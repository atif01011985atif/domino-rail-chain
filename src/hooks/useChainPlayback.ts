import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ACTIVATION_MS, Speed } from '../constants/config';
import { ChainEvent, key } from '../game/types';

const TICK_MS = 50;
const PULSE_WINDOW = 260;

export type PlaybackFrame = {
  activeKeys: Set<string>;
  toppledIds: Set<string>;
  rungKeys: Set<string>;
  endedKeys: Set<string>;
  bellsReached: number;
};

/**
 * Single playback clock over an immutable recorded timeline.
 * Callback state lives in refs, so a stale closure can never advance it twice.
 */
export function useChainPlayback(
  events: ChainEvent[],
  durationMs: number,
  onFinished?: () => void,
) {
  const [timeMs, setTimeMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  const timeRef = useRef(0);
  const finishedRef = useRef(false);
  const doneCb = useRef(onFinished);
  doneCb.current = onFinished;

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      const next = timeRef.current + TICK_MS * speed;
      if (next >= durationMs) {
        timeRef.current = durationMs;
        setTimeMs(durationMs);
        setPlaying(false);
        if (!finishedRef.current) {
          finishedRef.current = true;
          if (doneCb.current) doneCb.current();
        }
      } else {
        timeRef.current = next;
        setTimeMs(next);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, speed, durationMs]);

  const start = useCallback(() => {
    timeRef.current = 0;
    finishedRef.current = false;
    setTimeMs(0);
    setPlaying(true);
  }, []);

  const toggle = useCallback(() => {
    if (timeRef.current >= durationMs) {
      start();
      return;
    }
    setPlaying(p => !p);
  }, [durationMs, start]);

  const seek = useCallback(
    (ms: number) => {
      const clamped = Math.max(0, Math.min(durationMs, ms));
      timeRef.current = clamped;
      finishedRef.current = clamped >= durationMs;
      setTimeMs(clamped);
      setPlaying(false);
    },
    [durationMs],
  );

  const stop = useCallback(() => setPlaying(false), []);

  const frame = useMemo<PlaybackFrame>(() => {
    const activeKeys = new Set<string>();
    const toppledIds = new Set<string>();
    const rungKeys = new Set<string>();
    const endedKeys = new Set<string>();
    let bellsReached = 0;

    for (let i = 0; i < events.length; i += 1) {
      const e = events[i];
      if (e.t > timeMs) break;
      if (e.kind === 'activate') {
        if (e.pieceId) toppledIds.add(e.pieceId);
        const life = e.type ? ACTIVATION_MS[e.type] : 200;
        if (timeMs - e.t <= life + PULSE_WINDOW) activeKeys.add(key(e.x, e.y));
      } else if (e.kind === 'bell') {
        rungKeys.add(key(e.x, e.y));
        bellsReached += 1;
        if (timeMs - e.t <= PULSE_WINDOW) activeKeys.add(key(e.x, e.y));
      } else if (e.kind === 'stop') {
        endedKeys.add(key(e.x, e.y));
      } else if (e.kind === 'start') {
        if (timeMs - e.t <= PULSE_WINDOW) activeKeys.add(key(e.x, e.y));
      }
    }

    return { activeKeys, toppledIds, rungKeys, endedKeys, bellsReached };
  }, [events, timeMs]);

  return { timeMs, playing, speed, frame, setSpeed, start, toggle, seek, stop };
}
