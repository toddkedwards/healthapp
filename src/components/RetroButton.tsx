import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { soundService } from '../services/soundService';

interface RetroButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  playSound?: boolean;
  animated?: boolean;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  playSound = true,
  animated = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (disabled) return;
    
    if (playSound) {
      soundService.playButtonClick();
      soundService.triggerHaptic('light');
    }
    
    if (animated) {
      // Press animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    onPress();
  };

  const handlePressIn = () => {
    if (animated && !disabled) {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated && !disabled) {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'rgba(78, 205, 196, 0.2)',
          borderColor: '#4ecdc4',
          textColor: '#4ecdc4',
          glowColor: '#4ecdc4',
        };
      case 'danger':
        return {
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          borderColor: '#ff6b6b',
          textColor: '#ff6b6b',
          glowColor: '#ff6b6b',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(255, 170, 0, 0.2)',
          borderColor: '#ffaa00',
          textColor: '#ffaa00',
          glowColor: '#ffaa00',
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(255, 107, 53, 0.2)',
          borderColor: '#ff6b35',
          textColor: '#ff6b35',
          glowColor: '#ff6b35',
        };
      default:
        return {
          backgroundColor: 'rgba(78, 205, 196, 0.2)',
          borderColor: '#4ecdc4',
          textColor: '#4ecdc4',
          glowColor: '#4ecdc4',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 12,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: 14,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        styles.button,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: scaleAnim }],
          shadowColor: variantStyles.glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowAnim,
          shadowRadius: 8,
          elevation: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 8],
          }),
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={styles.touchable}
      >
        <Text
          style={[
            styles.text,
            {
              color: variantStyles.textColor,
              fontSize: sizeStyles.fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  touchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 