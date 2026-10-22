import React from 'react';
import Svg, { Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';

const FILL = '#CFE3FA';
const STROKE = '#2F63A8';

/** Polygone régulier à `sides` côtés, un sommet en haut. */
export function RegularPolygon({ sides, size = 150 }: { sides: number; size?: number }) {
  const points = Array.from({ length: sides })
    .map((_, i) => {
      const angle = (-90 + (i * 360) / sides) * (Math.PI / 180);
      return `${50 + 44 * Math.cos(angle)},${50 + 44 * Math.sin(angle)}`;
    })
    .join(' ');
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Polygon points={points} fill={FILL} stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
    </Svg>
  );
}

interface RectangleFigureProps {
  /** Longueur et largeur en cm. */
  width: number;
  height: number;
  /** Quadrillage de carrés de 1 cm (utile pour compter l'aire). */
  grid?: boolean;
}

/** Rectangle coté (longueurs écrites sur deux côtés), à l'échelle dans un cadre fixe. */
export function RectangleFigure({ width, height, grid = false }: RectangleFigureProps) {
  const unit = Math.min(190 / width, 110 / height);
  const w = width * unit;
  const h = height * unit;
  const x = 40;
  const y = 22;
  return (
    <Svg width={w + 80} height={h + 60} accessible={false}>
      <Rect x={x} y={y} width={w} height={h} fill={FILL} stroke={STROKE} strokeWidth="3" />
      {grid
        ? Array.from({ length: width - 1 }).map((_, i) => (
            <Line key={`v${i}`} x1={x + (i + 1) * unit} y1={y} x2={x + (i + 1) * unit} y2={y + h} stroke={STROKE} strokeWidth="1" opacity="0.5" />
          ))
        : null}
      {grid
        ? Array.from({ length: height - 1 }).map((_, i) => (
            <Line key={`h${i}`} x1={x} y1={y + (i + 1) * unit} x2={x + w} y2={y + (i + 1) * unit} stroke={STROKE} strokeWidth="1" opacity="0.5" />
          ))
        : null}
      <SvgText x={x + w / 2} y={y - 6} fontSize="16" fontWeight="700" fill="#33302E" textAnchor="middle">
        {`${width} cm`}
      </SvgText>
      <SvgText x={x + w + 8} y={y + h / 2 + 5} fontSize="16" fontWeight="700" fill="#33302E" textAnchor="start">
        {`${height} cm`}
      </SvgText>
    </Svg>
  );
}
