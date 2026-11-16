import { BELL_BOUNCE_MS, COLS, ROWS, RUN_CEILING_MS, SETTLE_MS } from '../constants/config';
import { medalFor } from './medals';
import { BoardQuery, resolvePiece } from './pieceRules';
import {
  ChainEvent,
  Coord,
  Dir,
  DX,
  DY,
  Endpoint,
  FixedKind,
  Level,
  Placement,
  RunResult,
  key,
} from './types';

type Pulse = { t: number; x: number; y: number; dir: Dir; seq: number };

/** Row, then column, then travel direction, then insertion order. */
function compare(a: Pulse, b: Pulse) {
  if (a.t !== b.t) return a.t - b.t;
  if (a.y !== b.y) return a.y - b.y;
  if (a.x !== b.x) return a.x - b.x;
  if (a.dir !== b.dir) return a.dir - b.dir;
  return a.seq - b.seq;
}

export function buildBoardQuery(level: Level, placements: Placement[]): BoardQuery {
  const fixed = new Map<string, FixedKind>();
  fixed.set(key(level.starter.x, level.starter.y), 'starter');
  level.bells.forEach(c => fixed.set(key(c.x, c.y), 'bell'));
  level.stops.forEach(c => fixed.set(key(c.x, c.y), 'stop'));
  level.gaps.forEach(c => fixed.set(key(c.x, c.y), 'gap'));

  const pieces = new Map<string, Placement>();
  placements.forEach(p => pieces.set(key(p.x, p.y), p));

  return {
    inBounds: (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS,
    fixedAt: (x, y) => fixed.get(key(x, y)) ?? null,
    pieceAt: (x, y) => pieces.get(key(x, y)) ?? null,
  };
}

/** True when a player piece may legally occupy this cell. */
export function cellIsPlaceable(level: Level, x: number, y: number) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return false;
  if (level.starter.x === x && level.starter.y === y) return false;
  const hit = (list: Coord[]) => list.some(c => c.x === x && c.y === y);
  return !hit(level.bells) && !hit(level.stops) && !hit(level.gaps);
}

/**
 * Deterministic event-queue evaluation. Integer millisecond timestamps,
 * no randomness, no dependence on frame rate.
 */
export function simulate(
  level: Level,
  placements: Placement[],
  sandbox = false,
): RunResult {
  const board = buildBoardQuery(level, placements);
  const events: ChainEvent[] = [];
  const endpoints: Endpoint[] = [];
  const rung = new Set<string>();
  const activated = new Set<string>();

  let seq = 0;
  const queue: Pulse[] = [];
  const emit = (t: number, x: number, y: number, dir: Dir) => {
    queue.push({ t, x, y, dir, seq: seq++ });
  };

  const s = level.starter;
  events.push({ t: 0, kind: 'start', x: s.x, y: s.y, dir: s.dir });
  emit(0, s.x + DX[s.dir], s.y + DY[s.dir], s.dir);

  let last = 0;
  let guard = 0;

  while (queue.length > 0 && guard++ < 512) {
    queue.sort(compare);
    const p = queue.shift() as Pulse;
    if (p.t > RUN_CEILING_MS) break;
    last = Math.max(last, p.t);

    const stop = (reason: string) => {
      endpoints.push({ t: p.t, x: p.x, y: p.y, dir: p.dir, reason });
      events.push({ t: p.t, kind: 'stop', x: p.x, y: p.y, dir: p.dir, reason });
    };

    if (!board.inBounds(p.x, p.y)) {
      endpoints.push({
        t: p.t,
        x: p.x - DX[p.dir],
        y: p.y - DY[p.dir],
        dir: p.dir,
        reason: 'The chain ran off the edge of the table.',
      });
      continue;
    }

    const fixed = board.fixedAt(p.x, p.y);

    if (fixed === 'bell') {
      const k = key(p.x, p.y);
      if (rung.has(k)) {
        stop('That bell had already rung.');
      } else {
        rung.add(k);
        events.push({ t: p.t, kind: 'bell', x: p.x, y: p.y, dir: p.dir });
        last = Math.max(last, p.t + BELL_BOUNCE_MS);
      }
      continue;
    }
    if (fixed === 'stop') {
      stop('A fixed wooden stop absorbed the chain.');
      continue;
    }
    if (fixed === 'gap') {
      stop('The chain reached a gap with no ramp to cross it.');
      continue;
    }
    if (fixed === 'starter') {
      stop('The starter block absorbed the returning push.');
      continue;
    }

    const piece = board.pieceAt(p.x, p.y);
    if (!piece) {
      stop('The chain reached an empty square.');
      continue;
    }
    if (activated.has(piece.id)) {
      stop('That piece had already toppled.');
      continue;
    }

    const res = resolvePiece(piece, p.dir, board);
    if (!res.ok) {
      stop(res.reason);
      continue;
    }

    activated.add(piece.id);
    events.push({
      t: p.t,
      kind: 'activate',
      x: p.x,
      y: p.y,
      dir: p.dir,
      type: piece.type,
      pieceId: piece.id,
    });
    const done = p.t + res.duration;
    last = Math.max(last, done);
    res.outputs.forEach(o => emit(done, o.x, o.y, o.dir));
  }

  const bellCount = level.bells.length;
  const bellsRung = rung.size;
  const success = bellCount > 0 && bellsRung === bellCount;
  const pieces = placements.length;

  return {
    levelId: level.id,
    sandbox,
    success,
    bellsRung,
    bellCount,
    pieces,
    gold: level.gold,
    medal: sandbox ? null : medalFor(success, pieces, level.gold),
    events,
    endpoints,
    durationMs: last + SETTLE_MS,
    snapshot: placements.map(p => ({ ...p })),
  };
}

/** Used by the level data module to prove every stored solution really rings. */
export function solutionIsValid(level: Level) {
  return simulate(level, level.solution).success;
}
