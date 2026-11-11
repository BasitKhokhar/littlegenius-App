import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Header } from '../../Components/UI';
import { useThemeColors } from '../../Context/ThemeContext';
import { useDialog } from '../../Context';
import { useTabBarClearance } from '../../Hooks';
import { DrawCanvas, ColorPalette, ERASER } from '../../Components/Games';

// ──────────────────────────────────────────────────────────────
// DrawingBoardScreen — neon free-drawing board. Glowing strokes on
// a fixed dark canvas (neon needs dark in BOTH themes), with color
// pencils, three brush sizes, eraser, undo and clear.
// ──────────────────────────────────────────────────────────────

const BOARD_BG = '#0F0D28';

const NEON = ['#22D3EE', '#F472B6', '#A78BFA', '#4ADE80', '#FBBF24', '#F87171', '#FFFFFF'];
const WIDTHS = [6, 10, 16];

const DrawingBoardScreen = ({ navigation }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const colors = useThemeColors();
  const bottomPad = useTabBarClearance();
  const { showConfirm } = useDialog();
  const styles = makeStyles(colors);

  const [color, setColor] = useState(NEON[0]);
  const [width, setWidth] = useState(WIDTHS[1]);
  const canvasRef = useRef(null);

  const canvasW = Math.min(screenWidth - 24, 1000);
  const canvasH = Math.max(320, screenHeight - bottomPad - 330);

  const isEraser = color === ERASER;

  const handleClear = () => {
    showConfirm({
      title: 'Clear the board?',
      message: 'Your drawing will be erased.',
      emoji: '🖌️',
      confirmLabel: 'Clear',
      onConfirm: () => canvasRef.current?.clear(),
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Neon Drawing ✨" showBack onBackPress={() => navigation.goBack()} />

      <View style={styles.body}>
        <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => canvasRef.current?.undo()} activeOpacity={0.85}>
            <Text style={styles.actionText}>↩️</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Draw anything you like — your lines glow! 🌟</Text>
        
          <TouchableOpacity style={styles.actionBtn} onPress={handleClear} activeOpacity={0.85}>
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>


        <DrawCanvas
          ref={canvasRef}
          width={canvasW}
          height={canvasH}
          strokeColor={isEraser ? BOARD_BG : color}
          strokeWidth={isEraser ? width * 2.4 : width}
          glow={!isEraser}
          backgroundColor={BOARD_BG}
          style={styles.board}
        />

        <ColorPalette
          colors={NEON}
          value={color}
          onChange={setColor}
          eraser
          widths={WIDTHS}
          width={width}
          onWidthChange={setWidth}
        />
      </View>
    </View>
  );
};

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 12, paddingTop: 8 },
  hint: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 },
  board: {
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#2A2647',
  },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginVertical: 5 },
  actionBtn: {
    backgroundColor: colors.textMuted + '22',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  actionText: { fontSize: 13, fontWeight: '900', color: colors.textPrimary },
});

export default DrawingBoardScreen;
