import React from 'react';
import { DayLog, UnitType } from '../../types';
import { ML_TO_OZ_RATIO } from '../../lib/constants';

interface WeeklyBarChartProps {
  logs: Record<string, DayLog>;
  dailyGoalMl: number;
  unit: UnitType;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  logs,
  dailyGoalMl,
  unit,
}) => {
  // Generate last 7 days array
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const dayNum = d.getDate().toString().padStart(2, '0');
    const key = `${year}-${month}-${dayNum}`;

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const log = logs[key];
    const totalMl = log ? log.entries.reduce((sum, e) => sum + e.amountMl, 0) : 0;
    const goal = log?.goalMl || dailyGoalMl || 2500;
    const isCompleted = totalMl >= goal && totalMl > 0;
    const percent = Math.min(100, Math.round((totalMl / goal) * 100));

    return {
      key,
      dayName,
      dayNumber: d.getDate(),
      totalMl,
      goal,
      isCompleted,
      percent,
      isToday: idx === 6,
    };
  });

  const chartHeight = 140;

  return (
    <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm mb-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Last 7 Days</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Hydration consistency</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-muted-foreground">Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Goal Met</span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-44 pt-4 pb-2 px-1">
        {days.map((day) => {
          const barHeightPx = Math.max(8, Math.round((day.percent / 100) * chartHeight));
          const displayAmount =
            unit === 'oz'
              ? `${Math.round(day.totalMl * ML_TO_OZ_RATIO)}oz`
              : `${day.totalMl >= 1000 ? (day.totalMl / 1000).toFixed(1) + 'L' : day.totalMl}`;

          return (
            <div key={day.key} className="flex-1 flex flex-col items-center h-full justify-end group">
              {/* Tooltip on hover */}
              <span className="text-[10px] font-semibold text-muted-foreground mb-1 group-hover:text-foreground transition-colors">
                {day.totalMl > 0 ? displayAmount : '-'}
              </span>

              {/* Bar container */}
              <div className="w-full max-w-[28px] h-[140px] bg-surface-subtle rounded-xl flex flex-col justify-end p-1 relative overflow-hidden">
                {/* 100% Target Reference Line */}
                <div className="absolute top-0 left-0 right-0 border-t border-dashed border-muted-foreground/30 z-10" />

                <div
                  style={{ height: `${barHeightPx}px` }}
                  className={`w-full rounded-lg transition-all duration-500 ${
                    day.isCompleted
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : day.percent > 0
                      ? 'bg-gradient-to-t from-accent to-sky-400'
                      : 'bg-transparent'
                  }`}
                />
              </div>

              {/* Day Label */}
              <div className="flex flex-col items-center mt-2">
                <span
                  className={`text-[11px] font-bold ${
                    day.isToday ? 'text-accent font-extrabold' : 'text-foreground'
                  }`}
                >
                  {day.dayName}
                </span>
                <span className="text-[10px] text-muted-foreground">{day.dayNumber}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
