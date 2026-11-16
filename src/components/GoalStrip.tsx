import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GOAL_STRIP_H } from '../constants/config';
import theme from '../constants/theme';

type Props = {
  bellsReached: number;
  bellCount: number;
  pieceCount: number;
  goldTarget: number;
  sandbox?: boolean;
};

/** Progress only. No money values exist anywhere in this app. */
function GoalStripBase({
  bellsReached,
  bellCount,
  pieceCount,
  goldTarget,
  sandbox = false,
}: Props) {
  const complete = bellCount > 0 && bellsReached === bellCount;
  return (
    <View style={styles.strip}>
      <Text style={[styles.left, complete ? styles.leftDone : null]}>
        {'Bells ' + bellsReached + '/' + bellCount}
      </Text>
      <Text style={styles.right}>
        {sandbox
          ? 'Pieces ' + pieceCount
          : 'Pieces ' + pieceCount + '  ·  Gold ' + goldTarget}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: GOAL_STRIP_H,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: theme.colors.text.secondary },
  leftDone: { color: theme.colors.primary },
  right: { fontSize: 14, lineHeight: 18, fontWeight: '500', color: theme.colors.text.tertiary },
});

export default memo(GoalStripBase);
