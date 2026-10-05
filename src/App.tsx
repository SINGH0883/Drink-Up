import { useState, useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useTheme } from './hooks/useTheme';
import { useWaterLog } from './hooks/useWaterLog';
import { useNotifications } from './hooks/useNotifications';
import { BottomNav, TabType } from './components/navigation/BottomNav';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { RemindersPage } from './pages/RemindersPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationSettingsPage } from './pages/NotificationSettingsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { InAppNotificationBanner } from './components/common/InAppNotificationBanner';
import { storage } from './lib/storage';
import { haptic } from './lib/haptics';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [subPage, setSubPage] = useState<'none' | 'notification_settings'>('none');

  useTheme();
  const {
    isLoaded,
    settings,
    updateSettings,
    todayLog,
    allLogs,
    stats,
    undoEntry,
    addWater,
    undoLastAdd,
    removeEntry,
  } = useWaterLog();

  const {
    notifSettings,
    activeSlots,
    inAppBanner,
    dismissInAppBanner,
    updateNotifSettings,
    requestPermission,
    toggleMasterSwitch,
    toggleSlotActive,
    testNotification,
  } = useNotifications(settings, stats.todayTotalMl, (amount) => {
    addWater(amount);
  });

  // Hardware Back Button listener for Android
  useEffect(() => {
    let handle: { remove: () => void } | null = null;

    CapacitorApp.addListener('backButton', () => {
      if (subPage !== 'none') {
        setSubPage('none');
      } else if (activeTab !== 'home') {
        setActiveTab('home');
      } else {
        CapacitorApp.exitApp();
      }
    }).then((h) => {
      handle = h;
    }).catch(() => {});

    return () => {
      if (handle) handle.remove();
    };
  }, [subPage, activeTab]);

  const handleClearAllData = async () => {
    await storage.clear();
    await haptic.heavy();
    window.location.reload();
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          <span className="text-sm font-semibold tracking-wide text-muted-foreground">
            Loading Drink Up...
          </span>
        </div>
      </div>
    );
  }

  // Step-by-step Onboarding for First Time Users
  if (!settings.onboardingCompleted) {
    return (
      <OnboardingPage
        onComplete={async (newSettings) => {
          await updateSettings(newSettings);
        }}
        onRequestNotifications={requestPermission}
      />
    );
  }

  return (
    <div className="h-screen h-[100dvh] bg-background text-foreground flex flex-col max-w-md mx-auto relative overflow-hidden transition-colors duration-200">
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain">
        {/* Subpage or Primary Tabs */}
        {subPage === 'notification_settings' ? (
        <NotificationSettingsPage
          userSettings={settings}
          notifSettings={notifSettings}
          onUpdateNotifSettings={updateNotifSettings}
          onBack={() => setSubPage('none')}
          onTestNotification={testNotification}
        />
      ) : (
        <>
          {activeTab === 'home' && (
            <HomePage
              stats={stats}
              settings={settings}
              onAddWater={addWater}
              undoEntry={undoEntry}
              onUndoLastAdd={undoLastAdd}
              onNavigateToReminders={() => setActiveTab('reminders')}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPage
              stats={stats}
              allLogs={allLogs}
              todayLog={todayLog}
              settings={settings}
              onRemoveEntry={removeEntry}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersPage
              userSettings={settings}
              notifSettings={notifSettings}
              activeSlots={activeSlots}
              todayTotalMl={stats.todayTotalMl}
              onUpdateUserSettings={updateSettings}
              onToggleMasterSwitch={toggleMasterSwitch}
              onToggleSlotActive={toggleSlotActive}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              settings={settings}
              notifSettings={notifSettings}
              onUpdateSettings={updateSettings}
              onUpdateNotifSettings={updateNotifSettings}
              onTestNotification={testNotification}
              onClearAllData={handleClearAllData}
            />
          )}
        </>
      )}
      </div>

      {/* Global In-App Notification Banner */}
      <InAppNotificationBanner
        notification={inAppBanner}
        onDismiss={dismissInAppBanner}
        onDrinkAction={(amount) => addWater(amount)}
      />

      {subPage === 'none' && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
