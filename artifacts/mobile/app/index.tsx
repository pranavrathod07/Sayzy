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
import { useToast } from '@/components/Toast';
import { useAppColors } from '@/hooks/useAppColors';
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
  const { showToast } = useToast();
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const [canvasKey, setCanvasKey] = useState(0);

  const handleGestureComplete = useCallback(
    (strokes: Point[][]) => {
      const match = matchGesture(strokes);
      if (match) {
        const phrase = match.shortcut.phrases[0];
        if (phrase) {
          speak(phrase.text, 'draw', phrase.voiceUri);
          return;
        }
      }
      showToast('No match found — tap Customize to save this');
    },
    [matchGesture, speak, showToast],
  );

  const handleNext = useCallback(() => {
    // Reset the canvas and any in-progress input so the app is immediately
    // ready for the next gesture, with no leftover state from the last one.
    setCanvasKey((k) => k + 1);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={settings.themeMode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
        translucent
      />
      <DrawingCanvas key={canvasKey} onGestureComplete={handleGestureComplete} />
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
