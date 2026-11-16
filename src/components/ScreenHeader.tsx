import React, { memo, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { HEADER_H, TOP_RESERVE } from '../constants/config';
import theme from '../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  align?: 'left' | 'center';
};

/**
 * The one header used by every screen. Different slots per screen, identical
 * sizing and material treatment so nothing drifts between screens.
 */
function ScreenHeaderBase({
  title,
  subtitle,
  leftSlot,
  rightSlot,
  align = 'center',
}: Props) {
  return (
    <LinearGradient
      colors={theme.gradients.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.wrap}
    >
      <View style={styles.shade} pointerEvents="none" />
      <View style={styles.row}>
        <View style={styles.slot}>{leftSlot}</View>
        <View style={[styles.center, align === 'left' ? styles.centerLeft : null]}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.slot}>{rightSlot}</View>
      </View>
      <View style={styles.hairline} pointerEvents="none" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: TOP_RESERVE,
    height: TOP_RESERVE + HEADER_H,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(29,36,24,0.45)',
  },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.30)' },
  row: {
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  slot: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  centerLeft: { alignItems: 'flex-start' },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: theme.colors.text.onDarkMuted,
    marginTop: 2,
  },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: 'rgba(176,221,180,0.35)',
  },
});

export default memo(ScreenHeaderBase);
