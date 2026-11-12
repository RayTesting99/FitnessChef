import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Art } from './Art';
import { DecorItem } from './decor';

/** Scattered background artwork. Render as the first child of a screen; it ignores touches and sits behind content. */
export function Decor({ items, opacity = 0.6 }: { items: DecorItem[]; opacity?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((d, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
            opacity: d.opacity ?? opacity,
            transform: [{ rotate: `${d.rotate ?? 0}deg` }],
          }}
        >
          <Art name={d.name} size={d.size} />
        </View>
      ))}
    </View>
  );
}
