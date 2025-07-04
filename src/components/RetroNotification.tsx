import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

interface RetroNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

const { width } = Dimensions.get('window');

export const RetroNotification: React.FC<RetroNotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(78, 205, 196, 0.9)',
          borderColor: '#4ecdc4',
          icon: '✓',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(255, 107, 107, 0.9)',
          borderColor: '#ff6b6b',
          icon: '✗',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(255, 170, 0, 0.9)',
          borderColor: '#ffaa00',
          icon: '⚠',
        };
      default:
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderColor: '#ffffff',
          icon: 'ℹ',
        };
    }
  };

  const typeStyles = getTypeStyles();

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after duration
    const timer = setTimeout(() => {
      hideNotification();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: typeStyles.backgroundColor,
          borderColor: typeStyles.borderColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{typeStyles.icon}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 3,
    borderRadius: 0,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
}); 