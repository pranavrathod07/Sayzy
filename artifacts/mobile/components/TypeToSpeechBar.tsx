import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppColors } from '@/hooks/useAppColors';
import { useHistory } from '@/context/HistoryContext';
import { useShortcuts } from '@/context/ShortcutsContext';
import { useSpeech } from '@/context/SpeechContext';
import { ShinyButton } from './ShinyButton';

/**
 * A collapsible keyboard-entry bar. Typing a saved shortcut code speaks the
 * mapped phrase (with a picker if several are assigned); anything else is
 * spoken literally via TTS. Suggestions come from recent history.
 */
export function TypeToSpeechBar() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { speak } = useSpeech();
  const { matchCode } = useShortcuts();
  const { entries } = useHistory();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [picker, setPicker] = useState<string[] | null>(null);
  const progress = useSharedValue(0);
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  const suggestions = useMemo(() => {
    if (!text.trim()) return [];
    const query = text.trim().toLowerCase();
    const unique = new Map<string, string>();
    for (const entry of entries) {
      if (entry.text.toLowerCase().includes(query) && entry.text.toLowerCase() !== query) {
        unique.set(entry.text.toLowerCase(), entry.text);
      }
      if (unique.size >= 4) break;
    }
    return Array.from(unique.values());
  }, [text, entries]);

  const openBar = () => {
    setOpen(true);
    progress.value = withTiming(1, { duration: 220 });
  };

  const closeBar = () => {
    progress.value = withTiming(0, { duration: 180 });
    setTimeout(() => {
      setOpen(false);
      setText('');
      setPicker(null);
    }, 180);
  };

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const shortcut = matchCode(trimmed);
    if (shortcut && shortcut.phrases.length > 0) {
      if (shortcut.phrases.length === 1) {
        const phrase = shortcut.phrases[0]!;
        speak(phrase.text, 'code', phrase.voiceUri, phrase.language);
      } else {
        setPicker(shortcut.phrases.map((p) => p.text));
        return;
      }
    } else {
      speak(trimmed, 'typed');
    }
    setText('');
    closeBar();
  };

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * -16 }],
  }));

  if (!open) {
    return (
      <View pointerEvents="box-none" style={[styles.fabWrap, { top: topInset + 14 }]}>
        <ShinyButton
          onPress={openBar}
          backgroundColor={colors.card}
          size={44}
          accessibilityLabel="Type to speak"
        >
          <Feather name="type" size={18} color={colors.mutedForeground} />
        </ShinyButton>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.wrap, { top: topInset + 14 }, style]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            autoFocus
            value={text}
            onChangeText={(v) => {
              setText(v);
              setPicker(null);
            }}
            onSubmitEditing={() => submit(text)}
            placeholder="Type a word, sentence, or shortcut code"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            returnKeyType="send"
          />
          <Pressable onPress={() => submit(text)} hitSlop={8}>
            <Feather name="send" size={20} color={colors.primary} />
          </Pressable>
          <Pressable onPress={closeBar} hitSlop={8}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>
        {picker && (
          <View style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.suggestLabel, { color: colors.mutedForeground }]}>Which one did you mean?</Text>
            {picker.map((p) => (
              <Pressable
                key={p}
                onPress={() => {
                  speak(p, 'code');
                  setText('');
                  setPicker(null);
                  closeBar();
                }}
                style={styles.suggestionRow}
              >
                <Text style={[styles.suggestionText, { color: colors.foreground }]}>{p}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {!picker && suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            style={[styles.suggestions, { backgroundColor: colors.card, borderColor: colors.border }]}
            scrollEnabled={suggestions.length > 3}
            renderItem={({ item }) => (
              <Pressable onPress={() => submit(item)} style={styles.suggestionRow}>
                <Text style={[styles.suggestionText, { color: colors.foreground }]}>{item}</Text>
              </Pressable>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: 'absolute',
    left: 16,
  },
  wrap: {
    position: 'absolute',
    left: 16,
    right: 66,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  suggestions: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    maxHeight: 200,
  },
  suggestLabel: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 2,
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestionText: {
    fontSize: 15,
  },
});
