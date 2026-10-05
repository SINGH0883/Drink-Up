import React, { useState, useMemo } from 'react';
import { Bell, Flame } from 'lucide-react';
import { WaterRing } from '../components/home/WaterRing';
import { QuickAddButtons } from '../components/home/QuickAddButtons';
import { UndoToast } from '../components/home/UndoToast';
import { CustomAddModal } from '../components/home/CustomAddModal';
import { ML_TO_OZ_RATIO } from '../lib/constants';
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

  // Dynamic Time-of-Day Greeting & Motivation
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const displayName = settings.userName?.trim() || 'Friend';

    if (hour >= 5 && hour < 12) {
      return {
        title: `Good morning, ${displayName}!`,
        sub: 'Start your morning with a fresh glass of water.',
        emoji: '☀️',
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        title: `Good afternoon, ${displayName}!`,
        sub: 'Stay energised and keep sipping throughout the day.',
        emoji: '🌤️',
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        title: `Good evening, ${displayName}!`,
        sub: 'Hit your daily hydration goal before winding down.',
        emoji: '🌅',
      };
    } else {
      return {
        title: `Good night, ${displayName}!`,
        sub: 'Rest well and stay hydrated for tomorrow.',
        emoji: '🌙',
      };
    }
  }, [settings.userName]);

  return (
    <div className="flex flex-col min-h-full pb-6 relative overflow-hidden bg-background">
      {/* Full Page Ambient Faded Hydration Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
        <img
          src="/hydrate-bg.webp"
          alt="Hydrate Background"
          className="w-full h-full object-cover opacity-25 dark:opacity-20 pointer-events-none scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent via-50% to-white/95 dark:from-slate-950/25 dark:via-transparent dark:to-slate-950/95 pointer-events-none" />
      </div>

      {/* Rich Extended Sky Blue Ambient Water Gradient Aura */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-sky-400/20 via-sky-300/10 to-transparent pointer-events-none z-0" />

      {/* Modern Sky Blue Gradient Header with Integrated 3D Waving Hand Greeting */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-sky-400/35 via-sky-300/20 to-transparent dark:from-sky-950/60 dark:via-sky-900/30 dark:to-transparent backdrop-blur-xl px-4 pt-safe pb-2 transition-all relative z-10">
        <div className="flex items-center justify-between min-h-[48px] max-w-md mx-auto">
          {/* Left: 3D Waving Hand + Drink Up Title & Greeting */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/waving-hand-3d.png"
              alt="Hello Hand"
              className="w-10 h-10 object-contain select-none animate-wave-hand pointer-events-none drop-shadow-sm shrink-0"
              draggable={false}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 dark:from-sky-300 dark:via-blue-300 dark:to-cyan-200 bg-clip-text text-transparent">
                  Drink Up
                </h1>
                <span className="text-sm shrink-0">{greeting.emoji}</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-extrabold tracking-tight truncate">
                {greeting.title}
              </p>
            </div>
          </div>

          {/* Right: Streak Badge & Bell Notification */}
          <div className="flex items-center gap-2 shrink-0">
            {stats.streakDays > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-black shadow-2xs backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-orange-500" />
                <span>{stats.streakDays}d</span>
              </div>
            )}
            <button
              onClick={onNavigateToReminders}
              className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-sky-200/70 dark:border-slate-800 flex items-center justify-center text-foreground hover:bg-surface active:scale-95 transition-all shadow-xs relative"
              aria-label="Reminders"
            >
              <Bell className="w-4 h-4 text-sky-600 dark:text-sky-400 hover:text-accent" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3.5 flex flex-col items-center justify-between max-w-md mx-auto w-full gap-2 relative z-10">
        {/* Central 3D Liquid Orb */}
        <div className="my-auto py-1">
          <WaterRing
            currentMl={stats.todayTotalMl}
            goalMl={stats.goalMl}
            unit={settings.unit}
            onRingClick={() => setIsCustomOpen(true)}
          />
        </div>

        {/* Quick Add Log Buttons */}
        <QuickAddButtons
          onAdd={onAddWater}
          onOpenCustom={() => setIsCustomOpen(true)}
          unit={settings.unit}
        />

        {/* Slim Two-Tone Status Bar (Between Quick Log & Navbar) */}
        {(() => {
          const displayCurrent = settings.unit === 'oz' ? Math.round(stats.todayTotalMl * ML_TO_OZ_RATIO) : stats.todayTotalMl;
          const displayGoal = settings.unit === 'oz' ? Math.round(stats.goalMl * ML_TO_OZ_RATIO) : stats.goalMl;
          const unitLabel = settings.unit === 'oz' ? 'fl oz' : 'ml';
          const remaining = Math.max(0, displayGoal - displayCurrent);
          const percent = Math.min(100, Math.round((stats.todayTotalMl / (stats.goalMl || 2000)) * 100));

          return (
            <div className="w-full px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-sky-100/90 dark:border-slate-800 shadow-sm backdrop-blur-md flex flex-col gap-1.5 mt-0.5 mb-1">
              <div className="flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{displayCurrent.toLocaleString()} {unitLabel} drunk ({percent}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                  <span>{remaining.toLocaleString()} {unitLabel} left</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </div>
              </div>

              {/* Slim Progress Meter Bar */}
              <div className="w-full h-2 rounded-full bg-rose-200 dark:bg-rose-950/70 overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })()}
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
