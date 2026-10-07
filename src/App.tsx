import { useState, useEffect, useRef } from 'react';
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
import { AppTour } from './components/common/AppTour';
import { storage } from './lib/storage';
import { haptic } from './lib/haptics';

const TABS: TabType[] = ['home', 'history', 'reminders', 'settings'];

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [subPage, setSubPage] = useState<'none' | 'notification_settings'>('none');
  const [showTour, setShowTour] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

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

  // 1-Finger horizontal swipe gesture handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (subPage !== 'none') return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || subPage !== 'none') return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Minimum swipe threshold of 50px and horizontal dominance (at least 1.3x vertical)
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentIndex = TABS.indexOf(activeTab);
      if (deltaX < 0 && currentIndex < TABS.length - 1) {
        // Swiped Left -> Move to Next Tab
        haptic.tap();
        setActiveTab(TABS[currentIndex + 1]);
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swiped Right -> Move to Previous Tab
        haptic.tap();
        setActiveTab(TABS[currentIndex - 1]);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

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

  // Trigger tour automatically for first-time visitors who finished onboarding
  useEffect(() => {
    if (isLoaded && settings.onboardingCompleted && settings.tourCompleted !== true) {
      setShowTour(true);
    }
  }, [isLoaded, settings.onboardingCompleted, settings.tourCompleted]);

  const handleFinishTour = async () => {
    await updateSettings({ tourCompleted: true });
    setShowTour(false);
  };

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
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-screen h-[100dvh] bg-background text-foreground flex flex-col max-w-md md:max-w-xl lg:max-w-2xl mx-auto relative overflow-hidden transition-colors duration-200 select-none"
    >
      {/* Scrollable Main Area */}
      <div className="flex-1 flex flex-col overflow-y-auto overscroll-y-contain min-h-0">
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
          <div key={activeTab} className="flex-1 flex flex-col min-h-full animate-fade-in">
            {activeTab === 'home' && (
              <HomePage
                stats={stats}
                settings={settings}
                onAddWater={addWater}
                undoEntry={undoEntry}
                onUndoLastAdd={undoLastAdd}
                onNavigateToReminders={() => setActiveTab('reminders')}
                onStartTour={() => setShowTour(true)}
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
                onStartTour={() => setShowTour(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* Global In-App Notification Banner */}
      <InAppNotificationBanner
        notification={inAppBanner}
        onDismiss={dismissInAppBanner}
        onDrinkAction={(amount) => addWater(amount)}
      />

      {/* Interactive App Tour Guide */}
      {showTour && (
        <AppTour
          userName={settings.userName}
          onFinish={handleFinishTour}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {subPage === 'none' && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}
