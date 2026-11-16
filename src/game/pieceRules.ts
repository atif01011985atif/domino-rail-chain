import { ACTIVATION_MS } from '../constants/config';
import { cw, opp, DX, DY, Dir, FixedKind, Placement } from './types';

export type BoardQuery = {
  inBounds: (x: number, y: number) => boolean;
  fixedAt: (x: number, y: number) => FixedKind | null;
  pieceAt: (x: number, y: number) => Placement | null;
};

export type Resolution =
  | { ok: true; outputs: { x: number; y: number; dir: Dir }[]; duration: number }
  | { ok: false; reason: string };

/** The two open sides of a corner rail: its facing and the side 90 degrees clockwise. */
export const cornerPorts = (facing: Dir): [Dir, Dir] => [facing, cw(facing)];

/**
 * Facing that makes a corner rail accept a pulse travelling `travel`
 * and send it out travelling `exit`. Returns null when that turn is impossible.
 */
export function cornerFacingFor(travel: Dir, exit: Dir): Dir | null {
  const entrySide = opp(travel);
  for (let f = 0 as Dir; f < 4; f = (f + 1) as Dir) {
    const ports = cornerPorts(f);
    if (ports.indexOf(entrySide) === -1) continue;
    const other = ports[0] === entrySide ? ports[1] : ports[0];
    if (other === exit) return f;
  }
  return null;
}

const step = (x: number, y: number, d: Dir, n = 1) => ({
  x: x + DX[d] * n,
  y: y + DY[d] * n,
});

/** Pure acceptance rules. No side effects, no simulator state. */
export function resolvePiece(
  piece: Placement,
  travel: Dir,
  board: BoardQuery,
): Resolution {
  const { x, y, dir, type } = piece;

  if (type === 'domino') {
    if (travel !== dir) {
      return { ok: false, reason: 'The domino faces away from the push.' };
    }
    const to = step(x, y, dir);
    return { ok: true, outputs: [{ ...to, dir }], duration: ACTIVATION_MS.domino };
  }

  if (type === 'corner') {
    const entrySide = opp(travel);
    const ports = cornerPorts(dir);
    if (ports.indexOf(entrySide) === -1) {
      return { ok: false, reason: 'The corner rail has no opening on that side.' };
    }
    const exit = ports[0] === entrySide ? ports[1] : ports[0];
    const to = step(x, y, exit);
    return { ok: true, outputs: [{ ...to, dir: exit }], duration: ACTIVATION_MS.corner };
  }

  if (type === 'ramp') {
    if (travel !== dir) {
      return { ok: false, reason: 'The ramp faces away from the push.' };
    }
    const mid = step(x, y, dir);
    if (board.fixedAt(mid.x, mid.y) !== 'gap') {
      return { ok: false, reason: 'This ramp needs a gap in front of it.' };
    }
    const to = step(x, y, dir, 2);
    return { ok: true, outputs: [{ ...to, dir }], duration: ACTIVATION_MS.ramp };
  }

  if (type === 'fork') {
    if (travel !== dir) {
      return { ok: false, reason: 'The fork rail faces away from the push.' };
    }
    const side = cw(dir);
    const a = step(x, y, dir);
    const b = step(x, y, side);
    return {
      ok: true,
      outputs: [
        { ...a, dir },
        { ...b, dir: side },
      ],
      duration: ACTIVATION_MS.fork,
    };
  }

  // bridge
  if (travel !== dir) {
    return { ok: false, reason: 'The bridge faces away from the push.' };
  }
  const mid = step(x, y, dir);
  const midFixed = board.fixedAt(mid.x, mid.y);
  if (!board.inBounds(mid.x, mid.y)) {
    return { ok: false, reason: 'The bridge points off the table.' };
  }
  if (midFixed === 'gap') {
    return { ok: false, reason: 'A bridge cannot span a gap square.' };
  }
  if (midFixed === 'starter' || midFixed === 'bell') {
    return { ok: false, reason: 'A bridge cannot arc over the starter or a bell.' };
  }
  const to = step(x, y, dir, 2);
  return { ok: true, outputs: [{ ...to, dir }], duration: ACTIVATION_MS.bridge };
}
