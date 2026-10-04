import { ReminderSlot } from '../types';

export interface ScheduleParams {
  goalMl: number;
  cupSizeMl: number;
  wakeTime: string; // "HH:MM"
  sleepTime: string; // "HH:MM"
}

export interface ScheduleSummary {
  drinksCount: number;
  intervalMinutes: number;
  intervalFormatted: string;
  firstDrinkTime: string;
  lastDrinkTime: string;
  perDrinkMl: number;
  totalTargetMl: number;
}

/**
 * Calculates suggested water intake based on body weight (approx 35 ml per kg).
 */
export function calculateGoalFromWeight(weightKg: number): number {
  const goal = Math.round(weightKg * 35);
  return Math.max(1000, Math.min(6000, Math.round(goal / 50) * 50));
}

/**
 * Converts "HH:MM" string to minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 420; // 07:00 AM default
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Converts minutes from midnight to formatted "HH:MM" 24h string.
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Converts "HH:MM" 24h string to 12-hour display string (e.g., "7:30 AM").
 */
export function formatTo12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${(minutes || 0).toString().padStart(2, '0')} ${period}`;
}

/**
 * Converts minutes duration into friendly string (e.g. "1h 30m" or "45m").
 */
export function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Precision timetable builder that evenly spaces reminder intervals between wake time
 * and bedtime buffer, perfectly matching target cup sizes to reach the daily goal.
 */
export function buildSchedule(params: ScheduleParams): ReminderSlot[] {
  const { goalMl, cupSizeMl, wakeTime, sleepTime } = params;

  const validGoal = Math.max(250, Math.round(goalMl));
  const validCup = Math.max(50, Math.round(cupSizeMl));
  const drinksCount = Math.max(1, Math.ceil(validGoal / validCup));

  const wakeMinutes = parseTimeToMinutes(wakeTime);
  let sleepMinutes = parseTimeToMinutes(sleepTime);

  // If sleep time is earlier than wake time (e.g. wake 07:00, sleep 01:00 AM next day)
  if (sleepMinutes <= wakeMinutes) {
    sleepMinutes += 1440;
  }

  // Bedtime buffer: stop reminders 45-60 min before sleep
  const bedtimeBuffer = Math.min(60, Math.max(30, Math.floor((sleepMinutes - wakeMinutes) * 0.06)));
  const effectiveEndMinutes = sleepMinutes - bedtimeBuffer;
  const availableWindowMinutes = Math.max(60, effectiveEndMinutes - wakeMinutes);

  if (drinksCount === 1) {
    return [
      {
        id: 1,
        timeStr: wakeTime,
        targetMl: validGoal,
        active: true,
      },
    ];
  }

  // Even step interval rounded to nearest 5 minutes
  const rawInterval = availableWindowMinutes / (drinksCount - 1);
  const intervalMinutes = Math.max(25, Math.round(rawInterval / 5) * 5);

  const slots: ReminderSlot[] = [];
  let remainingTarget = validGoal;

  for (let i = 0; i < drinksCount; i++) {
    const currentMinute = wakeMinutes + i * intervalMinutes;
    const boundedMinute = Math.min(sleepMinutes - 15, currentMinute);
    const timeStr = formatMinutesToTime(Math.round(boundedMinute));

    // Calculate exact portion for this drink
    let slotAmount = validCup;
    if (i === drinksCount - 1) {
      slotAmount = remainingTarget > 0 ? remainingTarget : validCup;
    } else {
      if (remainingTarget < validCup) {
        slotAmount = remainingTarget;
      }
    }
    remainingTarget -= slotAmount;

    // Avoid duplicate minute collision
    if (!slots.some((s) => s.timeStr === timeStr)) {
      slots.push({
        id: i + 1,
        timeStr,
        targetMl: slotAmount > 0 ? slotAmount : validCup,
        active: true,
      });
    }
  }

  return slots;
}

/**
 * Returns clean summary metrics for the auto-scheduled timetable.
 */
export function getScheduleSummary(params: ScheduleParams): ScheduleSummary {
  const slots = buildSchedule(params);
  const drinksCount = slots.length;
  const firstDrinkTime = slots[0]?.timeStr || params.wakeTime;
  const lastDrinkTime = slots[slots.length - 1]?.timeStr || params.sleepTime;

  let intervalMinutes = 60;
  if (slots.length > 1) {
    const m1 = parseTimeToMinutes(slots[0].timeStr);
    const m2 = parseTimeToMinutes(slots[1].timeStr);
    intervalMinutes = m2 >= m1 ? m2 - m1 : m2 + 1440 - m1;
  }

  return {
    drinksCount,
    intervalMinutes,
    intervalFormatted: formatInterval(intervalMinutes),
    firstDrinkTime: formatTo12Hour(firstDrinkTime),
    lastDrinkTime: formatTo12Hour(lastDrinkTime),
    perDrinkMl: params.cupSizeMl,
    totalTargetMl: params.goalMl,
  };
}
