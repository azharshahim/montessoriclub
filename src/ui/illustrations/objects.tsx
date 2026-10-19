import React, { useId } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { ObjectColor } from '../../theme/palette';

/**
 * Illustrations d'objets « semi-réalistes douces ».
 * Tout est vectoriel : net sur téléphone, tablette et écran Retina,
 * et aucun téléchargement d'asset nécessaire.
 */

export type ObjectId =
  | 'apple'
  | 'balloon'
  | 'fish'
  | 'cup'
  | 'banana'
  | 'star'
  | 'leaf'
  | 'ball'
  | 'carrot'
  | 'orange'
  | 'grapes'
  | 'flower'
  | 'butterfly'
  | 'icecream'
  | 'cookie'
  | 'bear';

export const OBJECTS: Record<ObjectId, { color: ObjectColor; labelKey: string }> = {
  apple: { color: 'red', labelKey: 'item.apple' },
  balloon: { color: 'red', labelKey: 'item.balloon' },
  fish: { color: 'blue', labelKey: 'item.fish' },
  cup: { color: 'blue', labelKey: 'item.cup' },
  banana: { color: 'yellow', labelKey: 'item.banana' },
  star: { color: 'yellow', labelKey: 'item.star' },
  leaf: { color: 'green', labelKey: 'item.leaf' },
  ball: { color: 'green', labelKey: 'item.ball' },
  carrot: { color: 'orange', labelKey: 'item.carrot' },
  orange: { color: 'orange', labelKey: 'item.orange' },
  grapes: { color: 'purple', labelKey: 'item.grapes' },
  flower: { color: 'purple', labelKey: 'item.flower' },
  butterfly: { color: 'pink', labelKey: 'item.butterfly' },
  icecream: { color: 'pink', labelKey: 'item.icecream' },
  cookie: { color: 'brown', labelKey: 'item.cookie' },
  bear: { color: 'brown', labelKey: 'item.bear' },
};

export const OBJECT_IDS = Object.keys(OBJECTS) as ObjectId[];

