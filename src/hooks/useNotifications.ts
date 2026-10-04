import { useState, useEffect, useCallback, useMemo } from 'react';
import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications';
import { NotificationSettings, ReminderSlot, UserSettings } from '../types';
import { ACTION_IDS, DEFAULT_NOTIFICATION_SETTINGS, STORAGE_KEYS } from '../lib/constants';
import { storage } from '../lib/storage';
import { notificationService } from '../lib/notifications';
import { buildSchedule } from '../lib/schedule';
import { playTone, speakNotification } from '../lib/sound';

export function useNotifications(
  userSettings: UserSettings,
  todayCurrentMl: number,
  onLogWaterAction?: (amountMl: number) => void
) {
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [customSlots, setCustomSlots] = useState<ReminderSlot[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

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

    LocalNotifications.addListener('localNotificationReceived', async () => {
      if (notifSettings.alertType === 'sound' || notifSettings.alertType === 'both') {
        if (notifSettings.soundTone === 'voice_announcement' || notifSettings.voiceAnnouncement) {
          await speakNotification(userSettings.userName, userSettings.defaultCupMl);
        } else {
          await playTone(notifSettings.soundTone, userSettings.userName, userSettings.defaultCupMl);
        }
      }
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
  }, [userSettings.defaultCupMl, userSettings.userName, notifSettings, onLogWaterAction]);

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
          // If denied, keep it off
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
    const cupAmount = activeSlots[0]?.targetMl || userSettings.defaultCupMl || 150;
    await notificationService.triggerTestNotification(
      { ...userSettings, defaultCupMl: cupAmount },
      notifSettings,
      todayCurrentMl
    );
  }, [userSettings, notifSettings, todayCurrentMl, activeSlots]);

  return {
    notifSettings,
    hasPermission,
    activeSlots,
    updateNotifSettings,
    requestPermission,
    toggleMasterSwitch,
    toggleSlotActive,
    testNotification,
  };
}
