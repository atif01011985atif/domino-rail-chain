/** North, East, South, West - the only four travel directions. */
export type Dir = 0 | 1 | 2 | 3;

export const N: Dir = 0;
export const E: Dir = 1;
export const S: Dir = 2;
export const W: Dir = 3;

export const DX = [0, 1, 0, -1] as const;
export const DY = [-1, 0, 1, 0] as const;

export const DIR_NAME = ['north', 'east', 'south', 'west'] as const;

export const cw = (d: Dir): Dir => ((d + 1) % 4) as Dir;
export const ccw = (d: Dir): Dir => ((d + 3) % 4) as Dir;
export const opp = (d: Dir): Dir => ((d + 2) % 4) as Dir;

export type PieceType = 'domino' | 'corner' | 'ramp' | 'fork' | 'bridge';

export const PIECE_TYPES: PieceType[] = ['domino', 'corner', 'ramp', 'fork', 'bridge'];

export const PIECE_LABEL: Record<PieceType, string> = {
  domino: 'Domino',
  corner: 'Corner Rail',
  ramp: 'Ramp',
  fork: 'Fork Rail',
  bridge: 'Bridge',
};

export const PIECE_RULE_TEXT: Record<PieceType, string> = {
  domino: 'Topples forward one square in the way it faces.',
  corner: 'Turns an incoming push through a right angle.',
  ramp: 'Rolls a bead over one gap square in front of it.',
  fork: 'Splits one push into two: forward and a right turn.',
  bridge: 'Arcs over the next square and lands two forward.',
};

/** Table number that must be completed before the type appears in the tray. */
export const PIECE_UNLOCK_TABLE: Record<PieceType, number> = {
  domino: 0,
  corner: 3,
  ramp: 10,
  fork: 30,
  bridge: 60,
};

export type Coord = { x: number; y: number };

export type Placement = {
  id: string;
  type: PieceType;
  x: number;
  y: number;
  dir: Dir;
  /** Seeded pieces start on the board but are still movable and still counted. */
  seeded?: boolean;
};

export type FixedKind = 'starter' | 'bell' | 'stop' | 'gap';

export type Level = {
  id: number;
  packId: number;
  title: string;
  starter: { x: number; y: number; dir: Dir };
  bells: Coord[];
  stops: Coord[];
  gaps: Coord[];
  allowed: PieceType[];
  seeded: Placement[];
  solution: Placement[];
  gold: number;
};

export type ChainEventKind = 'start' | 'activate' | 'bell' | 'stop';

export type ChainEvent = {
  t: number;
  kind: ChainEventKind;
  x: number;
  y: number;
  dir: Dir;
  type?: PieceType;
  pieceId?: string;
  reason?: string;
};

export type Endpoint = {
  t: number;
  x: number;
  y: number;
  dir: Dir;
  reason: string;
};

export type Medal = 'gold' | 'silver' | 'bronze' | null;

export type RunResult = {
  levelId: number;
  sandbox: boolean;
  success: boolean;
  bellsRung: number;
  bellCount: number;
  pieces: number;
  gold: number;
  medal: Medal;
  events: ChainEvent[];
  endpoints: Endpoint[];
  durationMs: number;
  /** The immutable pre-run construction - PLAY AGAIN restores exactly this. */
  snapshot: Placement[];
};

export const key = (x: number, y: number) => x + ',' + y;
