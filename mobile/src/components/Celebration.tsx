import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Art } from '../art/Art';

const COLORS = ['#E8833A', '#F2B84B', '#6B8E4E', '#D9482B', '#4F7C74', '#C98B4B'];
// Fixed layout (x as a fraction of the width, fall delay and speed) so the confetti looks the same every time.
const PIECES = [
  { x: 0.04, d: 0, t: 2100 }, { x: 0.14, d: 700, t: 2500 }, { x: 0.24, d: 300, t: 1900 }, { x: 0.34, d: 1100, t: 2300 },
  { x: 0.44, d: 200, t: 2600 }, { x: 0.54, d: 900, t: 2000 }, { x: 0.64, d: 500, t: 2400 }, { x: 0.74, d: 1300, t: 2200 },
  { x: 0.84, d: 100, t: 2700 }, { x: 0.94, d: 800, t: 2000 },
];

function ConfettiPiece({ x, d, t, color, width, height }: { x: number; d: number; t: number; color: string; width: number; height: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: t, easing: Easing.linear, useNativeDriver: true }));
    const timer = setTimeout(() => loop.start(), d);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [v, d, t]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x * width,
        top: -14,
        width: 8,
        height: 12,
        borderRadius: 2,
        backgroundColor: color,
        opacity: v.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, height] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] }) },
        ],
      }}
    />
  );
}

function Twinkle({ left, top, size, delay }: { left: number; top: number; size: number; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 520, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 520, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    const t = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [v, delay]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
        transform: [
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.25] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] }) },
        ],
      }}
    >
      <Art name="star" size={size} />
    </Animated.View>
  );
}

/** Falling confetti and twinkling stars drawn behind/around the excited animals. Ignores touches. */
export function Celebration({ width, height }: { width: number; height: number }) {
  return (
    <View pointerEvents="none" style={[styles.box, { width, height }]}>
      {PIECES.map((p, i) => (
        <ConfettiPiece key={i} x={p.x} d={p.d} t={p.t} color={COLORS[i % COLORS.length]} width={width} height={height} />
      ))}
      <Twinkle left={4} top={6} size={28} delay={0} />
      <Twinkle left={width - 36} top={0} size={32} delay={260} />
      <Twinkle left={width / 2 - 14} top={-8} size={24} delay={520} />
    </View>
  );
}

const styles = StyleSheet.create({ box: { position: 'absolute', left: 0, top: 0 } });
