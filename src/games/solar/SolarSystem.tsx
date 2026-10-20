import React from 'react';
import Svg, { Circle, Ellipse, G, Text as SvgText } from 'react-native-svg';

import { PLANETS } from './planets';

interface SolarSystemProps {
  /** Planète entourée d'un cercle (null : aucune). */
  highlight?: string | null;
  /** Affiche le rang sous chaque planète. */
  showNumbers?: boolean;
}

const WIDTH = 340;
const HEIGHT = 120;

/** Rayon visuel : compressé pour que Jupiter reste lisible à côté de Mercure. */
function radiusFor(diameter: number): number {
  return 5 + 11 * Math.sqrt(diameter / 11.2);
}

/** Le Soleil à gauche, puis les huit planètes dans l'ordre, tailles comparables. */
export function SolarSystem({ highlight = null, showNumbers = false }: SolarSystemProps) {
  const step = (WIDTH - 52) / PLANETS.length;
  const cy = 56;
  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} accessible={false}>
      <Circle cx="12" cy={cy} r="30" fill="#F7C948" />
      <Circle cx="12" cy={cy} r="22" fill="#FFE38A" />
      {PLANETS.map((planet, i) => {
        const cx = 50 + step * (i + 0.5);
        const r = radiusFor(planet.diameter);
        return (
          <G key={planet.id}>
            <Circle cx={cx} cy={cy} r={r} fill={planet.color} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
            {planet.id === 'saturn' ? (
              <Ellipse cx={cx} cy={cy} rx={r * 1.7} ry={r * 0.45} fill="none" stroke="#B8932E" strokeWidth="2" />
            ) : null}
            {highlight === planet.id ? (
              <Circle cx={cx} cy={cy} r={r + 7} fill="none" stroke="#EE6C5B" strokeWidth="3" strokeDasharray="5 4" />
            ) : null}
            {showNumbers ? (
              <SvgText x={cx} y={cy + 38} fontSize="14" fontWeight="800" fill="#33302E" textAnchor="middle">
                {planet.order}
              </SvgText>
            ) : null}
          </G>
        );
      })}
    </Svg>
  );
}
