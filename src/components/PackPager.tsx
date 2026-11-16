import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { PACK_COUNT } from '../constants/config';
import theme from '../constants/theme';
import IconButton from './IconButton';

type Props = {
  packIndex: number;
  name: string;
  onChange: (index: number) => void;
};

/** All 11 packs reachable without a vertically scrolling screen. */
function PackPagerBase({ packIndex, name, onChange }: Props) {
  const prev = useCallback(() => onChange(Math.max(0, packIndex - 1)), [onChange, packIndex]);
  const next = useCallback(
    () => onChange(Math.min(PACK_COUNT - 1, packIndex + 1)),
    [onChange, packIndex],
  );

  return (
    <View style={styles.row}>
      <IconButton
        Icon={ChevronLeft}
        tone="light"
        onPress={prev}
        disabled={packIndex === 0}
        accessibilityLabel="Previous pack"
      />
      <View style={styles.center}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text style={styles.count}>
          {'Pack ' + (packIndex + 1) + ' of ' + PACK_COUNT}
        </Text>
      </View>
      <IconButton
        Icon={ChevronRight}
        tone="light"
        onPress={next}
        disabled={packIndex === PACK_COUNT - 1}
        accessibilityLabel="Next pack"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 48, flexDirection: 'row', alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, lineHeight: 20, fontWeight: '700', color: theme.colors.ink },
  count: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
  },
});

export default memo(PackPagerBase);
