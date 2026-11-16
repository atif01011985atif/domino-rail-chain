import { COLS, LEVEL_COUNT, PACK_SIZE, ROWS } from '../constants/config';
import { cornerFacingFor } from './pieceRules';
import { simulate } from './simulator';
import {
  Coord,
  Dir,
  DX,
  DY,
  E,
  Level,
  N,
  Placement,
  PieceType,
  S,
  W,
  ccw,
  cw,
  key,
} from './types';

export type PackInfo = {
  id: number;
  name: string;
  from: number;
  to: number;
  bells: number;
  focus: string;
};

export const PACKS: PackInfo[] = [
  { id: 1, name: 'First Chimes', from: 1, to: 10, bells: 1, focus: 'Place, rotate, then corner rails' },
  { id: 2, name: 'Little Leaps', from: 11, to: 20, bells: 1, focus: 'One gap and its ramp' },
  { id: 3, name: 'Winding Rails', from: 21, to: 30, bells: 1, focus: 'Corners and longer routes' },
  { id: 4, name: 'Two Ways', from: 31, to: 40, bells: 2, focus: 'One fork, two endings' },
  { id: 5, name: 'Bell Duets', from: 41, to: 50, bells: 2, focus: 'Forks combined with ramps' },
  { id: 6, name: 'Turning Tables', from: 51, to: 60, bells: 2, focus: 'Corners around wooden stops' },
  { id: 7, name: 'Over and Under', from: 61, to: 70, bells: 2, focus: 'Bridges over intact squares' },
  { id: 8, name: 'Crossing Paths', from: 71, to: 80, bells: 2, focus: 'Bridges across a branch' },
  { id: 9, name: 'Bell Trios', from: 81, to: 90, bells: 3, focus: 'Two forks, three endings' },
  { id: 10, name: 'Fine Balance', from: 91, to: 100, bells: 3, focus: 'Efficient mixed routes' },
  { id: 11, name: 'Grand Chime', from: 101, to: 110, bells: 3, focus: 'Every unlocked mechanism' },
];

const TITLES: string[][] = [
  ['First Chime', 'Up the Rail', 'Back This Way', 'Around the Corner', 'Short Detour', 'Two Turns', 'The Long Lane', 'Quiet Edge', 'Corner Pocket', 'First Finale'],
  ['First Leap', 'Over the Gap', 'Mind the Hole', 'Ramp and Run', 'Gap on the Left', 'The Wide Step', 'Hop and Turn', 'Two Steps Over', 'Rolling Bead', 'Leap Finale'],
  ['Winding Start', 'Rail Bend', 'Double Bend', 'The Long Way', 'Two Gaps', 'The Snake', 'Hairpin', 'Around the Block', 'Rail Weave', 'Winding Finale'],
  ['First Fork', 'Split Decision', 'Left and Right', 'Two Bells', 'Branching Out', 'Twin Lanes', 'Both Ways', 'Parted Rails', 'Quiet Branch', 'Fork Finale'],
  ['Bell Duet', 'Fork and Leap', 'Two Chimes', 'Ramped Branch', 'Double Trouble', 'Split the Gap', 'Leaping Twins', 'Two of a Kind', 'Duet Detour', 'Duet Finale'],
  ['Turning Point', 'Around the Stops', 'Blocked Lane', 'Corner Duet', 'Wood in the Way', 'Tight Turns', 'The Spiral', 'Stop and Turn', 'Cornered', 'Turning Finale'],
  ['First Bridge', 'Over the Stop', 'Arch Lane', 'Bridge and Bell', 'The High Road', 'Two Arches', 'Over and On', 'Raised Rails', 'Under the Arch', 'Bridge Finale'],
  ['Crossing Paths', 'Over a Branch', 'The Overpass', 'Crossed Lanes', 'Above the Fork', 'Double Cross', 'Split and Span', 'Bridge the Split', 'Tangled Rails', 'Crossing Finale'],
  ['Bell Trio', 'Three Chimes', 'Triple Split', 'Three Lanes', 'Trio Detour', 'Fork on Fork', 'Three Ways Out', 'Chime Cluster', 'Trio Weave', 'Trio Finale'],
  ['Fine Balance', 'Tight Budget', 'Every Piece Counts', 'Lean Lanes', 'No Spare Wood', 'Balanced Trio', 'Measured Route', 'Neat and Narrow', 'Exact Fit', 'Balance Finale'],
  ['Grand Chime', 'All Together', 'Full Workshop', 'Every Mechanism', 'The Grand Weave', 'Masterpiece', 'Last Turns', 'Final Arches', 'Great Cascade', 'Grand Finale'],
];

