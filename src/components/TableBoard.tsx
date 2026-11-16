import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BOARD_BORDER, BOARD_PAD, COLS, ROWS } from '../constants/config';
import theme from '../constants/theme';
import { cellIsPlaceable } from '../game/simulator';
import { FixedKind, Level, Placement, key } from '../game/types';
import BoardCell, { CellVisual } from './BoardCell';

type Props = {
  level: Level;
  placements: Placement[];
  cellSize: number;
  selectedId: string | null;
  /** Cells currently carrying a pulse, as "x,y" keys. */
  activeKeys: ReadonlySet<string>;
  /** Pieces that have already toppled during this run. */
  toppledIds: ReadonlySet<string>;
  rungKeys: ReadonlySet<string>;
  endedKeys: ReadonlySet<string>;
  /** Highlight empty legal squares while a tray type is selected. */
  showTargets: boolean;
  onCellPress?: (x: number, y: number) => void;
};

/** The single raised wooden table. Always 5 x 4, on every device. */
function TableBoardBase({
  level,
  placements,
  cellSize,
  selectedId,
  activeKeys,
  toppledIds,
  rungKeys,
  endedKeys,
  showTargets,
  onCellPress,
}: Props) {
  const fixedMap = useMemo(() => {
    const m = new Map<string, FixedKind>();
    m.set(key(level.starter.x, level.starter.y), 'starter');
    level.bells.forEach(c => m.set(key(c.x, c.y), 'bell'));
    level.stops.forEach(c => m.set(key(c.x, c.y), 'stop'));
    level.gaps.forEach(c => m.set(key(c.x, c.y), 'gap'));
    return m;
  }, [level]);

  const bellIndex = useMemo(() => {
    const m = new Map<string, number>();
    level.bells.forEach((c, i) => m.set(key(c.x, c.y), i));
    return m;
  }, [level]);

  const pieceMap = useMemo(() => {
    const m = new Map<string, Placement>();
    placements.forEach(p => m.set(key(p.x, p.y), p));
    return m;
  }, [placements]);

  const width = cellSize * COLS + 2 * (BOARD_PAD + BOARD_BORDER);
  const height = cellSize * ROWS + 2 * (BOARD_PAD + BOARD_BORDER);

  const rows = [];
  for (let y = 0; y < ROWS; y += 1) {
    const cells = [];
    for (let x = 0; x < COLS; x += 1) {
      const k = key(x, y);
      const fixed = fixedMap.get(k) || null;
      const piece = pieceMap.get(k) || null;

      let visual: CellVisual = 'idle';
      if (activeKeys.has(k)) visual = 'active';
      else if (endedKeys.has(k)) visual = 'ended';
      else if (piece && piece.id === selectedId) visual = 'selected';
      else if (showTargets && !fixed && !piece && cellIsPlaceable(level, x, y)) visual = 'valid';

      cells.push(
        <BoardCell
          key={k}
          x={x}
          y={y}
          size={cellSize}
          fixed={fixed}
          starterDir={level.starter.dir}
          bellIndex={bellIndex.get(k) ?? 0}
          bellRung={rungKeys.has(k)}
          piece={piece}
          visual={visual}
          toppled={piece ? toppledIds.has(piece.id) : false}
          onPress={onCellPress}
        />,
      );
    }
    rows.push(
      <View key={'r' + y} style={styles.row}>
        {cells}
      </View>,
    );
  }

  return (
    <View style={[styles.shadow, { width, height }]}>
      <LinearGradient
        colors={theme.gradients.wood}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.board, { width, height }]}
      >
        <View style={styles.grain} pointerEvents="none" />
        {rows}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: theme.radius.lg, ...theme.shadows.board },
  board: {
    borderRadius: theme.radius.lg,
    borderWidth: BOARD_BORDER,
    borderColor: theme.colors.walnut,
    borderTopColor: theme.colors.woodEdge,
    padding: BOARD_PAD,
    overflow: 'hidden',
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  row: { flexDirection: 'row' },
});

export default memo(TableBoardBase);
