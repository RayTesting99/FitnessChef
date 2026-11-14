import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as svgs from '../art/svgs';
import { Greeter } from './WavingAnimal';

// Shoulder positions in the 120x120 artwork and the arm drawing's pivot (see WavingAnimal).
const R_SHOULDER = { x: 80, y: 85 };
const L_SHOULDER = { x: 40, y: 85 };
const ARM = { w: 28, h: 100, pivotX: 14, pivotY: 50 };

// The standing pose has a resting left arm drawn in; remove it so both arms can be raised.
const withoutLeftArm = (xml: string) => xml.replace(/<ellipse cx="36" cy="9[45]" rx="7" ry="13"[^>]*\/>/, '');

interface Props {
  kind: Greeter;
  size?: number;
  /** Start delay in ms, so a row of animals hops one after another (a wave of excitement). */
  delay?: number;
}

/** An excited animal: hops up and down and throws both arms in the air. */
export function ExcitedAnimal({ kind, size = 96, delay = 0 }: Props) {
  const jump = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(jump, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(jump, { toValue: 0, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(200),
      ]),
    );
    const t = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [jump, delay]);

  const k = size / 120;
  const base = useMemo(() => withoutLeftArm(svgs[`hi${kind}` as const]), [kind]);
  const armXml = svgs[`arm${kind}` as const];
  const translateY = jump.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.3] });
  // Arms drop a little on landing and fly up and out at the top of the hop.
  const rightRot = jump.interpolate({ inputRange: [0, 1], outputRange: ['28deg', '62deg'] });
  const leftRot = jump.interpolate({ inputRange: [0, 1], outputRange: ['-28deg', '-62deg'] });

  const armBox = (shoulder: { x: number; y: number }) => ({
    left: (shoulder.x - ARM.pivotX) * k,
    top: (shoulder.y - ARM.pivotY) * k,
    width: ARM.w * k,
    height: ARM.h * k,
  });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY }] }}>
      <SvgXml xml={base} width={size} height={size} />
      <Animated.View pointerEvents="none" style={[styles.arm, armBox(R_SHOULDER), { transform: [{ rotate: rightRot }] }]}>
        <SvgXml xml={armXml} width={ARM.w * k} height={ARM.h * k} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.arm, armBox(L_SHOULDER), { transform: [{ rotate: leftRot }] }]}>
        <Animated.View style={{ transform: [{ scaleX: -1 }] }}>
          <SvgXml xml={armXml} width={ARM.w * k} height={ARM.h * k} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ arm: { position: 'absolute' } });