function useUid(prefix: string): string {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

interface ArtProps {
  size: number;
  uid: string;
}

function Apple({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${uid}a`} cx="0.35" cy="0.28" r="0.85">
          <Stop offset="0" stopColor="#FF8E7E" />
          <Stop offset="0.55" stopColor="#E8554A" />
          <Stop offset="1" stopColor="#B8382F" />
        </RadialGradient>
        <LinearGradient id={`${uid}b`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8FD9A8" />
          <Stop offset="1" stopColor="#3E9E68" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="50" cy="92" rx="30" ry="5" fill="#8A5B3A" opacity="0.16" />
      <Path
        d="M50 32 C34 22 16 33 18 55 C20 78 38 92 50 86 C62 92 80 78 82 55 C84 33 66 22 50 32 Z"
        fill={`url(#${uid}a)`}
      />
      <Path d="M50 32 C46 24 50 14 58 10" stroke="#6B4A33" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Path d="M58 16 C68 8 82 12 84 22 C74 28 62 26 58 16 Z" fill={`url(#${uid}b)`} />
      <Ellipse cx="34" cy="46" rx="10" ry="15" fill="#FFFFFF" opacity="0.32" transform="rotate(-24 34 46)" />
      <Ellipse cx="40" cy="40" rx="4" ry="6" fill="#FFFFFF" opacity="0.45" transform="rotate(-24 40 40)" />
    </Svg>
  );
}

function Balloon({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${uid}a`} cx="0.34" cy="0.26" r="0.9">
          <Stop offset="0" stopColor="#FF9C8F" />
          <Stop offset="0.5" stopColor="#E8554A" />
          <Stop offset="1" stopColor="#A93229" />
        </RadialGradient>
      </Defs>
      <Path d="M50 68 Q44 82 50 94 Q55 84 52 68" stroke="#B08968" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Path
        d="M50 10 C30 10 20 27 24 42 C28 57 40 64 50 64 C60 64 72 57 76 42 C80 27 70 10 50 10 Z"
        fill={`url(#${uid}a)`}
      />
      <Path d="M46 64 L54 64 L50 70 Z" fill="#A93229" />
      <Ellipse cx="38" cy="28" rx="7" ry="10" fill="#FFFFFF" opacity="0.4" transform="rotate(-25 38 28)" />
      <Ellipse cx="43" cy="24" rx="2.6" ry="4" fill="#FFFFFF" opacity="0.65" transform="rotate(-25 43 24)" />
    </Svg>
  );
}

function Fish({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${uid}a`} x1="0" y1="0.2" x2="0.9" y2="1">
          <Stop offset="0" stopColor="#8EBDFA" />
          <Stop offset="0.5" stopColor="#4E8FE0" />
          <Stop offset="1" stopColor="#2F63A8" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="50" cy="88" rx="30" ry="5" fill="#8A5B3A" opacity="0.14" />
      <Path d="M82 50 L97 33 C99 45 99 55 97 67 Z" fill="#2F63A8" />
      <Path d="M20 50 C32 26 66 24 82 50 C66 76 32 74 20 50 Z" fill={`url(#${uid}a)`} />
      <Path d="M46 29 Q50 14 62 28 Z" fill="#3B79C4" />
      <Path d="M45 70 Q50 80 60 71 Z" fill="#3B79C4" />
      <Circle cx="33" cy="45" r="6.4" fill="#FFFFFF" />
      <Circle cx="34.5" cy="45" r="3.2" fill="#26364D" />
      <Circle cx="35.6" cy="43.8" r="1.1" fill="#FFFFFF" />
      <Path d="M26 58 Q32 61 38 58" stroke="#2F63A8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <G opacity="0.45" stroke="#EAF3FF" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <Path d="M52 36 Q58 44 52 52" />
        <Path d="M63 38 Q69 46 63 54" />
        <Path d="M74 42 Q79 48 74 56" />
      </G>
    </Svg>
  );
}

function Cup({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${uid}a`} x1="0" y1="0" x2="1" y2="0.8">
          <Stop offset="0" stopColor="#8EBDFA" />
          <Stop offset="1" stopColor="#3E78C6" />
        </LinearGradient>
        <LinearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFF6E6" />
          <Stop offset="1" stopColor="#F3DFC2" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="50" cy="92" rx="26" ry="4.5" fill="#8A5B3A" opacity="0.16" />
      <Path d="M63 44 C78 44 82 56 78 63 C74 70 66 70 63 68" stroke="#3E78C6" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Path d="M26 28 L31 86 C31.5 90 35 92 39 92 L61 92 C65 92 68.5 90 69 86 L74 28 Z" fill={`url(#${uid}a)`} />
      <Path d="M30 40 C42 47 58 47 70 40 L71 52 C58 59 42 59 29 52 Z" fill={`url(#${uid}b)`} opacity="0.95" />
      <Ellipse cx="50" cy="28" rx="24" ry="7" fill="#2F63A8" />
      <Ellipse cx="50" cy="27" rx="19" ry="5" fill="#1F4C87" />
      <Ellipse cx="50" cy="27" rx="15" ry="3.4" fill="#C98B5A" />
      <Ellipse cx="35" cy="60" rx="3.4" ry="10" fill="#FFFFFF" opacity="0.28" transform="rotate(-4 35 60)" />
    </Svg>
  );
}

function Banana({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${uid}a`} x1="0.1" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#FFE38A" />
          <Stop offset="0.55" stopColor="#F5C33B" />
          <Stop offset="1" stopColor="#D9A21E" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="50" cy="90" rx="30" ry="5" fill="#8A5B3A" opacity="0.14" />
      <Path
        d="M24 18 C18 46 30 76 58 84 C74 89 88 82 88 72 C88 66 82 63 76 68 C60 80 40 66 40 44 C40 32 36 20 28 16 Z"
        fill={`url(#${uid}a)`}
      />
      <Path d="M24 18 C23 24 23 30 24 34 C29 26 30 20 28 16 Z" fill="#8C6B24" />
      <Path d="M84 73 C84 78 85 81 88 77 C89 75 88 72 86 71 Z" fill="#8C6B24" />
      <Path d="M34 30 C44 52 58 66 74 70" stroke="#FFFFFF" strokeWidth="4" opacity="0.4" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function StarObject({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${uid}a`} cx="0.4" cy="0.3" r="0.85">
          <Stop offset="0" stopColor="#FFE9A3" />
          <Stop offset="0.55" stopColor="#F5C33B" />
          <Stop offset="1" stopColor="#D9A11B" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="50" cy="93" rx="26" ry="4.5" fill="#8A5B3A" opacity="0.14" />
      <Path
        d="M50 8 L61 36 L91 39 L68 59 L75 89 L50 73 L25 89 L32 59 L9 39 L39 36 Z"
        fill={`url(#${uid}a)`}
        stroke="#D9A11B"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <Path d="M50 18 L56 36 L40 42 L44 30 Z" fill="#FFFFFF" opacity="0.35" />
      <Circle cx="34" cy="46" r="2.6" fill="#FFFFFF" opacity="0.4" />
    </Svg>
  );
}

function Leaf({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${uid}a`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#9BE8BF" />
          <Stop offset="0.55" stopColor="#4FBF8B" />
          <Stop offset="1" stopColor="#2D8C62" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="50" cy="92" rx="26" ry="4.5" fill="#8A5B3A" opacity="0.14" />
      <Path d="M50 90 C18 72 16 30 50 10 C84 30 82 72 50 90 Z" fill={`url(#${uid}a)`} />
      <Path d="M50 88 L50 20" stroke="#2D8C62" strokeWidth="2.6" strokeLinecap="round" />
      <G stroke="#2D8C62" strokeWidth="2" strokeLinecap="round" opacity="0.7">
        <Path d="M50 34 L36 26" />
        <Path d="M50 34 L64 26" />
        <Path d="M50 50 L33 42" />
        <Path d="M50 50 L67 42" />
        <Path d="M50 66 L38 60" />
        <Path d="M50 66 L62 60" />
      </G>
      <Path d="M50 12 C40 22 34 34 32 44 C40 34 46 24 50 12 Z" fill="#FFFFFF" opacity="0.28" />
    </Svg>
  );
}

function Ball({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${uid}a`} cx="0.35" cy="0.3" r="0.85">
          <Stop offset="0" stopColor="#96E5BE" />
          <Stop offset="0.6" stopColor="#4FBF8B" />
          <Stop offset="1" stopColor="#2D8C62" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="50" cy="91" rx="30" ry="5" fill="#8A5B3A" opacity="0.15" />
      <Circle cx="50" cy="50" r="40" fill={`url(#${uid}a)`} />
      <Path d="M14 38 Q50 54 86 38" stroke="#FFF6E6" strokeWidth="7" fill="none" />
      <Path d="M18 64 Q50 78 82 64" stroke="#FFF6E6" strokeWidth="7" fill="none" />
      <Path d="M50 10 Q50 50 50 90" stroke="#FFF6E6" strokeWidth="7" fill="none" opacity="0.9" />
      <Ellipse cx="34" cy="28" rx="8" ry="6" fill="#FFFFFF" opacity="0.38" transform="rotate(-25 34 28)" />
    </Svg>
  );
}

function Carrot({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${uid}a`} x1="0" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor="#FFC182" />
          <Stop offset="0.55" stopColor="#F5943C" />
          <Stop offset="1" stopColor="#C46A19" />
        </LinearGradient>
        <LinearGradient id={`${uid}b`} x1="0" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#8FD9A8" />
          <Stop offset="1" stopColor="#379063" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="50" cy="94" rx="22" ry="4" fill="#8A5B3A" opacity="0.14" />
      <Path d="M42 24 C50 10 40 4 34 8 C40 12 42 18 42 24 Z" fill={`url(#${uid}b)`} />
      <Path d="M50 22 C58 8 50 2 44 6 C50 12 50 16 50 22 Z" fill={`url(#${uid}b)`} />
      <Path d="M56 24 C66 12 60 4 54 8 C58 14 58 18 56 24 Z" fill={`url(#${uid}b)`} opacity="0.9" />
      <Path d="M50 92 C36 66 32 40 42 26 C46 20 54 20 58 26 C68 40 64 66 50 92 Z" fill={`url(#${uid}a)`} />
      <G stroke="#C46A19" strokeWidth="2" strokeLinecap="round" opacity="0.6">
        <Path d="M34 52 L44 50" />
        <Path d="M38 68 L49 65" />
        <Path d="M60 46 L68 48" />
        <Path d="M54 62 L64 64" />
      </G>
      <Path d="M44 34 C42 48 44 60 48 70" stroke="#FFFFFF" strokeWidth="3" opacity="0.35" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function OrangeFruit({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${uid}a`} cx="0.35" cy="0.3" r="0.85">
          <Stop offset="0" stopColor="#FFD0A0" />
          <Stop offset="0.55" stopColor="#F5943C" />
          <Stop offset="1" stopColor="#C26A18" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="50" cy="91" rx="30" ry="5" fill="#8A5B3A" opacity="0.14" />
      <Circle cx="50" cy="54" r="36" fill={`url(#${uid}a)`} />
      <Ellipse cx="50" cy="20" rx="6" ry="5" fill="#E08A2E" />
      <Path d="M50 20 C56 10 70 8 74 14 C68 22 56 24 50 20 Z" fill="#4FBF8B" />
      <G fill="#C26A18" opacity="0.35">
        <Circle cx="36" cy="44" r="1.6" />
        <Circle cx="62" cy="40" r="1.6" />
        <Circle cx="48" cy="62" r="1.6" />
        <Circle cx="68" cy="66" r="1.6" />
        <Circle cx="30" cy="66" r="1.6" />
      </G>
      <Ellipse cx="34" cy="36" rx="9" ry="7" fill="#FFFFFF" opacity="0.32" transform="rotate(-30 34 36)" />
    </Svg>
  );
}

function Grapes({ size, uid }: ArtProps) {
  const grape = (cx: number, cy: number, r: number) => (
    <Circle cx={cx} cy={cy} r={r} fill={`url(#${uid}a)`} stroke="#6F51AE" strokeWidth="1" />
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${uid}a`} cx="0.35" cy="0.3" r="0.8">
          <Stop offset="0" stopColor="#CDB4FF" />
          <Stop offset="0.55" stopColor="#9C7BE0" />
          <Stop offset="1" stopColor="#6F51AE" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="50" cy="94" rx="24" ry="4" fill="#8A5B3A" opacity="0.14" />
      <Path d="M50 22 C50 12 54 6 62 4" stroke="#7A5A3A" strokeWidth="4" strokeLinecap="round" fill="none" />
      <Path d="M62 10 C74 4 86 10 84 20 C74 24 64 20 62 10 Z" fill="#4FBF8B" />
      {grape(38, 34, 10)}
      {grape(62, 34, 10)}
      {grape(50, 46, 10.5)}
      {grape(30, 50, 9.5)}
      {grape(70, 50, 9.5)}
      {grape(42, 60, 10)}
      {grape(58, 60, 10)}
      {grape(50, 74, 10)}
      <G fill="#FFFFFF" opacity="0.4">
        <Circle cx="34" cy="30" r="2.6" />
        <Circle cx="58" cy="30" r="2.6" />
        <Circle cx="46" cy="42" r="2.8" />
        <Circle cx="46" cy="70" r="2.6" />
      </G>
    </Svg>
  );
}

function Flower({ size, uid }: ArtProps) {
  const petal = (deg: number) => (
    <Ellipse
      key={deg}
      cx="50"
      cy="30"
      rx="13"
      ry="19"
      fill={`url(#${uid}a)`}
      transform={`rotate(${deg} 50 48)`}
      opacity="0.96"
    />
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${uid}a`} x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor="#CDB4FF" />
          <Stop offset="0.6" stopColor="#9C7BE0" />
          <Stop offset="1" stopColor="#7455B8" />
        </LinearGradient>
      </Defs>
      <Path d="M50 66 L50 94" stroke="#3E9E68" strokeWidth="5" strokeLinecap="round" />
      <Path d="M50 82 C40 78 32 82 28 90 C38 92 46 90 50 82 Z" fill="#4FBF8B" />
      <Path d="M50 74 C60 70 68 74 72 82 C62 84 54 82 50 74 Z" fill="#4FBF8B" />
      {[0, 60, 120, 180, 240, 300].map(petal)}
      <Circle cx="50" cy="48" r="13" fill="#F5C33B" />
      <Circle cx="46" cy="44" r="4" fill="#FFE9A3" />
    </Svg>
  );
}

function Butterfly({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${uid}a`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFC1D5" />
          <Stop offset="0.6" stopColor="#EE8FB1" />
          <Stop offset="1" stopColor="#C25B80" />
        </LinearGradient>
      </Defs>
      <G>
        <Ellipse cx="31" cy="38" rx="20" ry="24" fill={`url(#${uid}a)`} transform="rotate(-22 31 38)" />
        <Ellipse cx="69" cy="38" rx="20" ry="24" fill={`url(#${uid}a)`} transform="rotate(22 69 38)" />
        <Ellipse cx="34" cy="66" rx="16" ry="18" fill={`url(#${uid}a)`} transform="rotate(18 34 66)" opacity="0.95" />
        <Ellipse cx="66" cy="66" rx="16" ry="18" fill={`url(#${uid}a)`} transform="rotate(-18 66 66)" opacity="0.95" />
        <Circle cx="30" cy="36" r="5" fill="#FFF3F7" opacity="0.7" />
        <Circle cx="70" cy="36" r="5" fill="#FFF3F7" opacity="0.7" />
        <Circle cx="36" cy="68" r="3.4" fill="#FFF3F7" opacity="0.6" />
        <Circle cx="64" cy="68" r="3.4" fill="#FFF3F7" opacity="0.6" />
      </G>
      <Ellipse cx="50" cy="52" rx="5" ry="26" fill="#5B3A32" />
      <Circle cx="50" cy="24" r="7" fill="#5B3A32" />
      <Path d="M50 18 C44 8 38 6 34 8" stroke="#5B3A32" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <Path d="M50 18 C56 8 62 6 66 8" stroke="#5B3A32" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <Circle cx="34" cy="8" r="2.6" fill="#5B3A32" />
      <Circle cx="66" cy="8" r="2.6" fill="#5B3A32" />
    </Svg>
  );
}

function IceCream({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`${uid}a`} x1="0" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor="#FFC1D5" />
          <Stop offset="0.6" stopColor="#EE8FB1" />
          <Stop offset="1" stopColor="#C25B80" />
        </LinearGradient>
        <LinearGradient id={`${uid}b`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E8B77E" />
          <Stop offset="1" stopColor="#B9803F" />
        </LinearGradient>
      </Defs>
      <Path d="M32 56 L68 56 L52 94 C51 97 49 97 48 94 Z" fill={`url(#${uid}b)`} />
      <G stroke="#8E5F2B" strokeWidth="2" opacity="0.6">
        <Path d="M34 62 L62 88" />
        <Path d="M40 58 L64 80" />
        <Path d="M36 74 L52 92" />
        <Path d="M66 66 L52 90" />
      </G>
      <Circle cx="50" cy="42" r="24" fill={`url(#${uid}a)`} />
      <Path d="M28 46 C34 52 66 52 72 46 C70 56 30 56 28 46 Z" fill="#F7A6C0" opacity="0.7" />
      <Path d="M38 30 C42 22 52 20 58 26" stroke="#FFFFFF" strokeWidth="4" opacity="0.4" strokeLinecap="round" fill="none" />
      <Circle cx="58" cy="24" r="6" fill="#E8554A" />
      <Path d="M58 18 C60 14 64 14 66 16" stroke="#3E9E68" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <G fill="#FFF3F7" opacity="0.65">
        <Circle cx="38" cy="46" r="1.8" />
        <Circle cx="62" cy="50" r="1.8" />
        <Circle cx="50" cy="34" r="1.8" />
      </G>
    </Svg>
  );
}

function Cookie({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${uid}a`} cx="0.35" cy="0.3" r="0.85">
          <Stop offset="0" stopColor="#D3AC93" />
          <Stop offset="0.6" stopColor="#A5765A" />
          <Stop offset="1" stopColor="#7B543E" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="50" cy="90" rx="32" ry="5" fill="#8A5B3A" opacity="0.15" />
      <Path
        d="M50 14 C70 14 86 30 86 50 C86 70 70 86 50 86 C30 86 14 70 14 50 C14 30 30 14 50 14 Z"
        fill={`url(#${uid}a)`}
      />
      <G fill="#4A3026">
        <Circle cx="36" cy="38" r="5.5" />
        <Circle cx="60" cy="32" r="4.6" />
        <Circle cx="68" cy="56" r="5.8" />
        <Circle cx="42" cy="60" r="5" />
        <Circle cx="52" cy="74" r="4.2" />
        <Circle cx="28" cy="54" r="3.6" />
      </G>
      <G fill="#FFFFFF" opacity="0.25">
        <Circle cx="33" cy="34" r="1.6" />
        <Circle cx="65" cy="52" r="1.6" />
        <Circle cx="39" cy="56" r="1.4" />
      </G>
    </Svg>
  );
}

function Bear({ size, uid }: ArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={`${uid}a`} cx="0.35" cy="0.3" r="0.85">
          <Stop offset="0" stopColor="#D3AC93" />
          <Stop offset="0.6" stopColor="#A5765A" />
          <Stop offset="1" stopColor="#7B543E" />
        </RadialGradient>
        <LinearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFEBD6" />
          <Stop offset="1" stopColor="#EFCFAF" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="50" cy="93" rx="28" ry="4.5" fill="#8A5B3A" opacity="0.14" />
      <Circle cx="28" cy="30" r="12" fill={`url(#${uid}a)`} />
      <Circle cx="72" cy="30" r="12" fill={`url(#${uid}a)`} />
      <Circle cx="28" cy="30" r="6.4" fill={`url(#${uid}b)`} />
      <Circle cx="72" cy="30" r="6.4" fill={`url(#${uid}b)`} />
      <Circle cx="50" cy="54" r="34" fill={`url(#${uid}a)`} />
      <Ellipse cx="50" cy="64" rx="17" ry="13" fill={`url(#${uid}b)`} />
      <Circle cx="38" cy="46" r="4.2" fill="#3B2A22" />
      <Circle cx="62" cy="46" r="4.2" fill="#3B2A22" />
      <Circle cx="39.4" cy="44.6" r="1.3" fill="#FFFFFF" />
      <Circle cx="63.4" cy="44.6" r="1.3" fill="#FFFFFF" />
      <Ellipse cx="50" cy="59" rx="6" ry="4.4" fill="#4A3026" />
      <Path d="M50 63 L50 68" stroke="#4A3026" strokeWidth="2.4" strokeLinecap="round" />
      <Path d="M44 69 Q50 73 56 69" stroke="#4A3026" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <Ellipse cx="24" cy="58" rx="6" ry="4" fill="#E88C7C" opacity="0.5" />
      <Ellipse cx="76" cy="58" rx="6" ry="4" fill="#E88C7C" opacity="0.5" />
    </Svg>
  );
}

const ART: Record<ObjectId, React.ComponentType<ArtProps>> = {
  apple: Apple,
  balloon: Balloon,
  fish: Fish,
  cup: Cup,
  banana: Banana,
  star: StarObject,
  leaf: Leaf,
  ball: Ball,
  carrot: Carrot,
  orange: OrangeFruit,
  grapes: Grapes,
  flower: Flower,
  butterfly: Butterfly,
  icecream: IceCream,
  cookie: Cookie,
  bear: Bear,
};

export function ObjectIllustration({ id, size = 96 }: { id: ObjectId; size?: number }) {
  const uid = useUid('o');
  const Art = ART[id];
  return <Art size={size} uid={uid} />;
}
