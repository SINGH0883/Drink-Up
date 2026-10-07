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
import { AlertType, MessageStyle, NotificationSettings, ReminderSlot, SoundTone, UserSettings } from '../types';

export const notificationService = {
  /**
   * Initializes notification channels and interactive action buttons.
   */
  async initialize(): Promise<void> {
    try {
      // 1. Clean up legacy channels that had missing sound resources or older importance levels
      const existing = await LocalNotifications.listChannels().catch(() => ({ channels: [] }));
      if (existing && existing.channels) {
        for (const ch of existing.channels) {
          if (ch.id.startsWith('drinkup_') && !ch.id.includes('_v6')) {
            await LocalNotifications.deleteChannel({ id: ch.id }).catch(() => {});
          }
        }
      }

      // 2. Create channels for Android with sound & vibration
      const channels: Channel[] = [
        // Indian Girl Voice Channels (MAX importance for Screen Off / Lockscreen alerts)
        {
          id: NOTIFICATION_CHANNELS.BOTH_INDIAN_GIRL,
          name: 'Female Voice (Sound & Vibration)',
          description: 'Hydration reminders with female voice alert and vibration',
          importance: 5,
          visibility: 1,
          sound: 'indian_girl_voice.wav',
          vibration: true,
          lights: true,
          lightColor: '#00BCD4',
        },
        {
          id: NOTIFICATION_CHANNELS.SOUND_INDIAN_GIRL,
          name: 'Female Voice (Sound Only)',
          description: 'Hydration reminders with female voice alert',
          importance: 5,
          visibility: 1,
          sound: 'indian_girl_voice.wav',
          vibration: false,
          lights: true,
          lightColor: '#00BCD4',
        },
        // Sound & Vibration Channels (Default: MAX importance)
        {
          id: NOTIFICATION_CHANNELS.BOTH_WATER_DROP,
          name: 'Water Drop (Sound & Vibration)',
          description: 'Hydration reminders with water droplet chime and vibration',
          importance: 5,
          visibility: 1,
          sound: 'water_drop.wav',
          vibration: true,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.BOTH_GENTLE_CHIME,
          name: 'Gentle Chime (Sound & Vibration)',
          description: 'Hydration reminders with melodic chime and vibration',
          importance: 5,
          visibility: 1,
          sound: 'gentle_chime.wav',
          vibration: true,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.BOTH_SOFT_BELL,
          name: 'Soft Bell (Sound & Vibration)',
          description: 'Hydration reminders with bell tone and vibration',
          importance: 5,
          visibility: 1,
          sound: 'soft_bell.wav',
          vibration: true,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.BOTH_CRYSTAL_PING,
          name: 'Crystal Ping (Sound & Vibration)',
          description: 'Hydration reminders with crystal ping and vibration',
          importance: 5,
          visibility: 1,
          sound: 'crystal_ping.wav',
          vibration: true,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.BOTH_DEFAULT,
          name: 'Default Alert (Sound & Vibration)',
          description: 'Hydration reminders with alert tone and vibration',
          importance: 5,
          visibility: 1,
          sound: 'beep.wav',
          vibration: true,
          lights: true,
          lightColor: '#2196F3',
        },

        // Sound Only Channels
        {
          id: NOTIFICATION_CHANNELS.SOUND_WATER_DROP,
          name: 'Water Drop (Sound Only)',
          description: 'Hydration reminders with water drop sound',
          importance: 5,
          visibility: 1,
          sound: 'water_drop.wav',
          vibration: false,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.SOUND_GENTLE_CHIME,
          name: 'Gentle Chime (Sound Only)',
          description: 'Hydration reminders with gentle chime sound',
          importance: 5,
          visibility: 1,
          sound: 'gentle_chime.wav',
          vibration: false,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.SOUND_SOFT_BELL,
          name: 'Soft Bell (Sound Only)',
          description: 'Hydration reminders with soft bell sound',
          importance: 5,
          visibility: 1,
          sound: 'soft_bell.wav',
          vibration: false,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.SOUND_CRYSTAL_PING,
          name: 'Crystal Ping (Sound Only)',
          description: 'Hydration reminders with crystal ping sound',
          importance: 5,
          visibility: 1,
          sound: 'crystal_ping.wav',
          vibration: false,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.SOUND_DEFAULT,
          name: 'Default Alert (Sound Only)',
          description: 'Hydration reminders with standard sound',
          importance: 5,
          visibility: 1,
          sound: 'beep.wav',
          vibration: false,
          lights: true,
          lightColor: '#2196F3',
        },

        // Buzz & Silent Channels
        {
          id: NOTIFICATION_CHANNELS.BUZZ,
          name: 'Vibration Only Alerts',
          description: 'Hydration reminders with vibration only',
          importance: 4,
          visibility: 1,
          vibration: true,
          lights: true,
          lightColor: '#2196F3',
        },
        {
          id: NOTIFICATION_CHANNELS.SILENT,
          name: 'Silent Notifications',
          description: 'Hydration reminders delivered silently',
          importance: 2,
          visibility: 1,
          vibration: false,
        },
      ];

      for (const channel of channels) {
        await LocalNotifications.createChannel(channel).catch(() => {});
      }

      // 3. Register Interactive Action Types
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

  getChannelIdForType(type: AlertType, tone: SoundTone = 'water_drop'): string {
    if (type === 'silent') return NOTIFICATION_CHANNELS.SILENT;
    if (type === 'buzz') return NOTIFICATION_CHANNELS.BUZZ;

    const isBoth = type === 'both';
    switch (tone) {
      case 'voice_announcement':
        return isBoth ? NOTIFICATION_CHANNELS.BOTH_INDIAN_GIRL : NOTIFICATION_CHANNELS.SOUND_INDIAN_GIRL;
      case 'water_drop':
        return isBoth ? NOTIFICATION_CHANNELS.BOTH_WATER_DROP : NOTIFICATION_CHANNELS.SOUND_WATER_DROP;
      case 'gentle_chime':
        return isBoth ? NOTIFICATION_CHANNELS.BOTH_GENTLE_CHIME : NOTIFICATION_CHANNELS.SOUND_GENTLE_CHIME;
      case 'soft_bell':
        return isBoth ? NOTIFICATION_CHANNELS.BOTH_SOFT_BELL : NOTIFICATION_CHANNELS.SOUND_SOFT_BELL;
      case 'crystal_ping':
        return isBoth ? NOTIFICATION_CHANNELS.BOTH_CRYSTAL_PING : NOTIFICATION_CHANNELS.SOUND_CRYSTAL_PING;
      case 'custom':
        return isBoth ? NOTIFICATION_CHANNELS.BOTH_WATER_DROP : NOTIFICATION_CHANNELS.SOUND_WATER_DROP;
      default:
        return isBoth ? NOTIFICATION_CHANNELS.BOTH_INDIAN_GIRL : NOTIFICATION_CHANNELS.SOUND_INDIAN_GIRL;
    }
  },

  getSoundFileName(type: AlertType, tone: SoundTone = 'water_drop'): string | undefined {
    if (type === 'silent' || type === 'buzz') return undefined;
    switch (tone) {
      case 'voice_announcement':
        return 'indian_girl_voice.wav';
      case 'water_drop':
        return 'water_drop.wav';
      case 'gentle_chime':
        return 'gentle_chime.wav';
      case 'soft_bell':
        return 'soft_bell.wav';
      case 'crystal_ping':
        return 'crystal_ping.wav';
      case 'custom':
        return 'gentle_chime.wav';
      default:
        return 'indian_girl_voice.wav';
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

    const channelId = this.getChannelIdForType(notifSettings.alertType, notifSettings.soundTone);
    const soundFile = this.getSoundFileName(notifSettings.alertType, notifSettings.soundTone);
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
        sound: soundFile,
        smallIcon: 'ic_stat_drink',
        largeIcon: 'ic_launcher',
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
          tone: notifSettings.soundTone,
          userName: userSettings.userName,
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
    const channelId = this.getChannelIdForType(notifSettings.alertType, notifSettings.soundTone);
    const soundFile = this.getSoundFileName(notifSettings.alertType, notifSettings.soundTone);
    const { title, body } = this.getMessageText(
      notifSettings.messageStyle,
      userSettings.defaultCupMl,
      notifSettings.showProgress
        ? { current: todayCurrentMl, goal: userSettings.dailyGoalMl }
        : undefined,
      userSettings.userName
    );

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
              sound: soundFile,
              smallIcon: 'ic_stat_drink',
              largeIcon: 'ic_launcher',
              actionTypeId: notifSettings.actionButtons ? ACTION_TYPES.HYDRATION_ACTION : undefined,
              schedule: { at: new Date(Date.now() + 500) },
              extra: { amountMl: userSettings.defaultCupMl, tone: notifSettings.soundTone },
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

    const channelId = this.getChannelIdForType(notifSettings.alertType, notifSettings.soundTone);
    const soundFile = this.getSoundFileName(notifSettings.alertType, notifSettings.soundTone);
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 88888,
            title: '🎉 Daily Goal Achieved!',
            body: `Awesome job! You reached your ${userSettings.dailyGoalMl} ml hydration goal today.`,
            channelId,
            sound: soundFile,
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

