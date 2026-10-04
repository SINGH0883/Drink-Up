import React from 'react';
import { Droplet, BarChart3, Bell, Settings } from 'lucide-react';
import { haptic } from '../../lib/haptics';

export type TabType = 'home' | 'history' | 'reminders' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Droplet },
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
    <nav className="w-full shrink-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-surface-border pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-accent font-semibold scale-105'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5px] scale-110 drop-shadow-[0_0_8px_var(--color-accent-glow)]' : 'stroke-[1.8px]'
                  }`}
                />
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
