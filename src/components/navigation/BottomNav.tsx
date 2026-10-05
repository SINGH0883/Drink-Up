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
    <div className="w-full shrink-0 z-40 px-4 pb-3 pt-1 pointer-events-none">
      <nav className="pointer-events-auto max-w-sm md:max-w-md mx-auto flex items-center justify-around px-2.5 py-1.5 rounded-full bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-surface-border/80 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.16),0_2px_10px_rgba(0,0,0,0.08)] transition-all">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-full transition-all duration-200 ${
                isActive
                  ? 'text-accent font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
            >
              {/* Active Tab Ambient Pill Background */}
              {isActive && (
                <div className="absolute inset-0 bg-accent/15 dark:bg-accent/20 rounded-full -z-10 animate-fade-in shadow-xs" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'stroke-[2.6px] scale-105 drop-shadow-[0_0_10px_rgba(37,99,235,0.45)]'
                      : 'stroke-[1.8px]'
                  }`}
                />
              </div>
              <span className="text-[10px] mt-0.5 font-bold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
