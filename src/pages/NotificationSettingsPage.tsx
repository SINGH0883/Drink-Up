import React from 'react';
import {
  Volume2,
  Play,
  MessageSquare,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import {
  MessageStyle,
  NotificationSettings,
  SoundTone,
  UserSettings,
} from '../types';
import { haptic } from '../lib/haptics';
import { playTone } from '../lib/sound';

interface NotificationSettingsPageProps {
  userSettings?: UserSettings;
  notifSettings: NotificationSettings;
  onUpdateNotifSettings: (changes: Partial<NotificationSettings>) => void;
  onBack: () => void;
  onTestNotification: () => void;
}

export const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({
  userSettings,
  notifSettings,
  onUpdateNotifSettings,
  onBack,
  onTestNotification,
}) => {
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
        playTone('custom', userSettings?.userName, userSettings?.defaultCupMl || 150, dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const messageStyles: { id: MessageStyle; label: string; preview: string }[] = [
    {
      id: 'friendly',
      label: 'Friendly',
      preview: `Time for a fresh sip! Hello ${userSettings?.userName || 'Friend'}, grab a glass to stay hydrated.`,
    },
    {
      id: 'simple',
      label: 'Simple',
      preview: `Hello ${userSettings?.userName || 'Friend'}, it is time for your water intake.`,
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
    playTone(tone, userSettings?.userName, userSettings?.defaultCupMl || 150, notifSettings.customSoundData);
    onUpdateNotifSettings({ soundTone: tone });
  };

  return (
    <div className="flex flex-col min-h-full pb-10">
      <Header
        title="Notification Options"
        subtitle="Fine-tune sounds, voice & alert rules"
        showBack
        onBack={onBack}
      />

      <main className="flex-1 px-4 py-3 max-w-md mx-auto w-full space-y-4">
        {/* Test Alert Button */}
        <div className="p-3 rounded-2xl bg-surface border border-surface-border shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground block leading-tight truncate">Preview Notification</span>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                Trigger a test with current settings
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

        {/* Tone Selector */}
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

        {/* Message Style */}
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


      </main>
    </div>
  );
};
