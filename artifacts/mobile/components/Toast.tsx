import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppColors } from '@/hooks/useAppColors';

const TOAST_DURATION_MS = 2600;

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * A small non-blocking snackbar shown at the bottom of the screen, used for
 * transient feedback like "no match found" that shouldn't interrupt drawing.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const progress = useSharedValue(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomInset = Platform.OS === 'web' ? Math.max(insets.bottom, 34) : insets.bottom;

  const showToast = useCallback((text: string) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setMessage(text);
    progress.value = withTiming(1, { duration: 180 });
    hideTimerRef.current = setTimeout(() => {
      progress.value = withTiming(0, { duration: 220 });
      setTimeout(() => setMessage(null), 220);
    }, TOAST_DURATION_MS);
  }, [progress]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 20 }],
  }));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.wrap,
            { bottom: bottomInset + 130, backgroundColor: colors.foreground },
            style,
          ]}
        >
          <Text style={[styles.text, { color: colors.background }]}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
