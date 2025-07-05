import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { soundService } from '../services/soundService';

const { width } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface EnhancedAchievementNotificationProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
  onPress?: () => void;
}

export default function EnhancedAchievementNotification({
  achievement,
  visible,
  onClose,
  onPress,
}: EnhancedAchievementNotificationProps) {
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Play achievement sound
      soundService.playAchievementUnlock();
      soundService.triggerHaptic('success');

      // Slide in animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Bounce animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto-hide after 5 seconds
      const autoHideTimer = setTimeout(() => {
        hideNotification();
      }, 5000);

      return () => clearTimeout(autoHideTimer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 400,
        easing: Easing.in(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 400,
        easing: Easing.in(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getRarityColors = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return {
          primary: '#ffd700',
          secondary: '#ff6b35',
          glow: '#ffd700',
        };
      case 'epic':
        return {
          primary: '#9b59b6',
          secondary: '#8e44ad',
          glow: '#9b59b6',
        };
      case 'rare':
        return {
          primary: '#3498db',
          secondary: '#2980b9',
          glow: '#3498db',
        };
      default:
        return {
          primary: '#95a5a6',
          secondary: '#7f8c8d',
          glow: '#95a5a6',
        };
    }
  };

  const getRarityText = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'LEGENDARY';
      case 'epic':
        return 'EPIC';
      case 'rare':
        return 'RARE';
      default:
        return 'COMMON';
    }
  };

  const colors = getRarityColors();
  const bounceScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.background}
        >
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: colors.glow,
                opacity: glowAnim,
                shadowColor: colors.glow,
                shadowOpacity: glowAnim,
              },
            ]}
          />

          {/* Achievement icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: bounceScale }],
              },
            ]}
          >
            <View style={[styles.iconBackground, { backgroundColor: colors.primary }]}>
              <Ionicons name={achievement.icon as any} size={32} color="#ffffff" />
            </View>
          </Animated.View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.rarityText}>{getRarityText()}</Text>
              <Text style={styles.pointsText}>+{achievement.points} XP</Text>
            </View>

            <Text style={styles.title}>{achievement.title}</Text>
            <Text style={styles.description}>{achievement.description}</Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={hideNotification}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Achievement unlocked text */}
          <View style={styles.unlockedContainer}>
            <Text style={styles.unlockedText}>ACHIEVEMENT UNLOCKED!</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  touchable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  background: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 17,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 10,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  unlockedContainer: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#ff6b35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unlockedText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
}); 