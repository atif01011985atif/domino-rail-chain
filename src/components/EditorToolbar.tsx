import React, { memo, useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Eraser, LucideIcon, RotateCw, Trash2, Undo2 } from 'lucide-react-native';
import { ANIM } from '../constants/config';
import theme from '../constants/theme';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

type ToolProps = {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled: boolean;
};

function Tool({ Icon, label, onPress, disabled }: ToolProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.timing(scale, { toValue: 0.94, duration: 90, useNativeDriver: true }).start();
  }, [scale]);
  const pressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: ANIM.spring.tension,
      friction: ANIM.spring.friction,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const tint = disabled ? theme.colors.medal.none : theme.colors.text.secondary;

  return (
    <View style={styles.slot}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        style={styles.press}
      >
        <Animated.View
          pointerEvents="box-none"
          style={[styles.tile, { transform: [{ scale }] }, disabled ? styles.off : null]}
        >
          <Icon size={24} color={tint} strokeWidth={2.25} />
          <Text numberOfLines={1} style={[styles.label, { color: tint }]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

type Props = {
  canUndo: boolean;
  hasSelection: boolean;
  canClear: boolean;
  onUndo: () => void;
  onRotate: () => void;
  onRemove: () => void;
  onClear: () => void;
};

/** Undo, Turn, Remove and Clear. Every target is at least 48 dp. */
function EditorToolbarBase({
  canUndo,
  hasSelection,
  canClear,
  onUndo,
  onRotate,
  onRemove,
  onClear,
}: Props) {
  return (
    <View style={styles.row}>
      <Tool Icon={Undo2} label="UNDO" onPress={onUndo} disabled={!canUndo} />
      <Tool Icon={RotateCw} label="TURN" onPress={onRotate} disabled={!hasSelection} />
      <Tool Icon={Trash2} label="REMOVE" onPress={onRemove} disabled={!hasSelection} />
      <Tool Icon={Eraser} label="CLEAR" onPress={onClear} disabled={!canClear} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  slot: { flex: 1 },
  press: { width: '100%', height: 48 },
  tile: {
    width: '100%',
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    borderTopColor: theme.colors.ui.highlight,
  },
  off: { backgroundColor: theme.colors.surfaceWarm, opacity: 0.6 },
  label: { fontSize: 10, lineHeight: 12, fontWeight: '700', letterSpacing: 0.6, marginTop: 1 },
});

export default memo(EditorToolbarBase);
