import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import AppShell from '../components/AppShell';
import IconButton from '../components/IconButton';
import MaterialCard from '../components/MaterialCard';
import MedalBadge from '../components/MedalBadge';
import PackPager from '../components/PackPager';
import ScreenHeader from '../components/ScreenHeader';
import { LEVEL_COUNT, PACK_SIZE } from '../constants/config';
import theme from '../constants/theme';
import { medalTargets } from '../game/medals';
import { PACKS, getLevel } from '../game/levels';
import { Medal } from '../game/types';

const ROW_H = 72;

type Row = {
  id: number;
  title: string;
  gold: number;
  unlocked: boolean;
  medal: Medal;
  bestPieces: number;
};

type Props = {
  packIndex: number;
  unlocked: number;
  medalCount: number;
  medalOf: (levelId: number) => Medal;
  bestOf: (levelId: number) => number;
  onPack: (index: number) => void;
  onBack: () => void;
};

function MedalRow({ row }: { row: Row }) {
  const targets = medalTargets(row.gold);
  return (
    <MaterialCard
      tone={row.unlocked ? 'ivory' : 'wood'}
      compact
      style={styles.row}
    >
      <MedalBadge tier={row.medal} size={44} showLabel={false} />
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {row.id + '. ' + row.title}
        </Text>
        <Text numberOfLines={1} style={styles.rowMeta}>
          {'Gold: ' +
            targets.gold +
            ' or fewer  ·  Silver: ' +
            targets.silver +
            ' or fewer'}
        </Text>
      </View>
      <Text style={styles.rowBest}>
        {row.bestPieces > 0 ? row.bestPieces + ' pcs' : row.unlocked ? 'Open' : 'Locked'}
      </Text>
    </MaterialCard>
  );
}

/** The collection is never an empty screen - every table has a visible row. */
export default function MedalsScreen({
  packIndex,
  unlocked,
  medalCount,
  medalOf,
  bestOf,
  onPack,
  onBack,
}: Props) {
  const pack = PACKS[packIndex];

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (let i = 0; i < PACK_SIZE; i += 1) {
      const id = pack.from + i;
      const lv = getLevel(id);
      out.push({
        id,
        title: lv.title,
        gold: lv.gold,
        unlocked: id <= unlocked,
        medal: medalOf(id),
        bestPieces: bestOf(id),
      });
    }
    return out;
  }, [bestOf, medalOf, pack, unlocked]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Row>) => <MedalRow row={item} />,
    [],
  );
  const keyExtractor = useCallback((item: Row) => String(item.id), []);
  const getItemLayout = useCallback(
    (_: ArrayLike<Row> | null | undefined, index: number) => ({
      length: ROW_H + 8,
      offset: (ROW_H + 8) * index,
      index,
    }),
    [],
  );

  return (
    <AppShell variant="medals">
      <ScreenHeader
        title="Medals"
        subtitle={medalCount + ' of ' + LEVEL_COUNT + ' earned'}
        leftSlot={
          <IconButton Icon={ArrowLeft} onPress={onBack} accessibilityLabel="Back to tables" />
        }
      />

      <View style={styles.pagerWrap}>
        <PackPager packIndex={packIndex} name={pack.name} onChange={onPack} />
      </View>

      {medalCount === 0 ? (
        <MaterialCard tone="sage" compact style={styles.firstCard}>
          <Text style={styles.firstText}>Your first medal starts at table 1.</Text>
        </MaterialCard>
      ) : null}

      <FlatList
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        initialNumToRender={6}
        windowSize={5}
        removeClippedSubviews
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  pagerWrap: { paddingHorizontal: 16, paddingTop: 8 },
  firstCard: { marginHorizontal: 18, marginTop: 8 },
  firstText: { ...theme.typography.helper, color: theme.colors.ink },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 24, gap: 8 },
  row: { height: ROW_H, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 16, lineHeight: 20, fontWeight: '700', color: theme.colors.ink },
  rowMeta: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textTransform: 'none',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  rowBest: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: theme.colors.text.secondary },
});
