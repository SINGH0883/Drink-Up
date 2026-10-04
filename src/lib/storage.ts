import { Preferences } from '@capacitor/preferences';

export const storage = {
  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const { value } = await Preferences.get({ key });
      if (value !== null && value !== undefined) {
        return JSON.parse(value) as T;
      }
    } catch {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw) as T;
      } catch {
        // fallback to default
      }
    }
    return defaultValue;
  },

  async set<T>(key: string, value: T): Promise<void> {
    const stringified = JSON.stringify(value);
    try {
      await Preferences.set({ key, value: stringified });
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(key, stringified);
    } catch {
      // ignore
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await Preferences.remove({ key });
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },

  async clear(): Promise<void> {
    try {
      await Preferences.clear();
    } catch {
      // ignore
    }
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  }
};
