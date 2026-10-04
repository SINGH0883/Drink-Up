import React, { useState, useMemo } from 'react';
import { Bell, Award } from 'lucide-react';
import { Header } from '../components/common/Header';
import { WaterRing } from '../components/home/WaterRing';
import { QuickAddButtons } from '../components/home/QuickAddButtons';
import { UndoToast } from '../components/home/UndoToast';
import { CustomAddModal } from '../components/home/CustomAddModal';
import { HydrationStats, UserSettings } from '../types';

interface HomePageProps {
  stats: HydrationStats;
  settings: UserSettings;
  onAddWater: (amountMl: number) => void;
  undoEntry: { entry: { amountMl: number }; timeoutId: number } | null;
  onUndoLastAdd: () => void;
  onNavigateToReminders: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  stats,
  settings,
  onAddWater,
  undoEntry,
  onUndoLastAdd,
  onNavigateToReminders,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  // Dynamic Time-of-Day Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const displayName = settings.userName?.trim() || 'Friend';

    if (hour >= 5 && hour < 12) {
      return { title: `Good morning, ${displayName}! ☀️`, sub: 'Start your morning with a fresh glass of water.' };
    } else if (hour >= 12 && hour < 17) {
      return { title: `Good afternoon, ${displayName}! 🌤️`, sub: 'Stay energised and keep sipping throughout the day.' };
    } else if (hour >= 17 && hour < 22) {
      return { title: `Good evening, ${displayName}! 🌅`, sub: 'Hit your daily hydration goal before winding down.' };
    } else {
      return { title: `Good night, ${displayName}! 🌙`, sub: 'Rest well and stay hydrated for tomorrow.' };
    }
  }, [settings.userName]);

  return (
    <div className="flex flex-col min-h-full pb-8 relative overflow-hidden">
      {/* Rich Multi-Layer Ambient Water Gradient Aura */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-sky-400/35 via-blue-500/15 via-cyan-400/10 to-transparent dark:from-sky-500/30 dark:via-blue-700/15 dark:to-transparent pointer-events-none -z-10" />
      <div className="absolute top-4 -left-12 w-64 h-64 bg-sky-400/30 dark:bg-sky-500/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 -right-12 w-72 h-72 bg-cyan-400/25 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <Header
        title="Drink Up"
        subtitle={settings.userName ? `Hello, ${settings.userName}` : 'Daily Hydration'}
        rightElement={
          <button
            onClick={onNavigateToReminders}
            className="w-10 h-10 rounded-2xl bg-surface/90 border border-sky-400/30 flex items-center justify-center text-foreground hover:bg-surface active:scale-95 transition-all shadow-sm"
            aria-label="Reminders"
          >
            <Bell className="w-4 h-4 text-sky-600 dark:text-sky-400 hover:text-accent" />
          </button>
        }
      />

      <main className="flex-1 px-4 flex flex-col items-center justify-between max-w-md mx-auto w-full">
        {/* Dynamic Greeting Status Banner with Vibrant Gradient & Glow */}
        <div className="w-full mt-2.5 p-4 rounded-3xl bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-cyan-500/15 dark:from-sky-500/20 dark:via-blue-600/15 dark:to-cyan-500/20 border border-sky-400/40 dark:border-sky-400/30 flex items-center justify-between shadow-lg shadow-sky-500/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25">
              {stats.isGoalReached ? (
                <Award className="w-6 h-6 text-white" />
              ) : (
                <span className="text-xl select-none animate-wave-hand leading-none">👋</span>
              )}
            </div>
            <div>
              <p className="text-sm font-black text-foreground tracking-tight">
                {greeting.title}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {stats.isGoalReached
                  ? '🎉 Daily goal achieved! Outstanding job.'
                  : greeting.sub}
              </p>
            </div>
          </div>
        </div>

        {/* Clean Water Ring */}
        <div className="my-auto py-2">
          <WaterRing
            currentMl={stats.todayTotalMl}
            goalMl={stats.goalMl}
            unit={settings.unit}
            onRingClick={() => setIsCustomOpen(true)}
          />
        </div>

        {/* Simple Quick Add Buttons */}
        <QuickAddButtons
          onAdd={onAddWater}
          onOpenCustom={() => setIsCustomOpen(true)}
          unit={settings.unit}
        />
      </main>

      {/* Undo Toast */}
      {undoEntry && (
        <UndoToast
          amountMl={undoEntry.entry.amountMl}
          onUndo={onUndoLastAdd}
          unit={settings.unit}
        />
      )}

      {/* Custom Add Modal */}
      <CustomAddModal
        isOpen={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
        onAdd={onAddWater}
        unit={settings.unit}
      />
    </div>
  );
};
