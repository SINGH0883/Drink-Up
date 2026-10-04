import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';

export function useTheme() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');

    const metaColor = document.getElementById('meta-theme-color');
    if (metaColor) {
      metaColor.setAttribute('content', '#F8FAFC');
    }

    try {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  return { theme: 'light' as const };
}
