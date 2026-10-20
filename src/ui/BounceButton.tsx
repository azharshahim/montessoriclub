import React, { useRef } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

interface BounceButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Grande zone tactile qui « rebondit » quand l'enfant la touche.
 * Le rebond est supprimé si l'option « animations réduites » est active.
 */
export function BounceButton({ onPress, accessibilityLabel, children, style }: BounceButtonProps) {
  const { reducedMotion } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!reducedMotion) {
      scale.setValue(0.9);
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 140, useNativeDriver: true }).start();
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
