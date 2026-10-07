import React, { useState, useEffect, useRef } from 'react';
import { Droplet } from 'lucide-react';
import { ML_TO_OZ_RATIO } from '../../lib/constants';
import { UnitType } from '../../types';

interface WaterRingProps {
  currentMl: number;
  goalMl: number;
  unit: UnitType;
}

export const WaterRing: React.FC<WaterRingProps> = ({
  currentMl,
  goalMl,
  unit,
}) => {
  const size = 230;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const validGoal = goalMl > 0 ? goalMl : 2000;
  const progressRatio = Math.min(1.5, Math.max(0, currentMl / validGoal));
  const progressPercent = Math.round((currentMl / validGoal) * 100);
  const strokeDashoffset = circumference - Math.min(1, progressRatio) * circumference;

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

  const unitLabel = unit === 'oz' ? 'fl oz' : 'ml';
  const displayCurrent = unit === 'oz' ? Math.round(currentMl * ML_TO_OZ_RATIO) : currentMl;
  const displayGoal = unit === 'oz' ? Math.round(validGoal * ML_TO_OZ_RATIO) : validGoal;

  // Wave fill percentage bounded between 12% and 94%
  const waveFillPercent = Math.min(94, Math.max(progressPercent > 0 ? 14 : 0, progressPercent));

  return (
    <div
      className={`relative flex items-center justify-center my-1 select-none pointer-events-none transition-transform duration-300 ${
        isSurging ? 'scale-[1.03]' : ''
      }`}
    >
      {/* Outer Container */}
      <div
        className="rounded-full relative flex items-center justify-center shadow-lg shadow-sky-500/10 dark:shadow-sky-950/40"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {/* Inner Liquid Sphere */}
        <div
          className="absolute rounded-full overflow-hidden flex items-end justify-center pointer-events-none transition-all duration-700 bg-gradient-to-b from-sky-50/70 via-sky-100/30 to-sky-200/40 dark:from-slate-900/80 dark:via-slate-900/90 dark:to-sky-950/70 shadow-inner"
          style={{
            width: `${size - strokeWidth * 2 - 4}px`,
            height: `${size - strokeWidth * 2 - 4}px`,
          }}
        >
          {/* Top Glass Highlight Reflection */}
          <div className="absolute top-2 inset-x-8 h-8 rounded-[50%] bg-gradient-to-b from-white/70 dark:from-white/15 to-transparent pointer-events-none -rotate-6 blur-[0.5px] z-20" />

          {/* Animated Rising Fluid Waves */}
          {progressPercent > 0 && (
            <div
              className="w-full relative transition-all duration-1000 ease-out z-10"
              style={{
                height: `${waveFillPercent}%`,
                background:
                  progressPercent >= 100
                    ? 'linear-gradient(to top, rgba(16, 185, 129, 0.45), rgba(52, 211, 153, 0.2))'
                    : 'linear-gradient(to top, rgba(14, 165, 233, 0.45), rgba(56, 189, 248, 0.2))',
              }}
            >
              {/* Wave 1 SVG */}
              <div className="absolute -top-3 left-0 w-[200%] h-5 animate-wave-1 opacity-85">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                  <path
                    d="M0,0 C150,90 350,-40 500,50 C650,140 900,-30 1200,40 L1200,120 L0,120 Z"
                    fill={progressPercent >= 100 ? 'rgba(52, 211, 153, 0.6)' : 'rgba(56, 189, 248, 0.6)'}
                  />
                </svg>
              </div>

              {/* Wave 2 SVG */}
              <div className="absolute -top-3.5 left-0 w-[200%] h-6 animate-wave-2 opacity-65">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                  <path
                    d="M0,40 C300,-30 550,140 700,50 C850,-40 1050,90 1200,0 L1200,120 L0,120 Z"
                    fill={progressPercent >= 100 ? 'rgba(16, 185, 129, 0.65)' : 'rgba(14, 165, 233, 0.65)'}
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Clean Central Hydration Metrics */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none text-center p-3">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black tracking-tight text-foreground drop-shadow-sm">
                {displayCurrent}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {unitLabel}
              </span>
            </div>

            <div className="mt-1 px-3 py-0.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-sky-200/60 dark:border-slate-700 shadow-2xs">
              <span
                className={`text-[11px] font-extrabold ${
                  progressPercent >= 100
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-sky-600 dark:text-sky-400'
                }`}
              >
                {progressPercent}% Complete
              </span>
            </div>

            <span className="text-[10px] font-semibold text-muted-foreground mt-1">
              Goal: {displayGoal} {unitLabel}
            </span>
          </div>
        </div>

        {/* Outer Circular Progress Meter Track */}
        <svg width={size} height={size} className="transform -rotate-90 absolute inset-0 pointer-events-none">
          <defs>
            <linearGradient id="hydratedMeterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="completedGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200/80 dark:text-slate-800/80 transition-colors duration-300"
          />

          {/* Dynamic Active Progress Stroke */}
          {progressPercent > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={progressPercent >= 100 ? 'url(#completedGoalGradient)' : 'url(#hydratedMeterGradient)'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Floating Added Toast on Quick Add */}
        {justAddedAmount && (
          <div className="absolute -top-3.5 px-3.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-xs font-black shadow-xl animate-splash-pop flex items-center gap-1.5 z-30 pointer-events-none">
            <Droplet className="w-3.5 h-3.5 fill-white animate-bounce" />
            <span>
              +{unit === 'oz' ? Math.round(justAddedAmount * ML_TO_OZ_RATIO) : justAddedAmount}{' '}
              {unitLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
