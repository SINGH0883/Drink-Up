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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial settings & history
  useEffect(() => {
    async function loadData() {
      const savedSettings = await storage.get<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_USER_SETTINGS);
      const savedLogs = await storage.get<Record<string, DayLog>>(STORAGE_KEYS.LOGS, {});
      setSettings(savedSettings);
      setAllLogs(savedLogs);
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

  // Compute Streak
  const streakStats = useMemo(() => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const dates = Object.keys(allLogs).sort();
    
    // Check backwards from yesterday
    const today = new Date();
    
    // Calculate best streak across full history
    dates.forEach((d) => {
      const log = allLogs[d];
      const total = log.entries.reduce((s, e) => s + e.amountMl, 0);
      if (total >= (log.goalMl || settings.dailyGoalMl)) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    // Calculate active streak
    let checkDate = new Date(today);
    // If today is completed, start with 1, else start with 0 and check from yesterday
    const isTodayComplete = todayTotalMl >= settings.dailyGoalMl;
    if (isTodayComplete) {
      currentStreak = 1;
    }
    checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
      const y = checkDate.getFullYear();
      const m = (checkDate.getMonth() + 1).toString().padStart(2, '0');
      const d = checkDate.getDate().toString().padStart(2, '0');
      const key = `${y}-${m}-${d}`;

      const log = allLogs[key];
      if (log) {
        const total = log.entries.reduce((s, e) => s + e.amountMl, 0);
        if (total >= (log.goalMl || settings.dailyGoalMl)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
      }
      break;
    }

    if (currentStreak > bestStreak) bestStreak = currentStreak;

    return { currentStreak, bestStreak };
  }, [allLogs, settings.dailyGoalMl, todayTotalMl]);

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