export const packOf = (levelId: number): PackInfo =>
  PACKS[Math.min(PACKS.length - 1, Math.floor((levelId - 1) / PACK_SIZE))];

export const titleOf = (levelId: number) => {
  const p = Math.floor((levelId - 1) / PACK_SIZE);
  return TITLES[p][(levelId - 1) % PACK_SIZE];
};

/** Types a given table is allowed to use - earlier tables never need later types. */
export function allowedTypes(levelId: number): PieceType[] {
  const out: PieceType[] = ['domino'];
  if (levelId >= 4) out.push('corner');
  if (levelId >= 11) out.push('ramp');
  if (levelId >= 31) out.push('fork');
  if (levelId >= 61) out.push('bridge');
  return out;
}

// ------------------------------------------------------------------
// Deterministic generator: the route is built first, so every stored
// solution is correct by construction and then proved by the simulator.
// ------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rnd = () => number;
const randInt = (r: Rnd, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

type Head = { x: number; y: number; dir: Dir; len: number; target: number };
type Move = { w: number; apply: () => void };

function tryBuild(id: number, pack: PackInfo, allowed: PieceType[], r: Rnd): Level | null {
  const occ = new Map<string, string>();
  const bells: Coord[] = [];
  const stops: Coord[] = [];
  const gaps: Coord[] = [];
  const pieces: Placement[] = [];
  const can = (t: PieceType) => allowed.indexOf(t) !== -1;

  const inB = (x: number, y: number) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
  const free = (x: number, y: number) => inB(x, y) && !occ.has(key(x, y));
  const take = (x: number, y: number, kind: string) => occ.set(key(x, y), kind);

  const place = (type: PieceType, x: number, y: number, dir: Dir) => {
    take(x, y, 'piece');
    pieces.push({ id: 'L' + id + '-' + pieces.length, type, x, y, dir });
  };

  const dir = [N, E, S, W][randInt(r, 0, 3)] as Dir;
  let sx = 0;
  let sy = 0;
  if (dir === E) {
    sx = 0;
    sy = randInt(r, 0, ROWS - 1);
  } else if (dir === W) {
    sx = COLS - 1;
    sy = randInt(r, 0, ROWS - 1);
  } else if (dir === S) {
    sy = 0;
    sx = randInt(r, 0, COLS - 1);
  } else {
    sy = ROWS - 1;
    sx = randInt(r, 0, COLS - 1);
  }
  take(sx, sy, 'starter');

  let forksLeft = pack.bells - 1;
  if (forksLeft > 0 && !can('fork')) return null;

  const branchLen = () => randInt(r, 1, pack.bells > 1 ? 2 : 3);
  const mainTarget = pack.bells > 1 ? randInt(r, 1, 2) : randInt(r, 2, 4);

  const heads: Head[] = [
    { x: sx + DX[dir], y: sy + DY[dir], dir, len: 0, target: mainTarget },
  ];

  let guard = 0;
  while (heads.length > 0 && guard < 48) {
    guard += 1;
    const h = heads.shift() as Head;
    if (!free(h.x, h.y)) return null;

    const wantFork =
      forksLeft > 0 && can('fork') && h.len >= 1 && (h.len >= h.target || r() < 0.5);
    if (wantFork) {
      const side = cw(h.dir);
      const a = { x: h.x + DX[h.dir], y: h.y + DY[h.dir] };
      const b = { x: h.x + DX[side], y: h.y + DY[side] };
      if (free(a.x, a.y) && free(b.x, b.y)) {
        place('fork', h.x, h.y, h.dir);
        forksLeft -= 1;
        heads.push({ x: a.x, y: a.y, dir: h.dir, len: 0, target: branchLen() });
        heads.push({ x: b.x, y: b.y, dir: side, len: 0, target: branchLen() });
        continue;
      }
    }

    if (h.len >= h.target) {
      take(h.x, h.y, 'bell');
      bells.push({ x: h.x, y: h.y });
      continue;
    }

    const moves: Move[] = [];

    const fwd = { x: h.x + DX[h.dir], y: h.y + DY[h.dir] };
    if (free(fwd.x, fwd.y)) {
      moves.push({
        w: 5,
        apply: () => {
          place('domino', h.x, h.y, h.dir);
          heads.push({ x: fwd.x, y: fwd.y, dir: h.dir, len: h.len + 1, target: h.target });
        },
      });
    }

    if (can('corner')) {
      const turns: Dir[] = [cw(h.dir), ccw(h.dir)];
      for (let i = 0; i < turns.length; i += 1) {
        const nd = turns[i];
        const c = { x: h.x + DX[nd], y: h.y + DY[nd] };
        if (!free(c.x, c.y)) continue;
        const f = cornerFacingFor(h.dir, nd);
        if (f === null) continue;
        moves.push({
          w: pack.id === 3 || pack.id === 6 ? 5 : 2,
          apply: () => {
            place('corner', h.x, h.y, f);
            heads.push({ x: c.x, y: c.y, dir: nd, len: h.len + 1, target: h.target });
          },
        });
      }
    }

    if (can('ramp')) {
      const mid = { x: h.x + DX[h.dir], y: h.y + DY[h.dir] };
      const far = { x: h.x + DX[h.dir] * 2, y: h.y + DY[h.dir] * 2 };
      if (free(mid.x, mid.y) && free(far.x, far.y)) {
        moves.push({
          w: pack.id === 2 || pack.id === 5 ? 7 : 2,
          apply: () => {
            place('ramp', h.x, h.y, h.dir);
            take(mid.x, mid.y, 'gap');
            gaps.push(mid);
            heads.push({ x: far.x, y: far.y, dir: h.dir, len: h.len + 1, target: h.target });
          },
        });
      }
    }

    if (can('bridge')) {
      const mid = { x: h.x + DX[h.dir], y: h.y + DY[h.dir] };
      const far = { x: h.x + DX[h.dir] * 2, y: h.y + DY[h.dir] * 2 };
      if (free(mid.x, mid.y) && free(far.x, far.y)) {
        moves.push({
          w: pack.id === 7 || pack.id === 8 ? 7 : 2,
          apply: () => {
            place('bridge', h.x, h.y, h.dir);
            take(mid.x, mid.y, 'stop');
            stops.push(mid);
            heads.push({ x: far.x, y: far.y, dir: h.dir, len: h.len + 1, target: h.target });
          },
        });
      }
    }

    if (moves.length === 0) return null;

    let total = 0;
    for (let i = 0; i < moves.length; i += 1) total += moves[i].w;
    let roll = r() * total;
    let chosen = moves[moves.length - 1];
    for (let i = 0; i < moves.length; i += 1) {
      roll -= moves[i].w;
      if (roll <= 0) {
        chosen = moves[i];
        break;
      }
    }
    chosen.apply();
  }

  if (heads.length > 0) return null;
  if (forksLeft > 0) return null;
  if (bells.length !== pack.bells) return null;
  if (pieces.length === 0) return null;

  // Decorative fixed stops, only on cells the canonical route never visits.
  const spare: Coord[] = [];
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) if (free(x, y)) spare.push({ x, y });
  }
  const extra = Math.min(spare.length, randInt(r, 0, pack.id >= 6 ? 2 : 1));
  for (let i = 0; i < extra; i += 1) {
    const idx = randInt(r, 0, spare.length - 1);
    const c = spare.splice(idx, 1)[0];
    take(c.x, c.y, 'stop');
    stops.push(c);
  }

  const solution = pieces.map(p => ({ ...p }));
  const seeded: Placement[] = [];
  if (id % 7 === 3 && solution.length > 1) {
    solution[0].seeded = true;
    seeded.push({ ...solution[0] });
  }

  return {
    id,
    packId: pack.id,
    title: titleOf(id),
    starter: { x: sx, y: sy, dir },
    bells,
    stops,
    gaps,
    allowed,
    seeded,
    solution,
    gold: solution.length,
  };
}

