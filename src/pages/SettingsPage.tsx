import React, { useState } from 'react';
import {
  Target,
  Scale,
  Trash2,
  User,
  Volume2,
  Vibrate,
  VolumeX,
  Bell,
  Play,
  MessageSquare,
  Sparkles,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import {
  AlertType,
  MessageStyle,
  NotificationSettings,
  SoundTone,
  UserSettings,
} from '../types';
import { calculateGoalFromWeight } from '../lib/schedule';
import { haptic } from '../lib/haptics';
import { ML_TO_OZ_RATIO } from '../lib/constants';
import { playTone } from '../lib/sound';

interface SettingsPageProps {
  settings: UserSettings;
  notifSettings: NotificationSettings;
  onUpdateSettings: (changes: Partial<UserSettings>) => void;
  onUpdateNotifSettings: (changes: Partial<NotificationSettings>) => void;
  onTestNotification: () => void;
  onClearAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  notifSettings,
  onUpdateSettings,
  onUpdateNotifSettings,
  onTestNotification,
  onClearAllData,
}) => {
  const [userName, setUserName] = useState<string>(settings.userName || '');
  const [userAge, setUserAge] = useState<string>(settings.age ? settings.age.toString() : '');
  const [weightInput, setWeightInput] = useState<string>(settings.weightKg?.toString() || '');
  const [showWeightCalc, setShowWeightCalc] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const goalPresetsMl = [2000, 2500, 3000, 4000];

  const handleApplyWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(weightInput);
    if (!isNaN(kg) && kg > 20 && kg < 250) {
      const calculated = calculateGoalFromWeight(kg);
      onUpdateSettings({ dailyGoalMl: calculated, weightKg: kg });
      setShowWeightCalc(false);
      haptic.success();
    }
  };

  const alertTypes: { type: AlertType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { type: 'both', label: 'Sound + Buzz', icon: Volume2 },
    { type: 'buzz', label: 'Buzz Only', icon: Vibrate },
    { type: 'sound', label: 'Sound Only', icon: Volume2 },
    { type: 'silent', label: 'Silent', icon: VolumeX },
  ];

  const handleSelectAlertType = (type: AlertType) => {
    haptic.tap();
    onUpdateNotifSettings({ alertType: type });
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const soundTones: { id: SoundTone; label: string }[] = [
    { id: 'voice_announcement', label: 'Indian Voice 👧' },
    { id: 'water_drop', label: 'Water Drop 💧' },
    { id: 'gentle_chime', label: 'Gentle Chime 🔔' },
    { id: 'soft_bell', label: 'Soft Bell 🎵' },
    { id: 'crystal_ping', label: 'Crystal Ping ✨' },
    {
      id: 'custom',
      label: notifSettings.customSoundName
        ? `${notifSettings.customSoundName.length > 13 ? notifSettings.customSoundName.slice(0, 11) + '..' : notifSettings.customSoundName} 📁`
        : 'Choose File 📁',
    },
  ];

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        try {
          localStorage.setItem('drinkup_custom_audio', dataUrl);
        } catch {}
        onUpdateNotifSettings({
          soundTone: 'custom',
          customSoundData: dataUrl,
          customSoundName: file.name,
        });
        haptic.success();
        playTone('custom', settings.userName, settings.defaultCupMl || 150, dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const messageStyles: { id: MessageStyle; label: string; preview: string }[] = [
    {
      id: 'friendly',
      label: 'Friendly',
      preview: `Time for a fresh sip! Hello ${settings.userName || 'Friend'}, grab a glass to stay hydrated.`,
    },
    {
      id: 'simple',
      label: 'Simple',
      preview: `Hello ${settings.userName || 'Friend'}, it is time for your water intake.`,
    },
    {
      id: 'motivational',
      label: 'Motivational',
      preview: `Fuel your body! Every sip counts towards your best self.`,
    },
  ];

  const handleToneSelect = (tone: SoundTone) => {
    haptic.tap();
    if (tone === 'custom' && !notifSettings.customSoundData) {
      fileInputRef.current?.click();
      return;
    }
    playTone(tone, settings.userName, settings.defaultCupMl || 150, notifSettings.customSoundData);
    onUpdateNotifSettings({ soundTone: tone });
  };

  const handleSaveProfile = () => {
    onUpdateSettings({
      userName: userName.trim() || 'Friend',
      age: parseInt(userAge) || 24,
    });
    haptic.success();
  };

  return (
    <div className="flex flex-col min-h-full pb-10">
      <Header title="Settings" subtitle="Customize your hydration experience" />

      <main className="flex-1 px-4 py-2 max-w-md mx-auto w-full space-y-4">
        {/* User Profile */}
        <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Your Profile</h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onBlur={handleSaveProfile}
                placeholder="Your Name (e.g. Yuvi)"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Age (years)
              </label>
              <input
                type="number"
                value={userAge}
                onChange={(e) => setUserAge(e.target.value)}
                onBlur={handleSaveProfile}
                min={5}
                max={120}
                placeholder="Age"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Daily Hydration Goal */}
        <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-foreground">Daily Water Goal</h3>
            </div>
            <button
              onClick={() => setShowWeightCalc(!showWeightCalc)}
              className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 active:scale-95"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Weight Calc</span>
            </button>
          </div>

          <div className="flex items-baseline justify-between p-3 rounded-2xl bg-surface-subtle/70">
            <span className="text-xs font-semibold text-muted-foreground">Current Goal:</span>
            <span className="text-lg font-extrabold text-foreground">
              {settings.unit === 'oz'
                ? `${Math.round(settings.dailyGoalMl * ML_TO_OZ_RATIO)} fl oz`
                : `${settings.dailyGoalMl.toLocaleString()} ml`}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-2">
            {goalPresetsMl.map((val) => (
              <button
                key={val}
                onClick={() => {
                  haptic.tap();
                  onUpdateSettings({ dailyGoalMl: val });
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                  settings.dailyGoalMl === val
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-surface-subtle text-muted-foreground border-surface-border'
                }`}
              >
                {settings.unit === 'oz' ? `${Math.round(val * ML_TO_OZ_RATIO)}oz` : `${val / 1000}L`}
              </button>
            ))}
          </div>

          {/* Weight Calculator Collapsible */}
          {showWeightCalc && (
            <form
              onSubmit={handleApplyWeight}
              className="p-3.5 rounded-2xl bg-accent/5 border border-accent/20 mt-3 space-y-2 animate-fill-up"
            >
              <p className="text-xs font-semibold text-foreground">Calculate by body weight (~35 ml/kg):</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Body Weight (kg)"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-foreground focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm"
                >
                  Apply
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Alert Style */}
        <div className="p-4 rounded-3xl bg-surface border border-surface-border shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-foreground">Alert Style</h3>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">
              {alertTypes.find((a) => a.type === notifSettings.alertType)?.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {alertTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = notifSettings.alertType === item.type;

              return (
                <button
                  key={item.type}
                  onClick={() => handleSelectAlertType(item.type)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border text-left transition-all active:scale-98 ${
                    isSelected
                      ? 'border-accent bg-accent/10 ring-1 ring-accent text-foreground font-bold shadow-2xs'
                      : 'border-surface-border bg-surface-subtle/50 text-muted-foreground hover:bg-surface-subtle'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-accent text-white shadow-2xs'
                        : 'bg-surface text-muted-foreground border border-surface-border'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Sound */}
        {(notifSettings.alertType === 'sound' || notifSettings.alertType === 'both') && (
          <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-foreground">Notification Sound</h3>
            </div>
            {/* Hidden file input for custom audio */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleCustomAudioUpload}
              className="hidden"
            />
            <div className="grid grid-cols-2 gap-2">
              {soundTones.map((item) => {
                const isSelected = notifSettings.soundTone === item.id;
                const isCustom = item.id === 'custom';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isCustom && isSelected) {
                        // Open file picker to change file if already selected
                        fileInputRef.current?.click();
                      } else {
                        handleToneSelect(item.id);
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-3 rounded-2xl border text-left transition-all min-h-[46px] ${
                      isSelected
                        ? 'border-accent bg-accent/5 ring-1 ring-accent text-foreground font-bold'
                        : 'border-surface-border bg-surface-subtle/50 text-muted-foreground hover:bg-surface-subtle'
                    }`}
                  >
                    <span className="text-xs font-medium truncate mr-1">{item.label}</span>
                    <Play className="w-3 h-3 opacity-60 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Tone & Style */}
        <div className="p-5 rounded-3xl bg-surface border border-surface-border shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Message Tone & Style</h3>
          </div>
          <div className="space-y-2">
            {messageStyles.map((item) => {
              const isSelected = notifSettings.messageStyle === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    haptic.tap();
                    onUpdateNotifSettings({ messageStyle: item.id });
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/5 ring-1 ring-accent'
                      : 'border-surface-border bg-surface-subtle/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{item.label}</span>
                    <input
                      type="radio"
                      checked={isSelected}
                      readOnly
                      className="text-accent accent-accent"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 italic">
                    "{item.preview}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview / Test Alert Button */}
        <div className="p-3 rounded-2xl bg-surface border border-surface-border shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block leading-tight truncate">Test Notification</span>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                Preview sound & voice with current settings
              </p>
            </div>
          </div>
          <button
            onClick={onTestNotification}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-bold shadow-xs hover:bg-accent-hover active:scale-95 transition-all shrink-0 whitespace-nowrap"
          >
            <span>Test Now</span>
          </button>
        </div>


        {/* Reset / Clear Data */}
        <div className="pt-1">
          {showResetConfirm ? (
            <div className="p-3.5 rounded-2xl bg-surface border border-rose-200 dark:border-rose-900/50 shadow-2xs space-y-2.5 animate-fill-up">
              <div className="flex items-center gap-2 text-rose-500">
                <Trash2 className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Reset all data & history?</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This will delete your water logs and reset daily goals to default.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-surface-subtle text-xs font-bold text-muted-foreground hover:text-foreground border border-surface-border transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearAllData();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs hover:bg-rose-600 transition-colors active:scale-95"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-surface border border-surface-border text-rose-500 text-xs font-bold hover:bg-rose-500/5 hover:border-rose-200 active:scale-98 transition-all shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Data & Logs</span>
            </button>
          )}
        </div>

        {/* Creator Watermark - Single Clean Line */}
        <div className="pt-3 pb-6 flex items-center justify-center">
          <a
            href="https://github.com/SINGH0883"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface border border-surface-border shadow-2xs backdrop-blur-md hover:border-accent/40 active:scale-95 transition-all group text-[11px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span className="font-bold text-foreground">
              Drink Up <span className="text-muted-foreground font-normal">v1.0</span>
            </span>
            <span className="text-[10px] text-muted-foreground">•</span>
            <span className="text-muted-foreground flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline animate-bounce" /> by
            </span>
            <span className="font-extrabold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent group-hover:underline flex items-center gap-0.5">
              SINGH0883
              <ExternalLink className="w-3 h-3 text-sky-500 opacity-70 group-hover:opacity-100" />
            </span>
          </a>
        </div>
      </main>
    </div>
  );
};
