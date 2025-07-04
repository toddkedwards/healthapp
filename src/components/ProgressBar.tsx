import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  backgroundColor?: string;
  retro?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#4ecdc4',
  height = 8,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  retro = true,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  if (retro) {
    return (
      <View style={[styles.retroContainer, { height: height + 4, backgroundColor }]}>
        <View style={styles.retroBorder}>
          <View
            style={[
              styles.retroProgress,
              {
                width: `${clampedProgress}%`,
                backgroundColor: color,
                height,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
  retroContainer: {
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    padding: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  retroBorder: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 0,
    overflow: 'hidden',
  },
  retroProgress: {
    borderRadius: 0,
  },
}); 