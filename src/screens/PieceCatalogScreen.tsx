import React, { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Lock } from 'lucide-react-native';
import AppShell from '../components/AppShell';
import IconButton from '../components/IconButton';
import MaterialCard from '../components/MaterialCard';
import PieceView from '../components/PieceView';
import ScreenHeader from '../components/ScreenHeader';
import theme from '../constants/theme';
import {
  PIECE_LABEL,
  PIECE_RULE_TEXT,
  PIECE_TYPES,
  PIECE_UNLOCK_TABLE,
  PieceType,
} from '../game/types';

const CARD_H = 104;

type Row = { type: PieceType; unlocked: boolean };

type Props = {
  unlockedTypes: PieceType[];
  onBack: () => void;
};

function CatalogCard({ row }: { row: Row }) {
  return (
    <MaterialCard tone={row.unlocked ? 'ivory' : 'wood'} compact style={styles.card}>
      <View style={styles.preview}>
        <PieceView type={row.type} dir={1} size={56} />
      </View>
      <View style={styles.text}>
        <Text numberOfLines={1} style={styles.name}>
          {PIECE_LABEL[row.type]}
        </Text>
        <Text numberOfLines={2} style={styles.rule}>
          {PIECE_RULE_TEXT[row.type]}
        </Text>
        <Text numberOfLines={1} style={[styles.status, row.unlocked ? styles.statusOn : null]}>
          {row.unlocked
            ? 'Unlocked'
            : 'Unlock: complete table ' + PIECE_UNLOCK_TABLE[row.type]}
        </Text>
      </View>
      {row.unlocked ? null : (
        <Lock size={20} color={theme.colors.text.tertiary} strokeWidth={2.25} />
      )}
    </MaterialCard>
  );
}

/** Reference for all five placeable types plus the fixed board items. */
export default function PieceCatalogScreen({ unlockedTypes, onBack }: Props) {
  const rows = useMemo<Row[]>(
    () => PIECE_TYPES.map(t => ({ type: t, unlocked: unlockedTypes.indexOf(t) !== -1 })),
    [unlockedTypes],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Row>) => <CatalogCard row={item} />,
    [],
  );
  const keyExtractor = useCallback((item: Row) => item.type, []);

  const footer = useMemo(
    () => (
      <MaterialCard tone="sage" compact style={styles.reference}>
        <Text style={styles.refTitle}>Fixed board items</Text>
        <Text style={styles.refBody}>
          The green Starter sends one push in the way its arrow points. A Bell ends its branch
          and rings. A wooden Stop absorbs the chain. A Gap is a hole only a Ramp can cross.
        </Text>
      </MaterialCard>
    ),
    [],
  );

  return (
    <AppShell variant="catalog">
      <ScreenHeader
        title="Piece catalog"
        subtitle={unlockedTypes.length + ' of ' + PIECE_TYPES.length + ' types unlocked'}
        leftSlot={
          <IconButton Icon={ArrowLeft} onPress={onBack} accessibilityLabel="Back to tables" />
        }
      />

      <FlatList
        data={rows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListFooterComponent={footer}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        initialNumToRender={5}
        windowSize={5}
      />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 28, gap: 10 },
  card: { height: CARD_H, flexDirection: 'row', alignItems: 'center', gap: 12 },
  preview: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  name: { ...theme.typography.sectionTitle, fontSize: 20, lineHeight: 24, color: theme.colors.ink },
  rule: { ...theme.typography.helper, color: theme.colors.text.secondary, marginTop: 2 },
  status: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  statusOn: { color: theme.colors.primary },
  reference: { minHeight: 80, marginTop: 4 },
  refTitle: { fontSize: 16, lineHeight: 20, fontWeight: '700', color: theme.colors.ink },
  refBody: { ...theme.typography.helper, color: theme.colors.text.secondary, marginTop: 4 },
});
