import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { Bell, ChevronRight, LayoutGrid, Play, RotateCw } from 'lucide-react-native';
import assets from '../assets';
import AppShell from '../components/AppShell';
import MaterialCard from '../components/MaterialCard';
import MedalBadge from '../components/MedalBadge';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StatCard from '../components/StatCard';
import { LEVEL_COUNT } from '../constants/config';
import theme from '../constants/theme';
import { MEDAL_LABEL, medalTargets } from '../game/medals';
import { PIECE_LABEL, PIECE_UNLOCK_TABLE, PieceType, RunResult } from '../game/types';

type Props = {
  result: RunResult;
  title: string;
  onPlayAgain: () => void;
  onNextTable: () => void;
  onReplay: () => void;
  onMenu: () => void;
};

const UNLOCK_AT: { table: number; type: PieceType }[] = [
  { table: PIECE_UNLOCK_TABLE.corner, type: 'corner' },
  { table: PIECE_UNLOCK_TABLE.ramp, type: 'ramp' },
  { table: PIECE_UNLOCK_TABLE.fork, type: 'fork' },
  { table: PIECE_UNLOCK_TABLE.bridge, type: 'bridge' },
];

/** The separate result state. Every finished run lands here, win or not. */
export default function GameOverScreen({
  result,
  title,
  onPlayAgain,
  onNextTable,
  onReplay,
  onMenu,
}: Props) {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pop, {
      toValue: 1,
      duration: result.success ? 220 : 180,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    }).start();
  }, [pop, result.success]);

  const unlocked = useMemo(() => {
    if (!result.success || result.sandbox) return null;
    const hit = UNLOCK_AT.find(u => u.table === result.levelId);
    return hit ? hit.type : null;
  }, [result]);

  const targets = medalTargets(result.gold);
  const showStats = result.bellsRung > 0 && result.pieces > 0;
  const lastTable = result.levelId >= LEVEL_COUNT;

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const reason = result.endpoints.length > 0 ? result.endpoints[0].reason : '';

  return (
    <AppShell variant={result.success ? 'win' : 'lose'}>
      <ScreenHeader
        title={result.sandbox ? 'Sandbox run' : 'Table ' + result.levelId}
        subtitle={title}
      />

      <View style={styles.body}>
        <Animated.View
          pointerEvents="none"
          style={[styles.hero, { opacity: pop, transform: [{ scale }] }]}
        >
          {result.success ? (
            <View style={styles.recess}>
              <MedalBadge tier={result.medal} size={96} showLabel={false} />
            </View>
          ) : (
            <Image source={assets.bell} style={styles.bellArt} />
          )}
        </Animated.View>

        <Text style={styles.headline}>
          {result.success ? 'Every bell rang!' : 'Almost there'}
        </Text>
        <Text style={styles.sub}>
          {result.bellsRung + ' of ' + result.bellCount + ' bells rang'}
        </Text>

        {result.success && result.medal ? (
          <Text style={styles.medalLine}>
            {MEDAL_LABEL[result.medal] +
              '  ·  Gold ' +
              targets.gold +
              ' or fewer  ·  Silver ' +
              targets.silver +
              ' or fewer'}
          </Text>
        ) : (
          <Text style={styles.medalLine}>{reason}</Text>
        )}

        {showStats ? (
          <View style={styles.statRow}>
            <View style={styles.statSlot}>
              <StatCard
                Icon={Bell}
                value={result.bellsRung + '/' + result.bellCount}
                label="bells"
                valueColor={theme.colors.primary}
              />
            </View>
            <View style={styles.statSlot}>
              <StatCard
                Icon={Bell}
                value={String(result.pieces)}
                label="pieces"
                valueColor={theme.colors.brass}
              />
            </View>
          </View>
        ) : (
          <Text style={styles.plainStats}>
            {'No bells reached  ·  Pieces ' + result.pieces}
          </Text>
        )}

        {unlocked ? (
          <MaterialCard tone="sage" compact style={styles.unlock}>
            <Text style={styles.unlockTitle}>{PIECE_LABEL[unlocked] + ' unlocked'}</Text>
            <Text style={styles.unlockBody}>Available in the tray</Text>
          </MaterialCard>
        ) : null}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="PLAY AGAIN" Icon={RotateCw} onPress={onPlayAgain} />

        {result.success && !result.sandbox ? (
          <SecondaryButton
            label={lastTable ? 'All tables complete' : 'NEXT TABLE'}
            Icon={ChevronRight}
            onPress={onNextTable}
          />
        ) : null}

        <View style={styles.row}>
          <View style={styles.slot}>
            <SecondaryButton label="Replay" Icon={Play} onPress={onReplay} />
          </View>
          <View style={styles.slot}>
            <SecondaryButton label="Tables" Icon={LayoutGrid} onPress={onMenu} />
          </View>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  hero: { alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  recess: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.woodEdge,
    ...theme.shadows.card,
  },
  bellArt: { width: 88, height: 88, resizeMode: 'contain' },
  headline: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: theme.colors.ink,
    textAlign: 'center',
  },
  sub: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  medalLine: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'none',
    letterSpacing: 0.2,
  },
  statRow: { flexDirection: 'row', gap: 12, marginTop: 20, alignSelf: 'stretch' },
  statSlot: { flex: 1 },
  plainStats: { ...theme.typography.helper, color: theme.colors.text.secondary, marginTop: 20 },
  unlock: { marginTop: 16, alignSelf: 'stretch', minHeight: 72, justifyContent: 'center' },
  unlockTitle: { fontSize: 16, lineHeight: 20, fontWeight: '700', color: theme.colors.ink },
  unlockBody: { ...theme.typography.helper, color: theme.colors.text.secondary, marginTop: 2 },
  actions: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  row: { flexDirection: 'row', gap: 8 },
  slot: { flex: 1 },
});
