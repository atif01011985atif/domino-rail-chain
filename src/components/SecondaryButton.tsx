import React, { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { ANIM } from '../constants/config';
import theme from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  label: string;
  onPress: () => void;
  Icon?: LucideIcon;
  selected?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

/** 48 dp material control. Same icon size and gap as the primary CTA. */
function SecondaryButtonBase({
  label,
  onPress,
  Icon,
  selected = false,
  disabled = false,
  style,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.timing(scale, { toValue: 0.97, duration: 90, useNativeDriver: true }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: ANIM.spring.tension,
      friction: ANIM.spring.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const tint = selected ? theme.colors.ink : theme.colors.text.secondary;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled, selected }}
      style={[styles.press, style, disabled ? styles.disabled : null]}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.body,
          selected ? styles.bodySelected : null,
          { transform: [{ scale }] },
        ]}
      >
        <View style={styles.inner}>
          {Icon ? <Icon size={24} color={tint} strokeWidth={2.25} /> : null}
          <Text numberOfLines={1} style={[styles.label, { color: tint }]}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: 48, borderRadius: theme.radius.lg },
  disabled: { opacity: 0.45 },
  body: {
    width: '100%',
    height: 48,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    borderTopColor: theme.colors.ui.highlight,
    ...theme.shadows.piece,
  },
  bodySelected: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.primary,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  label: { ...theme.typography.buttonSmall },
});

export default memo(SecondaryButtonBase);
