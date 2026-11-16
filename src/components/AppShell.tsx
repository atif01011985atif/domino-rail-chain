import React, { memo, ReactNode } from 'react';
import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import assets from '../assets';
import theme from '../constants/theme';

export type ShellVariant =
  | 'loader'
  | 'menu'
  | 'game'
  | 'replay'
  | 'win'
  | 'lose'
  | 'medals'
  | 'catalog';

/** Same bg_game on every screen; the overlay is what tells the screens apart. */
const OVERLAY: Record<ShellVariant, string[]> = {
  loader: ['rgba(29,36,24,0.97)', 'rgba(71,84,63,0.92)', 'rgba(29,36,24,0.97)'],
  menu: ['rgba(241,246,237,0.90)', 'rgba(250,245,236,0.80)', 'rgba(176,221,180,0.88)'],
  game: ['rgba(241,246,237,0.94)', 'rgba(250,245,236,0.90)', 'rgba(232,221,196,0.94)'],
  replay: ['rgba(232,221,196,0.93)', 'rgba(241,246,237,0.88)', 'rgba(176,221,180,0.93)'],
  win: ['rgba(176,221,180,0.92)', 'rgba(241,246,237,0.86)', 'rgba(250,245,236,0.93)'],
  lose: ['rgba(241,246,237,0.93)', 'rgba(232,221,196,0.90)', 'rgba(250,245,236,0.94)'],
  medals: ['rgba(250,245,236,0.93)', 'rgba(241,246,237,0.87)', 'rgba(232,221,196,0.93)'],
  catalog: ['rgba(241,246,237,0.91)', 'rgba(176,221,180,0.86)', 'rgba(250,245,236,0.93)'],
};

const ANGLE: Record<ShellVariant, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  loader: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  menu: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  game: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  replay: { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
  win: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  lose: { start: { x: 0, y: 1 }, end: { x: 1, y: 0 } },
  medals: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  catalog: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
};

type Props = { variant: ShellVariant; children: ReactNode };

/** Owns the fixed vertical frame. Never a ScrollView root. */
function AppShellBase({ variant, children }: Props) {
  const dark = variant === 'loader';
  const angle = ANGLE[variant];
  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground source={assets.bgGame} style={styles.bg} resizeMode="cover">
        <LinearGradient
          colors={OVERLAY[variant]}
          start={angle.start}
          end={angle.end}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  bg: { flex: 1 },
});

export default memo(AppShellBase);
