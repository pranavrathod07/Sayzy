import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { SpeechLanguage, ThemeMode } from '@/types';

const STORAGE_KEY = 'speaknow:settings:v1';

type Settings = {
  themeMode: ThemeMode;
  speechLanguage: SpeechLanguage;
  hapticsEnabled: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  themeMode: 'light',
  speechLanguage: 'en-US',
  hapticsEnabled: true,
};

type SettingsContextValue = {
  settings: Settings;
  loaded: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setSpeechLanguage: (lang: SpeechLanguage) => void;
  setHapticsEnabled: (enabled: boolean) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: Settings) => {
    setSettings(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => persist({ ...settings, themeMode: mode }),
    [settings, persist],
  );
  const setSpeechLanguage = useCallback(
    (lang: SpeechLanguage) => persist({ ...settings, speechLanguage: lang }),
    [settings, persist],
  );
  const setHapticsEnabled = useCallback(
    (enabled: boolean) => persist({ ...settings, hapticsEnabled: enabled }),
    [settings, persist],
  );

  return (
    <SettingsContext.Provider
      value={{ settings, loaded, setThemeMode, setSpeechLanguage, setHapticsEnabled }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
