import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';
import { useHistory } from '@/context/HistoryContext';
import { useSpeech } from '@/context/SpeechContext';
import type { SpeechSource } from '@/types';

const SOURCE_ICON: Record<SpeechSource, keyof typeof Feather.glyphMap> = {
  draw: 'edit-2',
  code: 'hash',
  typed: 'type',
  list: 'shopping-bag',
};

function formatTime(ts: number) {
  const date = new Date(ts);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (sameDay) return time;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}

export function HistoryPanel() {
  const colors = useAppColors();
  const { entries, clearHistory } = useHistory();
  const { speak } = useSpeech();

  return (
    <View>
      {entries.length > 0 && (
        <Pressable onPress={clearHistory} style={styles.clearRow}>
          <Feather name="trash-2" size={14} color={colors.destructive} />
          <Text style={[styles.clearText, { color: colors.destructive }]}>Clear history</Text>
        </Pressable>
      )}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {entries.length === 0 && (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            Nothing spoken yet. Everything you say will be logged here.
          </Text>
        )}
        {entries.map((entry) => (
          <Pressable
            key={entry.id}
            onPress={() => speak(entry.text, entry.source)}
            style={[styles.row, { borderColor: colors.border }]}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
              <Feather name={SOURCE_ICON[entry.source]} size={14} color={colors.secondaryForeground} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.text, { color: colors.foreground }]}>{entry.text}</Text>
              <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(entry.timestamp)}</Text>
            </View>
            <Feather name="play" size={16} color={colors.primary} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 460,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
});