/** Always-valid straight lane. Only used if the generator runs out of attempts. */
function fallbackLevel(id: number, pack: PackInfo, allowed: PieceType[]): Level {
  const solution: Placement[] = [1, 2, 3].map((x, i) => ({
    id: 'F' + id + '-' + i,
    type: 'domino' as PieceType,
    x,
    y: 2,
    dir: E,
  }));
  return {
    id,
    packId: pack.id,
    title: titleOf(id),
    starter: { x: 0, y: 2, dir: E },
    bells: [{ x: 4, y: 2 }],
    stops: [],
    gaps: [],
    allowed,
    seeded: [],
    solution,
    gold: solution.length,
  };
}

const d = (id: string, type: PieceType, x: number, y: number, dir: Dir): Placement => ({
  id,
  type,
  x,
  y,
  dir,
});

/** The five opening tables are authored by hand, exactly as specified. */
const AUTHORED: Record<number, () => Level> = {
  1: () => {
    const seed: Placement = { ...d('T1-0', 'domino', 1, 2, E), seeded: true };
    return {
      id: 1,
      packId: 1,
      title: titleOf(1),
      starter: { x: 0, y: 2, dir: E },
      bells: [{ x: 4, y: 2 }],
      stops: [],
      gaps: [],
      allowed: ['domino'],
      seeded: [{ ...seed }],
      solution: [seed, d('T1-1', 'domino', 2, 2, E), d('T1-2', 'domino', 3, 2, E)],
      gold: 3,
    };
  },
  2: () => ({
    id: 2,
    packId: 1,
    title: titleOf(2),
    starter: { x: 2, y: 3, dir: N },
    bells: [{ x: 2, y: 0 }],
    stops: [],
    gaps: [],
    allowed: ['domino'],
    seeded: [],
    solution: [d('T2-0', 'domino', 2, 2, N), d('T2-1', 'domino', 2, 1, N)],
    gold: 2,
  }),
  3: () => ({
    id: 3,
    packId: 1,
    title: titleOf(3),
    starter: { x: 4, y: 1, dir: W },
    bells: [{ x: 0, y: 1 }],
    stops: [
      { x: 2, y: 0 },
      { x: 2, y: 3 },
    ],
    gaps: [],
    allowed: ['domino'],
    seeded: [],
    solution: [
      d('T3-0', 'domino', 3, 1, W),
      d('T3-1', 'domino', 2, 1, W),
      d('T3-2', 'domino', 1, 1, W),
    ],
    gold: 3,
  }),
  4: () => ({
    id: 4,
    packId: 1,
    title: titleOf(4),
    starter: { x: 0, y: 3, dir: E },
    bells: [{ x: 2, y: 1 }],
    stops: [{ x: 3, y: 2 }],
    gaps: [],
    allowed: ['domino', 'corner'],
    seeded: [],
    solution: [
      d('T4-0', 'domino', 1, 3, E),
      d('T4-1', 'corner', 2, 3, W),
      d('T4-2', 'domino', 2, 2, N),
    ],
    gold: 3,
  }),
  11: () => ({
    id: 11,
    packId: 2,
    title: titleOf(11),
    starter: { x: 0, y: 2, dir: E },
    bells: [{ x: 4, y: 2 }],
    stops: [],
    gaps: [{ x: 2, y: 2 }],
    allowed: ['domino', 'corner', 'ramp'],
    seeded: [],
    solution: [d('T11-0', 'ramp', 1, 2, E), d('T11-1', 'domino', 3, 2, E)],
    gold: 2,
  }),
};

const cache = new Map<number, Level>();

export function getLevel(levelId: number): Level {
  const id = Math.min(LEVEL_COUNT, Math.max(1, Math.round(levelId)));
  const hit = cache.get(id);
  if (hit) return hit;

  const pack = packOf(id);
  const allowed = allowedTypes(id);
  let level: Level | null = null;

  const authored = AUTHORED[id];
  if (authored) {
    const candidate = authored();
    if (simulate(candidate, candidate.solution).success) level = candidate;
  }

  for (let attempt = 0; !level && attempt < 160; attempt += 1) {
    const r = mulberry32(id * 7919 + attempt * 104729 + 17);
    const candidate = tryBuild(id, pack, allowed, r);
    if (candidate && simulate(candidate, candidate.solution).success) level = candidate;
  }

  const result = level || fallbackLevel(id, pack, allowed);
  cache.set(id, result);
  return result;
}

/** Dev helper - proves all 110 stored solutions ring every bell. */
export function validateAllLevels() {
  const bad: number[] = [];
  for (let id = 1; id <= LEVEL_COUNT; id += 1) {
    const lv = getLevel(id);
    if (!simulate(lv, lv.solution).success) bad.push(id);
  }
  return bad;
}
