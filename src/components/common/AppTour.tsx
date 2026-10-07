import React, { useState, useEffect, useCallback } from 'react';
import {
  Droplet,
  Coffee,
  CheckCircle2,
  Flame,
  CalendarCheck,
  Volume2,
  BarChart3,
  Sliders,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { TabType } from '../navigation/BottomNav';
import { haptic } from '../../lib/haptics';
import confetti from 'canvas-confetti';

export interface TourStep {
  targetId: string;
  tab: TabType;
  title: string;
  subtitle: string;
  whatItDoes: string;
  benefit: string;
  icon: React.ReactNode;
  badge: string;
}

interface AppTourProps {
  userName?: string;
  onFinish: () => void;
  onNavigateTab: (tab: TabType) => void;
}

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export const AppTour: React.FC<AppTourProps> = ({
  onFinish,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const [positionMode, setPositionMode] = useState<'top' | 'bottom'>('top');

  const TOUR_STEPS: TourStep[] = [
    {
      targetId: 'tour-status-bar',
      tab: 'home',
      title: 'Daily Hydration Status',
      subtitle: 'Consumed vs Remaining Goal',
      whatItDoes:
        'Live hydration overview showing total water drunk today, percentage achieved, and remaining amount needed to reach your daily goal.',
      benefit: 'Instantly see your daily hydration progress at a glance.',
      icon: <Droplet className="w-5 h-5 text-sky-500 fill-sky-400/20" />,
      badge: 'Step 1 of 8',
    },
    {
      targetId: 'tour-quick-add',
      tab: 'home',
      title: 'Quick Log Buttons',
      subtitle: 'Preset Cup, Glass & Bottle Sizes',
      whatItDoes:
        'Log standard water amounts (+150ml Cup, +250ml Glass, +500ml Bottle) in a single tap with realistic pouring sounds and an instant 5-second Undo.',
      benefit: 'Fast and convenient one-tap logging without typing.',
      icon: <Coffee className="w-5 h-5 text-amber-500" />,
      badge: 'Step 2 of 8',
    },
    {
      targetId: 'tour-header-actions',
      tab: 'home',
      title: 'Streak & Notifications',
      subtitle: 'Habit Consistency Counter',
      whatItDoes:
        'Reach your daily goal every day to build your streak. Tap the bell icon to jump directly to your reminder timetable.',
      benefit: 'Stay motivated and build long-term hydration habits.',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      badge: 'Step 3 of 8',
    },
    {
      targetId: 'tour-reminders-schedule',
      tab: 'reminders',
      title: 'Smart Reminder Schedule',
      subtitle: 'Automatic Interval Calculation',
      whatItDoes:
        'Calculates balanced drinking intervals between your wake and sleep times so your hydration is evenly distributed throughout the day.',
      benefit: 'Hands-free automatic timetable tailored to your routine.',
      icon: <CalendarCheck className="w-5 h-5 text-cyan-500" />,
      badge: 'Step 4 of 8',
    },
    {
      targetId: 'tour-reminders-timeline',
      tab: 'reminders',
      title: 'Daily Timetable & Voice Alerts',
      subtitle: 'Indian Female Voice Notifications',
      whatItDoes:
        'View all reminder slots for today. Receive pleasant Indian voice announcements ("Hello! It\'s time to drink water...") alongside gentle chimes.',
      benefit: 'Never miss a drink with clear voice and sound notifications.',
      icon: <Volume2 className="w-5 h-5 text-indigo-500" />,
      badge: 'Step 5 of 8',
    },
    {
      targetId: 'tour-history-chart',
      tab: 'history',
      title: 'Weekly History Trends',
      subtitle: '7-Day Hydration Consistency',
      whatItDoes:
        'Analyze weekly drinking patterns with clear bar charts and evaluate your hydration consistency over time.',
      benefit: 'Track long-term improvement and progress.',
      icon: <BarChart3 className="w-5 h-5 text-amber-500" />,
      badge: 'Step 6 of 8',
    },
    {
      targetId: 'tour-history-list',
      tab: 'history',
      title: "Today's Drink Logs",
      subtitle: 'Timestamped Entry History',
      whatItDoes:
        'View a complete timestamped log of every single drink recorded today with quick delete/undo options.',
      benefit: 'Accurate record-keeping and easy management of daily drinks.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      badge: 'Step 7 of 8',
    },
    {
      targetId: 'tour-settings-profile',
      tab: 'settings',
      title: 'Settings & Swipe Gestures',
      subtitle: 'Personalization & 1-Finger Navigation',
      whatItDoes:
        'Update your profile, calculate weight-based goals, toggle dark mode, and customize sounds. Swipe left or right with 1 finger anywhere to switch tabs.',
      benefit: 'Full control over your preferences, goals, and appearance.',
      icon: <Sliders className="w-5 h-5 text-emerald-500" />,
      badge: 'Step 8 of 8',
    },
  ];

  const stepData = TOUR_STEPS[currentStep];

  // Measure and position the spotlight box on the target element
  const updateTargetPosition = useCallback(() => {
    const el = document.getElementById(stepData.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      const padding = 6;
      setTargetRect({
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        bottom: rect.bottom + padding,
        right: rect.right + padding,
      });

      // If element is in bottom half of viewport, place card at top; otherwise place at bottom
      const isBottomHalf = (rect.top + rect.height / 2) > (window.innerHeight * 0.45);
      setPositionMode(isBottomHalf ? 'top' : 'bottom');

      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
      setPositionMode('bottom');
    }
  }, [stepData.targetId]);

  useEffect(() => {
    onNavigateTab(stepData.tab);

    const timer = setTimeout(() => {
      updateTargetPosition();
    }, 120);

    const handleResize = () => updateTargetPosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [currentStep, stepData.tab, onNavigateTab, updateTargetPosition]);

  const handleNext = () => {
    haptic.tap();
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    haptic.tap();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    haptic.success();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#38BDF8', '#10B981', '#6366F1'],
      });
    } catch {
      // Ignore
    }
    onNavigateTab('home');
    onFinish();
  };

  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto border-0 outline-none">
      {/* Semi-transparent Dimmed Backdrop with Spotlight Cutout */}
      {targetRect ? (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-300 border-0 outline-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="tour-spotlight-mask">
              <rect x="-20%" y="-20%" width="140%" height="140%" fill="white" />
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="20"
                ry="20"
                fill="black"
              />
            </mask>
          </defs>

          <rect
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            fill="rgba(3, 7, 18, 0.78)"
            mask="url(#tour-spotlight-mask)"
          />
        </svg>
      ) : (
        <div className="fixed inset-0 bg-slate-950/78 backdrop-blur-xs border-0 outline-none" />
      )}

      {/* Target Element Clean Glowing Spotlight Border */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-[20px] transition-all duration-300 border-2 border-sky-400 dark:border-sky-300 shadow-[0_0_24px_rgba(56,189,248,0.6)] ring-2 ring-sky-400/20"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
        />
      )}

      {/* Clean Modern Tour Card */}
      <div
        className={`fixed left-3.5 right-3.5 max-w-md mx-auto z-50 transition-all duration-300 ${
          positionMode === 'top' ? 'top-3.5 sm:top-5' : 'bottom-3.5 sm:bottom-5'
        }`}
      >
        <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-sky-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl flex flex-col gap-3 relative animate-scale-up">
          {/* Header Row: Badge, Step dots, Skip button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
                {stepData.badge}
              </span>
              <div className="flex items-center gap-1">
                {TOUR_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      haptic.tap();
                      setCurrentStep(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? 'w-5 bg-sky-500'
                        : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <span>Skip</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Section Info: Icon + Title + Subtitle */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 shrink-0 shadow-2xs">
              {stepData.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold tracking-tight text-foreground leading-tight">
                {stepData.title}
              </h3>
              <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
                {stepData.subtitle}
              </p>
            </div>
          </div>

          {/* Description & Key Benefit */}
          <div className="p-3 rounded-2xl bg-surface-subtle border border-surface-border space-y-1.5 text-xs">
            <p className="text-foreground/90 leading-relaxed font-normal">
              {stepData.whatItDoes}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {stepData.benefit}
            </p>
          </div>

          {/* Controls: Back & Next buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-0.5">
            {currentStep > 0 ? (
              <button
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-2xl bg-surface-subtle text-foreground hover:bg-surface border border-surface-border font-semibold text-xs flex items-center gap-1 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-2xl bg-accent text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-accent/25 hover:bg-accent-hover active:scale-98 transition-all"
            >
              {isLastStep ? (
                <>
                  <span>Get Started</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Next Section</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
