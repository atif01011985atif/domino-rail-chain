import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import theme from '../constants/theme';

type Props = {
  Icon: LucideIcon;
  value: string;
  label: string;
  valueColor: string;
};

/**
 * One shared pill, used identically on Menu and on the result screen.
 * Same icon component for every pill in a row - only the colour changes.
 */
function StatCardBase({ Icon, value, label, valueColor }: Props) {
  return (
    <View
      style={[styles.card, { borderColor: valueColor + '55' }]}
      accessibilityLabel={label + ' ' + value}
    >
      <View style={[styles.iconWrap, { backgroundColor: valueColor + '22' }]}>
        <Icon size={22} color={valueColor} strokeWidth={2.5} />
      </View>
      <Text numberOfLines={1} style={[styles.value, { color: valueColor }]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // width:'100%' - never flex:1 inside a flex:1 slot, that collapses the card.
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: { ...theme.typography.stat },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});

export default memo(StatCardBase);
