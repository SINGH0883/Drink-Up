import React, { useEffect, useState } from 'react';
import { Droplet, X, Check } from 'lucide-react';
import { haptic } from '../../lib/haptics';

export interface InAppNotificationData {
  id: string;
  title: string;
  body: string;
  amountMl: number;
}

interface InAppNotificationBannerProps {
  notification: InAppNotificationData | null;
  onDismiss: () => void;
  onDrinkAction: (amountMl: number) => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  notification,
  onDismiss,
  onDrinkAction,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification) {
      setProgress(100);
      return;
    }

    const duration = 7000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-3 inset-x-3 max-w-md mx-auto z-50 animate-in fade-in slide-in-from-top-6 duration-300">
      <div className="bg-surface/95 backdrop-blur-xl border border-accent/40 rounded-3xl p-4 shadow-2xl shadow-accent/20 flex flex-col gap-3 relative overflow-hidden">
        {/* Progress timer bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface-subtle">
          <div
            className="h-full bg-gradient-to-r from-accent to-sky-400 transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start gap-3 mt-1">
          <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 shadow-inner">
            <Droplet className="w-5 h-5 text-accent animate-bounce" fill="currentColor" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black tracking-tight text-foreground line-clamp-1">
                {notification.title}
              </h4>
              <button
                onClick={() => {
                  haptic.tap();
                  onDismiss();
                }}
                className="p-1 -mr-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-subtle transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed line-clamp-2">
              {notification.body}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              haptic.success();
              onDrinkAction(notification.amountMl);
              onDismiss();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-accent text-white text-xs font-bold shadow-md shadow-accent/30 flex items-center justify-center gap-1.5 active:scale-95 hover:bg-accent-hover transition-all"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Drank {notification.amountMl} ml</span>
          </button>
          <button
            onClick={() => {
              haptic.tap();
              onDismiss();
            }}
            className="py-2.5 px-3 rounded-xl bg-surface-subtle hover:bg-surface-border text-foreground text-xs font-semibold active:scale-95 transition-all"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
