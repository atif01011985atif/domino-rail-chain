import { useCallback, useMemo, useState } from 'react';
import { LEVEL_COUNT } from '../constants/config';
import { betterMedal } from '../game/medals';
import { Medal, PIECE_UNLOCK_TABLE, PieceType, Placement, RunResult } from '../game/types';

export type LevelRecord = {
  completed: boolean;
  bestPieces: number;
  medal: Medal;
};

type Records = Record<number, LevelRecord>;
type Drafts = Record<number, Placement[]>;

/**
 * Campaign progress for the session. Completion, best medal, drafts and the
 * derived unlock set all live here so no screen owns ground truth of its own.
 */
export function useProgress() {
  const [records, setRecords] = useState<Records>({});
  const [drafts, setDrafts] = useState<Drafts>({});
  const [unlocked, setUnlocked] = useState(1);

  const completedCount = useMemo(() => {
    let n = 0;
    Object.keys(records).forEach(k => {
      if (records[Number(k)].completed) n += 1;
    });
    return n;
  }, [records]);

  const medalCount = useMemo(() => {
    let n = 0;
    Object.keys(records).forEach(k => {
      if (records[Number(k)].medal) n += 1;
    });
    return n;
  }, [records]);

  /** Types available in the tray, derived from the consecutive unlock chain. */
  const unlockedTypes = useMemo<PieceType[]>(() => {
    const cleared = unlocked - 1;
    const out: PieceType[] = ['domino'];
    if (cleared >= PIECE_UNLOCK_TABLE.corner) out.push('corner');
    if (cleared >= PIECE_UNLOCK_TABLE.ramp) out.push('ramp');
    if (cleared >= PIECE_UNLOCK_TABLE.fork) out.push('fork');
    if (cleared >= PIECE_UNLOCK_TABLE.bridge) out.push('bridge');
    return out;
  }, [unlocked]);

  const isUnlocked = useCallback((levelId: number) => levelId <= unlocked, [unlocked]);

  const recordOf = useCallback(
    (levelId: number): LevelRecord | null => records[levelId] || null,
    [records],
  );

  /** Called once per finished campaign run, before the result screen appears. */
  const recordResult = useCallback((result: RunResult) => {
    if (result.sandbox || !result.success) return;
    setRecords(prev => {
      const old = prev[result.levelId];
      const next: LevelRecord = {
        completed: true,
        bestPieces: old ? Math.min(old.bestPieces, result.pieces) : result.pieces,
        medal: betterMedal(old ? old.medal : null, result.medal),
      };
      return { ...prev, [result.levelId]: next };
    });
    setUnlocked(prev =>
      result.levelId >= prev && prev < LEVEL_COUNT ? result.levelId + 1 : prev,
    );
  }, []);

  const saveDraft = useCallback((levelId: number, placements: Placement[]) => {
    setDrafts(prev => ({ ...prev, [levelId]: placements.map(p => ({ ...p })) }));
  }, []);

  const getDraft = useCallback(
    (levelId: number): Placement[] | null => drafts[levelId] || null,
    [drafts],
  );

  return {
    unlocked,
    completedCount,
    medalCount,
    unlockedTypes,
    isUnlocked,
    recordOf,
    recordResult,
    saveDraft,
    getDraft,
  };
}

export type ProgressApi = ReturnType<typeof useProgress>;
