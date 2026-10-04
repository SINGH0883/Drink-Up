import { Flame, Trophy } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, bestStreak }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      <div className="flex items-center gap-3 p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 shadow-sm">
        <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Flame className="w-6 h-6 fill-amber-500 stroke-amber-600" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-foreground">{currentStreak}</span>
            <span className="text-xs font-semibold text-muted-foreground">{currentStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
            Current Streak
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 shadow-sm">
        <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-accent" />
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-foreground">{bestStreak}</span>
            <span className="text-xs font-semibold text-muted-foreground">{bestStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Best Record
          </span>
        </div>
      </div>
    </div>
  );
};
