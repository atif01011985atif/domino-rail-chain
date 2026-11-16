import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { BookOpen, Hammer, Medal, Play, Trophy } from 'lucide-react-native';
import assets from '../assets';
import AppShell from '../components/AppShell';
import IconButton from '../components/IconButton';
import PackPager from '../components/PackPager';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import StatCard from '../components/StatCard';
import TableTile from '../components/TableTile';
import { COMPACT, LEVEL_COUNT, PACK_SIZE } from '../constants/config';
import theme from '../constants/theme';
import { PACKS, getLevel } from '../game/levels';
import { Medal as MedalTier } from '../game/types';

type Props = {
  packIndex: number;
  levelId: number;
  unlocked: number;
  completedCount: number;
  medalCount: number;
  medalOf: (levelId: number) => MedalTier;
  completedOf: (levelId: number) => boolean;
  onPack: (index: number) => void;
  onSelect: (levelId: number) => void;
  onPlay: () => void;
  onMedals: () => void;
  onCatalog: () => void;
  onSandbox: () => void;
};

export default function MenuScreen({
  packIndex,
  levelId,
  unlocked,
  completedCount,
  medalCount,
  medalOf,
  completedOf,
  onPack,
  onSelect,
  onPlay,
  onMedals,
  onCatalog,
  onSandbox,
}: Props) {
  const [notice, setNotice] = useState('');
  const art = useRef(new Animated.Value(0)).current;
  const sheet = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(art, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(sheet, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [art, sheet]);

  const pack = PACKS[packIndex];
  const level = useMemo(() => getLevel(levelId), [levelId]);

  const ids = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < PACK_SIZE; i += 1) out.push(pack.from + i);
    return out;
  }, [pack]);

  const handleTile = useCallback(
    (id: number) => {
      if (id > unlocked) {
        setNotice('Table ' + id + ' opens when table ' + (id - 1) + ' is complete.');
        return;
      }
      setNotice('');
      onSelect(id);
    },
    [onSelect, unlocked],
  );

  const bells = level.bells.length;
  const played = completedOf(levelId);
  const supporting =
    (played ? 'Replay table ' : 'Table ') +
    levelId +
    '  ·  ' +
    bells +
    (bells === 1 ? ' bell' : ' bells') +
    '  ·  Gold ' +
    level.gold +
    ' pieces';

  const showStats = completedCount > 0 && medalCount > 0;
  const rise = sheet.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <AppShell variant="menu">
      <ScreenHeader
        title="Your tables"
        subtitle={pack.focus}
        align="left"
        leftSlot={
          <IconButton Icon={BookOpen} onPress={onCatalog} accessibilityLabel="Piece catalog" />
        }
        rightSlot={<IconButton Icon={Medal} onPress={onMedals} accessibilityLabel="Medals" />}
      />

      <View style={styles.body}>
        <View style={styles.pagerWrap}>
          <PackPager packIndex={packIndex} name={pack.name} onChange={onPack} />
        </View>

        <Animated.View style={[styles.art, { opacity: art }]} pointerEvents="none">
          {COMPACT && showStats ? null : (
            <Image source={assets.logo} style={styles.artLogo} />
          )}
          {showStats ? (
            <View style={styles.statRow}>
              <View style={styles.statSlot}>
                <StatCard
                  Icon={Trophy}
                  value={completedCount + '/' + LEVEL_COUNT}
                  label="complete"
                  valueColor={theme.colors.primary}
                />
              </View>
              <View style={styles.statSlot}>
                <StatCard
                  Icon={Trophy}
                  value={String(medalCount)}
                  label="medals"
                  valueColor={theme.colors.medal.gold}
                />
              </View>
            </View>
          ) : (
            <Text style={styles.progressCaption}>
              {completedCount + ' of ' + LEVEL_COUNT + ' tables complete'}
            </Text>
          )}
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={[styles.sheet, { opacity: sheet, transform: [{ translateY: rise }] }]}
        >
          <Text numberOfLines={1} style={styles.sheetTitle}>
            {'Table ' + levelId + ': ' + level.title}
          </Text>

          <View style={styles.tileRow}>
            {ids.slice(0, 5).map(id => (
              <TableTile
                key={id}
                levelId={id}
                selected={id === levelId}
                unlocked={id <= unlocked}
                completed={completedOf(id)}
                bestMedal={medalOf(id)}
                onPress={handleTile}
              />
            ))}
          </View>
          <View style={styles.tileRow}>
            {ids.slice(5).map(id => (
              <TableTile
                key={id}
                levelId={id}
                selected={id === levelId}
                unlocked={id <= unlocked}
                completed={completedOf(id)}
                bestMedal={medalOf(id)}
                onPress={handleTile}
              />
            ))}
          </View>

          <Text numberOfLines={1} style={styles.supporting}>
            {notice ? notice : supporting}
          </Text>

          <PrimaryButton
            label="PLAY"
            Icon={Play}
            onPress={onPlay}
            accessibilityLabel={'Play table ' + levelId}
          />

          <View style={styles.actionRow}>
            <View style={styles.actionSlot}>
              <SecondaryButton label="Medals" Icon={Medal} onPress={onMedals} />
            </View>
            <View style={styles.actionSlot}>
              <SecondaryButton label="Catalog" Icon={BookOpen} onPress={onCatalog} />
            </View>
            <View style={styles.actionSlot}>
              <SecondaryButton label="Sandbox" Icon={Hammer} onPress={onSandbox} />
            </View>
          </View>
        </Animated.View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  pagerWrap: { paddingHorizontal: 16, paddingTop: 8 },
  art: {
    flex: 1,
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  artLogo: {
    width: COMPACT ? 96 : 128,
    height: COMPACT ? 96 : 128,
    resizeMode: 'contain',
  },
  progressCaption: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    marginTop: 10,
  },
  statRow: { flexDirection: 'row', gap: 12, marginTop: 12, alignSelf: 'stretch' },
  statSlot: { flex: 1 },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    borderTopWidth: 1,
    borderColor: theme.colors.ui.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 8,
    ...theme.shadows.sheet,
  },
  sheetTitle: { ...theme.typography.sectionTitle, color: theme.colors.ink },
  tileRow: { flexDirection: 'row', gap: 8 },
  supporting: {
    ...theme.typography.helper,
    color: theme.colors.text.tertiary,
    marginTop: 2,
    marginBottom: 6,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionSlot: { flex: 1 },
});
