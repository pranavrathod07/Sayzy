import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { generateId } from '@/utils/id';
import type { HistoryEntry, SpeechSource } from '@/types';

const STORAGE_KEY = 'speaknow:history:v1';
const MAX_ENTRIES = 300;

type HistoryContextValue = {
  entries: HistoryEntry[];
  loaded: boolean;
  addEntry: (text: string, source: SpeechSource) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setEntries(JSON.parse(raw));
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: HistoryEntry[]) => {
    setEntries(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addEntry = useCallback(
    (text: string, source: SpeechSource) => {
      if (!text.trim()) return;
      const entry: HistoryEntry = {
        id: generateId(),
        text: text.trim(),
        source,
        timestamp: Date.now(),
      };
      persist([entry, ...entries].slice(0, MAX_ENTRIES));
    },
    [entries, persist],
  );

  const clearHistory = useCallback(() => persist([]), [persist]);

  return (
    <HistoryContext.Provider value={{ entries, loaded, addEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
