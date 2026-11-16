import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react-native';
import theme from '../constants/theme';
import { PIECE_LABEL, PIECE_UNLOCK_TABLE, PieceType } from '../game/types';
import IconButton from './IconButton';
import PieceView from './PieceView';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const PER_PAGE = 3;

type TileProps = {
  type: PieceType;
  selected: boolean;
  locked: boolean;
  height: number;
  onSelect: (type: PieceType) => void;
};

function TrayTile({ type, selected, locked, height, onSelect }: TileProps) {
  const press = useCallback(() => onSelect(type), [onSelect, type]);
  return (
    <View style={styles.slot}>
      <Pressable
        onPress={press}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled: locked }}
        accessibilityLabel={
          locked
            ? PIECE_LABEL[type] + ', locked until table ' + PIECE_UNLOCK_TABLE[type] + ' is complete'
            : PIECE_LABEL[type] + ' piece'
        }
        style={[
          styles.tile,
          { height },
          selected ? styles.tileSelected : null,
          locked ? styles.tileLocked : null,
        ]}
      >
        {locked ? (
          <View style={styles.lockArt}>
            <Lock size={24} color={theme.colors.text.tertiary} strokeWidth={2.25} />
          </View>
        ) : (
          <PieceView type={type} dir={1} size={height > 60 ? 36 : 30} />
        )}
        <Text numberOfLines={1} style={styles.name}>
          {locked ? 'Table ' + PIECE_UNLOCK_TABLE[type] : PIECE_LABEL[type]}
        </Text>
      </Pressable>
    </View>
  );
}

type Props = {
  types: PieceType[];
  unlocked: PieceType[];
  selected: PieceType | null;
  page: number;
  onSelect: (type: PieceType) => void;
  onPage: (page: number) => void;
  compact: boolean;
};

/** Three visible type tiles per page, paged horizontally - never a scroll view. */
function PieceTrayBase({ types, unlocked, selected, page, onSelect, onPage, compact }: Props) {
  const pages = Math.max(1, Math.ceil(types.length / PER_PAGE));
  const current = Math.min(page, pages - 1);
  const shown = types.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE);
  const height = compact ? 56 : 64;

  const prev = useCallback(() => onPage(Math.max(0, current - 1)), [current, onPage]);
  const next = useCallback(() => onPage(Math.min(pages - 1, current + 1)), [current, onPage, pages]);

  return (
    <View style={styles.row}>
      {pages > 1 ? (
        <IconButton
          Icon={ChevronLeft}
          tone="light"
          onPress={prev}
          disabled={current === 0}
          accessibilityLabel="Previous tray page"
        />
      ) : null}

      <View style={styles.tiles}>
        {shown.map(t => (
          <TrayTile
            key={t}
            type={t}
            height={height}
            selected={selected === t}
            locked={unlocked.indexOf(t) === -1}
            onSelect={onSelect}
          />
        ))}
      </View>

      {pages > 1 ? (
        <IconButton
          Icon={ChevronRight}
          tone="light"
          onPress={next}
          disabled={current === pages - 1}
          accessibilityLabel="Next tray page"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tiles: { flex: 1, flexDirection: 'row', gap: 8 },
  slot: { flex: 1 },
  tile: {
    width: '100%',
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    borderTopColor: theme.colors.ui.highlight,
    paddingVertical: 4,
  },
  tileSelected: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  tileLocked: { backgroundColor: theme.colors.surfaceWarm, opacity: 0.8 },
  lockArt: { height: 30, alignItems: 'center', justifyContent: 'center' },
  name: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
});

export default memo(PieceTrayBase);
