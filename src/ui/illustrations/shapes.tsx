import React, { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/** Les 8 formes du module 3-5 ans (progressives : 4 au niveau 1, 8 au niveau 5). */
export type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle' | 'star' | 'hexagon' | 'oval' | 'heart';

export const SHAPES: ShapeId[] = ['circle', 'square', 'triangle', 'rectangle', 'star', 'hexagon', 'oval', 'heart'];

export const SHAPE_LABEL_KEYS: Record<ShapeId, string> = {
  circle: 'shape.circle',
  square: 'shape.square',
  triangle: 'shape.triangle',
  rectangle: 'shape.rectangle',
  star: 'shape.star',
  hexagon: 'shape.hexagon',
  oval: 'shape.oval',
  heart: 'shape.heart',
};

/** Étoile à 5 branches sur un carré de 100. */
const STAR_PATH =
  'M50 10 L61 37 L90 40 L67 59 L74 88 L50 73 L26 88 L33 59 L10 40 L39 37 Z';
const HEART_PATH =
  'M50 88 C22 68 10 48 19 33 C28 18 44 21 50 36 C56 21 72 18 81 33 C90 48 78 68 50 88 Z';

function ShapeGeometry({ shape, ...props }: { shape: ShapeId } & React.ComponentProps<typeof Path>) {
  switch (shape) {
    case 'circle':
      return <Circle cx="50" cy="50" r="40" {...(props as object)} />;
    case 'square':
      return <Rect x="12" y="12" width="76" height="76" rx="10" {...(props as object)} />;
    case 'triangle':
      return <Path d="M50 8 L92 86 L8 86 Z" {...props} />;
    case 'rectangle':
      return <Rect x="6" y="26" width="88" height="48" rx="9" {...(props as object)} />;
    case 'star':
      return <Path d={STAR_PATH} {...props} />;
    case 'hexagon':
      return <Path d="M50 6 L88 28 L88 72 L50 94 L12 72 L12 28 Z" {...props} />;
    case 'oval':
      return <Ellipse cx="50" cy="50" rx="43" ry="31" {...(props as object)} />;
    case 'heart':
      return <Path d={HEART_PATH} {...props} />;
    default:
      return null;
  }
}

interface ShapeSVGProps {
  shape: ShapeId;
  size?: number;
  /** Couleur principale (dégradé du clair vers le profond). */
  fill: string;
  fillDeep: string;
  stroke?: string;
  strokeWidth?: number;
  /** Contour pointillé pour un emplacement vide. */
  dashed?: boolean;
  opacity?: number;
  /** Petit reflet « verre » pour l'effet 3D doux. */
  glossy?: boolean;
}

export function ShapeSVG({
  shape,
  size = 96,
  fill,
  fillDeep,
  stroke,
  strokeWidth = 2,
  dashed,
  opacity = 1,
  glossy = false,
}: ShapeSVGProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradientId = `sh${rawId}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={opacity}>
      <Defs>
        <LinearGradient id={gradientId} x1="0.15" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={fill} />
          <Stop offset="1" stopColor={fillDeep} />
        </LinearGradient>
      </Defs>
      <ShapeGeometry
        shape={shape}
        fill={dashed ? 'none' : `url(#${gradientId})`}
        stroke={stroke ?? fillDeep}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '7 6' : undefined}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {glossy && !dashed ? (
        <G>
          <Ellipse cx="36" cy="32" rx="15" ry="9" fill="#FFFFFF" opacity={0.42} transform="rotate(-28 36 32)" />
          <Circle cx="58" cy="26" r="3" fill="#FFFFFF" opacity={0.5} />
        </G>
      ) : null}
    </Svg>
  );
}
