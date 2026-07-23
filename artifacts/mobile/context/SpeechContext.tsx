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
const TTS_INIT_TIMEOUT_MS = 5000;

type Caption = { text: string; source: SpeechSource } | null;

type SpeechContextValue = {
  isSpeaking: boolean;
  caption: Caption;
  showNext: boolean;
  speak: (text: string, source: SpeechSource, voiceUri?: string, phraseLanguage?: string) => Promise<void>;
  stop: () => void;
  dismissNext: () => void;
  registerNextHandler: (handler: (() => void) | null) => void;
  onError: (callback: (message: string) => void) => void;
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
  const errorCallbackRef = useRef<((message: string) => void) | null>(null);

  const initializeTTS = useCallback(async () => {
    try {
      // Configure audio session for playback even in silent mode (important for accessibility)
      await Speech.getAvailableVoicesAsync().catch(() => {
        // Voices may not be available immediately, try again on first speak
        return [];
      });
    } catch (error) {
      console.warn('TTS initialization warning:', error);
    }
  }, []);

  // Initialize TTS on mount
  useEffect(() => {
    const timeoutId = setTimeout(initializeTTS, 500);
    return () => clearTimeout(timeoutId);
  }, [initializeTTS]);

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
    async (text: string, source: SpeechSource, voiceUri?: string, phraseLanguage?: string) => {
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
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.warn('Voice playback failed, falling back to TTS:', errorMsg);
          // fall through to TTS if the recording can't be played
        }
      }

      try {
        // Check for available voices before attempting speech
        const voices = await Promise.race([
          Speech.getAvailableVoicesAsync(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Voice check timeout')), TTS_INIT_TIMEOUT_MS)
          ),
        ]) as Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>>;

        // Use per-phrase language if provided, otherwise use global setting
        const targetLang = (phraseLanguage || settings.speechLanguage) as string;
        const voiceAvailable = voices.some(v => v.language?.startsWith(targetLang.split('-')[0]));

        if (!voiceAvailable && targetLang === 'hi-IN') {
          const msg = 'Hindi voice not found. Go to Settings > Text-to-speech > Install voice data and download Hindi.';
          errorCallbackRef.current?.(msg);
          finishSpeaking();
          return;
        }

        Speech.speak(text, {
          language: targetLang,
          onDone: finishSpeaking,
          onStopped: finishSpeaking,
          onError: (error) => {
            console.warn('Speech error:', error);
            const errorMsg = error?.error 
              ? `Speech error: ${error.error}. Check your device volume or TTS settings.`
              : 'Couldn\'t play audio. Check your device volume or TTS settings.';
            errorCallbackRef.current?.(errorMsg);
            finishSpeaking();
          },
        });
      } catch (error) {
        console.error('TTS error:', error);
        const errorMsg = error instanceof Error 
          ? `Speech failed: ${error.message}`
          : 'Couldn\'t play audio. Check your device volume or TTS settings.';
        errorCallbackRef.current?.(errorMsg);
        finishSpeaking();
      }
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

  const onError = useCallback((callback: (message: string) => void) => {
    errorCallbackRef.current = callback;
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
      value={{ isSpeaking, caption, showNext, speak, stop, dismissNext, registerNextHandler, onError }}
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
