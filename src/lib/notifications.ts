import {
  LocalNotifications,
  Channel,
  ScheduleOptions,
  LocalNotificationSchema,
  PermissionStatus
} from '@capacitor/local-notifications';
import {
  ACTION_IDS,
  ACTION_TYPES,
  NOTIFICATION_CHANNELS,
} from './constants';
import { AlertType, MessageStyle, NotificationSettings, ReminderSlot, UserSettings } from '../types';
import { playTone, speakNotification } from './sound';
import { haptic } from './haptics';

export const notificationService = {
  /**
   * Initializes notification channels and interactive action buttons.
   */
  async initialize(): Promise<void> {
    try {
      // 1. Create channels for Android
      const channels: Channel[] = [
        {
          id: NOTIFICATION_CHANNELS.SOUND,
          name: 'Sound Only Alerts',
          description: 'Hydration reminders with sound only',
          importance: 4, // High
          visibility: 1, // Public
          sound: 'beep.wav',
          vibration: false,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.BUZZ,
          name: 'Vibration Only Alerts',
          description: 'Hydration reminders with vibration only',
          importance: 4, // High
          visibility: 1,
          vibration: true,
          sound: undefined,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.BOTH,
          name: 'Sound & Vibration Alerts',
          description: 'Hydration reminders with both sound and vibration',
          importance: 4, // High
          visibility: 1,
          sound: 'beep.wav',
          vibration: true,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.SILENT,
          name: 'Silent Notifications',
          description: 'Hydration reminders delivered silently in tray',
          importance: 2, // Low
          visibility: 1,
          vibration: false,
          sound: undefined,
        },
      ];

      for (const channel of channels) {
        await LocalNotifications.createChannel(channel).catch(() => {});
      }

      // 2. Register Interactive Action Types
      await LocalNotifications.registerActionTypes({
        types: [
          {
            id: ACTION_TYPES.HYDRATION_ACTION,
            actions: [
              {
                id: ACTION_IDS.DRANK_CUP,
                title: '💧 Drank Water',
                foreground: false,
              },
            ],
          },
        ],
      }).catch(() => {});
    } catch (e) {
      console.warn('Could not initialize native notifications:', e);
    }
  },

  /**
   * Checks or requests notification permissions.
   */
  async requestPermission(): Promise<boolean> {
    try {
      const status: PermissionStatus = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') {
        return true;
      }
      const req = await LocalNotifications.requestPermissions();
      return req.display === 'granted';
    } catch {
      // If running on web
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const res = await Notification.requestPermission();
        return res === 'granted';
      }
      return false;
    }
  },

  async hasPermission(): Promise<boolean> {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    } catch {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    }
  },

  getChannelIdForType(type: AlertType): string {
    switch (type) {
      case 'sound':
        return NOTIFICATION_CHANNELS.SOUND;
      case 'buzz':
        return NOTIFICATION_CHANNELS.BUZZ;
      case 'silent':
        return NOTIFICATION_CHANNELS.SILENT;
      case 'both':
      default:
        return NOTIFICATION_CHANNELS.BOTH;
    }
  },

  getMessageText(
    style: MessageStyle,
    cupAmount: number,
    currentProgress?: { current: number; goal: number },
    userName?: string
  ): { title: string; body: string } {
    const name = userName && userName.trim() ? userName.trim() : 'Friend';
    let title = `Drink Up, ${name} 💧`;
    let body = `Hello ${name}, it is time for your water intake! Please drink ${cupAmount} ml.`;

    if (style === 'friendly') {
      title = `Time for a fresh sip, ${name}! 🌊`;
      body = `Hello ${name}, it's time for your water intake. Grab a refreshing ${cupAmount} ml glass!`;
    } else if (style === 'motivational') {
      title = `Hydration Time, ${name}! ✨`;
      body = `Hello ${name}, it is time for your water intake! Fuel your body with ${cupAmount} ml now.`;
    } else {
      title = `Hydration Reminder • ${name}`;
      body = `Hello ${name}, it is time for your water intake. Drink ${cupAmount} ml of water.`;
    }

    if (currentProgress) {
      body += ` (Today: ${currentProgress.current}/${currentProgress.goal} ml)`;
    }

    return { title, body };
  },

  /**
   * Schedules all active hydration reminders for today and repeating daily.
   */
  async scheduleDailyReminders(
    slots: ReminderSlot[],
    userSettings: UserSettings,
    notifSettings: NotificationSettings,
    todayCurrentMl: number = 0
  ): Promise<void> {
    if (!notifSettings.enabled) {
      await this.cancelAll();
      return;
    }

    // Cancel existing reminders first
    await this.cancelAll();

    // If goal already reached and user chose to stop reminders
    if (notifSettings.stopWhenGoalReached && todayCurrentMl >= userSettings.dailyGoalMl) {
      return;
    }

    const channelId = this.getChannelIdForType(notifSettings.alertType);
    const notificationsToSchedule: LocalNotificationSchema[] = [];

    const now = new Date();

    for (const slot of slots) {
      if (!slot.active) continue;

      const [hours, minutes] = slot.timeStr.split(':').map(Number);
      const scheduledDate = new Date();
      scheduledDate.setHours(hours, minutes, 0, 0);

      // If scheduled time has already passed today, schedule for tomorrow
      if (scheduledDate.getTime() <= now.getTime()) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      const { title, body } = this.getMessageText(
        notifSettings.messageStyle,
        slot.targetMl || userSettings.defaultCupMl,
        notifSettings.showProgress
          ? { current: todayCurrentMl, goal: userSettings.dailyGoalMl }
          : undefined,
        userSettings.userName
      );

      notificationsToSchedule.push({
        id: slot.id,
        title,
        body,
        channelId,
        actionTypeId: notifSettings.actionButtons ? ACTION_TYPES.HYDRATION_ACTION : undefined,
        schedule: {
          at: scheduledDate,
          repeats: true,
          every: 'day',
          allowWhileIdle: true,
        },
        extra: {
          amountMl: slot.targetMl || userSettings.defaultCupMl,
          slotId: slot.id,
        },
      });
    }

    if (notificationsToSchedule.length > 0) {
      try {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      } catch (err) {
        console.warn('Failed to schedule local notifications:', err);
      }
    }
  },

  /**
   * Triggers an immediate test notification using currently selected settings.
   */
  async triggerTestNotification(
    userSettings: UserSettings,
    notifSettings: NotificationSettings,
    todayCurrentMl: number
  ): Promise<void> {
    const channelId = this.getChannelIdForType(notifSettings.alertType);
    const { title, body } = this.getMessageText(
      notifSettings.messageStyle,
      userSettings.defaultCupMl,
      notifSettings.showProgress
        ? { current: todayCurrentMl, goal: userSettings.dailyGoalMl }
        : undefined,
      userSettings.userName
    );

    // Audio & voice speech & haptic in-app preview
    if (notifSettings.alertType === 'sound' || notifSettings.alertType === 'both') {
      if (notifSettings.soundTone === 'voice_announcement' || notifSettings.voiceAnnouncement) {
        await speakNotification(userSettings.userName, userSettings.defaultCupMl);
      } else {
        await playTone(notifSettings.soundTone, userSettings.userName, userSettings.defaultCupMl);
      }
    }
    if (notifSettings.alertType === 'buzz' || notifSettings.alertType === 'both') {
      haptic.buzzPattern();
    }

    try {
      const hasPerm = await this.hasPermission();
      if (hasPerm) {
        const testOptions: ScheduleOptions = {
          notifications: [
            {
              id: 99999,
              title: `[Test] ${title}`,
              body,
              channelId,
              actionTypeId: notifSettings.actionButtons ? ACTION_TYPES.HYDRATION_ACTION : undefined,
              schedule: { at: new Date(Date.now() + 500) },
              extra: { amountMl: userSettings.defaultCupMl },
            },
          ],
        };
        await LocalNotifications.schedule(testOptions);
      }
    } catch (err) {
      console.warn('Test notification dispatch error:', err);
    }
  },

  /**
   * Dispatches celebration notification when goal is reached.
   */
  async triggerGoalReachedNotification(userSettings: UserSettings, notifSettings: NotificationSettings): Promise<void> {
    if (!notifSettings.enabled || !notifSettings.goalReachedAlert) return;

    const channelId = this.getChannelIdForType(notifSettings.alertType);
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 88888,
            title: '🎉 Daily Goal Achieved!',
            body: `Awesome job! You reached your ${userSettings.dailyGoalMl} ml hydration goal today.`,
            channelId,
            schedule: { at: new Date(Date.now() + 200) },
          },
        ],
      });
    } catch {
      // ignore
    }
  },

  /**
   * Cancels all scheduled hydration notifications.
   */
  async cancelAll(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch {
      // ignore
    }
  },
};
