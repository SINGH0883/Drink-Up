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
    <header className="sticky top-0 z-30 bg-gradient-to-b from-sky-400/35 via-sky-500/20 to-background/80 dark:from-sky-900/50 dark:via-blue-950/35 dark:to-background/80 backdrop-blur-2xl px-5 pt-safe pb-3.5 border-b border-sky-400/20 dark:border-sky-500/20 transition-all">
      <div className="absolute top-0 left-10 w-48 h-12 bg-sky-400/30 dark:bg-sky-400/40 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute top-0 right-10 w-40 h-10 bg-cyan-400/25 dark:bg-cyan-400/30 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="flex items-center justify-between min-h-[44px]">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="w-10 h-10 -ml-2 rounded-2xl flex items-center justify-center text-foreground hover:bg-surface/80 active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 dark:from-sky-300 dark:via-blue-300 dark:to-cyan-200 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-muted-foreground font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  );
};
