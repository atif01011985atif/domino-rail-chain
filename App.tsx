import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import ChainReplayScreen from './src/screens/ChainReplayScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import GameScreen from './src/screens/GameScreen';
import LoaderScreen from './src/screens/LoaderScreen';
import MedalsScreen from './src/screens/MedalsScreen';
import MenuScreen from './src/screens/MenuScreen';
import PieceCatalogScreen from './src/screens/PieceCatalogScreen';
import { LEVEL_COUNT, PACK_SIZE } from './src/constants/config';
import theme from './src/constants/theme';
import { useProgress } from './src/hooks/useProgress';
import { getLevel } from './src/game/levels';
import { E, Level, PIECE_TYPES, Placement, RunResult } from './src/game/types';

type Screen = 'loader' | 'menu' | 'game' | 'gameover' | 'replay' | 'medals' | 'catalog';

const SANDBOX_LEVEL: Level = {
  id: 0,
  packId: 0,
  title: 'Free build',
  starter: { x: 0, y: 2, dir: E },
  bells: [{ x: 4, y: 2 }],
  stops: [],
  gaps: [],
  allowed: PIECE_TYPES.slice(),
  seeded: [],
  solution: [],
  gold: 0,
};

/** Screen state machine only. No chain logic lives here. */
export default function App() {
  const progress = useProgress();
  const { recordResult, saveDraft, getDraft, recordOf } = progress;

  const [screen, setScreen] = useState<Screen>('loader');
  const [packIndex, setPackIndex] = useState(0);
  const [levelId, setLevelId] = useState(1);
  const [sandbox, setSandbox] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const level = useMemo(
    () => (sandbox ? SANDBOX_LEVEL : getLevel(levelId)),
    [levelId, sandbox],
  );
  const draftKey = sandbox ? 0 : levelId;

  const medalOf = useCallback(
    (id: number) => {
      const rec = recordOf(id);
      return rec ? rec.medal : null;
    },
    [recordOf],
  );

  const completedOf = useCallback(
    (id: number) => {
      const rec = recordOf(id);
      return !!rec && rec.completed;
    },
    [recordOf],
  );

  const bestOf = useCallback(
    (id: number) => {
      const rec = recordOf(id);
      return rec ? rec.bestPieces : 0;
    },
    [recordOf],
  );

  const openGame = useCallback((asSandbox: boolean) => {
    setSandbox(asSandbox);
    setGameKey(k => k + 1);
    setScreen('game');
  }, []);

  const toMenu = useCallback(() => setScreen('menu'), []);

  const handleSelect = useCallback((id: number) => setLevelId(id), []);

  const handlePlay = useCallback(() => openGame(false), [openGame]);
  const handleSandbox = useCallback(() => openGame(true), [openGame]);

  const handleHome = useCallback(
    (placements: Placement[]) => {
      saveDraft(draftKey, placements);
      setScreen('menu');
    },
    [draftKey, saveDraft],
  );

  const handleGameOver = useCallback(
    (run: RunResult) => {
      recordResult(run);
      saveDraft(draftKey, run.snapshot);
      setResult(run);
      setScreen('gameover');
    },
    [draftKey, recordResult, saveDraft],
  );

  const handlePlayAgain = useCallback(() => {
    if (result) saveDraft(draftKey, result.snapshot);
    openGame(sandbox);
  }, [draftKey, openGame, result, saveDraft, sandbox]);

  const handleNextTable = useCallback(() => {
    const next = Math.min(LEVEL_COUNT, levelId + 1);
    setLevelId(next);
    setPackIndex(Math.floor((next - 1) / PACK_SIZE));
    if (next === levelId) {
      setScreen('medals');
      return;
    }
    openGame(false);
  }, [levelId, openGame]);

  const handleWatchReplay = useCallback(() => setScreen('replay'), []);
  const handleReplayHome = useCallback(() => setScreen('gameover'), []);

  const handleReplayEdit = useCallback(() => {
    if (result) saveDraft(draftKey, result.snapshot);
    openGame(sandbox);
  }, [draftKey, openGame, result, saveDraft, sandbox]);

  const handleMedals = useCallback(() => setScreen('medals'), []);
  const handleCatalog = useCallback(() => setScreen('catalog'), []);

  // Android Back walks one step up the same flow the buttons use.
  useEffect(() => {
    const onBack = () => {
      if (screen === 'menu' || screen === 'loader') return false;
      if (screen === 'replay') {
        setScreen('gameover');
        return true;
      }
      setScreen('menu');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [screen]);

  if (screen === 'loader') {
    return (
      <View style={styles.root}>
        <LoaderScreen onDone={toMenu} />
      </View>
    );
  }

  if (screen === 'game') {
    return (
      <View style={styles.root}>
        <GameScreen
          key={'game-' + gameKey}
          level={level}
          sandbox={sandbox}
          initialPlacements={getDraft(draftKey)}
          unlockedTypes={progress.unlockedTypes}
          onHome={handleHome}
          onGameOver={handleGameOver}
        />
      </View>
    );
  }

  if (screen === 'gameover' && result) {
    return (
      <View style={styles.root}>
        <GameOverScreen
          result={result}
          title={level.title}
          onPlayAgain={handlePlayAgain}
          onNextTable={handleNextTable}
          onReplay={handleWatchReplay}
          onMenu={toMenu}
        />
      </View>
    );
  }

  if (screen === 'replay' && result) {
    return (
      <View style={styles.root}>
        <ChainReplayScreen
          level={level}
          result={result}
          onHome={handleReplayHome}
          onEdit={handleReplayEdit}
        />
      </View>
    );
  }

  if (screen === 'medals') {
    return (
      <View style={styles.root}>
        <MedalsScreen
          packIndex={packIndex}
          unlocked={progress.unlocked}
          medalCount={progress.medalCount}
          medalOf={medalOf}
          bestOf={bestOf}
          onPack={setPackIndex}
          onBack={toMenu}
        />
      </View>
    );
  }

  if (screen === 'catalog') {
    return (
      <View style={styles.root}>
        <PieceCatalogScreen unlockedTypes={progress.unlockedTypes} onBack={toMenu} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <MenuScreen
        packIndex={packIndex}
        levelId={levelId}
        unlocked={progress.unlocked}
        completedCount={progress.completedCount}
        medalCount={progress.medalCount}
        medalOf={medalOf}
        completedOf={completedOf}
        onPack={setPackIndex}
        onSelect={handleSelect}
        onPlay={handlePlay}
        onMedals={handleMedals}
        onCatalog={handleCatalog}
        onSandbox={handleSandbox}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
});
