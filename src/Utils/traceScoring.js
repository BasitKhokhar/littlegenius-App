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

/**
 * Heuristic score for glyphs we have NO skeleton for (e.g. Urdu haroof).
 * We can't match an exact shape, but we can honestly reward writing that
 * fills the guide area neatly and penalise tiny dots or ink dumped in a
 * corner — so the marks genuinely vary with effort & placement instead of
 * being a fixed reward.
 * @param {Array} strokes  [{ points: [{x,y}] }] from DrawCanvas
 * @param {number} size    cell size in px (square)
 * @returns {{ marks:number, coverage:number, stray:number }}
 */
export const scoreFreeform = (strokes, size) => {
  const pts = [];
  let length = 0;
  for (const s of strokes) {
    for (let i = 0; i < s.points.length; i++) {
      pts.push(s.points[i]);
      if (i > 0) {
        length += Math.hypot(
          s.points[i].x - s.points[i - 1].x,
          s.points[i].y - s.points[i - 1].y
        );
      }
    }
  }
  if (pts.length === 0) return { marks: 0, coverage: 0, stray: 0 };

  // The guide glyph lives roughly in the middle ~76% of the cell.
  const lo = size * 0.12;
  const hi = size * 0.88;
  let inZone = 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x >= lo && p.x <= hi && p.y >= lo && p.y <= hi) inZone++;
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const inZoneRatio = inZone / pts.length;             // stay inside the guide
  const spanX = (maxX - minX) / size;
  const spanY = (maxY - minY) / size;
  const extent = Math.min(1, spanX / 0.45) * Math.min(1, spanY / 0.45); // fills area
  const lengthScore = Math.min(1, length / (size * 1.4)); // enough ink, not a dot
  const fill = 0.5 * extent + 0.5 * lengthScore;

  // Placement gates the whole score; a good full trace inside the guide wins.
  const score = Math.max(0, Math.min(1, inZoneRatio * (0.35 + 0.65 * fill)));
  const marks = Math.max(1, Math.round(score * 10));
  return { marks, coverage: inZoneRatio, stray: 1 - inZoneRatio };
};
