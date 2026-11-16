import React, { memo, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';
import assets from '../assets';
import theme from '../constants/theme';
import { Dir, DIR_NAME, FixedKind, PieceType, Placement } from '../game/types';
import PieceView from './PieceView';

export type CellVisual = 'idle' | 'valid' | 'selected' | 'active' | 'ended';

type Props = {
  x: number;
  y: number;
  size: number;
  fixed: FixedKind | null;
  starterDir: Dir;
  bellIndex: number;
  bellRung: boolean;
  piece: Placement | null;
  visual: CellVisual;
  toppled: boolean;
  onPress?: (x: number, y: number) => void;
};

const ARROW: Record<Dir, string> = {
  0: '50,14 76,58 24,58',
  1: '86,50 42,76 42,24',
  2: '50,86 24,42 76,42',
  3: '14,50 58,24 58,76',
};

function label(
  fixed: FixedKind | null,
  piece: Placement | null,
  type: PieceType | undefined,
  dir: Dir,
  x: number,
  y: number,
) {
  const where = 'column ' + (x + 1) + ', row ' + (y + 1);
  if (fixed === 'starter') return 'Fixed starter facing ' + DIR_NAME[dir] + ', ' + where;
  if (fixed === 'bell') return 'Fixed bell, ' + where;
  if (fixed === 'stop') return 'Fixed wooden stop, ' + where;
  if (fixed === 'gap') return 'Fixed gap, ' + where;
  if (piece && type) return type + ' facing ' + DIR_NAME[piece.dir] + ', ' + where;
  return 'Empty square, ' + where;
}

/** One non-overlapping hit region. Neighbouring cells never share hit slop. */
function BoardCellBase({
  x,
  y,
  size,
  fixed,
  starterDir,
  bellIndex,
  bellRung,
  piece,
  visual,
  toppled,
  onPress,
}: Props) {
  const handle = useCallback(() => {
    if (onPress) onPress(x, y);
  }, [onPress, x, y]);

  const inner = size - 6;

  return (
    <Pressable
      onPress={handle}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label(fixed, piece, piece ? piece.type : undefined, starterDir, x, y)}
      style={[styles.cell, { width: size, height: size }]}
    >
      <View
        style={[
          styles.seat,
          { width: inner, height: inner },
          visual === 'valid' ? styles.valid : null,
          visual === 'selected' ? styles.selected : null,
          visual === 'active' ? styles.active : null,
          visual === 'ended' ? styles.ended : null,
        ]}
      >
        {fixed === 'gap' ? <View style={styles.gap} /> : null}

        {fixed === 'stop' ? (
          <View style={styles.stop}>
            <View style={styles.screw} />
          </View>
        ) : null}

        {fixed === 'starter' ? (
          <View style={styles.starter}>
            <Svg width={inner * 0.56} height={inner * 0.56} viewBox="0 0 100 100">
              <Rect x="6" y="6" width="88" height="88" rx="16" fill={theme.colors.primary} />
              <Polygon points={ARROW[starterDir]} fill={theme.colors.surface} />
              <Circle cx="50" cy="50" r="46" stroke={theme.colors.ink} strokeWidth="3" fill="none" opacity={0.25} />
            </Svg>
          </View>
        ) : null}

        {fixed === 'bell' ? (
          <View style={styles.bellWrap}>
            <Image
              source={assets.bell}
              style={{
                width: inner * 0.7,
                height: inner * 0.7,
                resizeMode: 'contain',
                opacity: bellRung ? 1 : 0.9,
              }}
            />
            <View style={[styles.bellTag, bellRung ? styles.bellTagOn : null]}>
              <Text style={styles.bellTagText}>{String(bellIndex + 1)}</Text>
            </View>
          </View>
        ) : null}

        {piece ? (
          <PieceView
            type={piece.type}
            dir={piece.dir}
            size={inner}
            selected={visual === 'selected'}
            toppled={toppled}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { alignItems: 'center', justifyContent: 'center' },
  seat: {
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(29,36,24,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(29,36,24,0.10)',
    borderTopColor: 'rgba(255,255,255,0.45)',
  },
  valid: { backgroundColor: 'rgba(91,171,42,0.18)', borderColor: theme.colors.primary },
  selected: { borderColor: theme.colors.accent, borderWidth: 2 },
  active: { borderColor: theme.colors.accent, borderWidth: 2, backgroundColor: 'rgba(224,40,206,0.12)' },
  ended: { borderColor: theme.colors.brass, borderWidth: 2, borderStyle: 'dashed' },
  gap: {
    width: '72%',
    height: '72%',
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(29,36,24,0.55)',
  },
  stop: {
    width: '74%',
    height: '74%',
    borderRadius: 6,
    backgroundColor: theme.colors.walnut,
    borderWidth: 1,
    borderColor: '#4C3F2E',
    borderTopColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screw: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.woodEdge,
    opacity: 0.8,
  },
  starter: { alignItems: 'center', justifyContent: 'center' },
  bellWrap: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  bellTag: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.woodEdge,
  },
  bellTagOn: { backgroundColor: theme.colors.primary },
  bellTagText: { fontSize: 10, lineHeight: 14, fontWeight: '700', color: theme.colors.ink },
});

export default memo(BoardCellBase);
