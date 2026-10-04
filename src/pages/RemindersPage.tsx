import React from 'react';
import {
  Bell,
  Sparkles,
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
    <div className="flex flex-col min-h-full pb-8">
      <Header
        title="Reminders"
        subtitle="Smart Hydration Timetable"
      />

      <main className="flex-1 px-4 py-2 max-w-md mx-auto w-full space-y-4">
        {/* Master Reminder Card */}
        <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  notifSettings.enabled
                    ? 'bg-accent/15 text-accent dark:bg-accent/20'
                    : 'bg-surface-subtle text-muted-foreground'
                }`}
              >
                <Bell className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Hydration Reminders</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {notifSettings.enabled ? 'Active throughout the day' : 'All reminders paused'}
                </p>
              </div>
            </div>
            <Switch checked={notifSettings.enabled} onChange={onToggleMasterSwitch} id="master-reminder-switch" />
          </div>

          {/* Quick Schedule Parameters */}
          {notifSettings.enabled && (
            <div className="mt-5 pt-4 border-t border-surface-border space-y-4">
              {/* Auto Schedule Switch */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Auto Schedule Timetable</span>
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Evenly spaces reminders from your target goal & cup size
                  </p>
                </div>
                <Switch
                  checked={userSettings.autoSchedule}
                  onChange={(val) => {
                    haptic.tap();
                    onUpdateUserSettings({ autoSchedule: val });
                  }}
                  id="auto-schedule-switch"
                />
              </div>

              {/* Live Timetable Summary Card */}
              {userSettings.autoSchedule && (
                <div className="p-3.5 rounded-2xl bg-accent-subtle/60 border border-accent/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-accent" />
                    <div>
                      <span className="font-bold text-foreground">
                        {scheduleSummary.drinksCount} drinks ({scheduleSummary.perDrinkMl}ml each)
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {scheduleSummary.firstDrinkTime} → {scheduleSummary.lastDrinkTime}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-accent text-white font-bold text-[11px] shadow-sm">
                    Every {scheduleSummary.intervalFormatted}
                  </span>
                </div>
              )}

              {/* Wake & Sleep Window */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-surface-subtle/70 border border-surface-border/80">
                  <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>Wake Time</span>
                  </label>
                  <input
                    type="time"
                    value={userSettings.wakeTime}
                    onChange={(e) => onUpdateUserSettings({ wakeTime: e.target.value })}
                    className="w-full mt-1 bg-transparent font-bold text-sm text-foreground focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-surface-subtle/70 border border-surface-border/80">
                  <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Sleep Time</span>
                  </label>
                  <input
                    type="time"
                    value={userSettings.sleepTime}
                    onChange={(e) => onUpdateUserSettings({ sleepTime: e.target.value })}
                    className="w-full mt-1 bg-transparent font-bold text-sm text-foreground focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Cup Size Selector */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                  <Coffee className="w-3.5 h-3.5 text-accent" />
                  <span>Target Cup Size (Interval Basis)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[150, 250, 500].map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        haptic.tap();
                        onUpdateUserSettings({ defaultCupMl: size });
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        userSettings.defaultCupMl === size
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-surface-subtle text-muted-foreground border-surface-border'
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
