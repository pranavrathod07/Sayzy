import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppColors } from '@/hooks/useAppColors';
import { useSettings } from '@/context/SettingsContext';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'light', label: 'Light', icon: 'sun' },
  { key: 'dark', label: 'Dark', icon: 'moon' },
  { key: 'highContrast', label: 'High contrast', icon: 'eye' },
];

export function SettingsPanel() {
  const colors = useAppColors();
  const { settings, setThemeMode, setSpeechLanguage, setHapticsEnabled } = useSettings();

  const confirmClearAll = () => {
    Alert.alert(
      'Clear all data?',
      'This removes every shortcut, list, history entry, and setting stored on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear everything',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'speaknow:shortcuts:v1',
              'speaknow:history:v1',
              'speaknow:lists:v1',
              'speaknow:settings:v1',
            ]);
            Alert.alert('Cleared', 'Please reopen the app for the changes to fully apply.');
          },
        },
      ],
    );
  };

  return (
    <View>
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Appearance</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map((opt) => {
          const active = settings.themeMode === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setThemeMode(opt.key)}
              style={[
                styles.themeOption,
                {
                  backgroundColor: active ? colors.primary : colors.secondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Feather name={opt.icon} size={18} color={active ? colors.primaryForeground : colors.secondaryForeground} />
              <Text style={{ color: active ? colors.primaryForeground : colors.secondaryForeground, fontWeight: '600', fontSize: 12 }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 22 }]}>
        Speech language
      </Text>
      <View style={styles.themeRow}>
        <Pressable
          onPress={() => setSpeechLanguage('en-US')}
          style={[
            styles.langOption,
            {
              backgroundColor: settings.speechLanguage === 'en-US' ? colors.primary : colors.secondary,
            },
          ]}
        >
          <Text
            style={{
              color: settings.speechLanguage === 'en-US' ? colors.primaryForeground : colors.secondaryForeground,
              fontWeight: '600',
            }}
          >
            English
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSpeechLanguage('hi-IN')}
          style={[
            styles.langOption,
            {
              backgroundColor: settings.speechLanguage === 'hi-IN' ? colors.primary : colors.secondary,
            },
          ]}
        >
          <Text
            style={{
              color: settings.speechLanguage === 'hi-IN' ? colors.primaryForeground : colors.secondaryForeground,
              fontWeight: '600',
            }}
          >
            हिन्दी
          </Text>
        </Pressable>
      </View>

      <View style={[styles.switchRow, { marginTop: 22, borderColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.switchLabel, { color: colors.foreground }]}>Haptic feedback</Text>
          <Text style={[styles.switchHint, { color: colors.mutedForeground }]}>
            Vibrate on taps and speech
          </Text>
        </View>
        <Switch
          value={settings.hapticsEnabled}
          onValueChange={setHapticsEnabled}
          trackColor={{ true: colors.primary }}
        />
      </View>

      <Pressable onPress={confirmClearAll} style={[styles.dangerButton, { borderColor: colors.destructive }]}>
        <Feather name="trash-2" size={16} color={colors.destructive} />
        <Text style={[styles.dangerText, { color: colors.destructive }]}>Clear all data</Text>
      </Pressable>

      <Text style={[styles.about, { color: colors.mutedForeground }]}>
        Speak Now works fully offline. Everything you create is stored only on this device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  langOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  switchHint: {
    fontSize: 12,
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 24,
  },
  dangerText: {
    fontWeight: '700',
  },
  about: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 18,
    lineHeight: 18,
  },
});
