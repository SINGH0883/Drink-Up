import React from 'react';
import { Header } from '../components/common/Header';
import { StreakCard } from '../components/history/StreakCard';
import { WeeklyBarChart } from '../components/history/WeeklyBarChart';
import { TodayEntriesList } from '../components/history/TodayEntriesList';
import { DayLog, HydrationStats, UserSettings } from '../types';

interface HistoryPageProps {
  stats: HydrationStats;
  allLogs: Record<string, DayLog>;
  todayLog: DayLog;
  settings: UserSettings;
  onRemoveEntry: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  stats,
  allLogs,
  todayLog,
  settings,
  onRemoveEntry,
}) => {
  return (
    <div className="flex flex-col min-h-full pb-8">
      <Header title="Hydration History" subtitle="Your drinking trends & records" />

      <main className="flex-1 px-4 py-2 max-w-md mx-auto w-full">
        {/* Streak Record Cards */}
        <StreakCard
          currentStreak={stats.streakDays}
          bestStreak={stats.bestStreakDays}
        />

        {/* Weekly Bar Chart */}
        <WeeklyBarChart
          logs={allLogs}
          dailyGoalMl={settings.dailyGoalMl}
          unit={settings.unit}
        />

        {/* Today's Logged Drinks List */}
        <TodayEntriesList
          entries={todayLog.entries}
          unit={settings.unit}
          onRemove={onRemoveEntry}
        />
      </main>
    </div>
  );
};
