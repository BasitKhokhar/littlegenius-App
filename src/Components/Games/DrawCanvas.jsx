import React, { useRef, useReducer, useImperativeHandle, forwardRef } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ──────────────────────────────────────────────────────────────
// DrawCanvas — reusable finger-drawing surface (extracted from the
// SketchCanvas PanResponder pattern). Unlike SketchCanvas it also
// keeps the RAW POINTS of every stroke so callers can score tracing
// accuracy, and it supports a neon "glow" render mode.
//
// Props:
//   width, height     canvas size (px)
//   strokeColor       current pen colour
//   strokeWidth       current pen width
//   glow              bool — render a wide soft underlay per stroke
//   backgroundColor   canvas fill (default transparent)
//   children          extra SVG elements rendered UNDER the ink
//                     (e.g. a guide glyph / skeleton)
//   onStrokeEnd(stroke, allStrokes)  called when a stroke completes
//
// Ref API: undo(), clear(), getStrokes() -> [{ d, points, color, width }]
// ──────────────────────────────────────────────────────────────
const DrawCanvas = forwardRef(({
  width,
  height,
  strokeColor = '#6366F1',
  strokeWidth = 10,
  glow = false,
  backgroundColor = 'transparent',
  children,
  onStrokeEnd,
  style,
}, ref) => {
  // Live stroke data lives in refs so the PanResponder closure always
  // reads fresh values; a forced re-render paints them.
  const strokesRef = useRef([]);   // [{ d, points, color, width }]
  const currentRef = useRef(null); // { d, points, color, width } | null
  const [, forceRender] = useReducer((x) => x + 1, 0);

  // Pen settings read inside the (once-created) responder.
  const penRef = useRef({ color: strokeColor, width: strokeWidth });
  penRef.current = { color: strokeColor, width: strokeWidth };

  const callbacksRef = useRef({ onStrokeEnd });
  callbacksRef.current = { onStrokeEnd };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentRef.current = {
          d: `M${locationX.toFixed(1)},${locationY.toFixed(1)}`,
          points: [{ x: locationX, y: locationY }],
          color: penRef.current.color,
          width: penRef.current.width,
        };
        forceRender();
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        const cur = currentRef.current;
        if (!cur) return;
        cur.d += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        cur.points.push({ x: locationX, y: locationY });
        forceRender();
      },
      onPanResponderRelease: () => {
        const cur = currentRef.current;
        if (cur && cur.points.length > 0) {
          strokesRef.current.push(cur);
          callbacksRef.current.onStrokeEnd?.(cur, strokesRef.current);
        }
        currentRef.current = null;
        forceRender();
      },
      onPanResponderTerminate: () => {
        currentRef.current = null;
        forceRender();
      },
    })
  ).current;

  useImperativeHandle(ref, () => ({
    undo: () => {
      strokesRef.current.pop();
      forceRender();
    },
    clear: () => {
      strokesRef.current = [];
      currentRef.current = null;
      forceRender();
    },
    getStrokes: () => strokesRef.current,
  }));

  const renderStroke = (s, key) => {
    if (!glow) {
      return (
        <Path
          key={key}
          d={s.d}
          stroke={s.color}
          strokeWidth={s.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.92}
        />
      );
    }
    // Neon: wide translucent underlay + bright core
    return (
      <React.Fragment key={key}>
        <Path
          d={s.d}
          stroke={s.color}
          strokeWidth={s.width * 2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.35}
        />
        <Path
          d={s.d}
          stroke={s.color}
          strokeWidth={s.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </React.Fragment>
    );
  };

  return (
    <View
      style={[{ width, height, backgroundColor }, styles.wrap, style]}
      {...panResponder.panHandlers}
    >
      <Svg width={width} height={height}>
        {children}
        {strokesRef.current.map((s, i) => renderStroke(s, i))}
        {currentRef.current ? renderStroke(currentRef.current, 'live') : null}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});

export default DrawCanvas;
