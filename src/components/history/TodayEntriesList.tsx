import React from 'react';
import { Trash2, Droplet, Clock } from 'lucide-react';
import { UnitType, WaterLogEntry } from '../../types';
import { ML_TO_OZ_RATIO } from '../../lib/constants';

interface TodayEntriesListProps {
  entries: WaterLogEntry[];
  unit: UnitType;
  onRemove: (id: string) => void;
}

export const TodayEntriesList: React.FC<TodayEntriesListProps> = ({
  entries,
  unit,
  onRemove,
}) => {
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatAmount = (ml: number) => {
    if (unit === 'oz') {
      return `${Math.round(ml * ML_TO_OZ_RATIO)} fl oz`;
    }
    return `${ml} ml`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3.5 rounded-2xl bg-surface border border-surface-border shadow-2xs">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h3 className="text-xs font-bold text-foreground">Today's Logs</h3>
        <span className="text-[10px] font-bold text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded-full">
          {entries.length} {entries.length === 1 ? 'drink' : 'drinks'}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-surface-subtle flex items-center justify-center text-muted-foreground mb-1.5">
            <Droplet className="w-5 h-5 opacity-40" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground">No drinks logged yet today</p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            Log your first glass from the Home tab!
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
          {sorted.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-2 rounded-xl bg-surface-subtle/70 hover:bg-surface-subtle transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                  <Droplet className="w-3.5 h-3.5 fill-accent" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block leading-tight">
                    +{formatAmount(entry.amountMl)}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTime(entry.timestamp)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRemove(entry.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all"
                aria-label="Delete entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
