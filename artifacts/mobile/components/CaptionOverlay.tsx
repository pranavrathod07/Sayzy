import { Feather } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppColors } from '@/hooks/useAppColors';
import { useSpeech } from '@/context/SpeechContext';
import type { SpeechSource } from '@/types';

const SOURCE_ICON: Record<SpeechSource, keyof typeof Feather.glyphMap> = {
  draw: 'edit-2',
  code: 'hash',
  typed: 'type',
  list: 'shopping-bag',
};

const SOURCE_LABEL: Record<SpeechSource, string> = {
  draw: 'From drawing',
  code: 'From shortcut',
  typed: 'Typed',
  list: 'From list',
};

/** Large, readable live caption of exactly what is being spoken. */
export function CaptionOverlay() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { caption } = useSpeech();
  const progress = useSharedValue(0);
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  useEffect(() => {
    progress.value = withTiming(caption ? 1 : 0, { duration: 200 });
  }, [caption, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -12 }],
  }));

  if (!caption) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { top: topInset + 14 }, style]}
    >
      <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name={SOURCE_ICON[caption.source]} size={14} color={colors.mutedForeground} />
        <Text style={[styles.source, { color: colors.mutedForeground }]}>
          {SOURCE_LABEL[caption.source]}
        </Text>
      </Animated.View>
      <Text style={[styles.caption, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}>
        {caption.text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    marginBottom: 6,
  },
  source: {
    fontSize: 12,
    fontWeight: '600',
  },
  caption: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
