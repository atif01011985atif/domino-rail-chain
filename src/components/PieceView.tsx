import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { PIECE_SPRITE } from '../assets';
import theme from '../constants/theme';
import { Dir, PieceType, cw } from '../game/types';

type Props = {
  type: PieceType;
  dir: Dir;
  size: number;
  selected?: boolean;
  toppled?: boolean;
};

/** Edge triangle marking one open side of a piece, in a 100 x 100 viewBox. */
const MARKS: Record<Dir, string> = {
  0: '50,6 41,22 59,22',
  1: '94,50 78,41 78,59',
  2: '50,94 41,78 59,78',
  3: '6,50 22,41 22,59',
};

function portsFor(type: PieceType, dir: Dir): Dir[] {
  if (type === 'corner') return [dir, cw(dir)];
  if (type === 'fork') return [dir, cw(dir)];
  return [dir];
}

/** Pure presentation. Never touches the simulator. */
function PieceViewBase({ type, dir, size, selected = false, toppled = false }: Props) {
  const sprite = PIECE_SPRITE[type];
  const art = Math.round(size * 0.64);
  const ports = portsFor(type, dir);
  const markColor = selected ? theme.colors.accent : theme.colors.primary;

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size },
        toppled ? styles.toppled : null,
      ]}
      pointerEvents="none"
    >
      {sprite ? (
        <Image
          source={sprite}
          style={{
            width: art,
            height: art,
            resizeMode: 'contain',
            transform: [{ rotate: dir * 90 + 'deg' }],
          }}
        />
      ) : (
        <Svg width={art} height={art} viewBox="0 0 100 100">
          <Path
            d="M14 76 Q50 10 86 76"
            stroke={theme.colors.walnut}
            strokeWidth={13}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M14 76 Q50 22 86 76"
            stroke={theme.colors.surface}
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
          />
          <Rect x="8" y="74" width="16" height="20" rx="4" fill={theme.colors.woodEdge} />
          <Rect x="76" y="74" width="16" height="20" rx="4" fill={theme.colors.woodEdge} />
          <Circle cx="50" cy="30" r="7" fill={theme.colors.brass} />
        </Svg>
      )}

      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100">
        {ports.map(p => (
          <Polygon key={p} points={MARKS[p]} fill={markColor} opacity={0.92} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  toppled: { opacity: 0.55 },
});

export default memo(PieceViewBase);
