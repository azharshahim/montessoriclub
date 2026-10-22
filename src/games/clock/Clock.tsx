import React from 'react';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

interface ClockProps {
  hour: number;
  minute: number;
  size?: number;
}

/** Position d'un point à `length` du centre, pour un angle en degrés (0° = midi). */
function polar(angle: number, length: number): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return { x: 50 + length * Math.sin(radians), y: 50 - length * Math.cos(radians) };
}

/**
 * Horloge analogique : cadran, 12 chiffres, graduations des minutes,
 * petite aiguille (heures) courte et épaisse, grande aiguille (minutes) fine.
 */
export function Clock({ hour, minute, size = 190 }: ClockProps) {
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;
  const hourTip = polar(hourAngle, 22);
  const minuteTip = polar(minuteAngle, 34);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessible={false}>
      <Circle cx="50" cy="50" r="47" fill="#FFFFFF" stroke="#C58549" strokeWidth="4" />
      {Array.from({ length: 60 }).map((_, i) => {
        const outer = polar(i * 6, 44);
        const inner = polar(i * 6, i % 5 === 0 ? 40 : 42);
        return (
          <Line
            key={i}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke={i % 5 === 0 ? '#33302E' : '#A79A90'}
            strokeWidth={i % 5 === 0 ? 1.4 : 0.6}
          />
        );
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const number = i === 0 ? 12 : i;
        const point = polar(i * 30, 32);
        return (
          <SvgText
            key={number}
            x={point.x}
            y={point.y + 3.4}
            fontSize="9.5"
            fontWeight="700"
            fill="#33302E"
            textAnchor="middle"
          >
            {number}
          </SvgText>
        );
      })}
      <Line x1="50" y1="50" x2={hourTip.x} y2={hourTip.y} stroke="#E8554A" strokeWidth="4.2" strokeLinecap="round" />
      <Line x1="50" y1="50" x2={minuteTip.x} y2={minuteTip.y} stroke="#2F63A8" strokeWidth="2.4" strokeLinecap="round" />
      <Circle cx="50" cy="50" r="3" fill="#33302E" />
    </Svg>
  );
}
