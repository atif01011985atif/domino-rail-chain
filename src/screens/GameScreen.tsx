import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { HelpCircle, Play, X } from 'lucide-react-native';
import assets from '../assets';
import AppShell from '../components/AppShell';
import EditorToolbar from '../components/EditorToolbar';
import GoalStrip from '../components/GoalStrip';
import IconButton from '../components/IconButton';
import PieceTray from '../components/PieceTray';
import PrimaryButton from '../components/PrimaryButton';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import TableBoard from '../components/TableBoard';
import { CELL, COMPACT } from '../constants/config';
import theme from '../constants/theme';
import { useChainPlayback } from '../hooks/useChainPlayback';
import { useTableEditor } from '../hooks/useTableEditor';
import { simulate } from '../game/simulator';
import { ChainEvent, Level, PieceType, Placement, RunResult } from '../game/types';

const EMPTY_SET: ReadonlySet<string> = new Set<string>();
const EMPTY_IDS: ReadonlySet<string> = new Set<string>();
const EMPTY_EVENTS: ChainEvent[] = [];

type Props = {
  level: Level;
  sandbox: boolean;
  initialPlacements: Placement[] | null;
  unlockedTypes: PieceType[];
  onHome: (placements: Placement[]) => void;
  onGameOver: (result: RunResult) => void;
};

/** Build Table. Owns editing and playback, never the screen state machine. */
export default function GameScreen({
  level,
  sandbox,
  initialPlacements,
  unlockedTypes,
  onHome,
  onGameOver,
}: Props) {
  const editor = useTableEditor(level, initialPlacements);
  const [run, setRun] = useState<RunResult | null>(null);
  const [help, setHelp] = useState(false);

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const events = run ? run.events : EMPTY_EVENTS;
  const duration = run ? run.durationMs : 0;

  const finish = useCallback(() => {
    if (run) onGameOver(run);
  }, [onGameOver, run]);

  const playback = useChainPlayback(events, duration, finish);
  const { start, stop, frame, playing } = playback;

  const running = run !== null && playing;

  const trayTypes = useMemo<PieceType[]>(
    () => (sandbox ? unlockedTypes.slice() : level.allowed.slice()),
    [level, sandbox, unlockedTypes],
  );

  const push = useCallback(() => {
    if (running || editor.placements.length === 0) return;
    const result = simulate(level, editor.placements, sandbox);
    setRun(result);
  }, [editor.placements, level, running, sandbox]);

  // Start the clock only once the immutable timeline is in state.
  useEffect(() => {
    if (run) start();
  }, [run, start]);

  useEffect(() => () => stop(), [stop]);

  const goHome = useCallback(() => {
    stop();
    onHome(editor.placements);
  }, [editor.placements, onHome, stop]);

  const openHelp = useCallback(() => setHelp(true), []);
  const closeHelp = useCallback(() => setHelp(false), []);

  const cellPress = running ? undefined : editor.pressCell;
  const bellsReached = run ? frame.bellsReached : 0;

  return (
    <AppShell variant="game">
      <ScreenHeader
        title={sandbox ? 'Sandbox' : 'Table ' + level.id}
        subtitle={sandbox ? 'Build anything' : level.title}
        leftSlot={
          <IconButton
            image={assets.iconHome}
            onPress={goHome}
            accessibilityLabel="Back to table select"
          />
        }
        rightSlot={
          <IconButton Icon={HelpCircle} onPress={openHelp} accessibilityLabel="How to play" />
        }
      />

      <GoalStrip
        bellsReached={bellsReached}
        bellCount={level.bells.length}
        pieceCount={editor.placements.length}
        goldTarget={level.gold}
        sandbox={sandbox}
      />

      <View style={styles.area}>
        <Animated.View
          pointerEvents="box-none"
          style={{
            opacity: enter,
            transform: [
              { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
            ],
          }}
        >
          <TableBoard
            level={level}
            placements={editor.placements}
            cellSize={CELL}
            selectedId={running ? null : editor.selectedId}
            activeKeys={run ? frame.activeKeys : EMPTY_SET}
            toppledIds={run ? frame.toppledIds : EMPTY_IDS}
            rungKeys={run ? frame.rungKeys : EMPTY_SET}
            endedKeys={EMPTY_SET}
            showTargets={!running}
            onCellPress={cellPress}
          />
        </Animated.View>

        <Text numberOfLines={2} style={styles.hint}>
          {running ? 'The chain is running - watch the bells.' : editor.hint}
        </Text>
      </View>

      <View style={styles.panel}>
        <PieceTray
          types={trayTypes}
          unlocked={unlockedTypes}
          selected={editor.selectedType}
          page={editor.trayPage}
          onSelect={editor.chooseType}
          onPage={editor.setTrayPage}
          compact={COMPACT}
        />

        <EditorToolbar
          canUndo={editor.canUndo && !running}
          hasSelection={!!editor.selectedId && !running}
          canClear={editor.placements.length > 0 && !running}
          onUndo={editor.undo}
          onRotate={editor.rotateSelected}
          onRemove={editor.removeSelected}
          onClear={editor.clearAll}
        />

        <PrimaryButton
          label={running ? 'RUNNING' : 'PUSH'}
          Icon={Play}
          onPress={push}
          disabled={running || editor.placements.length === 0}
          accessibilityLabel="Push the starter and run the chain"
        />
      </View>

      {help ? (
        <View style={styles.helpWrap}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeHelp}
            accessibilityRole="button"
            accessibilityLabel="Close help"
          />
          <View style={styles.helpSheet}>
            <View style={styles.helpHead}>
              <Text style={styles.helpTitle}>Place. Tap to turn. Push.</Text>
              <IconButton
                Icon={X}
                tone="light"
                onPress={closeHelp}
                accessibilityLabel="Close help"
              />
            </View>
            <Text style={styles.helpBody}>
              Pick a piece from the tray, then tap an open square to put it down. Tapping a
              piece already on the table turns it a quarter clockwise. The green triangle on
              each piece shows which side the push leaves from.
            </Text>
            <Text style={styles.helpBody}>
              PUSH sends one pulse out of the starter. Ring every bell to finish the table,
              and use fewer pieces than the gold target for a Gold medal.
            </Text>
            <SecondaryButton label="Back to the table" onPress={closeHelp} />
          </View>
        </View>
      ) : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  hint: {
    ...theme.typography.helper,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: 10,
    minHeight: 20,
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
    gap: COMPACT ? 8 : 12,
    ...theme.shadows.sheet,
  },
  helpWrap: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.ui.overlay },
  helpSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    padding: 20,
    gap: 12,
    ...theme.shadows.sheet,
  },
  helpHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  helpTitle: { ...theme.typography.sectionTitle, color: theme.colors.ink, flex: 1 },
  helpBody: { ...theme.typography.body, color: theme.colors.text.secondary },
});
