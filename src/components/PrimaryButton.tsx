import React, { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { ANIM } from '../constants/config';
import theme from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'action' | 'green';
  Icon?: LucideIcon;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

/**
 * 56 dp gradient CTA. The Pressable is the parent and the Animated.View the
 * child, which is the pattern that keeps taps alive on Android release builds.
 */
function PrimaryButtonBase({
  label,
  onPress,
  disabled = false,
  tone = 'action',
  Icon,
  style,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.timing(scale, {
      toValue: 0.97,
      duration: 90,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: ANIM.spring.tension,
      friction: ANIM.spring.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const colors =
    tone === 'green'
      ? [theme.gradients.green[0], theme.gradients.green[1]]
      : [theme.gradients.action[0], theme.gradients.action[1]];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      style={[styles.press, style, disabled ? styles.disabled : null]}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[styles.anim, { transform: [{ scale }] }]}
      >
        <LinearGradient
          colors={disabled ? [theme.colors.woodEdge, theme.colors.surfaceWarm] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.grad}
        >
          <View style={styles.inner}>
            {Icon ? <Icon size={24} color={theme.colors.ink} strokeWidth={2.5} /> : null}
            <Text numberOfLines={1} style={styles.label}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    height: 56,
    borderRadius: theme.radius.lg,
    ...theme.shadows.action,
  },
  disabled: { opacity: 0.55, shadowOpacity: 0, elevation: 0 },
  anim: { width: '100%', height: 56, borderRadius: theme.radius.lg },
  grad: {
    width: '100%',
    height: 56,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    ...theme.typography.button,
    color: theme.colors.ink,
    textAlign: 'center',
  },
});

export default memo(PrimaryButtonBase);
