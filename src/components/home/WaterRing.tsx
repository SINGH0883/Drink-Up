import React, { useState, useEffect, useRef } from 'react';
import { Droplet } from 'lucide-react';
import { ML_TO_OZ_RATIO } from '../../lib/constants';
import { UnitType } from '../../types';
import { haptic } from '../../lib/haptics';

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
  const size = 236;
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progressRatio = Math.min(1.5, Math.max(0, currentMl / (goalMl || 2500)));
  const progressPercent = Math.round(progressRatio * 100);
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

  // Liquid wave fill level percentage
  const waveFillPercent = Math.min(94, Math.max(progressPercent > 0 ? 14 : 0, progressPercent));

  const handleClick = () => {
    haptic.tap();
    if (onRingClick) onRingClick();
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-center justify-center my-1 cursor-pointer select-none group transition-transform duration-300 ${isSurging ? 'scale-[1.03]' : 'hover:scale-[1.015] active:scale-[0.98]'
        }`}
    >
      {/* Pulsing Ripple on Water Intake */}
      {isSurging && (
        <div className="absolute inset-0 rounded-full animate-ring-pulse pointer-events-none border-2 border-sky-400/50" />
      )}

      {/* Outer Ring Container */}
      <div
        className="rounded-full relative flex items-center justify-center bg-transparent"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {/* Inner Liquid Wave Fill Container (Orb Interior) */}
        <div
          className="absolute rounded-full overflow-hidden flex items-end justify-center pointer-events-none transition-all duration-700 bg-slate-900/10"
          style={{
            width: `${size - strokeWidth * 2 - 4}px`,
            height: `${size - strokeWidth * 2 - 4}px`,
          }}
        >
          {/* Water Ring Animation GIF */}
          <img
            src="/circle-water.gif"
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-85"
          />

          {/* Top Glass Highlight Reflection */}
          <div className="absolute top-1.5 inset-x-8 h-8 rounded-[50%] bg-gradient-to-b from-white/40 dark:from-white/10 to-transparent pointer-events-none -rotate-6 blur-[0.5px] z-10" />

          {/* Rising Wave Body */}
          {progressPercent > 0 && (
            <div
              className="w-full relative transition-all duration-1000 ease-out z-10"
              style={{
                height: `${waveFillPercent}%`,
                background: 'linear-gradient(to top, rgba(16, 185, 129, 0.35), rgba(52, 211, 153, 0.15))',
              }}
            >
              {/* Wave 1 SVG */}
              <div className="absolute -top-3 left-0 w-[200%] h-5 animate-wave-1 opacity-80">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                  <path
                    d="M0,0 C150,90 350,-40 500,50 C650,140 900,-30 1200,40 L1200,120 L0,120 Z"
                    fill="rgba(52, 211, 153, 0.5)"
                  />
                </svg>
              </div>

              {/* Wave 2 SVG */}
              <div className="absolute -top-3.5 left-0 w-[200%] h-6 animate-wave-2 opacity-60">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                  <path
                    d="M0,40 C300,-30 550,140 700,50 C850,-40 1050,90 1200,0 L1200,120 L0,120 Z"
                    fill="rgba(16, 185, 129, 0.55)"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* SVG Dual-Color Red (Remaining) & Green (Completed) Meter */}
        <svg width={size} height={size} className="transform -rotate-90 absolute inset-0 pointer-events-none">
          <defs>
            <linearGradient id="greenMeterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="redRemainingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="50%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>

          {/* Full Red Arc for Remaining Portion ("Kitna Baki Hai") */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#redRemainingGradient)"
            strokeWidth={strokeWidth}
            className="opacity-80 dark:opacity-90 transition-colors duration-300"
          />

          {/* Green Arc for Completed Portion ("Kitna Ho Chuka Hai") */}
          {progressPercent > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#greenMeterGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Floating Added Badge (only pops up temporarily when water is logged) */}
        {justAddedAmount && (
          <div className="absolute -top-4 px-3.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-xs font-black shadow-xl animate-splash-pop flex items-center gap-1.5 z-30 pointer-events-none">
            <Droplet className="w-3.5 h-3.5 fill-white animate-bounce" />
            <span>+{unit === 'oz' ? Math.round(justAddedAmount * ML_TO_OZ_RATIO) : justAddedAmount} {unitLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
