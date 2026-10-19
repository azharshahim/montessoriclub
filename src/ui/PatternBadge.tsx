import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colorBlindPatterns, type ObjectColor } from '../theme/palette';

/**
 * Symbole distinct par couleur, affiché en mode daltonisme.
 * Le tri ne repose jamais uniquement sur la teinte (WCAG 1.4.1).
 */
export function PatternBadge({ color, size = 22 }: { color: ObjectColor; size?: number }) {
  const pattern = colorBlindPatterns[color];
  if (pattern === 'none') return null;
  const ink = 'rgba(255,255,255,0.92)';

  const stroke = { stroke: ink, strokeWidth: 2.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="0.5" width="23" height="23" rx="8" fill="rgba(35,28,24,0.55)" />
      {pattern === 'dot' ? <Circle cx="12" cy="12" r="4.6" fill={ink} /> : null}
      {pattern === 'stripe' ? (
        <>
          <Path d="M8 6 L16 18" {...stroke} />
          <Path d="M13 6 L21 18" {...stroke} />
          <Path d="M3 6 L11 18" {...stroke} />
        </>
      ) : null}
      {pattern === 'star' ? (
        <Path d="M12 5 L13.9 10.2 L19.4 10.6 L15.1 14 L16.5 19.2 L12 16.2 L7.5 19.2 L8.9 14 L4.6 10.6 L10.1 10.2 Z" fill={ink} />
      ) : null}
      {pattern === 'cross' ? (
        <>
          <Path d="M12 5.5 V18.5" {...stroke} />
          <Path d="M5.5 12 H18.5" {...stroke} />
        </>
      ) : null}
      {pattern === 'wave' ? <Path d="M5 14 Q8 9 11 12 T17 12 T21 10" {...stroke} /> : null}
      {pattern === 'ring' ? <Circle cx="12" cy="12" r="4.8" {...stroke} /> : null}
    </Svg>
  );
}
