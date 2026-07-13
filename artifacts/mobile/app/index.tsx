import React, { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { BottomSheetPanel } from '@/components/BottomSheetPanel';
import { CaptionOverlay } from '@/components/CaptionOverlay';
import { ContextualControls } from '@/components/ContextualControls';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { CustomizePanel } from '@/components/panels/CustomizePanel';
import { HistoryPanel } from '@/components/panels/HistoryPanel';
import { ListsPanel } from '@/components/panels/ListsPanel';
import { SettingsPanel } from '@/components/panels/SettingsPanel';
import { VoicesPanel } from '@/components/panels/VoicesPanel';
import { SidebarRail } from '@/components/SidebarRail';
import { TypeToSpeechBar } from '@/components/TypeToSpeechBar';
import { useAppColors } from '@/hooks/useAppColors';
import { useHistory } from '@/context/HistoryContext';
import { useShortcuts } from '@/context/ShortcutsContext';
import { useSpeech } from '@/context/SpeechContext';
import { useSettings } from '@/context/SettingsContext';
import type { PanelKey, Point } from '@/types';

const PANEL_TITLES: Record<Exclude<PanelKey, null>, string> = {
  lists: 'Task and shopping lists',
  customize: 'Customize shortcuts',
  history: 'History',
  voices: 'Family voices',
  settings: 'Settings',
};

export default function MainScreen() {
  const colors = useAppColors();
  const { settings } = useSettings();
  const { matchGesture } = useShortcuts();
  const { speak } = useSpeech();
  const { entries } = useHistory();
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);

  const handleGestureComplete = useCallback(
    (strokes: Point[][]) => {
      const match = matchGesture(strokes);
      if (match) {
        const phrase = match.shortcut.phrases[0];
        if (phrase) {
          speak(phrase.text, 'draw', phrase.voiceUri);
        }
      }
    },
    [matchGesture, speak],
  );

  const handleNext = useCallback(() => {
    const [latest] = entries;
    if (latest) speak(latest.text, latest.source);
  }, [entries, speak]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={settings.themeMode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <DrawingCanvas onGestureComplete={handleGestureComplete} />
      <TypeToSpeechBar />
      <SidebarRail onOpen={setOpenPanel} />
      <CaptionOverlay />
      <ContextualControls onNext={handleNext} />

      {(Object.keys(PANEL_TITLES) as Exclude<PanelKey, null>[]).map((key) => (
        <BottomSheetPanel
          key={key}
          visible={openPanel === key}
          title={PANEL_TITLES[key]}
          onClose={() => setOpenPanel(null)}
        >
          {key === 'lists' && <ListsPanel />}
          {key === 'customize' && <CustomizePanel />}
          {key === 'history' && <HistoryPanel />}
          {key === 'voices' && <VoicesPanel />}
          {key === 'settings' && <SettingsPanel />}
        </BottomSheetPanel>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
