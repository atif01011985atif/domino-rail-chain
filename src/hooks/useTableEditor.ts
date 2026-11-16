import { useCallback, useMemo, useRef, useState } from 'react';
import { UNDO_LIMIT } from '../constants/config';
import { cellIsPlaceable } from '../game/simulator';
import { Dir, E, Level, PieceType, Placement, cw, key } from '../game/types';

type Snapshot = { placements: Placement[]; selectedId: string | null };

const clone = (list: Placement[]) => list.map(p => ({ ...p }));

/**
 * Owns placement selection, draft edits, tray paging and the 30-entry history.
 * Never evaluates the chain - that is the simulator's job alone.
 */
export function useTableEditor(level: Level, initial: Placement[] | null) {
  const seed = useMemo(
    () => clone(initial && initial.length ? initial : level.seeded),
    [initial, level],
  );

  const [placements, setPlacements] = useState<Placement[]>(seed);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<PieceType>(level.allowed[0] || 'domino');
  const [trayPage, setTrayPage] = useState(0);
  const [hint, setHint] = useState('Choose a piece, then tap a square.');
  const [history, setHistory] = useState<Snapshot[]>([]);

  const nextId = useRef(1);

  const remember = useCallback(
    (list: Placement[], sel: string | null) => {
      setHistory(prev => {
        const next = prev.concat([{ placements: clone(list), selectedId: sel }]);
        return next.length > UNDO_LIMIT ? next.slice(next.length - UNDO_LIMIT) : next;
      });
    },
    [],
  );

  const selected = useMemo(
    () => placements.find(p => p.id === selectedId) || null,
    [placements, selectedId],
  );

  const occupied = useMemo(() => {
    const m = new Map<string, Placement>();
    placements.forEach(p => m.set(key(p.x, p.y), p));
    return m;
  }, [placements]);

  const pressCell = useCallback(
    (x: number, y: number) => {
      const hit = occupied.get(key(x, y));

      if (hit) {
        // A short tap selects the piece and turns it one quarter clockwise.
        remember(placements, selectedId);
        setPlacements(prev =>
          prev.map(p => (p.id === hit.id ? { ...p, dir: cw(p.dir) as Dir } : p)),
        );
        setSelectedId(hit.id);
        setHint('Turned this piece a quarter clockwise.');
        return;
      }

      if (!cellIsPlaceable(level, x, y)) {
        setHint('That square is fixed - pick an open square.');
        setSelectedId(null);
        return;
      }

      remember(placements, selectedId);
      const id = 'u' + level.id + '-' + nextId.current;
      nextId.current += 1;
      const piece: Placement = { id, type: selectedType, x, y, dir: E };
      setPlacements(prev => prev.concat([piece]));
      setSelectedId(id);
      setHint('Tap the piece again to turn it.');
    },
    [level, occupied, placements, remember, selectedId, selectedType],
  );

  const rotateSelected = useCallback(() => {
    if (!selectedId) return;
    remember(placements, selectedId);
    setPlacements(prev =>
      prev.map(p => (p.id === selectedId ? { ...p, dir: cw(p.dir) as Dir } : p)),
    );
    setHint('Turned this piece a quarter clockwise.');
  }, [placements, remember, selectedId]);

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    remember(placements, selectedId);
    setPlacements(prev => prev.filter(p => p.id !== selectedId));
    setSelectedId(null);
    setHint('Piece removed.');
  }, [placements, remember, selectedId]);

  const clearAll = useCallback(() => {
    if (placements.length === 0) return;
    remember(placements, selectedId);
    setPlacements([]);
    setSelectedId(null);
    setHint('Table cleared. Undo brings it back.');
  }, [placements, remember, selectedId]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setPlacements(clone(last.placements));
    setSelectedId(last.selectedId);
    setHistory(prev => prev.slice(0, prev.length - 1));
    setHint('Last edit undone.');
  }, [history]);

  const restore = useCallback((list: Placement[]) => {
    setPlacements(clone(list));
    setSelectedId(null);
    setHistory([]);
    setHint('Construction restored. Press PUSH when ready.');
  }, []);

  const chooseType = useCallback((type: PieceType) => {
    setSelectedType(type);
    setSelectedId(null);
    setHint('Now tap an open square to place it.');
  }, []);

  return {
    placements,
    selected,
    selectedId,
    selectedType,
    trayPage,
    hint,
    canUndo: history.length > 0,
    setTrayPage,
    chooseType,
    pressCell,
    rotateSelected,
    removeSelected,
    clearAll,
    undo,
    restore,
  };
}
