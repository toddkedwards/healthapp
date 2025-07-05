import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { Achievement } from '../types';
import { soundService } from '../services/soundService';
import PixelIcon from './PixelIcon';

const { width, height } = Dimensions.get('window');

interface AchievementUnlockModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementUnlockModal({
  visible,
  achievement,
  onClose,
}: AchievementUnlockModalProps) {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  
  const [scaleAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));
  const [textAnim] = useState(new Animated.Value(0));
  const [particleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && achievement) {
      // Play achievement sound
      soundService.playAchievementUnlock();
      
      // Start animations
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      glowAnim.setValue(0);
      textAnim.setValue(0);
      particleAnim.setValue(0);
    }
  }, [visible, achievement]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!achievement) return null;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const textOpacity = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const particleScale = particleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const getAchievementRarity = (category: string) => {
    switch (category) {
      case 'special': return { color: '#ff8000', label: 'LEGENDARY' };
      case 'boss': return { color: '#a335ee', label: 'EPIC' };
      case 'streak': return { color: '#0070dd', label: 'RARE' };
      default: return { color: '#1eff00', label: 'COMMON' };
    }
  };

  const rarity = getAchievementRarity(achievement.category);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Background glow effect */}
        <Animated.View 
          style={[
            styles.glowBackground,
            { 
              backgroundColor: rarity.color,
              opacity: glowOpacity,
            }
          ]} 
        />

        {/* Particle effects */}
        <Animated.View 
          style={[
            styles.particles,
            {
              transform: [{ scale: particleScale }],
            }
          ]}
        >
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: rarity.color,
                  transform: [
                    { rotate: `${i * 45}deg` },
                    { translateX: 60 },
                  ],
                }
              ]}
            />
          ))}
        </Animated.View>

        {/* Main achievement card */}
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Achievement icon */}
          <View style={[styles.iconContainer, { borderColor: rarity.color }]}>
            <PixelIcon name={achievement.icon} size={40} color={rarity.color} />
            <View style={[styles.rarityBadge, { backgroundColor: rarity.color }]}>
              <Text style={styles.rarityText}>{rarity.label}</Text>
            </View>
          </View>

          {/* Achievement content */}
          <Animated.View style={[styles.content, { opacity: textOpacity }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {achievement.title}
            </Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {achievement.description}
            </Text>
            
            {/* Category indicator */}
            <View style={styles.categoryContainer}>
              <PixelIcon 
                name={
                  achievement.category === 'steps' ? 'steps' :
                  achievement.category === 'workout' ? 'workout' :
                  achievement.category === 'streak' ? 'achievement_streak_3' :
                  achievement.category === 'boss' ? 'achievement_boss_1' :
                  achievement.category === 'social' ? 'achievement_friend' :
                  achievement.category === 'collection' ? 'achievement_equipment' :
                  achievement.category === 'milestone' ? 'achievement_level_5' :
                  'achievement'
                } 
                size={16} 
                color={rarity.color} 
              />
              <Text style={[styles.categoryText, { color: rarity.color }]}>
                {achievement.category.toUpperCase()}
              </Text>
            </View>
          </Animated.View>

          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Tap to dismiss hint */}
        <Animated.View style={[styles.dismissHint, { opacity: textOpacity }]}>
          <Text style={[styles.dismissText, { color: theme.colors.textSecondary }]}>
            Tap anywhere to dismiss
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  glowBackground: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.4,
    borderRadius: 20,
    opacity: 0.3,
  },
  particles: {
    position: 'absolute',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderWidth: 3,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 40,
  },
  rarityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  content: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  dismissHint: {
    position: 'absolute',
    bottom: 40,
  },
  dismissText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
}); 