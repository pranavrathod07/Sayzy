import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { generateId } from '@/utils/id';
import { flattenStrokes, recognizeStroke } from '@/utils/gestureRecognizer';
import type { Phrase, Point, Shortcut } from '@/types';

const STORAGE_KEY = 'speaknow:shortcuts:v1';

type ShortcutsContextValue = {
  shortcuts: Shortcut[];
  loaded: boolean;
  addShortcut: (input: {
    code?: string;
    strokes?: Point[][];
    phrases: string[];
  }) => Shortcut;
  updateShortcut: (
    id: string,
    input: { code?: string; strokes?: Point[][] },
  ) => void;
  deleteShortcut: (id: string) => void;
  addPhrase: (shortcutId: string, text: string) => void;
  updatePhrase: (shortcutId: string, phraseId: string, text: string) => void;
  deletePhrase: (shortcutId: string, phraseId: string) => void;
  setPhraseVoice: (
    shortcutId: string,
    phraseId: string,
    voiceUri: string | undefined,
  ) => void;
  matchCode: (code: string) => Shortcut | null;
  matchGesture: (strokes: Point[][]) => { shortcut: Shortcut; score: number } | null;
};

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setShortcuts(JSON.parse(raw));
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: Shortcut[]) => {
    setShortcuts(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addShortcut = useCallback(
    (input: { code?: string; strokes?: Point[][]; phrases: string[] }) => {
      const shortcut: Shortcut = {
        id: generateId(),
        code: input.code?.trim().toUpperCase() || undefined,
        strokes: input.strokes,
        phrases: input.phrases
          .filter((p) => p.trim().length > 0)
          .map((text) => ({ id: generateId(), text: text.trim() })),
        createdAt: Date.now(),
      };
      persist([shortcut, ...shortcuts]);
      return shortcut;
    },
    [shortcuts, persist],
  );

  const updateShortcut = useCallback(
    (id: string, input: { code?: string; strokes?: Point[][] }) => {
      persist(
        shortcuts.map((s) =>
          s.id === id
            ? {
                ...s,
                code:
                  input.code !== undefined
                    ? input.code.trim().toUpperCase() || undefined
                    : s.code,
                strokes: input.strokes !== undefined ? input.strokes : s.strokes,
              }
            : s,
        ),
      );
    },
    [shortcuts, persist],
  );

  const deleteShortcut = useCallback(
    (id: string) => {
      persist(shortcuts.filter((s) => s.id !== id));
    },
    [shortcuts, persist],
  );

  const addPhrase = useCallback(
    (shortcutId: string, text: string) => {
      if (!text.trim()) return;
      persist(
        shortcuts.map((s) =>
          s.id === shortcutId
            ? { ...s, phrases: [...s.phrases, { id: generateId(), text: text.trim() }] }
            : s,
        ),
      );
    },
    [shortcuts, persist],
  );

  const updatePhrase = useCallback(
    (shortcutId: string, phraseId: string, text: string) => {
      persist(
        shortcuts.map((s) =>
          s.id === shortcutId
            ? {
                ...s,
                phrases: s.phrases.map((p) =>
                  p.id === phraseId ? { ...p, text } : p,
                ),
              }
            : s,
        ),
      );
    },
    [shortcuts, persist],
  );

  const deletePhrase = useCallback(
    (shortcutId: string, phraseId: string) => {
      persist(
        shortcuts.map((s) =>
          s.id === shortcutId
            ? { ...s, phrases: s.phrases.filter((p) => p.id !== phraseId) }
            : s,
        ),
      );
    },
    [shortcuts, persist],
  );

  const setPhraseVoice = useCallback(
    (shortcutId: string, phraseId: string, voiceUri: string | undefined) => {
      persist(
        shortcuts.map((s) =>
          s.id === shortcutId
            ? {
                ...s,
                phrases: s.phrases.map((p) =>
                  p.id === phraseId ? { ...p, voiceUri } : p,
                ),
              }
            : s,
        ),
      );
    },
    [shortcuts, persist],
  );

  const matchCode = useCallback(
    (code: string): Shortcut | null => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) return null;
      return shortcuts.find((s) => s.code === normalized) ?? null;
    },
    [shortcuts],
  );

  const matchGesture = useCallback(
    (strokes: Point[][]) => {
      const drawn = flattenStrokes(strokes);
      const candidates = shortcuts
        .filter((s) => s.strokes && s.strokes.length > 0)
        .map((s) => ({ id: s.id, template: flattenStrokes(s.strokes!) }));
      const result = recognizeStroke(drawn, candidates);
      if (!result) return null;
      const shortcut = shortcuts.find((s) => s.id === result.id);
      if (!shortcut) return null;
      return { shortcut, score: result.score };
    },
    [shortcuts],
  );

  return (
    <ShortcutsContext.Provider
      value={{
        shortcuts,
        loaded,
        addShortcut,
        updateShortcut,
        deleteShortcut,
        addPhrase,
        updatePhrase,
        deletePhrase,
        setPhraseVoice,
        matchCode,
        matchGesture,
      }}
    >
      {children}
    </ShortcutsContext.Provider>
  );
}

export function useShortcuts() {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) throw new Error('useShortcuts must be used within ShortcutsProvider');
  return ctx;
}

export type { Phrase };
