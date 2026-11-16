import { Medal } from './types';

export const MEDAL_LABEL: Record<'gold' | 'silver' | 'bronze', string> = {
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

/**
 * Gold when P is at most G, Silver up to G+2, Bronze above that.
 * An incomplete run earns nothing.
 */
export function medalFor(success: boolean, pieces: number, gold: number): Medal {
  if (!success) return null;
  if (pieces <= gold) return 'gold';
  if (pieces <= gold + 2) return 'silver';
  return 'bronze';
}

const RANK: Record<string, number> = { bronze: 1, silver: 2, gold: 3 };

/** Lower piece counts improve a record; a worse run never replaces a better one. */
export function betterMedal(a: Medal, b: Medal): Medal {
  if (!a) return b;
  if (!b) return a;
  return RANK[a] >= RANK[b] ? a : b;
}

export function medalTargets(gold: number) {
  return { gold, silver: gold + 2 };
}
