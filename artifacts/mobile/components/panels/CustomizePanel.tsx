import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';
import { useShortcuts } from '@/context/ShortcutsContext';
import type { Point, Shortcut } from '@/types';
import { DrawingCanvas } from '../DrawingCanvas';

function ShortcutRow({ shortcut }: { shortcut: Shortcut }) {
  const colors = useAppColors();
  const { deleteShortcut, addPhrase, updatePhrase, deletePhrase } = useShortcuts();
  const [newPhrase, setNewPhrase] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          {shortcut.code && (
            <View style={[styles.codeBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.codeBadgeText, { color: colors.accentForeground }]}>
                {shortcut.code}
              </Text>
            </View>
          )}
          {shortcut.strokes && shortcut.strokes.length > 0 && (
            <View style={[styles.gestureBadge, { backgroundColor: colors.secondary }]}>
              <Feather name="edit-2" size={12} color={colors.secondaryForeground} />
              <Text style={[styles.gestureBadgeText, { color: colors.secondaryForeground }]}>
                Drawing saved
              </Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={() =>
            Alert.alert('Delete this shortcut?', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteShortcut(shortcut.id) },
            ])
          }
          accessibilityLabel="Delete shortcut"
          hitSlop={8}
        >
          <Feather name="trash-2" size={18} color={colors.destructive} />
        </Pressable>
      </View>

      {shortcut.phrases.map((phrase) => (
        <View key={phrase.id} style={styles.phraseRow}>
          {editing === phrase.id ? (
            <TextInput
              autoFocus
              value={editText}
              onChangeText={setEditText}
              onSubmitEditing={() => {
                updatePhrase(shortcut.id, phrase.id, editText);
                setEditing(null);
              }}
              onBlur={() => {
                updatePhrase(shortcut.id, phrase.id, editText);
                setEditing(null);
              }}
              style={[styles.phraseInput, { color: colors.foreground, borderColor: colors.border }]}
            />
          ) : (
            <Pressable
              style={styles.phraseTextWrap}
              onPress={() => {
                setEditing(phrase.id);
                setEditText(phrase.text);
              }}
            >
              <Text style={[styles.phraseText, { color: colors.foreground }]}>{phrase.text}</Text>
            </Pressable>
          )}
          {phrase.voiceUri && <Feather name="mic" size={14} color={colors.mutedForeground} />}
          <Pressable
            onPress={() => deletePhrase(shortcut.id, phrase.id)}
            accessibilityLabel="Delete phrase"
            hitSlop={8}
          >
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>
      ))}

      <View style={styles.addPhraseRow}>
        <TextInput
          value={newPhrase}
          onChangeText={setNewPhrase}
          placeholder="Add another phrase for this symbol"
          placeholderTextColor={colors.mutedForeground}
          onSubmitEditing={() => {
            addPhrase(shortcut.id, newPhrase);
            setNewPhrase('');
          }}
          style={[styles.phraseInput, { flex: 1, color: colors.foreground, borderColor: colors.border }]}
        />
        <Pressable
          onPress={() => {
            addPhrase(shortcut.id, newPhrase);
            setNewPhrase('');
          }}
          hitSlop={8}
        >
          <Feather name="plus-circle" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

function NewShortcutForm({ onDone }: { onDone: () => void }) {
  const colors = useAppColors();
  const { addShortcut } = useShortcuts();
  const [code, setCode] = useState('');
  const [phrases, setPhrases] = useState(['']);
  const [strokes, setStrokes] = useState<Point[][] | null>(null);
  const [drawKey, setDrawKey] = useState(0);

  const canSave = (code.trim().length > 0 || !!strokes) && phrases.some((p) => p.trim());

  const save = () => {
    if (!canSave) return;
    addShortcut({ code: code.trim() || undefined, strokes: strokes ?? undefined, phrases });
    onDone();
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>Shortcut code (optional)</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="e.g. KH"
        autoCapitalize="characters"
        placeholderTextColor={colors.mutedForeground}
        style={[styles.phraseInput, { color: colors.foreground, borderColor: colors.border }]}
      />

      <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 12 }]}>
        Draw a symbol (optional)
      </Text>
      <View style={[styles.drawPad, { borderColor: colors.border, backgroundColor: colors.canvasBackground }]}>
        <DrawingCanvas
          key={drawKey}
          onGestureComplete={(s) => setStrokes(s)}
        />
      </View>
      <View style={styles.drawPadFooter}>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {strokes ? 'Symbol saved' : 'Draw, then pause'}
        </Text>
        <Pressable
          onPress={() => {
            setStrokes(null);
            setDrawKey((k) => k + 1);
          }}
        >
          <Text style={[styles.hint, { color: colors.primary }]}>Clear</Text>
        </Pressable>
      </View>

      <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 12 }]}>Phrases</Text>
      {phrases.map((p, i) => (
        <TextInput
          key={i}
          value={p}
          onChangeText={(v) => setPhrases((prev) => prev.map((old, idx) => (idx === i ? v : old)))}
          placeholder="What should this say?"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.phraseInput, { color: colors.foreground, borderColor: colors.border, marginTop: 6 }]}
        />
      ))}
      <Pressable onPress={() => setPhrases((p) => [...p, ''])} style={styles.addPhraseLink}>
        <Feather name="plus" size={14} color={colors.primary} />
        <Text style={[styles.hint, { color: colors.primary }]}>Add another phrase</Text>
      </Pressable>

      <View style={styles.formButtons}>
        <Pressable
          onPress={onDone}
          style={[styles.formButton, { backgroundColor: colors.secondary }]}
        >
          <Text style={{ color: colors.secondaryForeground, fontWeight: '600' }}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={save}
          disabled={!canSave}
          style={[styles.formButton, { backgroundColor: colors.primary, opacity: canSave ? 1 : 0.5 }]}
        >
          <Text style={{ color: colors.primaryForeground, fontWeight: '600' }}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function CustomizePanel() {
  const colors = useAppColors();
  const { shortcuts } = useShortcuts();
  const [adding, setAdding] = useState(false);

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      {!adding && (
        <Pressable
          onPress={() => setAdding(true)}
          style={[styles.newButton, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={18} color={colors.primaryForeground} />
          <Text style={[styles.newButtonText, { color: colors.primaryForeground }]}>New shortcut</Text>
        </Pressable>
      )}

      {adding && <NewShortcutForm onDone={() => setAdding(false)} />}

      {shortcuts.length === 0 && !adding && (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          No shortcuts yet. Add a code or drawing above to get started.
        </Text>
      )}

      {shortcuts.map((s) => (
        <ShortcutRow key={s.id} shortcut={s} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: '100%',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  newButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  codeBadgeText: {
    fontWeight: '700',
    fontSize: 13,
  },
  gestureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  gestureBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  phraseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  phraseTextWrap: {
    flex: 1,
  },
  phraseText: {
    fontSize: 15,
  },
  phraseInput: {
    fontSize: 15,
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  addPhraseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  addPhraseLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  drawPad: {
    height: 150,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 6,
  },
  drawPadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  hint: {
    fontSize: 12,
    fontWeight: '600',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
});
