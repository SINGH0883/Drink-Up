import React, { useState, useMemo } from 'react';
import { Bell, Flame, HelpCircle, Sun, SunMedium, Sunset, Moon } from 'lucide-react';
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
  onStartTour?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  stats,
  settings,
  onAddWater,
  undoEntry,
  onUndoLastAdd,
  onNavigateToReminders,
  onStartTour,
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
        icon: <Sun className="w-4 h-4 text-amber-500 fill-amber-400 drop-shadow-xs" />,
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        title: `Good afternoon, ${displayName}!`,
        sub: 'Stay energised and keep sipping throughout the day.',
        icon: <SunMedium className="w-4 h-4 text-amber-500 fill-amber-400 drop-shadow-xs" />,
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        title: `Good evening, ${displayName}!`,
        sub: 'Hit your daily hydration goal before winding down.',
        icon: <Sunset className="w-4 h-4 text-orange-500 stroke-[2.3]" />,
      };
    } else {
      return {
        title: `Good night, ${displayName}!`,
        sub: 'Rest well and stay hydrated for tomorrow.',
        icon: <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/40 stroke-[2.3]" />,
      };
    }
  }, [settings.userName]);

  return (
    <div className="flex-1 flex flex-col min-h-full pb-2 relative overflow-hidden bg-transparent">
      {/* Full Screen Animated Hydration GIF Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img
          src="/hydrate-bg.gif"
          alt="Hydration Background"
          className="w-full h-full object-cover object-center pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-black/10 to-black/25 dark:from-sky-950/30 dark:via-black/30 dark:to-background/70 pointer-events-none" />
      </div>

      {/* Modern Sky Blue Gradient Header with Integrated 3D Waving Hand Greeting */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-sky-400/35 via-sky-300/15 to-transparent dark:from-sky-950/60 dark:via-sky-900/30 dark:to-transparent backdrop-blur-xl px-4 pt-safe pb-2 transition-all relative z-10 shrink-0">
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
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-sky-700 via-blue-700 to-cyan-600 dark:from-sky-300 dark:via-blue-300 dark:to-cyan-200 bg-clip-text text-transparent">
                  Drink Up
                </h1>
                <span className="shrink-0 flex items-center">{greeting.icon}</span>
              </div>
              <p className="text-xs text-slate-900 dark:text-slate-100 font-black tracking-tight truncate">
                {greeting.title}
              </p>
            </div>
          </div>

          {/* Right: Streak Badge, Help Tour & Bell Notification */}
          <div id="tour-header-actions" className="flex items-center gap-1.5 shrink-0">
            {stats.streakDays > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-orange-400/60 text-orange-700 dark:text-orange-300 text-xs font-black shadow-xs backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 fill-current animate-pulse text-orange-500" />
                <span>{stats.streakDays}d</span>
              </div>
            )}
            {onStartTour && (
              <button
                onClick={onStartTour}
                className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-200/80 dark:border-slate-800 flex items-center justify-center text-foreground hover:bg-surface active:scale-95 transition-all shadow-xs"
                aria-label="App Tour Guide"
                title="App Tour Guide"
              >
                <HelpCircle className="w-4 h-4 text-sky-700 dark:text-sky-300 hover:text-accent" />
              </button>
            )}
            <button
              onClick={onNavigateToReminders}
              className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-200/80 dark:border-slate-800 flex items-center justify-center text-foreground hover:bg-surface active:scale-95 transition-all shadow-xs relative"
              aria-label="Reminders"
            >
              <Bell className="w-4 h-4 text-sky-700 dark:text-sky-300 hover:text-accent" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3.5 flex flex-col justify-end max-w-md mx-auto w-full py-2 relative z-10">
        {/* Lower Action & Status Group */}
        <div className="w-full flex flex-col gap-2.5 mt-auto pb-1">
          {/* Quick Add Log Buttons */}
          <div id="tour-quick-add">
            <QuickAddButtons
              onAdd={onAddWater}
              unit={settings.unit}
            />
          </div>

          {/* Slim Two-Tone Status Bar */}
          {(() => {
            const displayCurrent = settings.unit === 'oz' ? Math.round(stats.todayTotalMl * ML_TO_OZ_RATIO) : stats.todayTotalMl;
            const displayGoal = settings.unit === 'oz' ? Math.round(stats.goalMl * ML_TO_OZ_RATIO) : stats.goalMl;
            const unitLabel = settings.unit === 'oz' ? 'fl oz' : 'ml';
            const remaining = Math.max(0, displayGoal - displayCurrent);
            const percent = Math.min(100, Math.round((stats.todayTotalMl / (stats.goalMl || 2000)) * 100));

            return (
              <div id="tour-status-bar" className="w-full px-4 py-3 rounded-2xl glass-card flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-black">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
                    <span>{displayCurrent.toLocaleString()} {unitLabel} drunk ({percent}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-black">
                    <span>{remaining.toLocaleString()} {unitLabel} left</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                  </div>
                </div>

                {/* Slim Progress Meter Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-200/90 dark:bg-slate-800 overflow-hidden flex shadow-inner border border-slate-300/40 dark:border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 rounded-full transition-all duration-700 ease-out shadow-xs"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
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
