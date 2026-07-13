import type { Point } from '@/types';

/**
 * A compact, fully offline unistroke gesture recognizer (based on the
 * well-known $1 algorithm: resample -> rotate to indicative angle -> scale
 * to a reference square -> translate to centroid -> compare against
 * templates using rotation-invariant path distance). This gives tolerant,
 * "close enough" matching for hand-drawn symbols with no network or ML
 * model dependency, and runs in well under 300ms for the shortcut counts
 * this app expects.
 */

const RESAMPLE_POINTS = 64;
const SQUARE_SIZE = 250;
const ORIGIN: Point = { x: 0, y: 0 };
const ANGLE_STEP = (Math.PI / 180) * 2;
const ANGLE_RANGE = Math.PI / 4;

function pathLength(points: Point[]): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += distance(points[i - 1], points[i]);
  }
  return d;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function resample(points: Point[], n: number): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return new Array(n).fill(points[0]);

  const interval = pathLength(points) / (n - 1);
  let dist = 0;
  const newPoints: Point[] = [points[0]!];
  const src = [...points];

  for (let i = 1; i < src.length; i++) {
    const prev = src[i - 1]!;
    const curr = src[i]!;
    const d = distance(prev, curr);

    if (dist + d >= interval) {
      const t = interval === 0 ? 0 : (interval - dist) / d;
      const qx = prev.x + t * (curr.x - prev.x);
      const qy = prev.y + t * (curr.y - prev.y);
      const q = { x: qx, y: qy };
      newPoints.push(q);
      src.splice(i, 0, q);
      dist = 0;
    } else {
      dist += d;
    }
  }

  while (newPoints.length < n) {
    newPoints.push(src[src.length - 1]!);
  }

  return newPoints.slice(0, n);
}

function centroid(points: Point[]): Point {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 },
  );
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function indicativeAngle(points: Point[]): number {
  const c = centroid(points);
  return Math.atan2(c.y - points[0]!.y, c.x - points[0]!.x);
}

function rotateBy(points: Point[], radians: number): Point[] {
  const c = centroid(points);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return points.map((p) => ({
    x: (p.x - c.x) * cos - (p.y - c.y) * sin + c.x,
    y: (p.x - c.x) * sin + (p.y - c.y) * cos + c.y,
  }));
}

function boundingBox(points: Point[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function scaleToSquare(points: Point[], size: number): Point[] {
  const box = boundingBox(points);
  const w = box.maxX - box.minX || 1;
  const h = box.maxY - box.minY || 1;
  return points.map((p) => ({
    x: ((p.x - box.minX) * size) / w,
    y: ((p.y - box.minY) * size) / h,
  }));
}

function translateToOrigin(points: Point[]): Point[] {
  const c = centroid(points);
  return points.map((p) => ({ x: p.x - c.x + ORIGIN.x, y: p.y - c.y + ORIGIN.y }));
}

/** Normalize raw drawn points into a template ready for storage/comparison. */
export function normalizeStroke(points: Point[]): Point[] {
  if (points.length < 2) return points;
  let normalized = resample(points, RESAMPLE_POINTS);
  const angle = indicativeAngle(normalized);
  normalized = rotateBy(normalized, -angle);
  normalized = scaleToSquare(normalized, SQUARE_SIZE);
  normalized = translateToOrigin(normalized);
  return normalized;
}

function pathDistance(a: Point[], b: Point[]): number {
  let d = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    d += distance(a[i]!, b[i]!);
  }
  return d / n;
}

function distanceAtAngle(points: Point[], template: Point[], angle: number): number {
  const rotated = rotateBy(points, angle);
  return pathDistance(rotated, template);
}

/** Golden-section search for the rotation that minimizes path distance. */
function distanceAtBestAngle(points: Point[], template: Point[]): number {
  const phi = 0.5 * (-1 + Math.sqrt(5));
  let a = -ANGLE_RANGE;
  let b = ANGLE_RANGE;
  let x1 = phi * a + (1 - phi) * b;
  let f1 = distanceAtAngle(points, template, x1);
  let x2 = (1 - phi) * a + phi * b;
  let f2 = distanceAtAngle(points, template, x2);

  while (Math.abs(b - a) > ANGLE_STEP) {
    if (f1 < f2) {
      b = x2;
      x2 = x1;
      f2 = f1;
      x1 = phi * a + (1 - phi) * b;
      f1 = distanceAtAngle(points, template, x1);
    } else {
      a = x1;
      x1 = x2;
      f1 = f2;
      x2 = (1 - phi) * a + phi * b;
      f2 = distanceAtAngle(points, template, x2);
    }
  }

  return Math.min(f1, f2);
}

export type RecognitionCandidate<T> = { id: T; template: Point[] };
export type RecognitionResult<T> = { id: T; score: number } | null;

/**
 * Compares a freshly-drawn (already-normalized) stroke against saved
 * templates and returns the best match with a 0-1 confidence score, or null
 * if nothing clears the tolerance threshold.
 */
export function recognizeStroke<T>(
  drawn: Point[],
  candidates: RecognitionCandidate<T>[],
  threshold = 0.72,
): RecognitionResult<T> {
  if (candidates.length === 0 || drawn.length < 2) return null;

  const half = 0.5 * SQUARE_SIZE * Math.SQRT2;
  let best: { id: T; d: number } | null = null;

  for (const candidate of candidates) {
    if (candidate.template.length < 2) continue;
    const d = distanceAtBestAngle(drawn, candidate.template);
    if (!best || d < best.d) {
      best = { id: candidate.id, d };
    }
  }

  if (!best) return null;

  const score = 1 - best.d / half;
  if (score < threshold) return null;
  return { id: best.id, score };
}

/** Flattens multi-stroke drawings (connected in draw order) for matching. */
export function flattenStrokes(strokes: Point[][]): Point[] {
  return strokes.flat();
}
