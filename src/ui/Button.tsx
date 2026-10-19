import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  label?: string;
  icon?: IconName;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  color?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  /** Contenu personnalisé (prioritaire sur label/icon). */
  children?: React.ReactNode;
}

const SIZES: Record<Size, { height: number; padH: number; font: number; icon: number }> = {
  sm: { height: 44, padH: 16, font: 14, icon: 18 },
  md: { height: 56, padH: 22, font: 17, icon: 22 },
  lg: { height: 68, padH: 28, font: 20, icon: 26 },
  xl: { height: 84, padH: 34, font: 24, icon: 32 },
};

/** Bouton tactile avec micro-animation de pression (désactivable). */
export function Button({
  label,
  icon,
  onPress,
  variant = 'primary',
  size = 'md',
  color,
  disabled,
  fullWidth,
  style,
  accessibilityLabel,
  children,
}: ButtonProps) {
  const { colors, radius, shadow, reducedMotion } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const dims = SIZES[size];

  const animate = (to: number) => {
    if (reducedMotion) return;
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  };

  const palette: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: color ?? colors.coral, fg: '#FFFFFF' },
    secondary: { bg: color ?? colors.teal, fg: '#FFFFFF' },
    soft: { bg: colors.creamDeep, fg: colors.ink },
    ghost: { bg: 'transparent', fg: colors.ink, border: colors.sand },
    danger: { bg: '#FBEAE8', fg: colors.error, border: '#F3C9C4' },
  };
  const p = palette[variant];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { alignSelf: 'stretch' }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPressIn={() => animate(0.96)}
        onPressOut={() => animate(1)}
        onPress={onPress}
        style={[
          styles.base,
          {
            backgroundColor: p.bg,
            height: dims.height,
            paddingHorizontal: dims.padH,
            borderRadius: radius.pill,
            borderWidth: p.border ? 1.5 : 0,
            borderColor: p.border,
            opacity: disabled ? 0.45 : 1,
          },
          variant !== 'ghost' && shadow.soft,
        ]}
      >
        {children ?? (
          <View style={styles.row}>
            {icon ? <Icon name={icon} size={dims.icon} color={p.fg} /> : null}
            {label ? (
              <Text style={[styles.label, { color: p.fg, fontSize: dims.font }]} numberOfLines={1}>
                {label}
              </Text>
            ) : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** Bouton rond iconographique (retour, écouter, fermer…). */
export function RoundButton({
  icon,
  onPress,
  color,
  size = 52,
  accessibilityLabel,
  variant = 'soft',
}: {
  icon: IconName;
  onPress: () => void;
  color?: string;
  size?: number;
  accessibilityLabel?: string;
  variant?: 'soft' | 'primary' | 'ghost';
}) {
  const { colors, shadow } = useTheme();
  const bg = variant === 'primary' ? colors.coral : variant === 'ghost' ? 'transparent' : '#FFFFFF';
  const fg = color ?? (variant === 'primary' ? '#FFFFFF' : colors.ink);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={10}
      style={[
        styles.round,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          borderWidth: variant === 'soft' ? 1.5 : 0,
          borderColor: colors.sand,
        },
        variant !== 'ghost' && shadow.soft,
      ]}
    >
      <Icon name={icon} size={size * 0.44} color={fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  round: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
