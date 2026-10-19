import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

/**
 * Jeu d'icônes dessinées à la main (aucune police d'icônes à télécharger).
 * Traits ronds, épaisseur généreuse : lisibles par les jeunes enfants.
 */
export type IconName =
  | 'back'
  | 'close'
  | 'star'
  | 'lock'
  | 'check'
  | 'plus'
  | 'chevron'
  | 'play'
  | 'sliders'
  | 'sound'
  | 'soundOff'
  | 'trophy'
  | 'user'
  | 'home'
  | 'refresh'
  | 'eye'
  | 'chart'
  | 'clock'
  | 'info'
  | 'globe'
  | 'trash'
  | 'edit'
  | 'shield'
  | 'sparkles';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
}

export function Icon({ name, size = 24, color = '#33302E', strokeWidth = 2.4, filled }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  const content = () => {
    switch (name) {
      case 'back':
        return <Path d="M15 4.5 L7.5 12 L15 19.5" {...common} />;
      case 'close':
        return <Path d="M6 6 L18 18 M18 6 L6 18" {...common} />;
      case 'star':
        return (
          <Path
            d="M12 2.4 L14.95 9.05 L22.2 9.75 L16.7 14.55 L18.35 21.7 L12 18 L5.65 21.7 L7.3 14.55 L1.8 9.75 L9.05 9.05 Z"
            fill={filled === false ? 'none' : color}
            stroke={color}
            strokeWidth={strokeWidth * 0.7}
            strokeLinejoin="round"
          />
        );
      case 'lock':
        return (
          <>
            <Rect x="4.5" y="10.2" width="15" height="10.8" rx="3" {...common} />
            <Path d="M8.2 10.2 V7.6 a3.8 3.8 0 0 1 7.6 0 V10.2" {...common} />
            <Circle cx="12" cy="15.6" r="1.4" fill={color} />
          </>
        );
      case 'check':
        return <Path d="M4.5 12.4 L9.6 17.6 L19.5 6.4" {...common} />;
      case 'plus':
        return <Path d="M12 5 V19 M5 12 H19" {...common} />;
      case 'chevron':
        return <Path d="M9 4.5 L16.5 12 L9 19.5" {...common} />;
      case 'play':
        return <Path d="M8 4.6 L19.4 12 L8 19.4 Z" fill={color} stroke={color} strokeWidth={strokeWidth * 0.6} strokeLinejoin="round" />;
      case 'sliders':
        return (
          <>
            <Line x1="3.5" y1="7.5" x2="20.5" y2="7.5" {...common} />
            <Line x1="3.5" y1="16.5" x2="20.5" y2="16.5" {...common} />
            <Circle cx="9" cy="7.5" r="2.6" {...common} fill="#FFFFFF" />
            <Circle cx="15.5" cy="16.5" r="2.6" {...common} fill="#FFFFFF" />
          </>
        );
      case 'sound':
        return (
          <>
            <Path d="M4 9.4 H7.8 L12.8 5 V19 L7.8 14.6 H4 Z" fill={color} stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinejoin="round" />
            <Path d="M16.2 8.6 a4.8 4.8 0 0 1 0 6.8" {...common} />
            <Path d="M18.7 6.2 a8.2 8.2 0 0 1 0 11.6" {...common} />
          </>
        );
      case 'soundOff':
        return (
          <>
            <Path d="M4 9.4 H7.8 L12.8 5 V19 L7.8 14.6 H4 Z" fill={color} stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinejoin="round" />
            <Path d="M16.4 9.6 L21 14.4 M21 9.6 L16.4 14.4" {...common} />
          </>
        );
      case 'trophy':
        return (
          <>
            <Path d="M8 3.8 H16 V10 a4 4 0 0 1-8 0 Z" fill={color} stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinejoin="round" />
            <Path d="M8 5.2 H5.2 a2.4 2.4 0 0 0 0 4.8 H7.2 M16 5.2 H18.8 a2.4 2.4 0 0 1 0 4.8 H16.8" {...common} />
            <Path d="M12 14 V17.4 M8.4 20.6 H15.6 M9.6 17.4 H14.4" {...common} />
          </>
        );
      case 'user':
        return (
          <>
            <Circle cx="12" cy="8.2" r="3.9" {...common} />
            <Path d="M4.3 20.6 c0-4.2 3.5-7 7.7-7 s7.7 2.8 7.7 7" {...common} />
          </>
        );
      case 'home':
        return <Path d="M3.8 11 L12 3.8 L20.2 11 V19.4 a1.6 1.6 0 0 1-1.6 1.6 H5.4 a1.6 1.6 0 0 1-1.6-1.6 Z" {...common} />;
      case 'refresh':
        return <Path d="M20 12 a8 8 0 1 1-2.6-5.9 M20 3.8 V10 H13.8" {...common} />;
      case 'eye':
        return (
          <>
            <Path d="M2.2 12 C4.6 7.6 8 5.6 12 5.6 s7.4 2 9.8 6.4 c-2.4 4.4-5.8 6.4-9.8 6.4 s-7.4-2-9.8-6.4 Z" {...common} />
            <Circle cx="12" cy="12" r="2.9" fill={color} />
          </>
        );
      case 'chart':
        return (
          <>
            <Path d="M4 20 H21" {...common} />
            <Path d="M6.5 20 V12.5 M11.5 20 V6.5 M16.5 20 V15.5 M21 20 V9.5" {...common} />
          </>
        );
      case 'clock':
        return (
          <>
            <Circle cx="12" cy="12" r="8.6" {...common} />
            <Path d="M12 7.4 V12.2 L15.4 14.2" {...common} />
          </>
        );
      case 'info':
        return (
          <>
            <Circle cx="12" cy="12" r="8.8" {...common} />
            <Path d="M12 11 V16.4" {...common} />
            <Circle cx="12" cy="7.6" r="1.25" fill={color} />
          </>
        );
      case 'globe':
        return (
          <>
            <Circle cx="12" cy="12" r="8.8" {...common} />
            <Ellipse cx="12" cy="12" rx="4" ry="8.8" {...common} />
            <Path d="M3.4 9.2 H20.6 M3.4 14.8 H20.6" {...common} />
          </>
        );
      case 'trash':
        return (
          <>
            <Path d="M4.6 6.8 H19.4 M9.2 6.8 V4.6 a1 1 0 0 1 1-1 h3.6 a1 1 0 0 1 1 1 v2.2" {...common} />
            <Path d="M6.8 6.8 L7.9 19 a1.6 1.6 0 0 0 1.6 1.4 h5 a1.6 1.6 0 0 0 1.6-1.4 L17.2 6.8" {...common} />
            <Path d="M10.4 10.6 V16.4 M13.6 10.6 V16.4" {...common} />
          </>
        );
      case 'edit':
        return (
          <>
            <Path d="M4 20 L5.2 15.6 L15.8 5 L19 8.2 L8.4 18.8 Z" {...common} />
            <Path d="M13.6 7.2 L16.8 10.4" {...common} />
          </>
        );
      case 'shield':
        return (
          <Path d="M12 3.2 L19.4 6 v6.2 c0 4.3-3 7.5-7.4 8.6 C7.6 19.7 4.6 16.5 4.6 12.2 V6 Z" {...common} />
        );
      case 'sparkles':
        return (
          <>
            <Path d="M12 3.2 L13.6 8.4 L18.8 10 L13.6 11.6 L12 16.8 L10.4 11.6 L5.2 10 L10.4 8.4 Z" fill={color} stroke={color} strokeWidth={strokeWidth * 0.6} strokeLinejoin="round" />
            <Path d="M18.6 15.4 L19.4 18 L22 18.8 L19.4 19.6 L18.6 22.2 L17.8 19.6 L15.2 18.8 L17.8 18 Z" fill={color} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {content()}
    </Svg>
  );
}
