export type Point = { x: number; y: number };

export type Phrase = {
  id: string;
  text: string;
  /** Local file uri of a caregiver-recorded voice clip, if any. */
  voiceUri?: string;
};

export type Shortcut = {
  id: string;
  /** Optional multi-letter shorthand code, e.g. "KH" */
  code?: string;
  /** Normalized gesture template: array of strokes, each an array of points */
  strokes?: Point[][];
  phrases: Phrase[];
  createdAt: number;
};

export type SpeechSource = 'draw' | 'code' | 'typed' | 'list';

export type HistoryEntry = {
  id: string;
  text: string;
  source: SpeechSource;
  timestamp: number;
};

export type ListItem = {
  id: string;
  text: string;
};

export type ListTemplate = {
  id: string;
  name: string;
  items: ListItem[];
};

export type ThemeMode = 'light' | 'dark' | 'highContrast';
export type SpeechLanguage = 'en-US' | 'hi-IN';

export type PanelKey =
  | 'lists'
  | 'customize'
  | 'history'
  | 'voices'
  | 'settings'
  | null;
