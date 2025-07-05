import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PixelBackground from '../components/PixelBackground';
import PixelText from '../components/PixelText';
import UnifiedIcon from '../components/UnifiedIcon';
import { RetroButton } from '../components/RetroButton';
import { FadeInAnimation, SlideInAnimation } from '../components/RetroAnimations';
import { useAudio } from '../context/AudioContext';

export default function AudioSettingsScreen() {
  const { theme } = useTheme();
  const {
    isSoundEnabled,
    sfxVolume,
    hapticsEnabled,
    toggleSound,
    setSFXVolume,
    setHapticsEnabled,
    playButtonClick,
    playVictory,
    playDefeat,
    playQuestComplete,
    playLevelUp,
    playAchievementUnlock,
    playItemPickup,
    playMagicSpell,
    triggerHaptic,
  } = useAudio();

  const handleSFXVolumeChange = (value: number) => {
    setSFXVolume(value);
    triggerHaptic('light');
  };

  const handleSoundToggle = (value: boolean) => {
    toggleSound();
    triggerHaptic('medium');
  };

  const handleHapticsToggle = (value: boolean) => {
    setHapticsEnabled(value);
    if (value) {
      triggerHaptic('light');
    }
  };

  // Remove playMusicPreview and renderMusicPreview

  const playSoundPreview = (soundType: string) => {
    triggerHaptic('light');
    
    switch (soundType) {
      case 'button':
        playButtonClick();
        break;
      case 'victory':
        playVictory();
        break;
      case 'defeat':
        playDefeat();
        break;
      case 'quest':
        playQuestComplete();
        break;
      case 'levelup':
        playLevelUp();
        break;
      case 'achievement':
        playAchievementUnlock();
        break;
      case 'item':
        playItemPickup();
        break;
      case 'magic':
        playMagicSpell();
        break;
      case 'haptic':
        triggerHaptic('success');
        break;
    }
  };

  const resetAudioSettings = () => {
    Alert.alert(
      'Reset Audio Settings',
      'Are you sure you want to reset all audio settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSFXVolume(0.5);
            setHapticsEnabled(true);
            
            triggerHaptic('success');
            playButtonClick();
          },
        },
      ]
    );
  };

  const renderVolumeSlider = (
    title: string,
    value: number,
    onValueChange: (value: number) => void,
    icon: string
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingHeader}>
        <UnifiedIcon name={icon} size={24} color={theme.colors.text} />
        <PixelText style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </PixelText>
      </View>
      
      <View style={styles.volumeContainer}>
        <PixelText style={[styles.volumeLabel, { color: theme.colors.textSecondary }]}>
          {Math.round(value * 100)}%
        </PixelText>
        <View style={styles.volumeBar}>
          <View 
            style={[
              styles.volumeFill, 
              { 
                width: `${value * 100}%`,
                backgroundColor: theme.colors.primary 
              }
            ]} 
          />
        </View>
        <RetroButton
          title="Test"
          onPress={() => onValueChange(value)}
          variant="secondary"
          size="small"
        />
      </View>
    </View>
  );

  const renderToggleSetting = (
    title: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string,
    description?: string
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingHeader}>
        <UnifiedIcon name={icon} size={24} color={theme.colors.text} />
        <View style={styles.settingTextContainer}>
          <PixelText style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </PixelText>
          {description && (
            <PixelText style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              {description}
            </PixelText>
          )}
        </View>
      </View>
      
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
        thumbColor={value ? theme.colors.accent : theme.colors.text}
      />
    </View>
  );

  const renderSoundPreview = (soundType: string, title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.soundPreviewItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => playSoundPreview(soundType)}
      activeOpacity={0.8}
    >
      <UnifiedIcon name={icon} size={24} color={theme.colors.text} />
      <PixelText style={[styles.soundPreviewTitle, { color: theme.colors.text }]}>
        {title}
      </PixelText>
    </TouchableOpacity>
  );

  return (
    <PixelBackground pattern="stars" animated={true}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <PixelText variant="title" style={[styles.title, { color: theme.colors.text }]}>
            AUDIO SETTINGS
          </PixelText>
          <PixelText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Customize your retro RPG audio experience
          </PixelText>
        </View>

        {/* Master Audio Toggle */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Master Audio
          </PixelText>
          {renderToggleSetting(
            'Enable Sound',
            isSoundEnabled,
            handleSoundToggle,
            'volume-high',
            'Master switch for all audio'
          )}
        </View>

        {/* Volume Controls */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Volume Controls
          </PixelText>
          {renderVolumeSlider(
            'Sound Effects',
            sfxVolume,
            handleSFXVolumeChange,
            'volume-high'
          )}
        </View>

        {/* Haptic Feedback */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Haptic Feedback
          </PixelText>
          {renderToggleSetting(
            'Enable Haptics',
            hapticsEnabled,
            handleHapticsToggle,
            'phone-portrait',
            'Vibrate on interactions'
          )}
          <TouchableOpacity
            style={[styles.hapticTestButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              triggerHaptic('success');
              playButtonClick();
            }}
            activeOpacity={0.8}
          >
            <PixelText style={[styles.hapticTestText, { color: '#ffffff' }]}>
              Test Haptic Feedback
            </PixelText>
          </TouchableOpacity>
        </View>

        {/* Sound Effect Previews */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sound Effect Previews
          </PixelText>
          <View style={styles.soundGrid}>
            {renderSoundPreview('button', 'Button Click', 'hand-left')}
            {renderSoundPreview('victory', 'Victory', 'trophy')}
            {renderSoundPreview('defeat', 'Defeat', 'close-circle')}
            {renderSoundPreview('quest', 'Quest Complete', 'checkmark-circle')}
            {renderSoundPreview('levelup', 'Level Up', 'trending-up')}
            {renderSoundPreview('achievement', 'Achievement', 'star')}
            {renderSoundPreview('item', 'Item Pickup', 'bag')}
            {renderSoundPreview('magic', 'Magic Spell', 'sparkles')}
          </View>
        </View>

        {/* Reset Button */}
        <View style={styles.resetSection}>
          <RetroButton
            title="Reset to Defaults"
            onPress={resetAudioSettings}
            variant="danger"
            size="large"
          />
        </View>
      </ScrollView>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  volumeLabel: {
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  volumeBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 4,
  },
  hapticTestButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    marginTop: 12,
  },
  hapticTestText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  musicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  musicPreviewItem: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 0,
    borderWidth: 2,
    alignItems: 'center',
  },
  musicPreviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  playingIndicator: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  soundPreviewItem: {
    width: '48%',
    padding: 12,
    marginBottom: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundPreviewTitle: {
    fontSize: 12,
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  resetSection: {
    margin: 16,
    paddingBottom: 20,
  },
}); 