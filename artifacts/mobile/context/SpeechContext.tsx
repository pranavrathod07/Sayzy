import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useHistory } from '@/context/HistoryContext';
import { useSettings } from '@/context/SettingsContext';
import type { SpeechSource } from '@/types';

const NEXT_BUTTON_TIMEOUT_MS = 4000;

type Caption = { text: string; source: SpeechSource } | null;

type SpeechContextValue = {
  isSpeaking: boolean;
  caption: Caption;
  showNext: boolean;
  speak: (text: string, source: SpeechSource, voiceUri?: string) => Promise<void>;
  stop: () => void;
  dismissNext: () => void;
  registerNextHandler: (handler: (() => void) | null) => void;
};

const SpeechContext = createContext<SpeechContextValue | null>(null);

export function SpeechProvider({ children }: { children: React.ReactNode }) {
  const { addEntry } = useHistory();
  const { settings } = useSettings();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [caption, setCaption] = useState<Caption>(null);
  const [showNext, setShowNext] = useState(false);
  const playerRef = useRef<AudioPlayer | null>(null);
  const nextHandlerRef = useRef<(() => void) | null>(null);
  const nextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearNextTimeout = useCallback(() => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
  }, []);

  const finishSpeaking = useCallback(() => {
    setIsSpeaking(false);
    setShowNext(true);
    clearNextTimeout();
    nextTimeoutRef.current = setTimeout(() => setShowNext(false), NEXT_BUTTON_TIMEOUT_MS);
    if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
    captionTimeoutRef.current = setTimeout(() => setCaption(null), NEXT_BUTTON_TIMEOUT_MS);
  }, [clearNextTimeout]);

  const stop = useCallback(() => {
    Speech.stop();
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.remove();
      } catch {
        // player may already be released
      }
      playerRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, source: SpeechSource, voiceUri?: string) => {
      if (!text.trim()) return;
      stop();
      if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      setCaption({ text, source });
      if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
      setShowNext(false);
      clearNextTimeout();
      setIsSpeaking(true);
      addEntry(text, source);

      if (voiceUri) {
        try {
          const player = createAudioPlayer({ uri: voiceUri });
          playerRef.current = player;
          const subscription = player.addListener('playbackStatusUpdate', (status) => {
            if (status.didJustFinish) {
              subscription.remove();
              playerRef.current = null;
              try {
                player.remove();
              } catch {
                // already released
              }
              finishSpeaking();
            }
          });
          player.play();
          return;
        } catch {
          // fall through to TTS if the recording can't be played
        }
      }

      Speech.speak(text, {
        language: settings.speechLanguage,
        onDone: finishSpeaking,
        onStopped: finishSpeaking,
        onError: finishSpeaking,
      });
    },
    [stop, settings.hapticsEnabled, settings.speechLanguage, addEntry, finishSpeaking, clearNextTimeout],
  );

  const dismissNext = useCallback(() => {
    setShowNext(false);
    clearNextTimeout();
  }, [clearNextTimeout]);

  const registerNextHandler = useCallback((handler: (() => void) | null) => {
    nextHandlerRef.current = handler;
  }, []);

  useEffect(() => {
    return () => {
      Speech.stop();
      clearNextTimeout();
      if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
    };
  }, [clearNextTimeout]);

  return (
    <SpeechContext.Provider
      value={{ isSpeaking, caption, showNext, speak, stop, dismissNext, registerNextHandler }}
    >
      {children}
    </SpeechContext.Provider>
  );
}

export function useSpeech() {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('useSpeech must be used within SpeechProvider');
  return ctx;
}
