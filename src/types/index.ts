export type ThemeMode = 'system' | 'light' | 'dark';

export type AlertType = 'sound' | 'buzz' | 'both' | 'silent';

export type SoundTone = 'voice_announcement' | 'voice_hindi' | 'water_drop' | 'gentle_chime' | 'soft_bell' | 'crystal_ping';

export type MessageStyle = 'friendly' | 'simple' | 'motivational';

export type SnoozeDuration = 5 | 10 | 15 | 30; // minutes

export type UnitType = 'ml' | 'oz';

export interface WaterLogEntry {
  id: string;
  timestamp: number; // epoch ms
  amountMl: number;
  cupSize: number;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  entries: WaterLogEntry[];
  goalMl: number;
}

export interface UserSettings {
  userName?: string;
  age?: number;
  weightKg?: number;
  dailyGoalMl: number;
  unit: UnitType;
  defaultCupMl: number;
  wakeTime: string; // "HH:MM" e.g. "07:00"
  sleepTime: string; // "HH:MM" e.g. "23:00"
  theme?: ThemeMode;
  autoSchedule: boolean;
  onboardingCompleted: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  alertType: AlertType;
  soundTone: SoundTone;
  voiceAnnouncement?: boolean;
  quietHoursEnabled: boolean;
  quietStart: string; // "HH:MM"
  quietEnd: string; // "HH:MM"
  snoozeMinutes: SnoozeDuration;
  messageStyle: MessageStyle;
  showProgress: boolean;
  actionButtons: boolean;
  stopWhenGoalReached: boolean;
  goalReachedAlert: boolean;
}

export interface ReminderSlot {
  id: number;
  timeStr: string; // "HH:MM"
  targetMl: number;
  active: boolean;
  custom?: boolean;
}

export interface HydrationStats {
  todayTotalMl: number;
  goalMl: number;
  progressPercent: number;
  streakDays: number;
  bestStreakDays: number;
  drinksCount: number;
  isGoalReached: boolean;
  remainingMl: number;
}
