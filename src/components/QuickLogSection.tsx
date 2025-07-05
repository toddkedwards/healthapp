import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { soundService } from '../services/soundService';
import { RetroButton } from './RetroButton';
import PixelText from './PixelText';
import PixelIcon from './PixelIcon';
import PixelArtIcon from './PixelArtIcon';

export interface ExerciseLog {
  id: string;
  type: ExerciseType;
  duration: number;
  intensity: ExerciseIntensity;
  timestamp: Date;
  xpGained: number;
  caloriesBurned?: number;
  notes?: string;
}

export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'custom';
export type ExerciseIntensity = 'light' | 'moderate' | 'intense';

interface QuickLogSectionProps {
  onExerciseLogged?: (exercise: ExerciseLog) => void;
}

const EXERCISE_TYPES = [
  { type: 'cardio', label: 'Cardio', color: '#ff6b6b' },
  { type: 'strength', label: 'Strength', color: '#4ecdc4' },
  { type: 'flexibility', label: 'Flexibility', color: '#45b7d1' },
  { type: 'sports', label: 'Sports', color: '#96ceb4' },
  { type: 'custom', label: 'Custom', color: '#feca57' },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const INTENSITY_OPTIONS = [
  { level: 'light', label: 'Light', color: '#51cf66', xpMultiplier: 1 },
  { level: 'moderate', label: 'Moderate', color: '#ffd43b', xpMultiplier: 1.5 },
  { level: 'intense', label: 'Intense', color: '#ff6b6b', xpMultiplier: 2 },
];

export default function QuickLogSection({ onExerciseLogged }: QuickLogSectionProps) {
  const { theme } = useTheme();
  const { user, updateUser } = useUser();
  const { showNotification } = useNotification();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<ExerciseType>('cardio');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedIntensity, setSelectedIntensity] = useState<ExerciseIntensity>('moderate');
  const [customNotes, setCustomNotes] = useState('');

  const calculateXP = (duration: number, intensity: ExerciseIntensity): number => {
    const baseXP = Math.floor(duration / 15) * 10; // 10 XP per 15 minutes
    const intensityMultiplier = INTENSITY_OPTIONS.find(i => i.level === intensity)?.xpMultiplier || 1;
    return Math.floor(baseXP * intensityMultiplier);
  };

  const calculateCalories = (duration: number, intensity: ExerciseIntensity): number => {
    const baseCalories = duration * 5; // Rough estimate: 5 calories per minute
    const intensityMultiplier = intensity === 'light' ? 0.7 : intensity === 'moderate' ? 1 : 1.3;
    return Math.floor(baseCalories * intensityMultiplier);
  };

  const handleQuickLog = (type: ExerciseType, duration: number, intensity: ExerciseIntensity) => {
    console.log('🔧 handleQuickLog called with:', { type, duration, intensity });
    
    try {
      const xpGained = calculateXP(duration, intensity);
      const caloriesBurned = calculateCalories(duration, intensity);

      console.log('📊 Calculated values:', { xpGained, caloriesBurned });

      const exercise: ExerciseLog = {
        id: Date.now().toString(),
        type,
        duration,
        intensity,
        timestamp: new Date(),
        xpGained,
        caloriesBurned,
      };

      console.log('🏃‍♂️ Created exercise log:', exercise);

      // Update user stats
      const newXP = user.xp + xpGained;
      const newTotalXP = user.totalXp + xpGained;
      
      console.log('📈 XP update:', { currentXP: user.xp, newXP, xpGained });
      
      // Check for level up
      let newLevel = user.level;
      let newXPToNextLevel = user.xpToNextLevel;
      
      if (newXP >= user.xpToNextLevel) {
        newLevel += 1;
        newXPToNextLevel = newLevel * 100; // Simple level progression
        console.log('🎉 Level up!', { oldLevel: user.level, newLevel });
        showNotification(`🎉 Level Up! You're now level ${newLevel}!`, 'success');
        soundService.playLevelUp();
      }

      updateUser({
        xp: newXP,
        totalXp: newTotalXP,
        level: newLevel,
        xpToNextLevel: newXPToNextLevel,
      });

      console.log('✅ User updated successfully');

      // Check quest progress for exercise-related quests
      // This would typically update quest progress based on exercise data
      // For now, we'll just log that exercise was completed
      console.log('📋 Exercise completed - quest progress would be updated here');

      // Show success notification
      showNotification(`🏃‍♂️ Exercise logged! +${xpGained} XP gained!`, 'success');
      soundService.playQuestComplete();

      console.log('🔔 Notifications sent');

      // Callback
      onExerciseLogged?.(exercise);

      console.log('📞 Callback executed');

      // Close modal
      setModalVisible(false);
      
      console.log('✅ handleQuickLog completed successfully');
    } catch (error) {
      console.error('❌ Error in handleQuickLog:', error);
      showNotification('Error logging exercise. Please try again.', 'error');
    }
  };

  const renderExerciseTypeButton = (exerciseType: typeof EXERCISE_TYPES[0]) => (
    <TouchableOpacity
      key={exerciseType.type}
      style={[
        styles.exerciseTypeButton,
        { backgroundColor: theme.colors.surface },
        selectedType === exerciseType.type && { borderColor: exerciseType.color, borderWidth: 3 }
      ]}
      onPress={() => {
        setSelectedType(exerciseType.type as ExerciseType);
        soundService.playButtonClick();
      }}
    >
      <PixelArtIcon type={exerciseType.type as ExerciseType} size={24} color={exerciseType.color} />
      <PixelText style={[styles.exerciseTypeLabel, { color: theme.colors.text }]}>
        {exerciseType.label}
      </PixelText>
    </TouchableOpacity>
  );

  const renderDurationButton = (duration: number) => (
    <TouchableOpacity
      key={duration}
      style={[
        styles.durationButton,
        { backgroundColor: theme.colors.surface },
        selectedDuration === duration && { backgroundColor: theme.colors.primary }
      ]}
      onPress={() => {
        setSelectedDuration(duration);
        soundService.playButtonClick();
      }}
    >
      <PixelText style={[
        styles.durationText,
        { color: selectedDuration === duration ? '#fff' : theme.colors.text }
      ]}>
        {duration}min
      </PixelText>
    </TouchableOpacity>
  );

  const renderIntensityButton = (intensity: typeof INTENSITY_OPTIONS[0]) => (
    <TouchableOpacity
      key={intensity.level}
      style={[
        styles.intensityButton,
        { backgroundColor: theme.colors.surface },
        selectedIntensity === intensity.level && { borderColor: intensity.color, borderWidth: 3 }
      ]}
      onPress={() => {
        setSelectedIntensity(intensity.level as ExerciseIntensity);
        soundService.playButtonClick();
      }}
    >
      <View style={[styles.intensityIndicator, { backgroundColor: intensity.color }]} />
      <PixelText style={[styles.intensityLabel, { color: theme.colors.text }]}>
        {intensity.label}
      </PixelText>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Quick Log Header */}
      <View style={styles.header}>
        <PixelText style={[styles.title, { color: theme.colors.text }]}>
          ⚡ Quick Log Exercise
        </PixelText>
        <PixelText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Log your workout and gain XP!
        </PixelText>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            soundService.playButtonClick();
            handleQuickLog('cardio', 30, 'moderate');
          }}
        >
          <PixelArtIcon type="cardio" size={20} color="#fff" />
          <PixelText style={styles.quickButtonText}>30min Cardio</PixelText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => {
            soundService.playButtonClick();
            handleQuickLog('strength', 45, 'moderate');
          }}
        >
          <PixelArtIcon type="strength" size={20} color="#fff" />
          <PixelText style={styles.quickButtonText}>45min Strength</PixelText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.colors.warning }]}
          onPress={() => {
            soundService.playButtonClick();
            setModalVisible(true);
          }}
        >
          <PixelArtIcon type="custom" size={20} color="#fff" />
          <PixelText style={styles.quickButtonText}>Custom</PixelText>
        </TouchableOpacity>
      </View>

      {/* Custom Exercise Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <PixelText style={[styles.modalTitle, { color: theme.colors.text }]}>
                Log Custom Exercise
              </PixelText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <PixelIcon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Exercise Type */}
              <View style={styles.modalSection}>
                <PixelText style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Exercise Type
                </PixelText>
                <View style={styles.exerciseTypeGrid}>
                  {EXERCISE_TYPES.map(renderExerciseTypeButton)}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.modalSection}>
                <PixelText style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Duration
                </PixelText>
                <View style={styles.durationGrid}>
                  {DURATION_OPTIONS.map(renderDurationButton)}
                </View>
              </View>

              {/* Intensity */}
              <View style={styles.modalSection}>
                <PixelText style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Intensity
                </PixelText>
                <View style={styles.intensityGrid}>
                  {INTENSITY_OPTIONS.map(renderIntensityButton)}
                </View>
              </View>

              {/* XP Preview */}
              <View style={[styles.xpPreview, { backgroundColor: theme.colors.surface }]}>
                <PixelText style={[styles.xpPreviewTitle, { color: theme.colors.text }]}>
                  XP Preview
                </PixelText>
                <PixelText style={[styles.xpPreviewValue, { color: theme.colors.primary }]}>
                  +{calculateXP(selectedDuration, selectedIntensity)} XP
                </PixelText>
                <PixelText style={[styles.xpPreviewCalories, { color: theme.colors.textSecondary }]}>
                  ~{calculateCalories(selectedDuration, selectedIntensity)} calories
                </PixelText>
              </View>

              {/* Notes */}
              <View style={styles.modalSection}>
                <PixelText style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Notes (Optional)
                </PixelText>
                <View style={[styles.notesInput, { backgroundColor: theme.colors.surface }]}>
                  <TextInput
                    style={[styles.notesText, { color: theme.colors.text }]}
                    placeholder="Add any notes about your workout..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    value={customNotes}
                    onChangeText={setCustomNotes}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <RetroButton
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="secondary"
                size="medium"
              />
              <RetroButton
                title="Log Exercise"
                onPress={() => {
                  handleQuickLog(selectedType, selectedDuration, selectedIntensity);
                }}
                variant="primary"
                size="medium"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginLeft: 8,
  },
  exerciseTypeButton: {
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 0,
    margin: 5,
  },
  exerciseTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  durationButton: {
    padding: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    margin: 5,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  intensityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 0,
    margin: 5,
  },
  intensityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  exerciseTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  intensityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpPreview: {
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    marginBottom: 20,
  },
  xpPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  xpPreviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  xpPreviewCalories: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  notesInput: {
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    padding: 10,
    minHeight: 80,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
  },
}); 