import { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { DayLog, HydrationStats, UserSettings, WaterLogEntry } from '../types';
import { DEFAULT_USER_SETTINGS, STORAGE_KEYS } from '../lib/constants';
import { storage } from '../lib/storage';
import { haptic } from '../lib/haptics';
import { playTone } from '../lib/sound';

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useWaterLog() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [allLogs, setAllLogs] = useState<Record<string, DayLog>>({});
  const [todayKey, setTodayKey] = useState<string>(getTodayKey());
  const [undoEntry, setUndoEntry] = useState<{ entry: WaterLogEntry; timeoutId: number } | null>(null);
  const [savedBestStreak, setSavedBestStreak] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial settings, history & best streak record
  useEffect(() => {
    async function loadData() {
      const savedSettings = await storage.get<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_USER_SETTINGS);
      const savedLogs = await storage.get<Record<string, DayLog>>(STORAGE_KEYS.LOGS, {});
      const storedBest = await storage.get<number>(STORAGE_KEYS.STREAK, 0);
      setSettings(savedSettings);
      setAllLogs(savedLogs);
      setSavedBestStreak(storedBest);
      setIsLoaded(true);
    }
    loadData();

    // Check for day change every minute
    const interval = setInterval(() => {
      const currentToday = getTodayKey();
      if (currentToday !== todayKey) {
        setTodayKey(currentToday);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [todayKey]);

  // Save changes to storage
  const saveLogs = useCallback(async (newLogs: Record<string, DayLog>) => {
    setAllLogs(newLogs);
    await storage.set(STORAGE_KEYS.LOGS, newLogs);
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storage.set(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    });
  }, []);

  const todayLog = useMemo<DayLog>(() => {
    return allLogs[todayKey] || { date: todayKey, entries: [], goalMl: settings.dailyGoalMl };
  }, [allLogs, todayKey, settings.dailyGoalMl]);

  const todayTotalMl = useMemo(() => {
    return todayLog.entries.reduce((acc, curr) => acc + curr.amountMl, 0);
  }, [todayLog]);

  // Compute Streak & Best Record accurately across calendar history
  const streakStats = useMemo(() => {
    // 1. Gather all active date keys
    const activeDateSet = new Set<string>();
    Object.keys(allLogs).forEach((d) => {
      const log = allLogs[d];
      const total = (log?.entries || []).reduce((s, e) => s + e.amountMl, 0);
      if (total > 0) {
        activeDateSet.add(d);
      }
    });

    const todayHasDrinks = todayTotalMl > 0 || (todayLog?.entries && todayLog.entries.length > 0);
    if (todayHasDrinks) {
      activeDateSet.add(todayKey);
    }

    // 2. Compute longest consecutive streak across all historical active dates
    const sortedActiveDates = Array.from(activeDateSet).sort();
    let maxHistoricalStreak = 0;
    let runningStreak = 0;
    let prevDate: Date | null = null;

    sortedActiveDates.forEach((dateStr) => {
      const currentDate = new Date(dateStr + 'T00:00:00');
      if (!prevDate) {
        runningStreak = 1;
      } else {
        const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      }
      prevDate = currentDate;
      if (runningStreak > maxHistoricalStreak) {
        maxHistoricalStreak = runningStreak;
      }
    });

    // 3. Compute current active streak backwards from today/yesterday
    let currentStreak = 0;
    const checkDate = new Date();

    if (todayHasDrinks) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today not yet logged, check if yesterday was active to maintain ongoing streak
      checkDate.setDate(checkDate.getDate() - 1);
      const y = checkDate.getFullYear();
      const m = (checkDate.getMonth() + 1).toString().padStart(2, '0');
      const d = checkDate.getDate().toString().padStart(2, '0');
      const yesterdayKey = `${y}-${m}-${d}`;
      if (activeDateSet.has(yesterdayKey)) {
        currentStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Step backwards day-by-day to count uninterrupted consecutive days
    if (currentStreak > 0) {
      for (let i = 0; i < 365; i++) {
        const y = checkDate.getFullYear();
        const m = (checkDate.getMonth() + 1).toString().padStart(2, '0');
        const d = checkDate.getDate().toString().padStart(2, '0');
        const key = `${y}-${m}-${d}`;

        if (activeDateSet.has(key)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 4. Stored all-time best record (high-water mark)
    const effectiveBest = Math.max(savedBestStreak, maxHistoricalStreak, currentStreak);
    if (effectiveBest > savedBestStreak) {
      setSavedBestStreak(effectiveBest);
      storage.set(STORAGE_KEYS.STREAK, effectiveBest);
    }

    return { currentStreak, bestStreak: effectiveBest };
  }, [allLogs, todayTotalMl, todayLog, todayKey, savedBestStreak]);

  const stats = useMemo<HydrationStats>(() => {
    const isGoalReached = todayTotalMl >= settings.dailyGoalMl;
    const progressPercent = Math.min(100, Math.round((todayTotalMl / settings.dailyGoalMl) * 100));
    const remainingMl = Math.max(0, settings.dailyGoalMl - todayTotalMl);

    return {
      todayTotalMl,
      goalMl: settings.dailyGoalMl,
      progressPercent: isNaN(progressPercent) ? 0 : progressPercent,
      streakDays: streakStats.currentStreak,
      bestStreakDays: streakStats.bestStreak,
      drinksCount: todayLog.entries.length,
      isGoalReached,
      remainingMl,
    };
  }, [todayTotalMl, settings.dailyGoalMl, streakStats, todayLog.entries.length]);

  // Fire celebration confetti when goal is reached for the first time today
  const triggerCelebration = useCallback(() => {
    haptic.success();
    playTone('crystal_ping');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#2196F3', '#4FB3FF', '#00E676', '#FFD700'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Quick-Add Water Function
  const addWater = useCallback(
    async (amountMl: number, cupSize?: number) => {
      const wasGoalReached = todayTotalMl >= settings.dailyGoalMl;
      const newEntry: WaterLogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        amountMl,
        cupSize: cupSize || amountMl,
      };

      const updatedEntries = [...todayLog.entries, newEntry];
      const updatedDayLog: DayLog = {
        date: todayKey,
        entries: updatedEntries,
        goalMl: settings.dailyGoalMl,
      };

      const newLogs = { ...allLogs, [todayKey]: updatedDayLog };
      await saveLogs(newLogs);

      // Light haptic tap
      await haptic.tap();

      // Check if this drink crossed the goal
      const newTotal = updatedEntries.reduce((s, e) => s + e.amountMl, 0);
      if (!wasGoalReached && newTotal >= settings.dailyGoalMl) {
        triggerCelebration();
      }

      // Setup undo toast (5 seconds)
      if (undoEntry?.timeoutId) {
        clearTimeout(undoEntry.timeoutId);
      }
      const timeoutId = window.setTimeout(() => {
        setUndoEntry(null);
      }, 5000);

      setUndoEntry({ entry: newEntry, timeoutId });
    },
    [todayTotalMl, settings.dailyGoalMl, todayLog.entries, todayKey, allLogs, saveLogs, triggerCelebration, undoEntry]
  );

  // Undo Last Quick-Add
  const undoLastAdd = useCallback(async () => {
    if (!undoEntry) return;

    clearTimeout(undoEntry.timeoutId);
    const entryIdToRemove = undoEntry.entry.id;

    const filteredEntries = todayLog.entries.filter((e) => e.id !== entryIdToRemove);
    const updatedDayLog: DayLog = {
      date: todayKey,
      entries: filteredEntries,
      goalMl: settings.dailyGoalMl,
    };

    const newLogs = { ...allLogs, [todayKey]: updatedDayLog };
    await saveLogs(newLogs);
    setUndoEntry(null);
    await haptic.medium();
  }, [undoEntry, todayLog.entries, todayKey, settings.dailyGoalMl, allLogs, saveLogs]);

  // Remove specific entry
  const removeEntry = useCallback(
    async (entryId: string) => {
      const filteredEntries = todayLog.entries.filter((e) => e.id !== entryId);
      const updatedDayLog: DayLog = {
        date: todayKey,
        entries: filteredEntries,
        goalMl: settings.dailyGoalMl,
      };

      const newLogs = { ...allLogs, [todayKey]: updatedDayLog };
      await saveLogs(newLogs);
      await haptic.medium();
    },
    [todayLog.entries, todayKey, settings.dailyGoalMl, allLogs, saveLogs]
  );

  return {
    isLoaded,
    settings,
    updateSettings,
    todayLog,
    allLogs,
    stats,
    undoEntry,
    addWater,
    undoLastAdd,
    removeEntry,
    triggerCelebration,
  };
}
