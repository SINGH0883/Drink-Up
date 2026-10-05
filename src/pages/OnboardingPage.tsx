import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Scale,
  Target,
  Clock,
  CheckCircle2,
  Droplet,
  Sparkles,
} from 'lucide-react';
import { UserSettings } from '../types';
import { calculateGoalFromWeight } from '../lib/schedule';
import { haptic } from '../lib/haptics';
import confetti from 'canvas-confetti';

interface OnboardingPageProps {
  onComplete: (completedSettings: Partial<UserSettings>) => Promise<void>;
  onRequestNotifications: () => Promise<boolean>;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onComplete,
  onRequestNotifications,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State - all required
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number>(65);
  const [dailyGoalMl, setDailyGoalMl] = useState<number>(2250);
  const [cupSizeMl, setCupSizeMl] = useState<number>(250);
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [sleepTime, setSleepTime] = useState<string>('23:00');

  // Step validation - everything is required
  const isStepValid = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0 && typeof age === 'number' && age >= 5 && age <= 120;
      case 2:
        return weightKg >= 20 && weightKg <= 250;
      case 3:
        return dailyGoalMl >= 500 && cupSizeMl >= 50;
      case 4:
        return !!wakeTime && !!sleepTime && wakeTime !== sleepTime;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isStepValid()) return;
    haptic.tap();
    if (step === 2) {
      // Auto-calculate recommendation from weight
      const recommended = calculateGoalFromWeight(weightKg);
      setDailyGoalMl(recommended);
    }
    setStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const handleBack = () => {
    haptic.tap();
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = async () => {
    await haptic.success();
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#38BDF8', '#10B981'],
      });
    } catch {
      // ignore
    }

    await onRequestNotifications().catch(() => {});

    await onComplete({
      userName: name.trim() || 'Friend',
      age: typeof age === 'number' && age > 0 ? age : undefined,
      weightKg: weightKg || 65,
      dailyGoalMl: dailyGoalMl || 2250,
      defaultCupMl: cupSizeMl || 250,
      wakeTime,
      sleepTime,
      autoSchedule: true,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between max-w-md mx-auto p-6 transition-colors">
      {/* Top Step Progress Indicator */}
      <div className="w-full pt-safe">
        <div className="flex items-center justify-between mb-2">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-xs font-bold text-accent">
              <Droplet className="w-4 h-4 fill-accent" />
              <span>Drink Up</span>
            </div>
          )}
          <span className="text-xs font-bold text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden">
          <div
            style={{ width: `${(step / totalSteps) * 100}%` }}
            className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
          />
        </div>
      </div>

      {/* Main Step Content */}
      <div className="my-auto py-6">
        {/* STEP 1: Name & Age */}
        {step === 1 && (
          <div className="space-y-6 animate-fill-up">
            <div className="w-14 h-14 rounded-3xl bg-accent-subtle text-accent flex items-center justify-center shadow-sm">
              <User className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Welcome to Drink Up! 💧
              </h1>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Let's set up your personalized hydration plan in just a few quick steps.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  What's your name? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name (e.g. Yuvraj)"
                  className="w-full px-4 py-3.5 rounded-2xl bg-surface border border-surface-border text-foreground text-sm font-semibold focus:outline-none focus:border-accent shadow-sm"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  How old are you? <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAge(val === '' ? '' : Number(val));
                  }}
                  min={5}
                  max={120}
                  placeholder="Your Age (e.g. 24)"
                  className="w-full px-4 py-3.5 rounded-2xl bg-surface border border-surface-border text-foreground text-sm font-semibold focus:outline-none focus:border-accent shadow-sm"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Body Weight */}
        {step === 2 && (
          <div className="space-y-6 animate-fill-up">
            <div className="w-14 h-14 rounded-3xl bg-accent-subtle text-accent flex items-center justify-center shadow-sm">
              <Scale className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Your Body Weight <span className="text-red-500 text-lg">*</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                We calculate your optimal daily water requirement scientifically (~35 ml per kg).
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-6 bg-surface rounded-3xl border border-surface-border shadow-sm">
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  min={20}
                  max={250}
                  className="w-24 text-4xl font-extrabold text-center bg-transparent border-b-2 border-accent text-foreground focus:outline-none"
                  required
                />
                <span className="text-base font-bold text-muted-foreground">kg</span>
              </div>

              <div className="flex gap-2 mt-5">
                {[50, 60, 70, 80, 90].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      haptic.tap();
                      setWeightKg(preset);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      weightKg === preset
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'bg-surface-subtle text-muted-foreground border-surface-border'
                    }`}
                  >
                    {preset} kg
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-accent-subtle text-accent flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Recommended daily target: ~{calculateGoalFromWeight(weightKg)} ml</span>
            </div>
          </div>
        )}

        {/* STEP 3: Goal & Cup Size */}
        {step === 3 && (
          <div className="space-y-6 animate-fill-up">
            <div className="w-14 h-14 rounded-3xl bg-accent-subtle text-accent flex items-center justify-center shadow-sm">
              <Target className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Daily Goal & Cup Size <span className="text-red-500 text-lg">*</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Confirm your daily target and the cup size you normally drink with.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-surface rounded-3xl border border-surface-border shadow-sm">
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  Daily Water Target <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-foreground">
                    {dailyGoalMl.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">ml</span>
                  </span>
                  <div className="flex gap-1.5">
                    {[2000, 2500, 3000, 4000].map((ml) => (
                      <button
                        key={ml}
                        onClick={() => {
                          haptic.tap();
                          setDailyGoalMl(ml);
                        }}
                        className={`px-2 py-1.5 rounded-xl text-xs font-bold border ${
                          dailyGoalMl === ml
                            ? 'bg-accent text-white border-accent'
                            : 'bg-surface-subtle text-muted-foreground border-surface-border'
                        }`}
                      >
                        {ml / 1000}L
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  Default Cup Size (Interval basis) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { ml: 150, label: 'Small Cup' },
                    { ml: 250, label: 'Glass' },
                    { ml: 500, label: 'Bottle' },
                  ].map((cup) => (
                    <button
                      key={cup.ml}
                      onClick={() => {
                        haptic.tap();
                        setCupSizeMl(cup.ml);
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        cupSizeMl === cup.ml
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-surface border-surface-border text-foreground'
                      }`}
                    >
                      <span className="block text-sm font-extrabold">+{cup.ml} ml</span>
                      <span className="text-[11px] opacity-80">{cup.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Wake & Sleep Time */}
        {step === 4 && (
          <div className="space-y-6 animate-fill-up">
            <div className="w-14 h-14 rounded-3xl bg-accent-subtle text-accent flex items-center justify-center shadow-sm">
              <Clock className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Your Daily Hours <span className="text-red-500 text-lg">*</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Reminders are automatically distributed evenly throughout your waking window.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-3xl bg-surface border border-surface-border shadow-sm">
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Wake Up Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-transparent text-xl font-extrabold text-foreground focus:outline-none cursor-pointer"
                  required
                />
              </div>

              <div className="p-4 rounded-3xl bg-surface border border-surface-border shadow-sm">
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Sleep Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full bg-transparent text-xl font-extrabold text-foreground focus:outline-none cursor-pointer"
                  required
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed px-1">
              ✨ An automatic 45-minute wind-down buffer is included before bedtime so you can rest peacefully.
            </p>
          </div>
        )}

        {/* STEP 5: Notification Ready & Confirm */}
        {step === 5 && (
          <div className="space-y-6 animate-fill-up text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                You're All Set{name ? `, ${name}` : ''}!
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
                Your custom daily schedule is ready: {Math.ceil(dailyGoalMl / cupSizeMl)} reminder slots
                spaced throughout the day.
              </p>
            </div>

            <div className="p-4 bg-surface rounded-3xl border border-surface-border shadow-sm text-left space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-surface-border">
                <span className="text-muted-foreground">Name & Age</span>
                <span className="font-bold text-foreground">{name || 'Friend'} ({age} yrs)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border">
                <span className="text-muted-foreground">Daily Goal</span>
                <span className="font-bold text-accent">{dailyGoalMl} ml</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Active Hours</span>
                <span className="font-bold text-foreground">{wakeTime} to {sleepTime}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="w-full pb-safe pt-2">
        {step < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:bg-accent-hover active:scale-98 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none transition-all"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!isStepValid()}
            className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:bg-accent-hover active:scale-98 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none transition-all"
          >
            <span>Start Tracking Hydration</span>
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
