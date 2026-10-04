import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Droplet, Sparkles } from 'lucide-react';
import { ML_TO_OZ_RATIO } from '../../lib/constants';
import { UnitType } from '../../types';

interface WaterRingProps {
  currentMl: number;
  goalMl: number;
  unit: UnitType;
  onRingClick?: () => void;
}

export const WaterRing: React.FC<WaterRingProps> = ({
  currentMl,
  goalMl,
  unit,
  onRingClick,
}) => {
  const size = 264;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressRatio = Math.min(1.5, Math.max(0, currentMl / (goalMl || 2500)));
  const progressPercent = Math.round(progressRatio * 100);
  const strokeDashoffset = circumference - Math.min(1, progressRatio) * circumference;
  const isGoalAchieved = currentMl >= goalMl;

  // Track recent intake for splash animation
  const prevMlRef = useRef(currentMl);
  const [justAddedAmount, setJustAddedAmount] = useState<number | null>(null);
  const [isSurging, setIsSurging] = useState(false);

  useEffect(() => {
    if (currentMl > prevMlRef.current) {
      const added = currentMl - prevMlRef.current;
      setJustAddedAmount(added);
      setIsSurging(true);

      const t1 = setTimeout(() => setIsSurging(false), 1200);
      const t2 = setTimeout(() => setJustAddedAmount(null), 1800);

      prevMlRef.current = currentMl;
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    prevMlRef.current = currentMl;
  }, [currentMl]);

  const displayCurrent = unit === 'oz' ? Math.round(currentMl * ML_TO_OZ_RATIO) : currentMl;
  const displayGoal = unit === 'oz' ? Math.round(goalMl * ML_TO_OZ_RATIO) : goalMl;
  const unitLabel = unit === 'oz' ? 'fl oz' : 'ml';

  // Liquid wave fill level percentage (clamped between 8% and 95% for aesthetic centering)
  const waveFillPercent = Math.min(94, Math.max(progressPercent > 0 ? 12 : 0, progressPercent));

  return (
    <div
      onClick={onRingClick}
      className={`relative flex items-center justify-center my-3 cursor-pointer select-none group transition-transform ${
        isSurging ? 'scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
    >
      {/* Ambient Back Glow */}
      <div
        className={`absolute inset-4 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none -z-10 ${
          isGoalAchieved
            ? 'bg-emerald-500/20 dark:bg-emerald-500/25 opacity-100'
            : isSurging
            ? 'bg-sky-400/30 dark:bg-sky-400/35 opacity-100'
            : 'bg-sky-500/15 dark:bg-sky-500/20 opacity-80'
        }`}
      />

      {/* Pulsing Ripple on Water Intake */}
      {isSurging && (
        <div className="absolute inset-0 rounded-full animate-ring-pulse pointer-events-none border-2 border-sky-400/40" />
      )}

      {/* Inner Liquid Wave Fill Container */}
      <div
        className="absolute rounded-full overflow-hidden flex items-end justify-center pointer-events-none transition-all duration-700"
        style={{
          width: `${size - strokeWidth * 2 - 10}px`,
          height: `${size - strokeWidth * 2 - 10}px`,
        }}
      >
        {/* Rising Wave Body */}
        {progressPercent > 0 && (
          <div
            className="w-full relative transition-all duration-1000 ease-out"
            style={{
              height: `${waveFillPercent}%`,
              background: isGoalAchieved
                ? 'linear-gradient(to top, rgba(16, 185, 129, 0.22), rgba(52, 211, 153, 0.12))'
                : 'linear-gradient(to top, rgba(14, 165, 233, 0.22), rgba(56, 189, 248, 0.12))',
            }}
          >
            {/* Wave 1 SVG */}
            <div className="absolute -top-3.5 left-0 w-[200%] h-5 animate-wave-1 opacity-70">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0,0 C150,90 350,-40 500,50 C650,140 900,-30 1200,40 L1200,120 L0,120 Z"
                  fill={isGoalAchieved ? 'rgba(52, 211, 153, 0.35)' : 'rgba(56, 189, 248, 0.35)'}
                />
              </svg>
            </div>

            {/* Wave 2 SVG (Opposing phase for realistic water turbulence) */}
            <div className="absolute -top-4 left-0 w-[200%] h-6 animate-wave-2 opacity-50">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                <path
                  d="M0,40 C300,-30 550,140 700,50 C850,-40 1050,90 1200,0 L1200,120 L0,120 Z"
                  fill={isGoalAchieved ? 'rgba(16, 185, 129, 0.4)' : 'rgba(14, 165, 233, 0.4)'}
                />
              </svg>
            </div>

            {/* Floating Micro Bubbles */}
            <div className="absolute bottom-1 left-1/4 w-2 h-2 rounded-full bg-white/70 animate-bubble-1" />
            <div className="absolute bottom-2 left-1/2 w-1.5 h-1.5 rounded-full bg-sky-200/80 animate-bubble-2" />
            <div className="absolute bottom-1 right-1/3 w-2.5 h-2.5 rounded-full bg-cyan-100/60 animate-bubble-3" />
          </div>
        )}
      </div>

      {/* SVG Progress Ring */}
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        <defs>
          <linearGradient id="premiumWaterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="premiumGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Clean Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-ring-track)"
          strokeWidth={strokeWidth}
          className="transition-colors duration-300 opacity-60 dark:opacity-40"
        />

        {/* Progress Stroke */}
        {progressPercent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isGoalAchieved ? 'url(#premiumGoalGradient)' : 'url(#premiumWaterGradient)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>

      {/* Central Stats and Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
        {/* Just Added Floating Bubble Badge */}
        {justAddedAmount && (
          <div className="absolute -top-3 px-3 py-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-full text-xs font-black shadow-lg shadow-sky-500/30 animate-splash-pop flex items-center gap-1 z-30">
            <Droplet className="w-3 h-3 fill-white animate-bounce" />
            <span>+{unit === 'oz' ? Math.round(justAddedAmount * ML_TO_OZ_RATIO) : justAddedAmount} {unitLabel}</span>
          </div>
        )}

        {isGoalAchieved ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold mb-1 backdrop-blur-sm shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Goal Reached</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent mb-1 tracking-wider uppercase bg-accent-subtle/80 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            <Droplet className={`w-3.5 h-3.5 fill-accent ${isSurging ? 'animate-bounce' : ''}`} />
            <span>{progressPercent}% Today</span>
          </div>
        )}

        <div className="flex items-baseline justify-center gap-1 my-0.5">
          <span className="text-4xl font-black tracking-tight text-foreground drop-shadow-sm">
            {displayCurrent.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">/{displayGoal.toLocaleString()}</span>
        </div>

        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {unitLabel}
        </span>

        {currentMl < goalMl ? (
          <span className="text-xs text-muted-foreground mt-1.5 font-medium">
            {unit === 'oz'
              ? `${Math.round((goalMl - currentMl) * ML_TO_OZ_RATIO)} fl oz remaining`
              : `${(goalMl - currentMl).toLocaleString()} ml remaining`}
          </span>
        ) : (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>{currentMl > goalMl ? `+${(currentMl - goalMl).toLocaleString()} ml extra` : 'Daily Target Hit 🎉'}</span>
          </span>
        )}
      </div>
    </div>
  );
};

