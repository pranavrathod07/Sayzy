import { Feather } from '@expo/vector-icons';
import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';
import { useShortcuts } from '@/context/ShortcutsContext';
import { generateId } from '@/utils/id';
import type { Phrase, Shortcut } from '@/types';

const VOICES_DIR_NAME = 'speaknow-voices';

function getVoicesDirectory() {
  const dir = new Directory(Paths.document, VOICES_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

function VoiceRow({ shortcut, phrase }: { shortcut: Shortcut; phrase: Phrase }) {
  const colors = useAppColors();
  const { setPhraseVoice } = useShortcuts();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [busy, setBusy] = useState(false);

  const startRecording = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert('Microphone needed', 'Please allow microphone access to record a voice clip.');
        return;
      }
      await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('Could not start recording', 'Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      setBusy(true);
      await recorder.stop();
      const sourceUri = recorder.uri;
      if (sourceUri) {
        const dir = getVoicesDirectory();
        const sourceFile = new File(sourceUri);
        const destFile = new File(dir, `${shortcut.id}-${phrase.id}-${generateId()}.m4a`);
        sourceFile.copy(destFile);
        setPhraseVoice(shortcut.id, phrase.id, destFile.uri);
      }
    } catch {
      Alert.alert('Could not save recording', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const playPreview = () => {
    if (!phrase.voiceUri) return;
    try {
      const player = createAudioPlayer({ uri: phrase.voiceUri });
      player.play();
    } catch {
      Alert.alert('Could not play recording');
    }
  };

  const deleteRecording = () => {
    if (phrase.voiceUri) {
      try {
        new File(phrase.voiceUri).delete();
      } catch {
        // already removed
      }
    }
    setPhraseVoice(shortcut.id, phrase.id, undefined);
  };

  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <View style={styles.rowText}>
        <Text style={[styles.phraseText, { color: colors.foreground }]} numberOfLines={1}>
          {phrase.text}
        </Text>
        {shortcut.code && (
          <Text style={[styles.codeText, { color: colors.mutedForeground }]}>Code: {shortcut.code}</Text>
        )}
      </View>

      {phrase.voiceUri && !recorderState.isRecording && (
        <Pressable onPress={playPreview} hitSlop={8} style={styles.iconButton}>
          <Feather name="play" size={16} color={colors.primary} />
        </Pressable>
      )}

      <Pressable
        onPress={recorderState.isRecording ? stopRecording : startRecording}
        disabled={busy}
        style={[
          styles.recordButton,
          { backgroundColor: recorderState.isRecording ? colors.destructive : colors.secondary },
        ]}
      >
        <Feather
          name={recorderState.isRecording ? 'square' : 'mic'}
          size={16}
          color={recorderState.isRecording ? colors.destructiveForeground : colors.secondaryForeground}
        />
      </Pressable>

      {phrase.voiceUri && !recorderState.isRecording && (
        <Pressable onPress={deleteRecording} hitSlop={8} style={styles.iconButton}>
          <Feather name="trash-2" size={16} color={colors.destructive} />
        </Pressable>
      )}
    </View>
  );
}

export function VoicesPanel() {
  const colors = useAppColors();
  const { shortcuts } = useShortcuts();

  useEffect(() => {
    AudioModule.setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const rows = shortcuts.flatMap((s) => s.phrases.map((p) => ({ shortcut: s, phrase: p })));

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        Record a family member's real voice for any phrase. It will play instead of the default voice.
      </Text>
      {rows.length === 0 && (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Add a shortcut with a phrase first in Customize, then come back here to record a voice for it.
        </Text>
      )}
      {rows.map(({ shortcut, phrase }) => (
        <VoiceRow key={phrase.id} shortcut={shortcut} phrase={phrase} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 460,
  },
  intro: {
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
  },
  phraseText: {
    fontSize: 15,
    fontWeight: '500',
  },
  codeText: {
    fontSize: 11,
    marginTop: 2,
  },
  iconButton: {
    padding: 4,
  },
  recordButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
