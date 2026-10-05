import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';
import { NotificationSettings, ReminderSlot, SoundTone, UserSettings } from '../types';
import { ACTION_IDS, DEFAULT_NOTIFICATION_SETTINGS, STORAGE_KEYS } from '../lib/constants';
import { storage } from '../lib/storage';
import { notificationService } from '../lib/notifications';
import { buildSchedule } from '../lib/schedule';
import { playTone, stopAllAudio } from '../lib/sound';
import { haptic } from '../lib/haptics';
import { InAppNotificationData } from '../components/common/InAppNotificationBanner';

export function useNotifications(
  userSettings: UserSettings,
  todayCurrentMl: number,
  onLogWaterAction?: (amountMl: number) => void
) {
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [customSlots, setCustomSlots] = useState<ReminderSlot[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [inAppBanner, setInAppBanner] = useState<InAppNotificationData | null>(null);

  const lastAlertTimeRef = useRef<number>(0);

  // Load notification settings from storage
  useEffect(() => {
    async function init() {
      await notificationService.initialize();
      const saved = await storage.get<NotificationSettings>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATION_SETTINGS);
      const savedReminders = await storage.get<ReminderSlot[]>(STORAGE_KEYS.REMINDERS, []);
      const perm = await notificationService.hasPermission();

      setNotifSettings(saved);
      setCustomSlots(savedReminders);
      setHasPermission(perm);
      setIsInitialized(true);
    }
    init();
  }, []);

  // Compute active slots: if auto-schedule is ON, derive from algorithm; else use custom slots
  const activeSlots = useMemo<ReminderSlot[]>(() => {
    if (userSettings.autoSchedule) {
      return buildSchedule({
        goalMl: userSettings.dailyGoalMl,
        cupSizeMl: userSettings.defaultCupMl,
        wakeTime: userSettings.wakeTime,
        sleepTime: userSettings.sleepTime,
      });
    }
    return customSlots.length > 0
      ? customSlots
      : buildSchedule({
          goalMl: userSettings.dailyGoalMl,
          cupSizeMl: userSettings.defaultCupMl,
          wakeTime: userSettings.wakeTime,
          sleepTime: userSettings.sleepTime,
        });
  }, [userSettings, customSlots]);

  // Trigger in-app notification banner & sound
  const showNotificationAlert = useCallback(
    async (
      title: string,
      body: string,
      amountMl: number,
      tone?: SoundTone,
      skipSound: boolean = false
    ) => {
      const selectedTone = tone || notifSettings.soundTone;
      const userName = userSettings.userName;

      // Show top UI banner
      setInAppBanner({
        id: String(Date.now()),
        title,
        body,
        amountMl,
      });

      if (skipSound) return;

      lastAlertTimeRef.current = Date.now();

      // Stop any prior overlapping audio & play audio/haptics cleanly
      stopAllAudio();

      if (notifSettings.alertType === 'sound' || notifSettings.alertType === 'both') {
        await playTone(selectedTone, userName, amountMl);
      }
      if (notifSettings.alertType === 'buzz' || notifSettings.alertType === 'both') {
        haptic.buzzPattern();
      }
    },
    [notifSettings, userSettings.userName]
  );

  // Listen to background/foreground action button clicks on Android notifications
  useEffect(() => {
    let actionHandle: { remove: () => void } | null = null;
    let receivedHandle: { remove: () => void } | null = null;

    LocalNotifications.addListener('localNotificationActionPerformed', (action: ActionPerformed) => {
      const extra = action.notification.extra as { amountMl?: number; slotId?: number } | undefined;
      const amount = extra?.amountMl || userSettings.defaultCupMl || 250;

      if (action.actionId === ACTION_IDS.DRANK_CUP) {
        if (onLogWaterAction) {
          onLogWaterAction(amount);
        }
      }
    }).then((handle) => {
      actionHandle = handle;
    }).catch(() => {});

    LocalNotifications.addListener('localNotificationReceived', async (notification) => {
      const extra = notification?.extra as { amountMl?: number; slotId?: number; tone?: string; userName?: string } | undefined;
      const tone = (extra?.tone as SoundTone) || notifSettings.soundTone;
      const amount = extra?.amountMl || userSettings.defaultCupMl || 250;

      // If an alert was already triggered within the last 4 seconds, don't duplicate sound
      const timeSinceLastAlert = Date.now() - lastAlertTimeRef.current;
      const shouldSkipSound = timeSinceLastAlert < 4000;

      await showNotificationAlert(
        notification.title || 'Hydration Reminder 💧',
        notification.body || `Time to drink ${amount} ml of water!`,
        amount,
        tone,
        shouldSkipSound
      );
    }).then((handle) => {
      receivedHandle = handle;
    }).catch(() => {});

    return () => {
      if (actionHandle) {
        actionHandle.remove();
      }
      if (receivedHandle) {
        receivedHandle.remove();
      }
    };
  }, [userSettings.defaultCupMl, notifSettings, onLogWaterAction, showNotificationAlert]);

  // In-app real-time clock ticker for active reminder slots (triggers banner and sound when app is open)
  useEffect(() => {
    if (!notifSettings.enabled) return;

    let lastFiredTimeStr = '';

    const interval = setInterval(async () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentSlotStr = `${hh}:${mm}`;

      if (currentSlotStr === lastFiredTimeStr) return;

      const matchingSlot = activeSlots.find((s) => s.active && s.timeStr === currentSlotStr);
      if (matchingSlot) {
        lastFiredTimeStr = currentSlotStr;

        // Check if user already reached goal and stopWhenGoalReached is enabled
        if (notifSettings.stopWhenGoalReached && todayCurrentMl >= userSettings.dailyGoalMl) {
          return;
        }

        const cupAmount = matchingSlot.targetMl || userSettings.defaultCupMl;
        const { title, body } = notificationService.getMessageText(
          notifSettings.messageStyle,
          cupAmount,
          notifSettings.showProgress
            ? { current: todayCurrentMl, goal: userSettings.dailyGoalMl }
            : undefined,
          userSettings.userName
        );

        await showNotificationAlert(title, body, cupAmount, notifSettings.soundTone);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeSlots, notifSettings, todayCurrentMl, userSettings, showNotificationAlert]);

  // Synchronize scheduled notifications when settings or slots change
  useEffect(() => {
    if (!isInitialized) return;

    if (notifSettings.enabled) {
      notificationService.scheduleDailyReminders(
        activeSlots,
        userSettings,
        notifSettings,
        todayCurrentMl
      );
    } else {
      notificationService.cancelAll();
    }
  }, [activeSlots, notifSettings, userSettings, todayCurrentMl, isInitialized]);

  const updateNotifSettings = useCallback(
    async (changes: Partial<NotificationSettings>) => {
      const updated = { ...notifSettings, ...changes };
      setNotifSettings(updated);
      await storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
    },
    [notifSettings]
  );

  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    setHasPermission(granted);
    if (granted) {
      await updateNotifSettings({ enabled: true });
    }
    return granted;
  }, [updateNotifSettings]);

  const toggleMasterSwitch = useCallback(
    async (enable: boolean) => {
      if (enable) {
        const granted = await notificationService.requestPermission();
        setHasPermission(granted);
        if (granted) {
          await updateNotifSettings({ enabled: true });
        } else {
          await updateNotifSettings({ enabled: false });
        }
      } else {
        await updateNotifSettings({ enabled: false });
        await notificationService.cancelAll();
      }
    },
    [updateNotifSettings]
  );

  const toggleSlotActive = useCallback(
    async (slotId: number) => {
      const updated = activeSlots.map((s) => (s.id === slotId ? { ...s, active: !s.active } : s));
      setCustomSlots(updated);
      await storage.set(STORAGE_KEYS.REMINDERS, updated);
    },
    [activeSlots]
  );

  const testNotification = useCallback(async () => {
    const cupAmount = activeSlots[0]?.targetMl || userSettings.defaultCupMl || 250;
    const { title, body } = notificationService.getMessageText(
      notifSettings.messageStyle,
      cupAmount,
      notifSettings.showProgress
        ? { current: todayCurrentMl, goal: userSettings.dailyGoalMl }
        : undefined,
      userSettings.userName
    );

    // 1. Trigger in-app banner & audio immediately
    await showNotificationAlert(title, body, cupAmount, notifSettings.soundTone);

    // 2. Trigger native system notification without duplicate audio in JS
    await notificationService.triggerTestNotification(
      { ...userSettings, defaultCupMl: cupAmount },
      notifSettings,
      todayCurrentMl
    );
  }, [userSettings, notifSettings, todayCurrentMl, activeSlots, showNotificationAlert]);

  const dismissInAppBanner = useCallback(() => {
    setInAppBanner(null);
  }, []);

  return {
    notifSettings,
    hasPermission,
    activeSlots,
    inAppBanner,
    dismissInAppBanner,
    updateNotifSettings,
    requestPermission,
    toggleMasterSwitch,
    toggleSlotActive,
    testNotification,
  };
}
