import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as svgs from '../art/svgs';

export type Greeter = 'Bear' | 'Rabbit' | 'Fox';

// Where the (hidden) right shoulder sits in the 120x120 artwork, and the pivot of the 28x100 arm drawing.
const SHOULDER = { x: 80, y: 85 };
const ARM = { w: 28, h: 100, pivotX: 14, pivotY: 50 };

interface Props {
  kind: Greeter;
  size?: number;
  /** Start delay in ms, so a row of animals does not wave in unison. */
  delay?: number;
  /** 1 = relaxed wave, 2 = excited. */
  speed?: number;
}

/** A friendly animal that waves (arm swings from the shoulder) and bobs gently. */
export function WavingAnimal({ kind, size = 100, delay = 0, speed = 1 }: Props) {
  const wave = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    const waveLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wave, { toValue: 1, duration: 380 / speed, easing: ease, useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration: 380 / speed, easing: ease, useNativeDriver: true }),
      ]),
    );
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 700 / speed, easing: ease, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 700 / speed, easing: ease, useNativeDriver: true }),
      ]),
    );
    const timer = setTimeout(() => {
      waveLoop.start();
      bobLoop.start();
    }, delay);
    return () => {
      clearTimeout(timer);
      waveLoop.stop();
      bobLoop.stop();
    };
  }, [wave, bob, delay, speed]);

  const k = size / 120;
  const rotate = wave.interpolate({ inputRange: [0, 1], outputRange: ['26deg', '62deg'] });
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.04] });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY }] }}>
      <SvgXml xml={svgs[`hi${kind}` as const]} width={size} height={size} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.arm,
          {
            left: (SHOULDER.x - ARM.pivotX) * k,
            top: (SHOULDER.y - ARM.pivotY) * k,
            width: ARM.w * k,
            height: ARM.h * k,
            transform: [{ rotate }],
          },
        ]}
      >
        <SvgXml xml={svgs[`arm${kind}` as const]} width={ARM.w * k} height={ARM.h * k} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({ arm: { position: 'absolute' } });
