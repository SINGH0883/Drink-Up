import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const haptic = {
  /** Light tap for button clicks & quick-add */
  async tap(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Fallback in web browser if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }
  },

  /** Medium tap for modal open / toggle switch */
  async medium(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  },

  /** Heavy vibration for deletions or resetting */
  async heavy(): Promise<void> {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  },

  /** Success buzz pattern for logging water and reaching goal */
  async success(): Promise<void> {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([40, 60, 80]);
      }
    }
  },

  /** Custom buzz sequence for "Buzz Only" notification preview */
  async buzzPattern(): Promise<void> {
    try {
      await Haptics.vibrate({ duration: 400 });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([150, 100, 200]);
      }
    }
  }
};
