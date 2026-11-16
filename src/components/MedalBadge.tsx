import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import theme from '../constants/theme';
import { MEDAL_LABEL } from '../game/medals';
import { Medal } from '../game/types';

type Props = {
  tier: Medal;
  size: number;
  showLabel?: boolean;
};

const FACE: Record<string, string> = {
  gold: theme.colors.medal.gold,
  silver: theme.colors.medal.silver,
  bronze: theme.colors.medal.bronze,
};

/**
 * Vector medal. Tiers differ by ribbon shape and star count as well as colour,
 * and the tier is always written out in text.
 */
function MedalBadgeBase({ tier, size, showLabel = true }: Props) {
  if (!tier) {
    return (
      <View style={[styles.wrap, { width: size }]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle
            cx="50"
            cy="58"
            r="30"
            fill="none"
            stroke={theme.colors.woodEdge}
            strokeWidth="4"
            strokeDasharray="7 6"
          />
        </Svg>
        {showLabel ? <Text style={styles.labelNone}>No medal yet</Text> : null}
      </View>
    );
  }

  const face = FACE[tier];
  const stars = tier === 'gold' ? 3 : tier === 'silver' ? 2 : 1;

  return (
    <View style={[styles.wrap, { width: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path d="M30 4 L46 4 L40 40 L26 36 Z" fill={theme.colors.primary} />
        <Path d="M70 4 L54 4 L60 40 L74 36 Z" fill={theme.colors.accent} />
        <Circle cx="50" cy="60" r="32" fill={theme.colors.walnut} opacity={0.35} />
        <Circle cx="50" cy="58" r="30" fill={face} />
        <Circle cx="50" cy="58" r="30" fill="none" stroke={theme.colors.ink} strokeWidth="2" opacity={0.3} />
        <Circle cx="50" cy="58" r="22" fill="none" stroke={theme.colors.surface} strokeWidth="2" opacity={0.75} />
        <Circle cx="40" cy="48" r="7" fill={theme.colors.surface} opacity={0.35} />
        {Array.from({ length: stars }).map((_, i) => (
          <Circle
            key={i}
            cx={50 + (i - (stars - 1) / 2) * 14}
            cy={58}
            r={5}
            fill={theme.colors.ink}
            opacity={0.55}
          />
        ))}
      </Svg>
      {showLabel ? <Text style={styles.label}>{MEDAL_LABEL[tier]}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  labelNone: {
    ...theme.typography.caption,
    color: theme.colors.medal.none,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});

export default memo(MedalBadgeBase);
