import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { JazaTheme } from '../theme/tokens.js';

type SkeletonProps = {
  theme: JazaTheme;
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Stripe-style pulsing placeholder block.
 */
export function Skeleton({
  theme,
  width = '100%',
  height,
  borderRadius = theme.radius.md,
  style,
}: SkeletonProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const { colors } = theme;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        // Slow, gentle breathing rather than a blink.
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.6, 0.2],
  });

  const styles = StyleSheet.create({
    block: {
      width,
      height,
      borderRadius,
      backgroundColor: colors.skeleton,
      overflow: 'hidden',
    },
  });

  return (
    <View style={[styles.block, style]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.skeletonHighlight, opacity }]}
      />
    </View>
  );
}
