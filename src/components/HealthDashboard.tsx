import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PixelText from './PixelText';
import PixelIcon from './PixelIcon';
import { ProgressBar } from './ProgressBar';
import { RetroButton } from './RetroButton';
import { HealthMetrics, HealthData, HealthWorkout } from '../services/healthDataService';
import { healthDataService } from '../services/healthDataService';
import { soundService } from '../services/soundService';

const { width } = Dimensions.get('window');

interface HealthDashboardProps {
  onSync: () => void;
  onViewWorkouts: () => void;
}

export const HealthDashboard: React.FC<HealthDashboardProps> = ({
  onSync,
  onViewWorkouts,
}) => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pulseAnimation] = useState(new Animated.Value(1));

  // Load health data on mount
  useEffect(() => {
    loadHealthData();
  }, []);

  // Animate pulse effect
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const loadHealthData = async () => {
    setIsLoading(true);
    try {
      // Initialize health service if not already done
      if (!healthDataService.isHealthDataAvailable()) {
        await healthDataService.initialize();
      }

      // Get metrics and sync data
      const [healthMetrics, syncData] = await Promise.all([
        healthDataService.getHealthMetrics(),
        healthDataService.syncHealthData(),
      ]);

      setMetrics(healthMetrics);
      setHealthData(syncData);
      setLastSync(healthDataService.getLastSyncTime());
      
      soundService.playHealthSync();
      soundService.triggerHaptic('success');
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const syncData = await healthDataService.syncHealthData();
      if (syncData) {
        setHealthData(syncData);
        setLastSync(healthDataService.getLastSyncTime());
        onSync();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMetricCard = (
    title: string,
    value: number,
    unit: string,
    icon: string,
    color: string,
    progress?: number
  ) => (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.metricHeader}>
        <PixelIcon name={icon} size={24} color={color} />
        <PixelText style={[styles.metricTitle, { color: theme.colors.text }]}>
          {title}
        </PixelText>
      </View>
      <View style={styles.metricValue}>
        <PixelText style={[styles.metricNumber, { color: color }]}>
          {value.toLocaleString()}
        </PixelText>
        <PixelText style={[styles.metricUnit, { color: theme.colors.textSecondary }]}>
          {unit}
        </PixelText>
      </View>
      {progress !== undefined && (
        <ProgressBar
          progress={progress}
          color={color}
        />
      )}
    </View>
  );

  const renderWorkoutCard = (workout: HealthWorkout) => (
    <View key={workout.id} style={[styles.workoutCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.workoutHeader}>
        <PixelIcon 
          name={getWorkoutIcon(workout.type)} 
          size={20} 
          color={theme.colors.primary} 
        />
        <PixelText style={[styles.workoutType, { color: theme.colors.text }]}>
          {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
        </PixelText>
        <PixelText style={[styles.workoutSource, { color: theme.colors.textSecondary }]}>
          {workout.source}
        </PixelText>
      </View>
      <View style={styles.workoutStats}>
        <View style={styles.workoutStat}>
          <PixelText style={[styles.workoutStatValue, { color: theme.colors.primary }]}>
            {workout.duration}
          </PixelText>
          <PixelText style={[styles.workoutStatLabel, { color: theme.colors.textSecondary }]}>
            min
          </PixelText>
        </View>
        <View style={styles.workoutStat}>
          <PixelText style={[styles.workoutStatValue, { color: theme.colors.success }]}>
            {workout.calories}
          </PixelText>
          <PixelText style={[styles.workoutStatLabel, { color: theme.colors.textSecondary }]}>
            cal
          </PixelText>
        </View>
        {workout.distance && (
          <View style={styles.workoutStat}>
            <PixelText style={[styles.workoutStatValue, { color: theme.colors.warning }]}>
              {(workout.distance / 1000).toFixed(1)}
            </PixelText>
            <PixelText style={[styles.workoutStatLabel, { color: theme.colors.textSecondary }]}>
              km
            </PixelText>
          </View>
        )}
      </View>
    </View>
  );

  const getWorkoutIcon = (type: HealthWorkout['type']): string => {
    const iconMap: Record<HealthWorkout['type'], string> = {
      walking: 'walk',
      running: 'run',
      cycling: 'bike',
      swimming: 'swim',
      strength: 'dumbbell',
      yoga: 'yoga',
      other: 'workout',
    };
    return iconMap[type] || 'workout';
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  if (!metrics && !healthData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surface }]}>
          <PixelText style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading Health Data...
          </PixelText>
          <RetroButton
            title="Initialize Health Data"
            onPress={loadHealthData}
            variant="primary"
            size="medium"
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <PixelText style={[styles.headerTitle, { color: theme.colors.text }]}>
            Health Dashboard
          </PixelText>
          <PixelText style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Last sync: {formatLastSync(lastSync)}
          </PixelText>
        </View>
        <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSync}
            disabled={isLoading}
          >
            <PixelIcon name="refresh" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Daily Metrics */}
      <View style={styles.section}>
        <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Today's Progress
        </PixelText>
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Steps',
            metrics?.dailySteps || 0,
            'steps',
            'footsteps',
            theme.colors.primary,
            Math.min(100, ((metrics?.dailySteps || 0) / 10000) * 100)
          )}
          {renderMetricCard(
            'Calories',
            metrics?.dailyCalories || 0,
            'cal',
            'flame',
            theme.colors.success
          )}
          {renderMetricCard(
            'Distance',
            (metrics?.dailyDistance || 0) / 1000,
            'km',
            'map',
            theme.colors.warning
          )}
          {renderMetricCard(
            'Active Time',
            metrics?.activeMinutes || 0,
            'min',
            'clock',
            theme.colors.accent
          )}
        </View>
      </View>

      {/* Weekly Overview */}
      <View style={styles.section}>
        <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
          This Week
        </PixelText>
        <View style={styles.weeklyMetrics}>
          <View style={[styles.weeklyMetric, { backgroundColor: theme.colors.surface }]}>
            <PixelText style={[styles.weeklyMetricValue, { color: theme.colors.primary }]}>
              {metrics?.weeklySteps?.toLocaleString() || 0}
            </PixelText>
            <PixelText style={[styles.weeklyMetricLabel, { color: theme.colors.textSecondary }]}>
              Weekly Steps
            </PixelText>
          </View>
          <View style={[styles.weeklyMetric, { backgroundColor: theme.colors.surface }]}>
            <PixelText style={[styles.weeklyMetricValue, { color: theme.colors.success }]}>
              {metrics?.workoutsThisWeek || 0}
            </PixelText>
            <PixelText style={[styles.weeklyMetricLabel, { color: theme.colors.textSecondary }]}>
              Workouts
            </PixelText>
          </View>
          <View style={[styles.weeklyMetric, { backgroundColor: theme.colors.surface }]}>
            <PixelText style={[styles.weeklyMetricValue, { color: theme.colors.accent }]}>
              {metrics?.streakDays || 0}
            </PixelText>
            <PixelText style={[styles.weeklyMetricLabel, { color: theme.colors.textSecondary }]}>
              Day Streak
            </PixelText>
          </View>
        </View>
      </View>

      {/* Health Stats */}
      {healthData && (
        <View style={styles.section}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Health Stats
          </PixelText>
          <View style={styles.healthStats}>
            {healthData.heartRate && (
              <View style={[styles.healthStat, { backgroundColor: theme.colors.surface }]}>
                <PixelIcon name="heart" size={20} color={theme.colors.error} />
                <PixelText style={[styles.healthStatValue, { color: theme.colors.error }]}>
                  {healthData.heartRate}
                </PixelText>
                <PixelText style={[styles.healthStatLabel, { color: theme.colors.textSecondary }]}>
                  BPM
                </PixelText>
              </View>
            )}
            {healthData.sleepHours && (
              <View style={[styles.healthStat, { backgroundColor: theme.colors.surface }]}>
                <PixelIcon name="moon" size={20} color={theme.colors.secondary} />
                <PixelText style={[styles.healthStatValue, { color: theme.colors.secondary }]}>
                  {healthData.sleepHours.toFixed(1)}
                </PixelText>
                <PixelText style={[styles.healthStatLabel, { color: theme.colors.textSecondary }]}>
                  Hours Sleep
                </PixelText>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Recent Workouts */}
      {healthData?.workouts && healthData.workouts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.workoutHeader}>
            <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Recent Workouts
            </PixelText>
            <RetroButton
              title="View All"
              onPress={onViewWorkouts}
              variant="secondary"
              size="small"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {healthData.workouts.slice(0, 3).map(renderWorkoutCard)}
          </ScrollView>
        </View>
      )}

      {/* Connection Status */}
      <View style={[styles.connectionStatus, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.connectionInfo}>
          <PixelIcon 
            name={healthDataService.isHealthDataAvailable() ? 'wifi' : 'wifi-off'} 
            size={16} 
            color={healthDataService.isHealthDataAvailable() ? theme.colors.success : theme.colors.error} 
          />
          <PixelText style={[styles.connectionText, { color: theme.colors.textSecondary }]}>
            {healthDataService.isHealthDataAvailable() 
              ? `Connected to ${Platform.OS === 'ios' ? 'HealthKit' : 'Google Fit'}`
              : 'Health data not connected'
            }
          </PixelText>
        </View>
        <PixelText style={[styles.deviceInfo, { color: theme.colors.textSecondary }]}>
          {healthDataService.getDeviceInfo().platform} • {healthDataService.getDeviceInfo().model}
        </PixelText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
    margin: 16,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 12,
    marginBottom: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  metricUnit: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  weeklyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyMetric: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
  },
  weeklyMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  weeklyMetricLabel: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  healthStat: {
    padding: 12,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    minWidth: 80,
  },
  healthStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  healthStatLabel: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutCard: {
    width: 150,
    padding: 12,
    marginRight: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  workoutType: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'monospace',
  },
  workoutSource: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  workoutStat: {
    alignItems: 'center',
  },
  workoutStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  workoutStatLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  connectionStatus: {
    padding: 12,
    margin: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  connectionText: {
    fontSize: 12,
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  deviceInfo: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
}); 