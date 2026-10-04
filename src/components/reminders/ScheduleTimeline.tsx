import React from 'react';
import { Bell, CheckCircle, BellOff, Sparkles } from 'lucide-react';
import { ReminderSlot, UnitType } from '../../types';
import { formatTo12Hour, parseTimeToMinutes, formatInterval } from '../../lib/schedule';
import { ML_TO_OZ_RATIO } from '../../lib/constants';

interface ScheduleTimelineProps {
  slots: ReminderSlot[];
  unit: UnitType;
  todayTotalMl?: number;
  onToggleSlot: (id: number) => void;
  isAutoSchedule: boolean;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  slots,
  unit,
  todayTotalMl = 0,
  onToggleSlot,
  isAutoSchedule,
}) => {
  const formatAmount = (ml: number) => {
    if (unit === 'oz') {
      return `${Math.round(ml * ML_TO_OZ_RATIO)} fl oz`;
    }
    return `${ml} ml`;
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Compute average interval between slots
  let intervalText = '';
  if (slots.length > 1) {
    const diff = parseTimeToMinutes(slots[1].timeStr) - parseTimeToMinutes(slots[0].timeStr);
    if (diff > 0) {
      intervalText = `Every ${formatInterval(diff)}`;
    }
  }

  const activeCount = slots.filter((s) => s.active).length;
  const totalMlTarget = slots.filter((s) => s.active).reduce((s, e) => s + e.targetMl, 0);

  // Track cumulative target for active slots to determine completion
  let cumulativeActiveMl = 0;

  return (
    <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            {isAutoSchedule && <Sparkles className="w-4 h-4 text-accent" />}
            <span>{isAutoSchedule ? 'Optimized Daily Timetable' : 'Custom Reminder Schedule'}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeCount} {activeCount === 1 ? 'drink' : 'drinks'} • {formatAmount(totalMlTarget)} total
          </p>
        </div>
        {intervalText && (
          <span className="px-2.5 py-1 rounded-xl bg-accent-subtle text-accent text-xs font-bold">
            {intervalText}
          </span>
        )}
      </div>

      {slots.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No reminders scheduled. Adjust wake & sleep hours.
        </p>
      ) : (
        <div className="space-y-2 mt-4">
          {slots.map((slot, index) => {
            const slotMinutes = parseTimeToMinutes(slot.timeStr);
            const isPast = slotMinutes < currentMinutes;

            let isFulfilled = false;
            if (slot.active) {
              cumulativeActiveMl += slot.targetMl;
              isFulfilled = todayTotalMl >= cumulativeActiveMl;
            }

            return (
              <div
                key={slot.id}
                onClick={() => onToggleSlot(slot.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  slot.active
                    ? isFulfilled
                      ? 'bg-surface border-emerald-500/30 shadow-sm'
                      : isPast
                      ? 'bg-surface-subtle/40 border-surface-border opacity-75'
                      : 'bg-surface border-surface-border hover:border-accent/40 shadow-sm'
                    : 'bg-surface-subtle/20 border-dashed border-surface-border opacity-40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      slot.active
                        ? isFulfilled
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : isPast
                          ? 'bg-surface-subtle text-muted-foreground'
                          : 'bg-accent/15 text-accent'
                        : 'bg-surface-subtle text-muted-foreground'
                    }`}
                  >
                    {isFulfilled && slot.active ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span>#{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-foreground tracking-tight">
                      {formatTo12Hour(slot.timeStr)}
                    </span>
                    <span className="block text-[11px] font-medium text-muted-foreground">
                      Drink {formatAmount(slot.targetMl)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                      slot.active
                        ? isFulfilled
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : isPast
                          ? 'bg-surface-subtle text-muted-foreground'
                          : 'bg-accent/10 text-accent'
                        : 'bg-surface-subtle text-muted-foreground'
                    }`}
                  >
                    {slot.active ? (
                      isFulfilled ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                          <span>Drank</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Bell className="w-3 h-3 stroke-[2.5]" />
                          <span>Active</span>
                        </span>
                      )
                    ) : (
                      <span className="flex items-center gap-1">
                        <BellOff className="w-3 h-3 stroke-[2.5]" />
                        <span>Skip</span>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
