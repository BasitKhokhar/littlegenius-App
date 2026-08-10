// ──────────────────────────────────────────────────────────────
// traceScoring — pure functions that grade a child's tracing.
//
// The guide skeleton (normalized polylines, see traceSkeletons.js)
// is densified into evenly-spaced sample points inside the drawing
// cell. A mark out of 10 combines TWO honest measures so a careless
// scribble can't score high just by covering the cell:
//   recall    — how much of the letter the child actually traced
//               (did ink land near each guide point?)
//   precision — how much of the child's ink actually lay ON the letter
//               (a scribble/blob has lots of ink far from the thin line)
// A big scribble has high recall but LOW precision, so recall×precision
// (with a light stray penalty) keeps it low. Only a stroke that follows
// the letter scores well.
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
  for (let lineIdx = 0; lineIdx < skeleton.length; lineIdx++) {
    const line = skeleton[lineIdx];
    for (let i = 0; i < line.length - 1; i++) {
      const ax = pad + line[i][0] * drawSize;
      const ay = pad + line[i][1] * drawSize;
      const bx = pad + line[i + 1][0] * drawSize;
      const by = pad + line[i + 1][1] * drawSize;
      const segLen = Math.hypot(bx - ax, by - ay);
      const n = Math.max(1, Math.round(segLen / step));
      for (let k = 0; k <= n; k++) {
        pts.push({ x: ax + ((bx - ax) * k) / n, y: ay + ((by - ay) * k) / n, line: lineIdx });
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

  // Tighter than before: ink must hug the line, not just wander near it.
  const nearR = size * 0.08;   // a guide point counts as traced within this radius
  const onR = size * 0.09;     // ink counts as "on the letter" within this radius
  const strayR = size * 0.16;  // ink farther than this from the letter is a scribble
  const nearR2 = nearR * nearR;
  const onR2 = onR * onR;
  const strayR2 = strayR * strayR;

  // recall — did the child cover the letter? Measured PER STROKE (each
  // polyline of the skeleton, e.g. the crossbar of an "A"/"H" or one loop
  // of an "8") and then combined so a long stroke can't hide a short one
  // that was skipped entirely. Pooling every guide point into one flat
  // average let a child who traced only 2 of "A"'s 3 strokes (both long
  // diagonals, skipping the short crossbar) still land recall ~0.9,
  // because the crossbar is a tiny fraction of the letter's total point
  // count — that's why an incomplete letter used to still score 8-9/10.
  const lineIds = [];
  for (const g of guidePts) if (!lineIds.includes(g.line)) lineIds.push(g.line);
  const perLineRecall = lineIds.map((id) => {
    let lineCovered = 0;
    let lineTotal = 0;
    for (const g of guidePts) {
      if (g.line !== id) continue;
      lineTotal++;
      if (minDistSq(g, inkPts) <= nearR2) lineCovered++;
    }
    return lineTotal ? lineCovered / lineTotal : 0;
  });
  const avgRecall = perLineRecall.reduce((a, b) => a + b, 0) / perLineRecall.length;
  const minRecall = Math.min(...perLineRecall);
  // A stroke that's skipped or barely attempted (minRecall near 0) drags the
  // whole letter down hard via this power term, even if the strokes that
  // WERE drawn were perfect — an "A" missing its crossbar is not a passing
  // "A" just because both diagonals were traced beautifully.
  const recall = avgRecall * Math.pow(minRecall, 1.5);

  // precision — did the child's ink stay ON the letter (vs. scribbling)?
  let onLetter = 0;
  let strayCount = 0;
  for (const p of inkPts) {
    const d = minDistSq(p, guidePts);
    if (d <= onR2) onLetter++;
    if (d > strayR2) strayCount++;
  }
  const precision = onLetter / inkPts.length;
  const stray = strayCount / inkPts.length;

  // recall×precision is the core: a scribble that fills the cell has high recall
  // but low precision, so it can no longer score high. The stray term is an
  // extra penalty for ink dumped well away from the letter. No floor at 1 — a
  // wrong or careless attempt must be allowed to score low so the retry is real.
  const score = Math.max(0, Math.min(1, recall * precision - 0.3 * stray));
  const marks = Math.max(0, Math.round(score * 10));
  return { marks, coverage: recall, stray };
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
  const extent = Math.min(1, spanX / 0.55) * Math.min(1, spanY / 0.55); // fills area
  const lengthScore = Math.min(1, length / (size * 1.2)); // enough ink, not a dot

  // Overdraw penalty: a real glyph's ink length is a small multiple of its
  // bounding-box diagonal; a back-and-forth scribble is many times longer.
  // Full credit up to ~4× the diagonal, then falls off — this is what stops a
  // scribble that fills the cell from scoring high without a target shape.
  const diag = Math.hypot(spanX, spanY) * size;
  const lengthRatio = length / Math.max(1, diag);
  const neat = Math.max(0, Math.min(1, 1 - Math.max(0, lengthRatio - 4) / 8));

  const fill = 0.4 * extent + 0.3 * lengthScore + 0.3 * neat;

  // Placement gates the whole score hard (squared). CEILING caps the best
  // possible mark below the "amazing" tier (>=8): without a real skeleton we
  // can't confirm the ink is actually the target glyph and not just a filled
  // scribble or an unrelated stroke that happens to span the guide box, so
  // this heuristic must never claim the same confidence as a verified trace.
  // No floor at 1, so a corner scribble or a tiny mark genuinely scores low.
  const CEILING = 0.72;
  const score = Math.max(0, Math.min(1, Math.pow(inZoneRatio, 1.5) * fill * CEILING));
  const marks = Math.max(0, Math.round(score * 10));
  return { marks, coverage: inZoneRatio, stray: 1 - inZoneRatio };
};
