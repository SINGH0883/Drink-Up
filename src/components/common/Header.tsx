import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { haptic } from '../../lib/haptics';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightElement,
}) => {
  const handleBack = () => {
    haptic.tap();
    if (onBack) onBack();
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-sky-400/50 via-sky-300/30 via-sky-200/15 to-transparent dark:from-sky-950/70 dark:via-sky-900/40 dark:to-transparent backdrop-blur-xl px-5 pt-safe pb-3 transition-all">
      <div className="flex items-center justify-between min-h-[46px]">
        <div className="flex items-center gap-2.5">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="w-9 h-9 rounded-2xl bg-surface/90 border border-sky-300/40 flex items-center justify-center text-foreground hover:bg-surface active:scale-95 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 dark:from-sky-300 dark:via-blue-300 dark:to-cyan-200 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5 tracking-tight flex items-center gap-1">
                <span>{subtitle}</span>
              </p>
            )}
          </div>
        </div>

        {rightElement && <div className="flex items-center gap-2">{rightElement}</div>}
      </div>
    </header>
  );
};
