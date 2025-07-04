import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Sound effect definitions using Web Audio API for retro 8-bit sounds
class RetroSoundService {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private backgroundMusic: Audio.Sound | null = null;
  private currentMusic: string | null = null;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.5;
  private hapticsEnabled: boolean = true;

  async initialize() {
    try {
      // Request audio permissions
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Initialize Web Audio API for retro sounds
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new AudioContext();
      }
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }

  // Generate retro 8-bit style sounds using Web Audio API
  private generateRetroSound(frequency: number, duration: number, type: OscillatorType = 'square'): void {
    if (!this.audioContext || !this.isEnabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      // Create retro-style envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.log('Sound generation failed:', error);
    }
  }

  // Button click sound (short, high-pitched beep)
  playButtonClick() {
    this.generateRetroSound(800, 0.1, 'square');
  }

  // Purchase success sound (ascending chime)
  playPurchaseSuccess() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Purchase sound failed:', error);
    }
  }

  // Quest completion sound (victory fanfare)
  playQuestComplete() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      // Play a sequence of notes for victory fanfare
      const notes = [523, 659, 784, 1047]; // C, E, G, C (higher octave)
      const duration = 0.2;
      
      notes.forEach((frequency, index) => {
        setTimeout(() => {
          this.generateRetroSound(frequency, duration, 'square');
        }, index * duration * 1000);
      });
    } catch (error) {
      console.log('Quest completion sound failed:', error);
    }
  }

  // Error sound (low buzz)
  playError() {
    this.generateRetroSound(200, 0.3, 'sawtooth');
  }

  // Level up sound (ascending scale)
  playLevelUp() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const notes = [261, 329, 392, 523, 659, 784, 1047]; // C major scale
      const duration = 0.15;
      
      notes.forEach((frequency, index) => {
        setTimeout(() => {
          this.generateRetroSound(frequency, duration, 'triangle');
        }, index * duration * 1000);
      });
    } catch (error) {
      console.log('Level up sound failed:', error);
    }
  }

  // Achievement unlock sound (sparkle effect)
  playAchievementUnlock() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const notes = [800, 1000, 1200, 1000, 800];
      const duration = 0.1;
      
      notes.forEach((frequency, index) => {
        setTimeout(() => {
          this.generateRetroSound(frequency, duration, 'sine');
        }, index * duration * 1000);
      });
    } catch (error) {
      console.log('Achievement sound failed:', error);
    }
  }

  // Boss battle sound (dramatic low tone)
  playBossBattle() {
    this.generateRetroSound(150, 0.5, 'sawtooth');
  }

  // Tab switch sound (quick beep)
  playTabSwitch() {
    this.generateRetroSound(600, 0.08, 'square');
  }

  // Modal open sound (ascending tone)
  playModalOpen() {
    this.generateRetroSound(300, 0.2, 'triangle');
  }

  // Modal close sound (descending tone)
  playModalClose() {
    this.generateRetroSound(600, 0.2, 'triangle');
  }

  // Stat increase sound (positive chime)
  playStatIncrease() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(659, this.audioContext.currentTime + 0.2);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Stat increase sound failed:', error);
    }
  }

  // Equipment equip sound (metallic clink)
  playEquipmentEquip() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Equipment equip sound failed:', error);
    }
  }

  // Health/Energy restore sound (healing chime)
  playHealthRestore() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const notes = [523, 659, 784]; // C, E, G (healing chord)
      const duration = 0.15;
      
      notes.forEach((frequency, index) => {
        setTimeout(() => {
          this.generateRetroSound(frequency, duration, 'sine');
        }, index * duration * 1000);
      });
    } catch (error) {
      console.log('Health restore sound failed:', error);
    }
  }

  // Health data sync sound (data transfer chime)
  playHealthSync() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Health sync sound failed:', error);
    }
  }

  // Critical hit sound (dramatic impact)
  playCriticalHit() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Critical hit sound failed:', error);
    }
  }

  // Menu navigation sound (soft click)
  playMenuNavigate() {
    this.generateRetroSound(400, 0.05, 'square');
  }

  // Toggle sound on/off
  toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  // Get sound status
  isSoundEnabled() {
    return this.isEnabled;
  }

  // Background Music Methods
  async playBackgroundMusic(musicType: 'menu' | 'battle' | 'shop' | 'gallery' | 'forest' | 'cave' | 'castle' | 'desert' | 'ocean' | 'dungeon') {
    if (!this.isEnabled || this.currentMusic === musicType) return;

    try {
      // Stop current music if playing
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
      }

      // Generate retro background music based on type
      this.currentMusic = musicType;
      await this.generateBackgroundMusic(musicType);
    } catch (error) {
      console.log('Background music failed:', error);
    }
  }

  private async generateBackgroundMusic(musicType: string) {
    if (!this.audioContext || !this.isEnabled) return;

    try {
      // Create a simple retro music loop
      const musicPattern = this.getMusicPattern(musicType);
      const loopDuration = 8; // 8 seconds per loop
      
      setInterval(() => {
        if (this.currentMusic === musicType && this.isEnabled) {
          this.playMusicPattern(musicPattern);
        }
      }, loopDuration * 1000);

      // Play initial pattern
      this.playMusicPattern(musicPattern);
    } catch (error) {
      console.log('Music generation failed:', error);
    }
  }

  private getMusicPattern(musicType: string): number[][] {
    switch (musicType) {
      case 'menu':
        return [[261, 329, 392, 523], [392, 523, 659, 784]]; // C major progression
      case 'battle':
        return [[150, 200, 250, 300], [300, 250, 200, 150]]; // Dramatic low tones
      case 'shop':
        return [[523, 659, 784, 1047], [784, 659, 523, 392]]; // Upbeat progression
      case 'gallery':
        return [[392, 523, 659, 784], [659, 784, 1047, 1319]]; // Majestic progression
      case 'forest':
        return [[261, 329, 392, 523], [392, 523, 659, 784]]; // Nature-inspired
      case 'cave':
        return [[130, 174, 196, 261], [196, 261, 329, 392]]; // Deep, mysterious
      case 'castle':
        return [[523, 659, 784, 1047], [784, 1047, 1319, 1568]]; // Royal fanfare
      case 'desert':
        return [[174, 220, 261, 329], [261, 329, 392, 523]]; // Exotic scales
      case 'ocean':
        return [[261, 329, 392, 523], [392, 523, 659, 784]]; // Flowing progression
      case 'dungeon':
        return [[130, 174, 196, 261], [196, 261, 329, 392]]; // Dark atmosphere
      default:
        return [[261, 329, 392, 523], [392, 523, 659, 784]];
    }
  }

  private playMusicPattern(pattern: number[][]) {
    if (!this.audioContext || !this.isEnabled) return;

    try {
      pattern.forEach((chord, chordIndex) => {
        setTimeout(() => {
          chord.forEach((note, noteIndex) => {
            setTimeout(() => {
              this.generateRetroSound(note, 0.5, 'triangle');
            }, noteIndex * 100);
          });
        }, chordIndex * 1000);
      });
    } catch (error) {
      console.log('Music pattern failed:', error);
    }
  }

  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
      }
      this.currentMusic = null;
    } catch (error) {
      console.log('Stop music failed:', error);
    }
  }

  // Enhanced Sound Effects
  playVictory() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const victoryNotes = [523, 659, 784, 1047, 1319, 1047, 784, 659, 523];
      const duration = 0.2;
      
      victoryNotes.forEach((frequency, index) => {
        setTimeout(() => {
          this.generateRetroSound(frequency, duration, 'square');
        }, index * duration * 1000);
      });
    } catch (error) {
      console.log('Victory sound failed:', error);
    }
  }

  playDefeat() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const defeatNotes = [523, 493, 466, 440, 415, 392];
      const duration = 0.3;
      
      defeatNotes.forEach((frequency, index) => {
        setTimeout(() => {
          this.generateRetroSound(frequency, duration, 'sawtooth');
        }, index * duration * 1000);
      });
    } catch (error) {
      console.log('Defeat sound failed:', error);
    }
  }

  playItemPickup() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Item pickup sound failed:', error);
    }
  }

  playDoorOpen() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Door open sound failed:', error);
    }
  }

  playMagicSpell() {
    if (!this.audioContext || !this.isEnabled) return;
    
    try {
      const notes = [800, 1000, 1200, 1000, 800, 600];
      const duration = 0.15;
      
      notes.forEach((frequency, index) => {
        setTimeout(() => {
          this.generateRetroSound(frequency, duration, 'sine');
        }, index * duration * 1000);
      });
    } catch (error) {
      console.log('Magic spell sound failed:', error);
    }
  }

  // Haptic Feedback
  triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
    if (!this.hapticsEnabled) return;

    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.log('Haptic feedback failed:', error);
    }
  }

  // Audio Settings
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  isHapticsEnabled(): boolean {
    return this.hapticsEnabled;
  }
}

// Create singleton instance
export const soundService = new RetroSoundService(); 