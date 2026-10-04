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
    <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">Today's Logs</h3>
        <span className="text-xs font-semibold text-muted-foreground">
          {entries.length} {entries.length === 1 ? 'drink' : 'drinks'}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-surface-subtle flex items-center justify-center text-muted-foreground mb-2">
            <Droplet className="w-6 h-6 opacity-40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No drinks logged yet today</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Log your first glass from the Home tab!
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {sorted.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle/70 hover:bg-surface-subtle transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                  <Droplet className="w-4 h-4 fill-accent" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">
                    +{formatAmount(entry.amountMl)}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(entry.timestamp)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRemove(entry.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all"
                aria-label="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
