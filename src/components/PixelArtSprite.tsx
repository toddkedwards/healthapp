import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PixelArtSprite } from '../assets/pixelArtAssets';

interface PixelArtSpriteProps {
  sprite: PixelArtSprite;
  size?: number;
  animated?: boolean;
  glow?: boolean;
  pulse?: boolean;
  style?: any;
  onPress?: () => void;
}

export default function PixelArtSpriteComponent({
  sprite,
  size = 48,
  animated = false,
  glow = false,
  pulse = false,
  style,
  onPress,
}: PixelArtSpriteProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Create floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated]);

  useEffect(() => {
    if (glow) {
      // Create glowing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [glow]);

  useEffect(() => {
    if (pulse) {
      // Create pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulse]);

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return '#1eff00';
      case 'uncommon': return '#0070dd';
      case 'rare': return '#a335ee';
      case 'epic': return '#ff8000';
      case 'legendary': return '#ff0000';
      default: return theme.colors.text;
    }
  };

  const getGlowStyle = () => {
    if (!glow) return {};
    
    const glowColor = getRarityColor(sprite.rarity);
    const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    });

    return {
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowOpacity,
      shadowRadius: 10,
      elevation: 10,
    };
  };

  const getTransformStyle = () => {
    const transforms = [];
    
    if (animated) {
      transforms.push({ scale: scaleAnim });
    }
    
    if (pulse) {
      transforms.push({ scale: pulseAnim });
    }
    
    return transforms.length > 0 ? { transform: transforms } : {};
  };

  const renderSprite = () => {
    // For multi-line sprites (like backgrounds), split and render each line
    if (sprite.sprite.includes('\n')) {
      const lines = sprite.sprite.split('\n');
      return lines.map((line, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.spriteText,
            {
              fontSize: size / 3,
              color: getRarityColor(sprite.rarity),
              lineHeight: size / 3,
            },
            getTransformStyle(),
          ]}
        >
          {line}
        </Animated.Text>
      ));
    }
    
    // For single sprites, render normally
    return (
      <Animated.Text
        style={[
          styles.spriteText,
          {
            fontSize: size,
            color: getRarityColor(sprite.rarity),
          },
          getTransformStyle(),
        ]}
      >
        {sprite.sprite}
      </Animated.Text>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size * 2,
          height: size * 2,
        },
        getGlowStyle(),
        style,
      ]}
    >
      {renderSprite()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  spriteText: {
    fontFamily: 'monospace',
    textAlign: 'center',
  },
}); 