import React from 'react';
import {
  Bell,
  Clock,
  Coffee,
  CalendarCheck,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { Switch } from '../components/common/Switch';
import { ScheduleTimeline } from '../components/reminders/ScheduleTimeline';
import { NotificationSettings, ReminderSlot, UserSettings } from '../types';
import { haptic } from '../lib/haptics';
import { getScheduleSummary } from '../lib/schedule';

interface RemindersPageProps {
  userSettings: UserSettings;
  notifSettings: NotificationSettings;
  activeSlots: ReminderSlot[];
  todayTotalMl?: number;
  onUpdateUserSettings: (changes: Partial<UserSettings>) => void;
  onToggleMasterSwitch: (enable: boolean) => void;
  onToggleSlotActive: (slotId: number) => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({
  userSettings,
  notifSettings,
  activeSlots,
  todayTotalMl = 0,
  onUpdateUserSettings,
  onToggleMasterSwitch,
  onToggleSlotActive,
}) => {
  const scheduleSummary = getScheduleSummary({
    goalMl: userSettings.dailyGoalMl,
    cupSizeMl: userSettings.defaultCupMl,
    wakeTime: userSettings.wakeTime,
    sleepTime: userSettings.sleepTime,
  });

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden pb-1">
      <Header
        title="Reminders"
        subtitle="Smart Hydration Timetable"
      />

      <main className="flex-1 px-3.5 pt-1 pb-2 max-w-md mx-auto w-full flex flex-col gap-2.5 min-h-0">
        {/* Master Reminder Card */}
        <div className="p-3.5 rounded-2xl bg-surface border border-surface-border shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notifSettings.enabled
                    ? 'bg-accent/15 text-accent dark:bg-accent/20'
                    : 'bg-surface-subtle text-muted-foreground'
                }`}
              >
                <Bell className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground leading-tight">Hydration Reminders</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {notifSettings.enabled ? 'Active throughout the day' : 'All reminders paused'}
                </p>
              </div>
            </div>
            <Switch checked={notifSettings.enabled} onChange={onToggleMasterSwitch} id="master-reminder-switch" />
          </div>

          {/* Quick Schedule Parameters */}
          {notifSettings.enabled && (
            <div className="pt-2 border-t border-surface-border space-y-2.5">
              {/* Live Timetable Summary Card */}
              <div className="p-2 rounded-xl bg-accent-subtle/70 border border-accent/20 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-foreground">
                      {scheduleSummary.drinksCount} drinks ({scheduleSummary.perDrinkMl}ml each)
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {scheduleSummary.firstDrinkTime} → {scheduleSummary.lastDrinkTime}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-accent text-white font-bold text-[10px] shadow-2xs shrink-0">
                  Every {scheduleSummary.intervalFormatted}
                </span>
              </div>

              {/* Wake & Sleep Window */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-surface-subtle/80 border border-surface-border">
                  <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>Wake Time</span>
                  </label>
                  <input
                    type="time"
                    value={userSettings.wakeTime}
                    onChange={(e) => onUpdateUserSettings({ wakeTime: e.target.value })}
                    className="w-full bg-transparent font-bold text-xs text-foreground focus:outline-none cursor-pointer mt-0.5"
                  />
                </div>

                <div className="p-2 rounded-xl bg-surface-subtle/80 border border-surface-border">
                  <label className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Sleep Time</span>
                  </label>
                  <input
                    type="time"
                    value={userSettings.sleepTime}
                    onChange={(e) => onUpdateUserSettings({ sleepTime: e.target.value })}
                    className="w-full bg-transparent font-bold text-xs text-foreground focus:outline-none cursor-pointer mt-0.5"
                  />
                </div>
              </div>

              {/* Cup Size Selector */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
                  <Coffee className="w-3.5 h-3.5 text-accent" />
                  <span>Cup Size</span>
                </span>
                <div className="flex gap-1.5">
                  {[150, 250, 500].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        haptic.tap();
                        onUpdateUserSettings({ defaultCupMl: size });
                      }}
                      className={`py-1 px-2.5 rounded-lg text-[11px] font-bold border transition-all ${
                        userSettings.defaultCupMl === size
                          ? 'bg-accent text-white border-accent shadow-2xs'
                          : 'bg-surface-subtle text-muted-foreground border-surface-border hover:bg-surface'
                      }`}
                    >
                      {size} ml
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Timeline Preview */}
        {notifSettings.enabled && (
          <ScheduleTimeline
            slots={activeSlots}
            unit={userSettings.unit}
            todayTotalMl={todayTotalMl}
            onToggleSlot={onToggleSlotActive}
            isAutoSchedule={userSettings.autoSchedule}
          />
        )}
      </main>
    </div>
  );
};
