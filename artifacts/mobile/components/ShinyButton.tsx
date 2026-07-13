import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAppColors } from '@/hooks/useAppColors';
import { useSettings } from '@/context/SettingsContext';

type ShinyButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  backgroundColor: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  shine?: boolean;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
};

/**
 * A tactile button with a Material-style radial ripple on press, a soft
 * elevation shadow, a scale-down press state, and an optional idle glossy
 * sheen sweep for important actions (STOP / primary speak triggers).
 */
export function ShinyButton({
  onPress,
  children,
  backgroundColor,
  size = 64,
  style,
  shine = false,
  disabled = false,
  testID,
  accessibilityLabel,
}: ShinyButtonProps) {
  const colors = useAppColors();
  const { settings } = useSettings();
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const sheenX = useSharedValue(-1);
  const rippleOrigin = useRef({ x: size / 2, y: size / 2 });

  useEffect(() => {
    if (!shine) return;
    sheenX.value = -1;
    sheenX.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 1400 }),
        withTiming(2, { duration: 1400, easing: Easing.out(Easing.quad) }),
      ),
      -1,
    );
    return () => cancelAnimation(sheenX);
  }, [shine, sheenX]);

  const handlePressIn = useCallback(
    (e: { nativeEvent: { locationX: number; locationY: number } }) => {
      rippleOrigin.current = {
        x: e.nativeEvent.locationX,
        y: e.nativeEvent.locationY,
      };
      scale.value = withTiming(0.94, { duration: 100 });
      rippleScale.value = 0;
      rippleOpacity.value = 0.5;
      rippleScale.value = withTiming(2.4, { duration: 420, easing: Easing.out(Easing.quad) });
      rippleOpacity.value = withTiming(0, { duration: 420 });
    },
    [scale, rippleScale, rippleOpacity],
  );

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onPress();
  }, [onPress, settings.hapticsEnabled]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [
      { translateX: rippleOrigin.current.x - size },
      { translateY: rippleOrigin.current.y - size },
      { scale: rippleScale.value },
    ],
  }));

  const sheenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sheenX.value * size }, { rotate: '20deg' }],
  }));

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: disabled ? 0.45 : 1,
        },
        styles.shadow,
        style,
      ]}
    >
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.pressable,
          { width: size, height: size, borderRadius: size / 2, backgroundColor },
        ]}
      >
        <View style={StyleSheet.absoluteFill}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ripple,
              { width: size * 2, height: size * 2, borderRadius: size, backgroundColor: colors.ripple },
              rippleStyle,
            ]}
          />
          {shine && (
            <Animated.View pointerEvents="none" style={[styles.sheenClip, { borderRadius: size / 2 }]}>
              <Animated.View
                style={[
                  styles.sheen,
                  { width: size * 0.5, height: size * 2, backgroundColor: colors.sheen },
                  sheenStyle,
                ]}
              />
            </Animated.View>
          )}
        </View>
        <View style={styles.content}>{children}</View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
  },
  sheenClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: -20,
    opacity: 0.9,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
