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
  age: undefined,
  weightKg: 65,
  dailyGoalMl: 2250,
  unit: 'ml',
  defaultCupMl: 250,
  wakeTime: '07:00',
  sleepTime: '23:00',
  autoSchedule: true,
  onboardingCompleted: false,
  tourCompleted: false,
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
  SOUND_INDIAN_GIRL: 'drinkup_sound_indian_girl_v6',
  BOTH_INDIAN_GIRL: 'drinkup_both_indian_girl_v6',
  SOUND_WATER_DROP: 'drinkup_sound_water_drop_v6',
  SOUND_GENTLE_CHIME: 'drinkup_sound_gentle_chime_v6',
  SOUND_SOFT_BELL: 'drinkup_sound_soft_bell_v6',
  SOUND_CRYSTAL_PING: 'drinkup_sound_crystal_ping_v6',
  SOUND_DEFAULT: 'drinkup_sound_default_v6',
  BOTH_WATER_DROP: 'drinkup_both_water_drop_v6',
  BOTH_GENTLE_CHIME: 'drinkup_both_gentle_chime_v6',
  BOTH_SOFT_BELL: 'drinkup_both_soft_bell_v6',
  BOTH_CRYSTAL_PING: 'drinkup_both_crystal_ping_v6',
  BOTH_DEFAULT: 'drinkup_both_default_v6',
  BUZZ: 'drinkup_buzz_v6',
  SILENT: 'drinkup_silent_v6',
} as const;

export const ACTION_TYPES = {
  HYDRATION_ACTION: 'DRINKUP_HYDRATION_ACTION',
} as const;

export const ACTION_IDS = {
  DRANK_CUP: 'ACTION_DRANK_CUP',
  SNOOZE: 'ACTION_SNOOZE',
} as const;
