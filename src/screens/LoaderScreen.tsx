import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import assets from '../assets';
import AppShell from '../components/AppShell';
import { LOADER_DURATION_MS } from '../constants/config';
import theme from '../constants/theme';

const BAR_W = 200;

type Props = { onDone: () => void };

/**
 * Branded splash. Deliberately dark, non-interactive (brand card + progress
 * bar only), so it can never be mistaken for the bright Table Select screen.
 */
export default function LoaderScreen({ onDone }: Props) {
  const enter = useRef(new Animated.Value(0)).current;
  const fill = useRef(new Animated.Value(0)).current;
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(fill, {
      toValue: 1,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    const id = setTimeout(() => done.current(), LOADER_DURATION_MS);
    return () => clearTimeout(id);
  }, [enter, fill]);

  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  const slide = fill.interpolate({ inputRange: [0, 1], outputRange: [-BAR_W, 0] });

  return (
    <AppShell variant="loader">
      <View style={styles.root}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.brandCard, { opacity: enter, transform: [{ scale }] }]}
        >
          <LinearGradient
            colors={['rgba(176,221,180,0.16)', 'rgba(91,171,42,0.10)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandInner}
          >
            <Image source={assets.logo} style={styles.logo} />
          </LinearGradient>
        </Animated.View>

        <Animated.View pointerEvents="none" style={{ opacity: enter }}>
          <Text style={styles.title}>DOMINO RAIL</Text>
          <Text style={styles.title}>CHAIN</Text>
          <Text style={styles.subtitle}>One push. Every bell.</Text>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.loading}>LOADING</Text>
          <View style={styles.track}>
            <Animated.View
              pointerEvents="none"
              style={[styles.fillWrap, { transform: [{ translateX: slide }] }]}
            >
              <LinearGradient
                colors={theme.gradients.progress}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fill}
              />
            </Animated.View>
          </View>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  brandCard: {
    width: 176,
    height: 176,
    borderRadius: 32,
    padding: 1,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(176,221,180,0.30)',
    overflow: 'hidden',
  },
  brandInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 31 },
  logo: { width: 136, height: 136, resizeMode: 'contain' },
  title: {
    ...theme.typography.hero,
    color: theme.colors.text.inverse,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: theme.colors.text.onDarkMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  footer: { position: 'absolute', bottom: 72, alignItems: 'center' },
  loading: {
    ...theme.typography.caption,
    color: theme.colors.text.onDarkMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },
  track: {
    width: BAR_W,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.inkMid,
    overflow: 'hidden',
  },
  fillWrap: { width: BAR_W, height: 6 },
  fill: { width: BAR_W, height: 6, borderRadius: 3 },
});
