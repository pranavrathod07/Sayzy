import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { generateId } from '@/utils/id';
import type { ListItem, ListTemplate } from '@/types';

const STORAGE_KEY = 'speaknow:lists:v1';

type ListsContextValue = {
  templates: ListTemplate[];
  loaded: boolean;
  createTemplate: (name: string) => ListTemplate;
  renameTemplate: (id: string, name: string) => void;
  deleteTemplate: (id: string) => void;
  addItem: (templateId: string, text: string) => void;
  updateItem: (templateId: string, itemId: string, text: string) => void;
  deleteItem: (templateId: string, itemId: string) => void;
  reorderItems: (templateId: string, items: ListItem[]) => void;
};

const ListsContext = createContext<ListsContextValue | null>(null);

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<ListTemplate[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTemplates(JSON.parse(raw));
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: ListTemplate[]) => {
    setTemplates(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const createTemplate = useCallback(
    (name: string) => {
      const template: ListTemplate = {
        id: generateId(),
        name: name.trim() || 'Untitled list',
        items: [],
      };
      persist([template, ...templates]);
      return template;
    },
    [templates, persist],
  );

  const renameTemplate = useCallback(
    (id: string, name: string) => {
      persist(templates.map((t) => (t.id === id ? { ...t, name } : t)));
    },
    [templates, persist],
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      persist(templates.filter((t) => t.id !== id));
    },
    [templates, persist],
  );

  const addItem = useCallback(
    (templateId: string, text: string) => {
      if (!text.trim()) return;
      persist(
        templates.map((t) =>
          t.id === templateId
            ? { ...t, items: [...t.items, { id: generateId(), text: text.trim() }] }
            : t,
        ),
      );
    },
    [templates, persist],
  );

  const updateItem = useCallback(
    (templateId: string, itemId: string, text: string) => {
      persist(
        templates.map((t) =>
          t.id === templateId
            ? {
                ...t,
                items: t.items.map((i) => (i.id === itemId ? { ...i, text } : i)),
              }
            : t,
        ),
      );
    },
    [templates, persist],
  );

  const deleteItem = useCallback(
    (templateId: string, itemId: string) => {
      persist(
        templates.map((t) =>
          t.id === templateId
            ? { ...t, items: t.items.filter((i) => i.id !== itemId) }
            : t,
        ),
      );
    },
    [templates, persist],
  );

  const reorderItems = useCallback(
    (templateId: string, items: ListItem[]) => {
      persist(templates.map((t) => (t.id === templateId ? { ...t, items } : t)));
    },
    [templates, persist],
  );

  return (
    <ListsContext.Provider
      value={{
        templates,
        loaded,
        createTemplate,
        renameTemplate,
        deleteTemplate,
        addItem,
        updateItem,
        deleteItem,
        reorderItems,
      }}
    >
      {children}
    </ListsContext.Provider>
  );
}

export function useLists() {
  const ctx = useContext(ListsContext);
  if (!ctx) throw new Error('useLists must be used within ListsProvider');
  return ctx;
}
