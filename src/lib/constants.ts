import { NotificationSettings, UserSettings } from '../types';

export const STORAGE_KEYS = {
  SETTINGS: 'drinkup_settings',
  NOTIFICATIONS: 'drinkup_notifications',
  LOGS: 'drinkup_logs',
  REMINDERS: 'drinkup_reminders',
  THEME: 'drinkup_theme',
  STREAK: 'drinkup_streak',
} as const;

export const DEFAULT_USER_SETTINGS: UserSettings = {
  userName: '',
  age: 24,
  weightKg: 65,
  dailyGoalMl: 2250,
  unit: 'ml',
  defaultCupMl: 250,
  wakeTime: '07:00',
  sleepTime: '23:00',
  autoSchedule: true,
  onboardingCompleted: false,
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  alertType: 'both',
  soundTone: 'voice_announcement',
  voiceAnnouncement: true,
  quietHoursEnabled: true,
  quietStart: '23:00',
  quietEnd: '07:00',
  snoozeMinutes: 15,
  messageStyle: 'friendly',
  showProgress: true,
  actionButtons: true,
  stopWhenGoalReached: true,
  goalReachedAlert: true,
};

export const QUICK_ADD_AMOUNTS = [150, 250, 500];

export const ML_TO_OZ_RATIO = 0.033814;
export const OZ_TO_ML_RATIO = 29.5735;

export const NOTIFICATION_CHANNELS = {
  SOUND: 'drinkup_sound',
  BUZZ: 'drinkup_buzz',
  BOTH: 'drinkup_both',
  SILENT: 'drinkup_silent',
} as const;

export const ACTION_TYPES = {
  HYDRATION_ACTION: 'DRINKUP_HYDRATION_ACTION',
} as const;

export const ACTION_IDS = {
  DRANK_CUP: 'ACTION_DRANK_CUP',
  SNOOZE: 'ACTION_SNOOZE',
} as const;
