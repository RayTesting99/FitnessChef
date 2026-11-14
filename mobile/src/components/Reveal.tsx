import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/** Fades and slides its child up when it first appears. Use `index` to stagger a list. */
export function Reveal({ index = 0, children }: { index?: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration: 420, delay: 120 + index * 130, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [v, index]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}
