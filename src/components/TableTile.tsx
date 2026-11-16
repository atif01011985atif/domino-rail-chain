import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Lock } from 'lucide-react-native';
import theme from '../constants/theme';
import { Medal } from '../game/types';

const HIT = { top: 4, bottom: 4, left: 4, right: 4 };

type Props = {
  levelId: number;
  selected: boolean;
  unlocked: boolean;
  completed: boolean;
  bestMedal: Medal;
  onPress: (levelId: number) => void;
};

const MEDAL_COLOR = {
  gold: theme.colors.medal.gold,
  silver: theme.colors.medal.silver,
  bronze: theme.colors.medal.bronze,
};

/** Number, lock state and best medal - state is never carried by colour alone. */
function TableTileBase({
  levelId,
  selected,
  unlocked,
  completed,
  bestMedal,
  onPress,
}: Props) {
  const press = useCallback(() => onPress(levelId), [levelId, onPress]);

  const a11y =
    'Table ' +
    levelId +
    (unlocked ? '' : ', locked') +
    (completed ? ', complete' : '') +
    (bestMedal ? ', best medal ' + bestMedal : '');

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={press}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        accessibilityState={{ selected, disabled: !unlocked }}
        style={[
          styles.tile,
          unlocked ? styles.open : styles.locked,
          selected ? styles.selected : null,
        ]}
      >
        {unlocked ? (
          <Text style={[styles.num, selected ? styles.numSelected : null]}>
            {String(levelId)}
          </Text>
        ) : (
          <Lock size={16} color={theme.colors.text.tertiary} strokeWidth={2.5} />
        )}

        {bestMedal ? (
          <View style={[styles.dot, { backgroundColor: MEDAL_COLOR[bestMedal] }]} />
        ) : completed ? (
          <View style={styles.check}>
            <Check size={10} color={theme.colors.surface} strokeWidth={4} />
          </View>
        ) : null}

        {selected ? <View style={styles.tick} pointerEvents="none" /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1 },
  tile: {
    width: '100%',
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  open: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderTopColor: theme.colors.ui.highlight,
  },
  locked: {
    backgroundColor: theme.colors.surfaceWarm,
    borderColor: theme.colors.woodEdge,
    opacity: 0.85,
  },
  selected: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  num: { fontSize: 16, lineHeight: 20, fontWeight: '700', color: theme.colors.text.secondary },
  numSelected: { color: theme.colors.ink },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(29,36,24,0.25)',
  },
  check: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  tick: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 4,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
  },
});

export default memo(TableTileBase);
