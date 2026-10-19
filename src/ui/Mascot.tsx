import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '../theme';

export type MascotMood = 'idle' | 'happy' | 'thinking';

interface MascotProps {
  size?: number;
  mood?: MascotMood;
  speaking?: boolean;
}

/**
 * Nino, le renard guide.
 * Illustration vectorielle « 3D douce » : dégradés, reflets, ombre portée.
 * Animations : respiration légère + clignements + bouche qui parle.
 */
export function Mascot({ size = 140, mood = 'idle', speaking = false }: MascotProps) {
  const { reducedMotion } = useTheme();
  const bob = useRef(new Animated.Value(0)).current;
  const [eyesClosed, setEyesClosed] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  // Respiration : translation verticale très douce.
  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, reducedMotion]);

  // Clignements aléatoires.
  useEffect(() => {
    if (reducedMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    const blink = () => {
      setEyesClosed(true);
      setTimeout(() => setEyesClosed(false), 130);
      timer = setTimeout(blink, 2600 + Math.random() * 2600);
    };
    timer = setTimeout(blink, 2200);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // Bouche animée pendant la parole.
  useEffect(() => {
    if (!speaking) {
      setMouthOpen(false);
      return;
    }
    const id = setInterval(() => setMouthOpen((v) => !v), 160);
    return () => clearInterval(id);
  }, [speaking]);

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const happy = mood === 'happy';

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY }] }}>
      <Svg width={size} height={size} viewBox="0 0 220 220">
        <Defs>
          <LinearGradient id="nino-body" x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor="#FFB27A" />
            <Stop offset="0.55" stopColor="#F58B4E" />
            <Stop offset="1" stopColor="#E06A34" />
          </LinearGradient>
          <RadialGradient id="nino-head" cx="0.35" cy="0.28" r="0.85">
            <Stop offset="0" stopColor="#FFC392" />
            <Stop offset="0.5" stopColor="#F79355" />
            <Stop offset="1" stopColor="#E06A34" />
          </RadialGradient>
          <LinearGradient id="nino-belly" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFF8EC" />
            <Stop offset="1" stopColor="#FFE6C9" />
          </LinearGradient>
          <RadialGradient id="nino-eye" cx="0.35" cy="0.3" r="0.8">
            <Stop offset="0" stopColor="#6B4A3A" />
            <Stop offset="1" stopColor="#2E1D16" />
          </RadialGradient>
        </Defs>

        {/* Ombre au sol */}
        <Ellipse cx="110" cy="208" rx="58" ry="9" fill="#8A5B3A" opacity="0.18" />

        {/* Queue */}
        <Path
          d="M152 178 C196 186 210 148 190 122 C198 152 172 158 154 152 Z"
          fill="url(#nino-body)"
          stroke="#D8602C"
          strokeWidth="1.5"
        />
        <Path d="M190 122 C196 136 193 148 186 154 C190 142 188 132 184 126 Z" fill="#FFF3E0" />

        {/* Pattes */}
        <Ellipse cx="86" cy="198" rx="19" ry="9.5" fill="#D8602C" />
        <Ellipse cx="134" cy="198" rx="19" ry="9.5" fill="#D8602C" />
        <Ellipse cx="86" cy="196" rx="13" ry="5.5" fill="#FFD9B8" opacity="0.7" />
        <Ellipse cx="134" cy="196" rx="13" ry="5.5" fill="#FFD9B8" opacity="0.7" />

        {/* Corps */}
        <Ellipse cx="110" cy="166" rx="55" ry="41" fill="url(#nino-body)" />
        <Ellipse cx="110" cy="174" rx="36" ry="27" fill="url(#nino-belly)" />
        {/* Bras */}
        <Ellipse cx="62" cy="168" rx="13" ry="17" fill="#F58B4E" transform="rotate(-16 62 168)" />
        <Ellipse cx="158" cy="168" rx="13" ry="17" fill="#F58B4E" transform="rotate(16 158 168)" />

        {/* Oreilles */}
        <Path d="M60 84 L64 24 L101 62 Z" fill="url(#nino-body)" stroke="#D8602C" strokeWidth="2" strokeLinejoin="round" />
        <Path d="M69 76 L71 40 L92 62 Z" fill="#FFD9C0" />
        <Path d="M160 84 L156 24 L119 62 Z" fill="url(#nino-body)" stroke="#D8602C" strokeWidth="2" strokeLinejoin="round" />
        <Path d="M151 76 L149 40 L128 62 Z" fill="#FFD9C0" />

        {/* Tête */}
        <Ellipse cx="110" cy="99" rx="63" ry="55" fill="url(#nino-head)" />
        {/* Mèche */}
        <Path d="M101 47 C106 34 116 34 121 47 C115 43 108 43 101 47 Z" fill="#E06A34" />

        {/* Museau */}
        <Ellipse cx="110" cy="121" rx="35" ry="25" fill="url(#nino-belly)" />
        {/* Joues */}
        <Ellipse cx="62" cy="113" rx="11" ry="7" fill="#F7837B" opacity="0.55" />
        <Ellipse cx="158" cy="113" rx="11" ry="7" fill="#F7837B" opacity="0.55" />

        {/* Yeux */}
        {eyesClosed ? (
          <>
            <Path d="M78 92 Q88 99 98 92" stroke="#3B2A22" strokeWidth="4" strokeLinecap="round" fill="none" />
            <Path d="M122 92 Q132 99 142 92" stroke="#3B2A22" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        ) : happy ? (
          <>
            <Path d="M78 94 Q88 82 98 94" stroke="#3B2A22" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <Path d="M122 94 Q132 82 142 94" stroke="#3B2A22" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <Ellipse cx="88" cy="90" rx="9" ry="10.5" fill="url(#nino-eye)" />
            <Circle cx="91.5" cy="86" r="3.2" fill="#FFFFFF" opacity="0.95" />
            <Ellipse cx="132" cy="90" rx="9" ry="10.5" fill="url(#nino-eye)" />
            <Circle cx="135.5" cy="86" r="3.2" fill="#FFFFFF" opacity="0.95" />
          </>
        )}

        {/* Nez */}
        <Path d="M102 108 Q110 103.5 118 108 Q116.5 119.5 110 121 Q103.5 119.5 102 108 Z" fill="#43291F" />
        <Ellipse cx="107" cy="110" rx="2.6" ry="1.6" fill="#FFFFFF" opacity="0.35" />

        {/* Bouche */}
        {speaking && mouthOpen ? (
          <Ellipse cx="110" cy="134" rx="7.5" ry="6" fill="#7A3B2E" />
        ) : happy ? (
          <Path d="M96 130 Q110 144 124 130" stroke="#43291F" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        ) : (
          <Path d="M100 133 Q110 139 120 133" stroke="#43291F" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        )}

        {/* Reflet de tête */}
        <Ellipse cx="82" cy="70" rx="17" ry="10" fill="#FFFFFF" opacity="0.28" transform="rotate(-22 82 70)" />
      </Svg>
    </Animated.View>
  );
}
