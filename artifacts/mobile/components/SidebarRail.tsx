import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColors } from '@/hooks/useAppColors';
import type { PanelKey } from '@/types';
import { ShinyButton } from './ShinyButton';

const ICON_SIZE = 20;
const BUTTON_SIZE = 44;

const ITEMS: { key: Exclude<PanelKey, null>; icon: keyof typeof Feather.glyphMap; label: string }[] = [
  { key: 'lists', icon: 'shopping-bag', label: 'Task and shopping lists' },
  { key: 'customize', icon: 'edit-3', label: 'Customize shortcuts' },
  { key: 'history', icon: 'clock', label: 'History' },
  { key: 'voices', icon: 'mic', label: 'Family voice recordings' },
  { key: 'settings', icon: 'settings', label: 'Settings' },
];

export function SidebarRail({ onOpen }: { onOpen: (key: Exclude<PanelKey, null>) => void }) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = Platform.OS === 'web' ? Math.max(insets.bottom, 34) : insets.bottom;

  return (
    <View
      style={[
        styles.rail,
        {
          paddingTop: topInset + 16,
          paddingBottom: bottomInset + 16,
        },
      ]}
      pointerEvents="box-none"
    >
      {ITEMS.map((item) => (
        <ShinyButton
          key={item.key}
          onPress={() => onOpen(item.key)}
          backgroundColor={colors.card}
          size={BUTTON_SIZE}
          accessibilityLabel={item.label}
          style={styles.button}
        >
          <Feather name={item.icon} size={ICON_SIZE} color={colors.mutedForeground} />
        </ShinyButton>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    right: 6,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  button: {
    opacity: 0.62,
  },
});
