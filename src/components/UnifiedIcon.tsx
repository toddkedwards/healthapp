import React from 'react';
import PixelIcon from './PixelIcon';
import PixelArtIcon from './PixelArtIcon';

interface UnifiedIconProps {
  name: string;
  size?: number;
  color?: string;
  animated?: boolean;
  style?: any;
}

// Icons that should use PixelArtIcon (SVG-based pixel art)
const PIXEL_ART_ICONS = [
  // Exercise types
  'cardio',
  'strength', 
  'flexibility',
  'sports',
  'custom',
  
  // UI Icons
  'close',
  'check',
  'lock',
  'refresh',
  'info',
  'bug',
  'flash',
  'star',
  'coin',
  'heart',
  'moon',
  'fitness',
];

export default function UnifiedIcon({
  name,
  size = 24,
  color,
  animated = false,
  style,
}: UnifiedIconProps) {
  // Use PixelArtIcon for specific icons that have pixel art versions
  if (PIXEL_ART_ICONS.includes(name)) {
    return (
      <PixelArtIcon 
        type={name} 
        size={size} 
        color={color} 
      />
    );
  }
  
  // Fallback to PixelIcon for all other icons (emoji-based)
  return (
    <PixelIcon 
      name={name} 
      size={size} 
      color={color} 
      animated={animated} 
      style={style} 
    />
  );
} 