import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

interface PixelArtIconProps {
  type: string;
  size?: number;
  color?: string;
}

const PixelArtIcon: React.FC<PixelArtIconProps> = ({ type, size = 24, color = '#000' }) => {
  const iconData: { [key: string]: any } = {
    // Exercise types
    cardio: {
      rects: [
        { x: 12, y: 8, width: 8, height: 8 },
        { x: 10, y: 10, width: 12, height: 8 },
        { x: 8, y: 14, width: 16, height: 8 },
        { x: 10, y: 20, width: 12, height: 4 },
      ],
      color: '#e63946'
    },
    strength: {
      rects: [
        { x: 6, y: 14, width: 4, height: 4 },
        { x: 10, y: 15, width: 4, height: 2 },
        { x: 14, y: 15, width: 4, height: 2 },
        { x: 18, y: 15, width: 4, height: 2 },
        { x: 22, y: 14, width: 4, height: 4 },
      ],
      color: '#22223b'
    },
    flexibility: {
      rects: [
        { x: 14, y: 20, width: 4, height: 4 },
        { x: 12, y: 18, width: 8, height: 2 },
        { x: 10, y: 16, width: 12, height: 2 },
        { x: 8, y: 14, width: 16, height: 2 },
        { x: 15, y: 10, width: 2, height: 4 },
      ],
      color: '#a3c4bc'
    },
    sports: {
      rects: [
        { x: 10, y: 10, width: 12, height: 12 },
        { x: 14, y: 14, width: 4, height: 4 },
        { x: 12, y: 12, width: 8, height: 8 },
      ],
      color: '#f9c74f'
    },
    custom: {
      rects: [
        { x: 15, y: 8, width: 2, height: 16 },
        { x: 14, y: 10, width: 4, height: 2 },
        { x: 14, y: 20, width: 4, height: 2 },
        { x: 12, y: 12, width: 8, height: 2 },
        { x: 12, y: 18, width: 8, height: 2 },
      ],
      color: '#22223b'
    },

    // UI Icons
    close: {
      rects: [
        { x: 8, y: 8, width: 2, height: 2 },
        { x: 10, y: 10, width: 2, height: 2 },
        { x: 12, y: 12, width: 2, height: 2 },
        { x: 14, y: 14, width: 2, height: 2 },
        { x: 16, y: 16, width: 2, height: 2 },
        { x: 18, y: 18, width: 2, height: 2 },
        { x: 20, y: 20, width: 2, height: 2 },
        { x: 22, y: 22, width: 2, height: 2 },
        { x: 22, y: 8, width: 2, height: 2 },
        { x: 20, y: 10, width: 2, height: 2 },
        { x: 18, y: 12, width: 2, height: 2 },
        { x: 16, y: 14, width: 2, height: 2 },
        { x: 14, y: 16, width: 2, height: 2 },
        { x: 12, y: 18, width: 2, height: 2 },
        { x: 10, y: 20, width: 2, height: 2 },
        { x: 8, y: 22, width: 2, height: 2 },
      ],
      color: '#ff6b6b'
    },
    check: {
      rects: [
        { x: 8, y: 12, width: 2, height: 2 },
        { x: 10, y: 14, width: 2, height: 2 },
        { x: 12, y: 16, width: 2, height: 2 },
        { x: 14, y: 18, width: 2, height: 2 },
        { x: 16, y: 16, width: 2, height: 2 },
        { x: 18, y: 14, width: 2, height: 2 },
        { x: 20, y: 12, width: 2, height: 2 },
        { x: 22, y: 10, width: 2, height: 2 },
      ],
      color: '#51cf66'
    },
    lock: {
      rects: [
        { x: 12, y: 8, width: 8, height: 4 },
        { x: 14, y: 12, width: 4, height: 12 },
        { x: 10, y: 20, width: 12, height: 4 },
        { x: 12, y: 16, width: 2, height: 2 },
        { x: 18, y: 16, width: 2, height: 2 },
      ],
      color: '#868e96'
    },
    refresh: {
      rects: [
        { x: 8, y: 16, width: 4, height: 4 },
        { x: 12, y: 12, width: 4, height: 4 },
        { x: 16, y: 8, width: 4, height: 4 },
        { x: 20, y: 12, width: 4, height: 4 },
        { x: 16, y: 16, width: 4, height: 4 },
        { x: 12, y: 20, width: 4, height: 4 },
        { x: 8, y: 16, width: 4, height: 4 },
      ],
      color: '#4ecdc4'
    },
    info: {
      rects: [
        { x: 14, y: 8, width: 4, height: 4 },
        { x: 12, y: 12, width: 8, height: 2 },
        { x: 12, y: 16, width: 8, height: 2 },
        { x: 12, y: 20, width: 8, height: 2 },
      ],
      color: '#339af0'
    },
    bug: {
      rects: [
        { x: 12, y: 8, width: 8, height: 4 },
        { x: 10, y: 12, width: 12, height: 2 },
        { x: 8, y: 16, width: 16, height: 2 },
        { x: 10, y: 20, width: 12, height: 4 },
        { x: 14, y: 14, width: 4, height: 4 },
      ],
      color: '#ffd43b'
    },
    flash: {
      rects: [
        { x: 16, y: 8, width: 2, height: 2 },
        { x: 14, y: 10, width: 4, height: 2 },
        { x: 12, y: 12, width: 6, height: 2 },
        { x: 10, y: 14, width: 8, height: 2 },
        { x: 12, y: 16, width: 6, height: 2 },
        { x: 14, y: 18, width: 4, height: 2 },
        { x: 16, y: 20, width: 2, height: 2 },
      ],
      color: '#ffd43b'
    },
    star: {
      rects: [
        { x: 16, y: 8, width: 2, height: 2 },
        { x: 14, y: 10, width: 6, height: 2 },
        { x: 12, y: 12, width: 10, height: 2 },
        { x: 10, y: 14, width: 14, height: 2 },
        { x: 12, y: 16, width: 10, height: 2 },
        { x: 14, y: 18, width: 6, height: 2 },
        { x: 16, y: 20, width: 2, height: 2 },
      ],
      color: '#ffd43b'
    },
    coin: {
      rects: [
        { x: 10, y: 10, width: 12, height: 12 },
        { x: 12, y: 12, width: 8, height: 8 },
        { x: 14, y: 14, width: 4, height: 4 },
      ],
      color: '#ffd43b'
    },
    heart: {
      rects: [
        { x: 12, y: 8, width: 8, height: 8 },
        { x: 10, y: 10, width: 12, height: 8 },
        { x: 8, y: 14, width: 16, height: 8 },
        { x: 10, y: 20, width: 12, height: 4 },
      ],
      color: '#e63946'
    },
    moon: {
      rects: [
        { x: 8, y: 8, width: 16, height: 16 },
        { x: 12, y: 8, width: 12, height: 12 },
      ],
      color: '#868e96'
    },
    fitness: {
      rects: [
        { x: 6, y: 14, width: 4, height: 4 },
        { x: 10, y: 15, width: 4, height: 2 },
        { x: 14, y: 15, width: 4, height: 2 },
        { x: 18, y: 15, width: 4, height: 2 },
        { x: 22, y: 14, width: 4, height: 4 },
      ],
      color: '#4ecdc4'
    },
  };

  const data = iconData[type];
  if (!data) {
    // Fallback to a simple square if icon not found
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x={8} y={8} width={16} height={16} fill={color} />
      </Svg>
    );
  }

  const scale = size / 32; // Original SVG is 32x32

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {data.rects.map((rect: any, index: number) => (
        <Rect
          key={index}
          x={rect.x * scale}
          y={rect.y * scale}
          width={rect.width * scale}
          height={rect.height * scale}
          fill={color || data.color}
        />
      ))}
    </Svg>
  );
};

export default PixelArtIcon; 