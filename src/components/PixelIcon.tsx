import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PixelIconProps {
  name: string;
  size?: number;
  color?: string;
  animated?: boolean;
  style?: any;
}

// Pixel art icon definitions
const PIXEL_ICONS: { [key: string]: string } = {
  // Health and stats
  heart: '❤️',
  energy: '⚡',
  strength: '💪',
  agility: '🏃',
  defense: '🛡️',
  speed: '⚡',
  
  // Fitness
  steps: '👟',
  distance: '🗺️',
  calories: '🔥',
  workout: '🏋️',
  run: '🏃',
  walk: '🚶',
  
  // RPG elements
  sword: '⚔️',
  shield: '🛡️',
  potion: '🧪',
  coin: '🪙',
  gem: '💎',
  key: '🗝️',
  chest: '📦',
  
  // Quests and achievements
  quest: '📜',
  achievement: '🏆',
  boss: '👹',
  monster: '👾',
  npc: '👤',
  
  // UI elements
  arrow: '➡️',
  back: '⬅️',
  close: '❌',
  check: '✅',
  star: '⭐',
  crown: '👑',
  
  // Character classes
  warrior: '⚔️',
  mage: '🔮',
  archer: '🏹',
  rogue: '🗡️',
  cleric: '⛪',
  
  // Equipment
  weapon: '⚔️',
  armor: '🛡️',
  accessory: '💍',
  helmet: '⛑️',
  boots: '👢',
  
  // Status effects
  buff: '✨',
  debuff: '💀',
  poison: '☠️',
  fire: '🔥',
  ice: '❄️',
  lightning: '⚡',
  
  // Social
  friend: '👥',
  party: '👥',
  guild: '🏰',
  chat: '💬',
  mail: '📧',
  
  // Time and progress
  clock: '⏰',
  calendar: '📅',
  timer: '⏱️',
  progress: '📊',
  level: '📈',
  
  // Settings and menu
  settings: '⚙️',
  menu: '☰',
  profile: '👤',
  stats: '📊',
  inventory: '🎒',
  shop: '🏪',

  // NEW ACHIEVEMENT ICONS
  // Steps achievements
  achievement_steps_1k: '👣',
  achievement_steps_10k: '🏃‍♂️',
  achievement_steps_50k: '🏃‍♂️🔥',
  achievement_steps_100k: '🏃‍♂️🔥⚡',
  
  // Workout achievements
  achievement_workout_10: '💪',
  achievement_workout_50: '💪💪',
  achievement_workout_100: '💪💪💪',
  achievement_workout_500: '💪💪💪💪',
  
  // Streak achievements
  achievement_streak_3: '🔥',
  achievement_streak_7: '🔥🔥',
  achievement_streak_30: '🔥🔥🔥',
  achievement_streak_100: '🔥🔥🔥🔥',
  
  // Boss achievements
  achievement_boss_1: '⚔️',
  achievement_boss_3: '⚔️⚔️',
  achievement_boss_10: '⚔️⚔️⚔️',
  achievement_perfect_boss: '✨⚔️✨',
  achievement_solo_boss: '🗡️',
  
  // Collection achievements
  achievement_avatars: '👥',
  achievement_equipment: '🎒',
  achievement_epic: '💎',
  achievement_classes: '👑',
  
  // Social achievements
  achievement_friend: '🤝',
  achievement_party: '🎉',
  achievement_guild: '🏰',
  achievement_help: '💝',
  
  // Special achievements
  achievement_early_bird: '🌅',
  achievement_night_owl: '🌙',
  achievement_weekend: '📅',
  achievement_holiday: '🎊',
  
  // Milestone achievements
  achievement_level_5: '⭐',
  achievement_level_10: '⭐⭐',
  achievement_level_25: '⭐⭐⭐',
  achievement_level_50: '⭐⭐⭐⭐',
  achievement_level_100: '⭐⭐⭐⭐⭐',

  // ENHANCED RPG ICONS
  // Enhanced character class icons
  warrior_pixel: '🗡️',
  mage_pixel: '🔮',
  archer_pixel: '🏹',
  rogue_pixel: '⚔️',
  cleric_pixel: '⛪',

  // Enhanced equipment icons
  sword_pixel: '⚔️',
  shield_pixel: '🛡️',
  armor_pixel: '🛡️',
  helmet_pixel: '⛑️',
  boots_pixel: '👢',
  staff_pixel: '🔮',
  bow_pixel: '🏹',
  dagger_pixel: '🗡️',

  // Enhanced status effect icons
  buff_pixel: '✨',
  debuff_pixel: '💀',
  poison_pixel: '☠️',
  fire_pixel: '🔥',
  ice_pixel: '❄️',
  lightning_pixel: '⚡',

  // NEW UI & INTERACTION ICONS
  achievement_tab: '🏆',
  collection_tab: '🎒',
  social_tab: '👥',
  stats_tab: '📊',
  share: '📤',
  like: '👍',
  comment: '💬',
  gift: '🎁',
  challenge: '⚔️',
  tournament: '🏆',

  // NEW PROGRESS ICONS
  progress_bar: '▰▰▰▰▰',
  progress_complete: '▰▰▰▰▰',
  progress_partial: '▰▰▱▱▱',

  // BOSS & ENEMY ICONS
  boss_dragon: '🐉',
  boss_giant: '👹',
  boss_skeleton: '💀',
  boss_ghost: '👻',
  boss_robot: '🤖',
  boss_alien: '👽',
  enemy_goblin: '👺',
  enemy_orc: '👹',
  enemy_troll: '🧌',
  enemy_demon: '😈',
  enemy_angel: '👼',

  // ENHANCED FITNESS ICONS
  workout_strength: '🏋️',
  workout_cardio: '🏃',
  workout_yoga: '🧘',
  workout_swim: '🏊',
  workout_cycle: '🚴',
  workout_climb: '🧗',
  steps_daily: '👟',
  steps_weekly: '👟👟',
  steps_monthly: '👟👟👟',
  calories_burned: '🔥',
  distance_walked: '🗺️',
  active_minutes: '⏱️',

  // MISSING ICONS - ADDED BACK
  lock: '🔒',
  question: '❓',
  refresh: '🔄',
  flash: '⚡',
  info: 'ℹ️',
  bug: '🐛',
  fitness: '🏋️',
  
  // Avatar icons for character selection
  mage_m: '🧙‍♂️',
  mage_f: '🧙‍♀️',
  warrior_m: '⚔️',
  warrior_f: '⚔️',
  rogue_m: '🗡️',
  rogue_f: '🗡️',
  archer_m: '🏹',
  archer_f: '🏹',
  healer_m: '⛪',
  healer_f: '⛪',
};

export default function PixelIcon({
  name,
  size = 24,
  color,
  animated = false,
  style,
}: PixelIconProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Create pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated]);

  const iconText = PIXEL_ICONS[name] || '❓';
  const iconColor = color || theme.colors.text;

  const getIconStyle = () => {
    const baseStyle = {
      fontSize: size,
      color: iconColor,
    };

    if (animated) {
      return {
        ...baseStyle,
        transform: [
          { scale: scaleAnim },
          {
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      };
    }

    return baseStyle;
  };

  return (
    <Animated.View style={[styles.container, style]}>
      <Animated.Text style={getIconStyle()}>
        {iconText}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 