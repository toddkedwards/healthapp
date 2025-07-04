import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { soundService } from '../services/soundService';

interface AudioContextType {
  // Audio state
  isSoundEnabled: boolean;
  sfxVolume: number;
  hapticsEnabled: boolean;
  
  // Audio controls
  toggleSound: () => void;
  setSFXVolume: (volume: number) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  
  // Sound effects
  playButtonClick: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  playQuestComplete: () => void;
  playLevelUp: () => void;
  playAchievementUnlock: () => void;
  playItemPickup: () => void;
  playMagicSpell: () => void;
  playError: () => void;
  
  // Haptic feedback
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [sfxVolume, setSfxVolumeState] = useState(0.5);
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);

  // Initialize audio service
  useEffect(() => {
    soundService.initialize();
  }, []);

  // Load audio settings from service
  useEffect(() => {
    setSfxVolumeState(soundService.getSFXVolume());
    setHapticsEnabledState(soundService.isHapticsEnabled());
  }, []);

  const toggleSound = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    
    if (newState) {
      soundService.initialize();
    }
    
    soundService.triggerHaptic('light');
  };

  const setSFXVolume = (volume: number) => {
    setSfxVolumeState(volume);
    soundService.setSFXVolume(volume);
    soundService.triggerHaptic('light');
  };

  const setHapticsEnabled = (enabled: boolean) => {
    setHapticsEnabledState(enabled);
    soundService.setHapticsEnabled(enabled);
    if (enabled) {
      soundService.triggerHaptic('light');
    }
  };

  // Sound effect wrappers
  const playButtonClick = () => {
    if (isSoundEnabled) {
      soundService.playButtonClick();
      soundService.triggerHaptic('light');
    }
  };

  const playVictory = () => {
    if (isSoundEnabled) {
      soundService.playVictory();
      soundService.triggerHaptic('success');
    }
  };

  const playDefeat = () => {
    if (isSoundEnabled) {
      soundService.playDefeat();
      soundService.triggerHaptic('error');
    }
  };

  const playQuestComplete = () => {
    if (isSoundEnabled) {
      soundService.playQuestComplete();
      soundService.triggerHaptic('success');
    }
  };

  const playLevelUp = () => {
    if (isSoundEnabled) {
      soundService.playLevelUp();
      soundService.triggerHaptic('success');
    }
  };

  const playAchievementUnlock = () => {
    if (isSoundEnabled) {
      soundService.playAchievementUnlock();
      soundService.triggerHaptic('success');
    }
  };

  const playItemPickup = () => {
    if (isSoundEnabled) {
      soundService.playItemPickup();
      soundService.triggerHaptic('light');
    }
  };

  const playMagicSpell = () => {
    if (isSoundEnabled) {
      soundService.playMagicSpell();
      soundService.triggerHaptic('medium');
    }
  };

  const playError = () => {
    if (isSoundEnabled) {
      soundService.playError();
      soundService.triggerHaptic('error');
    }
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (hapticsEnabled) {
      soundService.triggerHaptic(type);
    }
  };

  const value: AudioContextType = {
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
    playError,
    triggerHaptic,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}; 