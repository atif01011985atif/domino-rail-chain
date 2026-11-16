import React, { memo, ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import theme from '../constants/theme';

type Props = {
  children: ReactNode;
  tone?: 'ivory' | 'sage' | 'wood';
  compact?: boolean;
  style?: ViewStyle | ViewStyle[];
};

const TONES = {
  ivory: { backgroundColor: theme.colors.surface, borderColor: theme.colors.ui.border },
  sage: { backgroundColor: theme.colors.secondary, borderColor: theme.colors.primary },
  wood: { backgroundColor: theme.colors.woodLight, borderColor: theme.colors.woodEdge },
};

/** Shared 16 dp corner surface: 1 dp material border, top highlight, soft shadow. */
function MaterialCardBase({ children, tone = 'ivory', compact = false, style }: Props) {
  return (
    <View
      style={[
        styles.card,
        TONES[tone],
        compact ? styles.compact : null,
        style as ViewStyle,
      ]}
    >
      <View style={styles.highlight} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  compact: { padding: theme.spacing.md },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 2,
    backgroundColor: theme.colors.ui.highlight,
  },
});

export default memo(MaterialCardBase);
