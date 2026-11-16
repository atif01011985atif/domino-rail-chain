import React, { memo, useCallback, useRef } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { ANIM } from '../constants/config';
import theme from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
  Icon?: LucideIcon;
  image?: ImageSourcePropType;
  tone?: 'dark' | 'light';
  disabled?: boolean;
  style?: ViewStyle;
};

/** 48 x 48 hit region holding a 24 dp glyph. Used by every header. */
function IconButtonBase({
  onPress,
  accessibilityLabel,
  Icon,
  image,
  tone = 'dark',
  disabled = false,
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.timing(scale, { toValue: 0.92, duration: 90, useNativeDriver: true }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: ANIM.spring.tension,
      friction: ANIM.spring.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const onDark = tone === 'dark';

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[styles.press, style, disabled ? styles.disabled : null]}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.body,
          onDark ? styles.bodyDark : styles.bodyLight,
          { transform: [{ scale }] },
        ]}
      >
        {image ? (
          <Image source={image} style={styles.image} />
        ) : Icon ? (
          <Icon
            size={24}
            color={onDark ? theme.colors.text.inverse : theme.colors.ink}
            strokeWidth={2.25}
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.4 },
  body: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  bodyDark: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  bodyLight: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.ui.border,
  },
  image: { width: 24, height: 24, resizeMode: 'contain' },
});

export default memo(IconButtonBase);
