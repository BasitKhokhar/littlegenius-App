// ──────────────────────────────────────────────────────────────
// traceScoring — pure functions that grade a child's tracing.
//
// The guide skeleton (normalized polylines, see traceSkeletons.js)
// is densified into evenly-spaced sample points inside the drawing
// cell. Marks out of 10 combine:
//   coverage — how much of the letter the child actually traced
//   stray    — how much ink landed far away from the letter (scribble)
// Brute-force nearest-neighbour is plenty fast (< a few ms per cell).
// ──────────────────────────────────────────────────────────────

/**
 * Scale a normalized skeleton into pixel space and emit points every
 * `step` px along each polyline segment.
 * @param {Array} skeleton  array of polylines of [x,y] in 0-1 space
 * @param {number} size     cell size in px (drawing area is square)
 * @param {number} pad      inner padding in px
 * @returns {Array<{x,y}>}  densified guide points
 */
export const densifySkeleton = (skeleton, size, pad = 0) => {
  const drawSize = size - pad * 2;
  const step = Math.max(3, size * 0.03);
  const pts = [];
  for (const line of skeleton) {
    for (let i = 0; i < line.length - 1; i++) {
      const ax = pad + line[i][0] * drawSize;
      const ay = pad + line[i][1] * drawSize;
      const bx = pad + line[i + 1][0] * drawSize;
      const by = pad + line[i + 1][1] * drawSize;
      const segLen = Math.hypot(bx - ax, by - ay);
      const n = Math.max(1, Math.round(segLen / step));
      for (let k = 0; k <= n; k++) {
        pts.push({ x: ax + ((bx - ax) * k) / n, y: ay + ((by - ay) * k) / n });
      }
    }
  }
  return pts;
};

/** Convert a skeleton polyline into an SVG path `d` string for a cell. */
export const skeletonToPath = (line, size, pad = 0) => {
  const drawSize = size - pad * 2;
  return line
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${(pad + x * drawSize).toFixed(1)},${(pad + y * drawSize).toFixed(1)}`)
    .join(' ');
};

const minDistSq = (p, pts) => {
  let best = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const dx = p.x - pts[i].x;
    const dy = p.y - pts[i].y;
    const d = dx * dx + dy * dy;
    if (d < best) best = d;
  }
  return best;
};

/**
 * Score the child's ink against the guide.
 * @param {Array<{x,y}>} guidePts  densified skeleton points (px)
 * @param {Array}        strokes   [{ points: [{x,y}] }] from DrawCanvas
 * @param {number}       size      cell size in px
 * @returns {{ marks:number, coverage:number, stray:number }}
 */
export const scoreTrace = (guidePts, strokes, size) => {
  // Downsample ink to every 3rd point to keep the NN check cheap.
  const inkPts = [];
  for (const s of strokes) {
    for (let i = 0; i < s.points.length; i += 3) inkPts.push(s.points[i]);
    const last = s.points[s.points.length - 1];
    if (last) inkPts.push(last);
  }
  if (inkPts.length === 0 || guidePts.length === 0) {
    return { marks: 0, coverage: 0, stray: 0 };
  }

  const nearR = size * 0.09;   // guide point counts as traced within this radius
  const strayR = size * 0.18;  // ink farther than this from the letter is scribble
  const nearR2 = nearR * nearR;
  const strayR2 = strayR * strayR;

  let covered = 0;
  for (const g of guidePts) {
    if (minDistSq(g, inkPts) <= nearR2) covered++;
  }
  const coverage = covered / guidePts.length;

  let strayCount = 0;
  for (const p of inkPts) {
    if (minDistSq(p, guidePts) > strayR2) strayCount++;
  }
  const stray = strayCount / inkPts.length;

  const score = Math.max(0, Math.min(1, coverage - 0.5 * stray));
  const marks = Math.max(1, Math.round(score * 10));
  return { marks, coverage, stray };
};
