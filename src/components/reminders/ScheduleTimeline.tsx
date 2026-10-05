import React from 'react';
import { Droplet, Clock, CheckCircle, Bell, BellOff, Sparkles } from 'lucide-react';
import { ReminderSlot, UnitType } from '../../types';
import { formatTo12Hour, parseTimeToMinutes, formatInterval } from '../../lib/schedule';
import { ML_TO_OZ_RATIO } from '../../lib/constants';
import { haptic } from '../../lib/haptics';

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

  let cumulativeActiveMl = 0;

  return (
    <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            {isAutoSchedule && <Sparkles className="w-4 h-4 text-accent shrink-0" />}
            <span>{isAutoSchedule ? 'Daily Timetable' : 'Custom Schedule'}</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {intervalText ? `${intervalText} • ` : ''}{formatAmount(totalMlTarget)} total
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-surface-subtle px-2.5 py-1 rounded-full shrink-0">
          {activeCount} {activeCount === 1 ? 'drink' : 'drinks'}
        </span>
      </div>

      {slots.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-surface-subtle flex items-center justify-center text-muted-foreground mb-2">
            <Droplet className="w-6 h-6 opacity-40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No reminders scheduled</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Adjust wake & sleep hours or add slots.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {slots.map((slot) => {
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
                onClick={() => {
                  haptic.tap();
                  onToggleSlot(slot.id);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                  slot.active
                    ? isFulfilled
                      ? 'bg-surface border-emerald-500/30 hover:bg-surface-subtle/50'
                      : 'bg-surface-subtle/70 hover:bg-surface-subtle border-transparent'
                    : 'bg-surface-subtle/30 border-dashed border-surface-border opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                      slot.active
                        ? isFulfilled
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-accent-subtle text-accent'
                        : 'bg-surface-subtle text-muted-foreground'
                    }`}
                  >
                    {isFulfilled && slot.active ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Droplet
                        className={`w-4 h-4 ${
                          slot.active ? 'fill-accent text-accent' : 'text-muted-foreground'
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground">
                      +{formatAmount(slot.targetMl)}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatTo12Hour(slot.timeStr)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition-all ${
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
