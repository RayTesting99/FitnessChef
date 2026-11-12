import React from 'react';
import { SvgXml } from 'react-native-svg';
import * as svgs from './svgs';

export type ArtName = keyof typeof svgs;

interface Props {
  name: ArtName;
  /** Width in px. Height follows the artwork's aspect ratio unless `height` is given. */
  size?: number;
  height?: number;
}

const RATIO: Partial<Record<ArtName, number>> = { owl: 120 / 140, kitchenShelf: 100 / 360 };

export function Art({ name, size = 48, height }: Props) {
  return <SvgXml xml={svgs[name]} width={size} height={height ?? size * (RATIO[name] ?? 1)} />;
}
