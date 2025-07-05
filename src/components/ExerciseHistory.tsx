import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ExerciseLog } from './QuickLogSection';
import PixelText from './PixelText';
import UnifiedIcon from './UnifiedIcon';

import { RetroButton } from './RetroButton';
import { soundService } from '../services/soundService';

interface ExerciseHistoryProps {
  exercises: ExerciseLog[];
  maxItems?: number;
}

const getExerciseIcon = (type: ExerciseLog['type']): string => {
  return type; // Return the type directly for PixelArtIcon
};

const getExerciseColor = (type: ExerciseLog['type']): string => {
  switch (type) {
    case 'cardio': return '#ff6b6b';
    case 'strength': return '#4ecdc4';
    case 'flexibility': return '#45b7d1';
    case 'sports': return '#96ceb4';
    case 'custom': return '#feca57';
    default: return '#666';
  }
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return `${Math.floor(diffInHours / 24)}d ago`;
  }
};

export default function ExerciseHistory({ exercises, maxItems = 5 }: ExerciseHistoryProps) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const recentExercises = exercises
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  if (recentExercises.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <PixelText style={[styles.title, { color: theme.colors.text }]}>
          📊 Recent Workouts
        </PixelText>
        <View style={styles.emptyState}>
          <UnifiedIcon name="fitness" size={32} color={theme.colors.textSecondary} />
          <PixelText style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No workouts logged yet
          </PixelText>
          <PixelText style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
            Log your first exercise to see it here!
          </PixelText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <PixelText style={[styles.title, { color: theme.colors.text }]}>
          📊 Recent Workouts
        </PixelText>
        {exercises.length > maxItems && (
          <RetroButton
            title="View All"
            onPress={() => {
              soundService.playMenuNavigate();
              // For now, navigate to Settings since we don't have a dedicated workouts screen
              navigation.navigate('Settings' as never);
            }}
            variant="secondary"
            size="small"
          />
        )}
      </View>
      
      <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
        {recentExercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseItem}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseType}>
                <UnifiedIcon 
                  name={exercise.type} 
                  size={20} 
                  color={getExerciseColor(exercise.type)} 
                />
                <PixelText style={[styles.exerciseTypeText, { color: theme.colors.text }]}>
                  {exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
                </PixelText>
              </View>
              <PixelText style={[styles.exerciseTime, { color: theme.colors.textSecondary }]}>
                {formatTime(exercise.timestamp)}
              </PixelText>
            </View>
            
            <View style={styles.exerciseDetails}>
              <View style={styles.exerciseStat}>
                <PixelText style={[styles.exerciseStatLabel, { color: theme.colors.textSecondary }]}>
                  Duration
                </PixelText>
                <PixelText style={[styles.exerciseStatValue, { color: theme.colors.text }]}>
                  {exercise.duration}min
                </PixelText>
              </View>
              
              <View style={styles.exerciseStat}>
                <PixelText style={[styles.exerciseStatLabel, { color: theme.colors.textSecondary }]}>
                  Intensity
                </PixelText>
                <PixelText style={[styles.exerciseStatValue, { color: theme.colors.text }]}>
                  {exercise.intensity}
                </PixelText>
              </View>
              
              <View style={styles.exerciseStat}>
                <PixelText style={[styles.exerciseStatLabel, { color: theme.colors.textSecondary }]}>
                  XP Gained
                </PixelText>
                <PixelText style={[styles.exerciseStatValue, { color: theme.colors.primary }]}>
                  +{exercise.xpGained}
                </PixelText>
              </View>
              
              {exercise.caloriesBurned && (
                <View style={styles.exerciseStat}>
                  <PixelText style={[styles.exerciseStatLabel, { color: theme.colors.textSecondary }]}>
                    Calories
                  </PixelText>
                  <PixelText style={[styles.exerciseStatValue, { color: theme.colors.text }]}>
                    {exercise.caloriesBurned}
                  </PixelText>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  exerciseList: {
    maxHeight: 300,
  },
  exerciseItem: {
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    marginBottom: 10,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseTypeText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginLeft: 8,
  },
  exerciseTime: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  exerciseStat: {
    alignItems: 'center',
    minWidth: 60,
  },
  exerciseStatLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  exerciseStatValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
}); 