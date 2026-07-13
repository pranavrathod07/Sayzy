import { Feather } from '@expo/vector-icons';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAppColors } from '@/hooks/useAppColors';
import { normalizeStroke } from '@/utils/gestureRecognizer';
import type { Point } from '@/types';
import { ShinyButton } from './ShinyButton';

// How long to wait after the last touch-end, with no new stroke started,
// before auto-finalizing a multi-stroke drawing and running recognition.
// Kept generous so lifting a finger between strokes of a multi-part symbol
// (e.g. "|" then "<" to form a "K") never gets mistaken for "done".
const STROKE_END_DELAY_MS = 1300;

export type DrawingCanvasHandle = {
  /** Immediately finalize the current multi-stroke drawing and run recognition. */
  finishNow: () => void;
  /** Discard the current drawing without running recognition. */
  clear: () => void;
};

type DrawingCanvasProps = {
  /** Called with the raw multi-stroke drawing once finalized (Done tap or inactivity timeout). */
  onGestureComplete: (strokes: Point[][]) => void;
};

function pointsToPath(points: Point[]): string {
  if (points.length === 0) return '';
  return points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    '',
  );
}

/**
 * A full-screen SVG drawing surface. All strokes for the current
 * gesture-in-progress stay visible together — lifting a finger never clears
 * the canvas by itself. The drawing is only finalized (recognized, then
 * cleared) when the user taps the Done checkmark, or after a short pause
 * with no new stroke started.
 */
export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas({ onGestureComplete }, ref) {
    const colors = useAppColors();
    const insets = useSafeAreaInsets();
    const [liveStroke, setLiveStroke] = useState<Point[]>([]);
    const [committedStrokes, setCommittedStrokes] = useState<Point[][]>([]);
    const sessionStrokesRef = useRef<Point[][]>([]);
    const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

    const clearCanvas = useCallback(() => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      setCommittedStrokes([]);
      setLiveStroke([]);
      sessionStrokesRef.current = [];
    }, []);

    const finishNow = useCallback(() => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      // Commit any stroke still mid-drag before finalizing, so a Done tap
      // right after lifting never drops the last stroke.
      setLiveStroke((prev) => {
        if (prev.length > 1) {
          sessionStrokesRef.current = [...sessionStrokesRef.current, prev];
        }
        return [];
      });
      const strokes = sessionStrokesRef.current;
      if (strokes.length > 0) {
        const normalized = strokes.map((s) => normalizeStroke(s));
        onGestureComplete(normalized);
      }
      clearCanvas();
    }, [onGestureComplete, clearCanvas]);

    const scheduleSessionEnd = useCallback(() => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(() => {
        finishNow();
      }, STROKE_END_DELAY_MS);
    }, [finishNow]);

    useImperativeHandle(ref, () => ({ finishNow, clear: clearCanvas }), [finishNow, clearCanvas]);

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: (evt) => {
            // A new stroke is starting: cancel any pending auto-finalize so
            // the drawing-in-progress is never cleared out from under it.
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
            const { locationX, locationY } = evt.nativeEvent;
            setLiveStroke([{ x: locationX, y: locationY }]);
          },
          onPanResponderMove: (evt) => {
            const { locationX, locationY } = evt.nativeEvent;
            setLiveStroke((prev) => [...prev, { x: locationX, y: locationY }]);
          },
          onPanResponderRelease: () => {
            // Finalize this stroke into the session, but do NOT clear the
            // canvas or run recognition yet — more strokes may follow.
            setLiveStroke((prev) => {
              if (prev.length > 1) {
                sessionStrokesRef.current = [...sessionStrokesRef.current, prev];
                setCommittedStrokes((strokes) => [...strokes, prev]);
              }
              return [];
            });
            scheduleSessionEnd();
          },
        }),
      [scheduleSessionEnd],
    );

    const hasContent = committedStrokes.length > 0 || liveStroke.length > 0;

    return (
      <View style={styles.wrapper}>
        <View
          style={[styles.canvas, { backgroundColor: colors.canvasBackground }]}
          {...panResponder.panHandlers}
          testID="drawing-canvas"
        >
          <Svg style={StyleSheet.absoluteFill}>
            {committedStrokes.map((stroke, i) => (
              <Path
                key={`committed-${i}`}
                d={pointsToPath(stroke)}
                stroke={colors.canvasStroke}
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {liveStroke.length > 0 && (
              <Path
                d={pointsToPath(liveStroke)}
                stroke={colors.primary}
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
        </View>

        {hasContent && (
          <View style={[styles.doneWrap, { top: topInset + 16 }]} pointerEvents="box-none">
            <ShinyButton
              onPress={finishNow}
              backgroundColor={colors.primary}
              size={40}
              accessibilityLabel="Done drawing — finish and recognize"
              testID="drawing-done-button"
            >
              <Feather name="check" size={18} color={colors.primaryForeground} />
            </ShinyButton>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  doneWrap: {
    position: 'absolute',
    left: 12,
    opacity: 0.85,
  },
});
