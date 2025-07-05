import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface PixelArtIconProps {
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'custom';
  size?: number;
  color?: string;
}

const PixelArtIcon: React.FC<PixelArtIconProps> = ({ type, size = 24, color = '#000' }) => {
  const iconData = {
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
    }
  };

  const data = iconData[type];
  const scale = size / 32; // Original SVG is 32x32

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {data.rects.map((rect, index) => (
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