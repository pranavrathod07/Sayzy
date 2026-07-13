import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppColors } from '@/hooks/useAppColors';
import { normalizeStroke } from '@/utils/gestureRecognizer';
import type { Point } from '@/types';

const STROKE_END_DELAY_MS = 550;

type DrawingCanvasProps = {
  /** Called with the raw multi-stroke drawing once the user pauses after lifting their finger. */
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
 * A full-screen SVG drawing surface. Strokes are captured raw for on-screen
 * rendering, and normalized (via the $1 recognizer's pipeline) before being
 * handed off for matching so imperfect drawings still compare fairly.
 */
export function DrawingCanvas({ onGestureComplete }: DrawingCanvasProps) {
  const colors = useAppColors();
  const [liveStroke, setLiveStroke] = useState<Point[]>([]);
  const [committedStrokes, setCommittedStrokes] = useState<Point[][]>([]);
  const sessionStrokesRef = useRef<Point[][]>([]);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCanvas = useCallback(() => {
    setCommittedStrokes([]);
    setLiveStroke([]);
    sessionStrokesRef.current = [];
  }, []);

  const scheduleSessionEnd = useCallback(() => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => {
      const strokes = sessionStrokesRef.current;
      if (strokes.length > 0) {
        const normalized = strokes.map((s) => normalizeStroke(s));
        onGestureComplete(normalized);
      }
      clearCanvas();
    }, STROKE_END_DELAY_MS);
  }, [onGestureComplete, clearCanvas]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
          const { locationX, locationY } = evt.nativeEvent;
          setLiveStroke([{ x: locationX, y: locationY }]);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setLiveStroke((prev) => [...prev, { x: locationX, y: locationY }]);
        },
        onPanResponderRelease: () => {
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

  return (
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
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
