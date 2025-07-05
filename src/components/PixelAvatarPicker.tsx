import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import UnifiedIcon from './UnifiedIcon';
import { soundService } from '../services/soundService';

const AVATARS = [
  { key: 'mage_m', label: 'Mage (M)' },
  { key: 'mage_f', label: 'Mage (F)' },
  { key: 'warrior_m', label: 'Warrior (M)' },
  { key: 'warrior_f', label: 'Warrior (F)' },
  { key: 'rogue_m', label: 'Rogue (M)' },
  { key: 'rogue_f', label: 'Rogue (F)' },
  { key: 'archer_m', label: 'Archer (M)' },
  { key: 'archer_f', label: 'Archer (F)' },
  { key: 'healer_m', label: 'Healer (M)' },
  { key: 'healer_f', label: 'Healer (F)' },
];

interface PixelAvatarPickerProps {
  selected: string;
  onSelect: (avatar: string) => void;
}

const PixelAvatarPicker: React.FC<PixelAvatarPickerProps> = ({ selected, onSelect }) => {
  // Animation refs for each avatar
  const anims = useRef(AVATARS.map(() => new Animated.Value(1))).current;

  const handleSelect = (avatar: string, idx: number) => {
    // Play sound
    soundService.playButtonClick();
    // Animate pop
    Animated.sequence([
      Animated.timing(anims[idx], { toValue: 1.15, duration: 80, useNativeDriver: true }),
      Animated.timing(anims[idx], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onSelect(avatar);
  };

  return (
    <View style={styles.grid}>
      {AVATARS.map((avatar, idx) => (
        <View key={avatar.key} style={styles.avatarCol}>
          <TouchableOpacity
            style={[styles.avatarButton, selected === avatar.key && styles.selected]}
            onPress={() => handleSelect(avatar.key, idx)}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: anims[idx] }] }}>
              <UnifiedIcon name={avatar.key} size={48} />
            </Animated.View>
          </TouchableOpacity>
          <Text style={[styles.label, selected === avatar.key && styles.selectedLabel]}>{avatar.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  avatarCol: {
    alignItems: 'center',
    width: 72,
    margin: 4,
  },
  avatarButton: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  selected: {
    borderColor: '#00ff88',
    borderWidth: 3,
    backgroundColor: 'rgba(0,255,136,0.08)',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    color: '#fff',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
});

export default PixelAvatarPicker; 