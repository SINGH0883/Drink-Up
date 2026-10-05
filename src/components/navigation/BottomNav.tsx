import React from 'react';
import { Droplets, BarChart3, Bell, Settings } from 'lucide-react';
import { haptic } from '../../lib/haptics';

export type TabType = 'home' | 'history' | 'reminders' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Droplets },
    { id: 'history', label: 'History', icon: BarChart3 },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const handleTabClick = (tabId: TabType) => {
    if (activeTab !== tabId) {
      haptic.tap();
      onTabChange(tabId);
    }
  };

  return (
    <nav className="w-full shrink-0 z-40 bg-surface/90 dark:bg-surface/85 backdrop-blur-2xl border-t border-surface-border/80 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)] transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around px-3 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-accent scale-105 font-bold'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
            >
              {/* Active Tab Ambient Pill Background */}
              {isActive && (
                <div className="absolute inset-0 bg-accent/10 dark:bg-accent/15 rounded-2xl -z-10 animate-fade-in" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'stroke-[2.6px] scale-110 drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                      : 'stroke-[1.8px]'
                  }`}
                />
              </div>
              <span className="text-[11px] mt-1 font-bold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
