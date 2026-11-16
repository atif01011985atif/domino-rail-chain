import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, Pencil, RotateCw } from 'lucide-react-native';
import assets from '../assets';
import AppShell from '../components/AppShell';
import GoalStrip from '../components/GoalStrip';
import IconButton from '../components/IconButton';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import TableBoard from '../components/TableBoard';
import { REPLAY_CELL, SPEEDS, Speed } from '../constants/config';
import theme from '../constants/theme';
import { useChainPlayback } from '../hooks/useChainPlayback';
import { Level, RunResult } from '../game/types';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const EMPTY_SET: ReadonlySet<string> = new Set<string>();

type Props = {
  level: Level;
  result: RunResult;
  onHome: () => void;
  onEdit: () => void;
};

/** Read-only inspection of the recorded run. Never awards progress. */
export default function ChainReplayScreen({ level, result, onHome, onEdit }: Props) {
  const playback = useChainPlayback(result.events, result.durationMs);
  const { frame, playing, speed, setSpeed, start, toggle, seek, timeMs } = playback;
  const [endpointIndex, setEndpointIndex] = useState(0);

  useEffect(() => {
    // An unsuccessful run opens at half speed so each connection is readable.
    setSpeed(result.success ? 1 : 0.5);
    start();
  }, [result.success, setSpeed, start]);

  const step = useCallback(
    (delta: number) => seek(timeMs + delta),
    [seek, timeMs],
  );
  const back = useCallback(() => step(-200), [step]);
  const forward = useCallback(() => step(200), [step]);

  const endpoints = result.endpoints;
  const endpoint = endpoints.length > 0 ? endpoints[Math.min(endpointIndex, endpoints.length - 1)] : null;

  const nextEndpoint = useCallback(() => {
    setEndpointIndex(i => (endpoints.length ? (i + 1) % endpoints.length : 0));
  }, [endpoints.length]);

  const progress = result.durationMs > 0 ? timeMs / result.durationMs : 0;
  const finished = timeMs >= result.durationMs;

  return (
    <AppShell variant="replay">
      <ScreenHeader
        title="Chain replay"
        subtitle={result.sandbox ? 'Sandbox' : 'Table ' + level.id + ' - ' + level.title}
        leftSlot={
          <IconButton
            image={assets.iconHome}
            onPress={onHome}
            accessibilityLabel="Back to the result"
          />
        }
        rightSlot={
          <IconButton
            image={assets.iconPause}
            onPress={toggle}
            accessibilityLabel={playing ? 'Pause replay' : 'Resume replay'}
          />
        }
      />

      <GoalStrip
        bellsReached={frame.bellsReached}
        bellCount={result.bellCount}
        pieceCount={result.pieces}
        goldTarget={result.gold}
        sandbox={result.sandbox}
      />

      <View style={styles.area}>
        <TableBoard
          level={level}
          placements={result.snapshot}
          cellSize={REPLAY_CELL}
          selectedId={null}
          activeKeys={frame.activeKeys}
          toppledIds={frame.toppledIds}
          rungKeys={frame.rungKeys}
          endedKeys={finished ? frame.endedKeys : EMPTY_SET}
          showTargets={false}
        />

        <Pressable
          onPress={nextEndpoint}
          hitSlop={HIT}
          disabled={endpoints.length < 2}
          accessibilityRole="button"
          accessibilityLabel="Show the next place the chain stopped"
          style={styles.explain}
        >
          <Text numberOfLines={2} style={styles.explainText}>
            {endpoint
              ? endpoint.reason +
                (endpoints.length > 1
                  ? '  (' + (endpointIndex % endpoints.length + 1) + ' of ' + endpoints.length + ')'
                  : '')
              : finished
              ? 'Every bell rang.'
              : 'Watching the chain.'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <View style={styles.speedRow}>
          {SPEEDS.map(s => (
            <SpeedChip key={s} value={s} active={speed === s} onSelect={setSpeed} />
          ))}
        </View>

        <View style={styles.scrubRow}>
          <IconButton
            Icon={ChevronLeft}
            tone="light"
            onPress={back}
            accessibilityLabel="Step back 200 milliseconds"
          />
          <View style={styles.track}>
            <View style={[styles.trackFill, { flex: progress }]} />
            <View style={{ flex: 1 - progress }} />
          </View>
          <IconButton
            Icon={ChevronRight}
            tone="light"
            onPress={forward}
            accessibilityLabel="Step forward 200 milliseconds"
          />
        </View>

        <PrimaryButton
          label="REPLAY AGAIN"
          Icon={RotateCw}
          tone="green"
          onPress={start}
        />

        <SecondaryButton label="Edit table" Icon={Pencil} onPress={onEdit} />
      </View>
    </AppShell>
  );
}

function SpeedChip({
  value,
  active,
  onSelect,
}: {
  value: Speed;
  active: boolean;
  onSelect: (s: Speed) => void;
}) {
  const press = useCallback(() => onSelect(value), [onSelect, value]);
  return (
    <View style={styles.speedSlot}>
      <Pressable
        onPress={press}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={'Play at ' + value + ' times speed'}
        style={[styles.speed, active ? styles.speedOn : null]}
      >
        <Text style={[styles.speedText, active ? styles.speedTextOn : null]}>
          {value + 'x'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  explain: { marginTop: 12, minHeight: 40, justifyContent: 'center', paddingHorizontal: 8 },
  explainText: {
    ...theme.typography.helper,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: theme.colors.secondary,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    borderTopWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
    ...theme.shadows.sheet,
  },
  speedRow: { flexDirection: 'row', gap: 8 },
  speedSlot: { flex: 1 },
  speed: {
    width: '100%',
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
  },
  speedOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.ink },
  speedText: { fontSize: 15, lineHeight: 20, fontWeight: '700', color: theme.colors.text.secondary },
  speedTextOn: { color: theme.colors.surface },
  scrubRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: {
    flex: 1,
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    overflow: 'hidden',
  },
  trackFill: { backgroundColor: theme.colors.accent },
});
