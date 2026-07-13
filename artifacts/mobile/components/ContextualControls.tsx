import { Feather } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppColors } from '@/hooks/useAppColors';
import { useSpeech } from '@/context/SpeechContext';
import { ShinyButton } from './ShinyButton';

/**
 * STOP appears only while speech is playing; NEXT appears briefly right
 * after speech finishes. Both animate in with a fade + scale and animate
 * out the instant they're no longer needed — no permanent toolbar.
 */
export function ContextualControls({ onNext }: { onNext: () => void }) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { isSpeaking, showNext, stop, dismissNext } = useSpeech();
  const bottomInset = Platform.OS === 'web' ? Math.max(insets.bottom, 34) : insets.bottom;

  const stopProgress = useSharedValue(0);
  const nextProgress = useSharedValue(0);

  useEffect(() => {
    stopProgress.value = withTiming(isSpeaking ? 1 : 0, { duration: 220 });
  }, [isSpeaking, stopProgress]);

  useEffect(() => {
    nextProgress.value = withTiming(showNext && !isSpeaking ? 1 : 0, { duration: 220 });
  }, [showNext, isSpeaking, nextProgress]);

  const stopStyle = useAnimatedStyle(() => ({
    opacity: stopProgress.value,
    transform: [{ scale: 0.7 + stopProgress.value * 0.3 }],
  }));

  const nextStyle = useAnimatedStyle(() => ({
    opacity: nextProgress.value,
    transform: [{ scale: 0.7 + nextProgress.value * 0.3 }],
  }));

  return (
    <>
      <Animated.View
        pointerEvents={isSpeaking ? 'auto' : 'none'}
        style={[styles.wrap, { bottom: bottomInset + 28 }, stopStyle]}
      >
        <ShinyButton
          onPress={stop}
          backgroundColor={colors.destructive}
          size={84}
          shine
          accessibilityLabel="Stop speaking"
          testID="stop-button"
        >
          <Feather name="square" size={30} color={colors.destructiveForeground} />
        </ShinyButton>
      </Animated.View>

      <Animated.View
        pointerEvents={showNext && !isSpeaking ? 'auto' : 'none'}
        style={[styles.wrap, { bottom: bottomInset + 28 }, nextStyle]}
      >
        <ShinyButton
          onPress={() => {
            dismissNext();
            onNext();
          }}
          backgroundColor={colors.primary}
          size={68}
          shine
          accessibilityLabel="Next"
          testID="next-button"
        >
          <Feather name="arrow-right" size={26} color={colors.primaryForeground} />
        </ShinyButton>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
