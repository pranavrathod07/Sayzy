import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppColors } from '@/hooks/useAppColors';
import { useLists } from '@/context/ListsContext';
import { useSpeech } from '@/context/SpeechContext';
import type { ListTemplate } from '@/types';

function TemplateEditor({ template, onBack }: { template: ListTemplate; onBack: () => void }) {
  const colors = useAppColors();
  const { addItem, updateItem, deleteItem, renameTemplate, deleteTemplate } = useLists();
  const [newItem, setNewItem] = useState('');
  const [name, setName] = useState(template.name);

  return (
    <View>
      <Pressable onPress={onBack} style={styles.backRow}>
        <Feather name="arrow-left" size={16} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>All lists</Text>
      </Pressable>

      <TextInput
        value={name}
        onChangeText={setName}
        onBlur={() => renameTemplate(template.id, name)}
        style={[styles.nameInput, { color: colors.foreground, borderColor: colors.border }]}
      />

      <ScrollView style={styles.itemScroll} showsVerticalScrollIndicator={false}>
        {template.items.map((item) => (
          <View key={item.id} style={[styles.itemRow, { borderColor: colors.border }]}>
            <TextInput
              value={item.text}
              onChangeText={(v) => updateItem(template.id, item.id, v)}
              style={[styles.itemInput, { color: colors.foreground }]}
            />
            <Pressable onPress={() => deleteItem(template.id, item.id)} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={styles.addItemRow}>
        <TextInput
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add an item"
          placeholderTextColor={colors.mutedForeground}
          onSubmitEditing={() => {
            addItem(template.id, newItem);
            setNewItem('');
          }}
          style={[styles.itemInput, { flex: 1, color: colors.foreground, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 }]}
        />
        <Pressable
          onPress={() => {
            addItem(template.id, newItem);
            setNewItem('');
          }}
          hitSlop={8}
        >
          <Feather name="plus-circle" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => {
          deleteTemplate(template.id);
          onBack();
        }}
        style={styles.deleteTemplateRow}
      >
        <Feather name="trash-2" size={14} color={colors.destructive} />
        <Text style={[styles.deleteTemplateText, { color: colors.destructive }]}>Delete this list</Text>
      </Pressable>
    </View>
  );
}

function PlayMode({ template, onExit }: { template: ListTemplate; onExit: () => void }) {
  const colors = useAppColors();
  const { speak, isSpeaking } = useSpeech();
  const [index, setIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const prevSpeakingRef = useRef(false);

  const item = template.items[index];

  useEffect(() => {
    if (item) speak(item.text, 'list');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    if (prevSpeakingRef.current && !isSpeaking && autoAdvance) {
      if (index < template.items.length - 1) {
        const t = setTimeout(() => setIndex((i) => i + 1), 500);
        return () => clearTimeout(t);
      } else {
        setAutoAdvance(false);
      }
    }
    prevSpeakingRef.current = isSpeaking;
  }, [isSpeaking, autoAdvance, index, template.items.length]);

  if (!item) {
    return (
      <View>
        <Text style={{ color: colors.mutedForeground }}>This list is empty.</Text>
        <Pressable onPress={onExit} style={[styles.exitButton, { backgroundColor: colors.secondary }]}>
          <Text style={{ color: colors.secondaryForeground, fontWeight: '600' }}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.playCounter, { color: colors.mutedForeground }]}>
        Item {index + 1} of {template.items.length}
      </Text>
      <View style={[styles.playCard, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.playText, { color: colors.secondaryForeground }]}>{item.text}</Text>
      </View>

      <View style={styles.playControls}>
        <Pressable
          onPress={() => speak(item.text, 'list')}
          style={[styles.playButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="repeat" size={18} color={colors.foreground} />
        </Pressable>
        <Pressable
          onPress={() => setAutoAdvance((a) => !a)}
          style={[
            styles.playButton,
            { backgroundColor: autoAdvance ? colors.primary : colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name={autoAdvance ? 'pause' : 'play'} size={18} color={autoAdvance ? colors.primaryForeground : colors.foreground} />
        </Pressable>
        <Pressable
          onPress={() => setIndex((i) => Math.min(i + 1, template.items.length - 1))}
          disabled={index >= template.items.length - 1}
          style={[styles.playButton, { backgroundColor: colors.card, borderColor: colors.border, opacity: index >= template.items.length - 1 ? 0.4 : 1 }]}
        >
          <Feather name="arrow-right" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <Pressable onPress={onExit} style={[styles.exitButton, { backgroundColor: colors.secondary }]}>
        <Text style={{ color: colors.secondaryForeground, fontWeight: '600' }}>Exit list</Text>
      </Pressable>
    </View>
  );
}

export function ListsPanel() {
  const colors = useAppColors();
  const { templates, createTemplate } = useLists();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'play'>('view');
  const [newName, setNewName] = useState('');

  const active = templates.find((t) => t.id === activeId) ?? null;

  if (active && mode === 'play') {
    return <PlayMode template={active} onExit={() => setMode('view')} />;
  }

  if (active) {
    return <TemplateEditor template={active} onBack={() => setActiveId(null)} />;
  }

  return (
    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.addRow}>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="New list name (e.g. Shopping)"
          placeholderTextColor={colors.mutedForeground}
          onSubmitEditing={() => {
            if (newName.trim()) {
              const t = createTemplate(newName);
              setNewName('');
              setActiveId(t.id);
            }
          }}
          style={[styles.itemInput, { flex: 1, color: colors.foreground, borderColor: colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12 }]}
        />
        <Pressable
          onPress={() => {
            if (newName.trim()) {
              const t = createTemplate(newName);
              setNewName('');
              setActiveId(t.id);
            }
          }}
          hitSlop={8}
        >
          <Feather name="plus-circle" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {templates.length === 0 && (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>
          Create a list to speak items one by one, in order.
        </Text>
      )}

      {templates.map((t) => (
        <View key={t.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable style={styles.cardTitleRow} onPress={() => setActiveId(t.id)}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{t.name}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{t.items.length} items</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setActiveId(t.id);
              setMode('play');
            }}
            disabled={t.items.length === 0}
            style={[styles.playIconButton, { backgroundColor: colors.primary, opacity: t.items.length === 0 ? 0.4 : 1 }]}
          >
            <Feather name="play" size={16} color={colors.primaryForeground} />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 480,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  cardTitleRow: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  playIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '700',
    borderBottomWidth: 1,
    paddingVertical: 8,
    marginBottom: 12,
  },
  itemScroll: {
    maxHeight: 260,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemInput: {
    fontSize: 15,
    flex: 1,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  deleteTemplateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 18,
  },
  deleteTemplateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  playCounter: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  playCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 18,
  },
  playText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  playControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 18,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButton: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
});
