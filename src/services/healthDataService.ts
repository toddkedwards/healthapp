import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { soundService } from './soundService';

// Conditional imports for health libraries
let Health: any = null;
let GoogleFit: any = null;
let Scopes: any = null;

try {
  Health = require('expo-health');
} catch (error) {
  console.log('expo-health not available');
}

try {
  const googleFitModule = require('react-native-google-fit');
  GoogleFit = googleFitModule.default;
  Scopes = googleFitModule.Scopes;
} catch (error) {
  console.log('react-native-google-fit not available');
}

export interface HealthData {
  steps: number;
  distance: number; // in meters
  calories: number;
  activeMinutes: number;
  workouts: HealthWorkout[];
  heartRate: number | null;
  sleepHours: number | null;
  lastSync: Date;
  isConnected: boolean;
}

export interface HealthWorkout {
  id: string;
  type: 'walking' | 'running' | 'cycling' | 'swimming' | 'strength' | 'yoga' | 'other';
  duration: number; // in minutes
  calories: number;
  distance?: number; // in meters
  startTime: Date;
  endTime: Date;
  source: 'healthkit' | 'googlefit' | 'manual';
}

export interface HealthMetrics {
  dailySteps: number;
  weeklySteps: number;
  monthlySteps: number;
  dailyCalories: number;
  weeklyCalories: number;
  dailyDistance: number;
  weeklyDistance: number;
  activeMinutes: number;
  workoutsThisWeek: number;
  streakDays: number;
}

class HealthDataService {
  private isInitialized = false;
  private lastSyncTime: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private platform: 'ios' | 'android' | 'web' = 'web';

  // Initialize health data service
  async initialize(): Promise<boolean> {
    try {
      console.log('=== HEALTH SERVICE INITIALIZE START ===');
      console.log('Initializing health data service...');
      console.log('Current platform:', Platform.OS);
      console.log('Current isInitialized state:', this.isInitialized);
      
      this.platform = Platform.OS as 'ios' | 'android' | 'web';
      
      // Support web for mock/dev
      if (Platform.OS === 'ios') {
        console.log('Initializing for iOS (HealthKit)...');
        const result = await this.initializeHealthKit();
        console.log('HealthKit initialization result:', result);
        return result;
      } else if (Platform.OS === 'android') {
        console.log('Initializing for Android (Google Fit)...');
        const result = await this.initializeGoogleFit();
        console.log('Google Fit initialization result:', result);
        return result;
      } else if (Platform.OS === 'web') {
        console.log('Initializing for Web (Mock Health)...');
        this.isInitialized = true;
        this.startBackgroundSync();
        return true;
      } else {
        console.log('Health data not supported on this platform');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize health data service:', error);
      return false;
    } finally {
      console.log('=== HEALTH SERVICE INITIALIZE END ===');
    }
  }

  // Initialize HealthKit (iOS) - Real implementation
  private async initializeHealthKit(): Promise<boolean> {
    try {
      console.log('=== HEALTHKIT INITIALIZE START ===');
      
      if (!Health) {
        console.log('HealthKit library not available');
        return false;
      }
      
      // Check if HealthKit is available
      const isAvailable = await Health.isAvailableAsync();
      if (!isAvailable) {
        console.log('HealthKit is not available on this device');
        return false;
      }

      // Request permissions
      const permissions = await Health.requestPermissionsAsync([
        Health.PermissionKind.Steps,
        Health.PermissionKind.Distance,
        Health.PermissionKind.Calories,
        Health.PermissionKind.HeartRate,
        Health.PermissionKind.SleepAnalysis,
        Health.PermissionKind.Workouts,
      ]);

      if (!permissions) {
        console.log('HealthKit permissions denied');
        return false;
      }

      this.isInitialized = true;
      console.log('HealthKit permissions granted');
      console.log('isInitialized set to:', this.isInitialized);
      
      // Start background sync
      this.startBackgroundSync();
      console.log('Background sync started');
      
      console.log('=== HEALTHKIT INITIALIZE END ===');
      return true;
    } catch (error) {
      console.error('HealthKit initialization failed:', error);
      return false;
    }
  }

  // Initialize Google Fit (Android) - Real implementation
  private async initializeGoogleFit(): Promise<boolean> {
    try {
      console.log('=== GOOGLE FIT INITIALIZE START ===');
      
      if (!GoogleFit) {
        console.log('Google Fit library not available');
        return false;
      }
      
      // Check if Google Fit is available
      const isAvailable = await GoogleFit.isAvailable();
      if (!isAvailable) {
        console.log('Google Fit is not available on this device');
        return false;
      }

      // Request authorization
      const authorized = await GoogleFit.authorize({
        scopes: [
          Scopes.FITNESS_ACTIVITY_READ,
          Scopes.FITNESS_BODY_READ,
          Scopes.FITNESS_LOCATION_READ,
          Scopes.FITNESS_NUTRITION_READ,
        ]
      });

      if (!authorized) {
        console.log('Google Fit authorization denied');
        return false;
      }

      this.isInitialized = true;
      console.log('Google Fit authorization granted');
      
      // Start background sync
      this.startBackgroundSync();
      
      console.log('=== GOOGLE FIT INITIALIZE END ===');
      return true;
    } catch (error) {
      console.error('Google Fit initialization failed:', error);
      return false;
    }
  }

  // Start background sync
  private startBackgroundSync(): void {
    // Sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncHealthData();
    }, 5 * 60 * 1000);
  }

  // Stop background sync
  stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Sync health data - Real implementation with fallback
  async syncHealthData(): Promise<HealthData | null> {
    if (!this.isInitialized) {
      console.log('Health data service not initialized');
      return null;
    }

    try {
      console.log('Syncing health data...');
      
      const now = new Date();
      let healthData: HealthData;

      if (this.platform === 'ios' && Health) {
        // Use real HealthKit data
        healthData = await this.getHealthKitData();
      } else if (this.platform === 'android' && GoogleFit) {
        // Use real Google Fit data
        healthData = await this.getGoogleFitData();
      } else {
        // Fallback to mock data (web or when libraries unavailable)
        healthData = this.generateMockHealthData();
      }

      this.lastSyncTime = now;
      console.log('Health data sync completed');
      
      // Play success sound
      soundService.playHealthSync();
      
      return healthData;
    } catch (error) {
      console.error('Health data sync failed:', error);
      // Fallback to mock data on error
      return this.generateMockHealthData();
    }
  }

  // Get real HealthKit data
  private async getHealthKitData(): Promise<HealthData> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Get steps for today
      const steps = await Health.getStepCountAsync(startOfDay, now);
      
      // Get distance for today
      const distance = await Health.getDistanceWalkingRunningAsync(startOfDay, now);
      
      // Get active calories for today
      const calories = await Health.getActiveCaloriesBurnedAsync(startOfDay, now);
      
      // Get heart rate (latest)
      const heartRate = await Health.getHeartRateAsync(startOfDay, now);
      
      // Get sleep data
      const sleepData = await Health.getSleepAnalysisAsync(startOfDay, now);
      
      // Get workouts
      const workouts = await Health.getWorkoutsAsync(startOfDay, now);

      return {
        steps: steps || 0,
        distance: distance || 0,
        calories: calories || 0,
        activeMinutes: Math.floor((calories || 0) / 3), // Rough estimate
        workouts: this.mapHealthKitWorkouts(workouts || []),
        heartRate: heartRate ? heartRate[heartRate.length - 1]?.value : null,
        sleepHours: this.calculateSleepHours(sleepData || []),
        lastSync: now,
        isConnected: true,
      };
    } catch (error) {
      console.error('Error getting HealthKit data:', error);
      throw error;
    }
  }

  // Get real Google Fit data
  private async getGoogleFitData(): Promise<HealthData> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Get steps for today
      const stepsData = await GoogleFit.getSteps(startOfDay.getTime(), now.getTime());
      const steps = stepsData.length > 0 ? stepsData[0].value : 0;
      
      // Get distance for today
      const distanceData = await GoogleFit.getDistance(startOfDay.getTime(), now.getTime());
      const distance = distanceData.length > 0 ? distanceData[0].value : 0;
      
      // Get calories for today
      const caloriesData = await GoogleFit.getCalories(startOfDay.getTime(), now.getTime());
      const calories = caloriesData.length > 0 ? caloriesData[0].value : 0;
      
      // Get heart rate
      const heartRateData = await GoogleFit.getHeartRate(startOfDay.getTime(), now.getTime());
      const heartRate = heartRateData.length > 0 ? heartRateData[heartRateData.length - 1].value : null;

      return {
        steps: steps,
        distance: distance,
        calories: calories,
        activeMinutes: Math.floor(calories / 3), // Rough estimate
        workouts: [], // Google Fit workouts would need additional implementation
        heartRate: heartRate,
        sleepHours: null, // Google Fit sleep would need additional implementation
        lastSync: now,
        isConnected: true,
      };
    } catch (error) {
      console.error('Error getting Google Fit data:', error);
      throw error;
    }
  }

  // Generate mock health data (fallback)
  private generateMockHealthData(): HealthData {
    const now = new Date();
    
    return {
      steps: Math.floor(Math.random() * 8000) + 2000, // 2000-10000 steps
      distance: Math.floor(Math.random() * 5000) + 1000, // 1-6km
      calories: Math.floor(Math.random() * 300) + 100, // 100-400 calories
      activeMinutes: Math.floor(Math.random() * 60) + 20, // 20-80 minutes
      workouts: this.generateMockWorkouts(),
      heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
      sleepHours: Math.floor(Math.random() * 3) + 6, // 6-9 hours
      lastSync: now,
      isConnected: false, // Mock data means not connected to real health service
    };
  }

  // Generate mock workouts
  private generateMockWorkouts(): HealthWorkout[] {
    const workoutTypes: HealthWorkout['type'][] = ['walking', 'running', 'cycling', 'strength', 'yoga'];
    const workouts: HealthWorkout[] = [];
    
    // Generate 1-3 random workouts
    const numWorkouts = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numWorkouts; i++) {
      const type = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
      const duration = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
      const calories = Math.floor(duration * (Math.random() * 5 + 3)); // 3-8 calories per minute
      
      workouts.push({
        id: `workout_${Date.now()}_${i}`,
        type,
        duration,
        calories,
        distance: type === 'walking' || type === 'running' ? Math.floor(duration * (Math.random() * 50 + 30)) : undefined,
        startTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        endTime: new Date(),
        source: Platform.OS === 'ios' ? 'healthkit' : 'googlefit',
      });
    }
    
    return workouts;
  }

  // Map workout types to our internal types
  private mapWorkoutType(workoutType: string): HealthWorkout['type'] {
    const typeMap: Record<string, HealthWorkout['type']> = {
      'walking': 'walking',
      'running': 'running',
      'cycling': 'cycling',
      'swimming': 'swimming',
      'strength': 'strength',
      'yoga': 'yoga',
      'workout': 'other',
      'exercise': 'other',
    };

    return typeMap[workoutType.toLowerCase()] || 'other';
  }

  // Map HealthKit workouts to our format
  private mapHealthKitWorkouts(workouts: any[]): HealthWorkout[] {
    return workouts.map(workout => ({
      id: workout.id || `workout_${Date.now()}`,
      type: this.mapWorkoutType(workout.workoutActivityType || 'other'),
      duration: Math.floor((workout.endDate - workout.startDate) / 60000), // Convert to minutes
      calories: workout.totalEnergyBurned || 0,
      distance: workout.totalDistance || undefined,
      startTime: new Date(workout.startDate),
      endTime: new Date(workout.endDate),
      source: 'healthkit' as const,
    }));
  }

  // Calculate sleep hours from HealthKit sleep data
  private calculateSleepHours(sleepData: any[]): number | null {
    if (!sleepData || sleepData.length === 0) return null;
    
    let totalSleepMinutes = 0;
    for (const sleep of sleepData) {
      if (sleep.sleepState === 'inBed' || sleep.sleepState === 'asleep') {
        const duration = (sleep.endDate - sleep.startDate) / 60000; // Convert to minutes
        totalSleepMinutes += duration;
      }
    }
    
    return totalSleepMinutes > 0 ? totalSleepMinutes / 60 : null;
  }

  // Get health metrics for different time periods - Mock implementation
  async getHealthMetrics(): Promise<HealthMetrics> {
    if (!this.isInitialized) {
      return this.getDefaultMetrics();
    }

    try {
      // Generate mock metrics
      const metrics: HealthMetrics = {
        dailySteps: Math.floor(Math.random() * 8000) + 2000,
        weeklySteps: Math.floor(Math.random() * 50000) + 15000,
        monthlySteps: Math.floor(Math.random() * 200000) + 60000,
        dailyCalories: Math.floor(Math.random() * 300) + 100,
        weeklyCalories: Math.floor(Math.random() * 2000) + 700,
        dailyDistance: Math.floor(Math.random() * 5000) + 1000,
        weeklyDistance: Math.floor(Math.random() * 30000) + 10000,
        activeMinutes: Math.floor(Math.random() * 60) + 20,
        workoutsThisWeek: Math.floor(Math.random() * 5) + 1,
        streakDays: Math.floor(Math.random() * 7) + 1,
      };

      return metrics;
    } catch (error) {
      console.error('Failed to get health metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  // Get default metrics when health data is not available
  private getDefaultMetrics(): HealthMetrics {
    return {
      dailySteps: 0,
      weeklySteps: 0,
      monthlySteps: 0,
      dailyCalories: 0,
      weeklyCalories: 0,
      dailyDistance: 0,
      weeklyDistance: 0,
      activeMinutes: 0,
      workoutsThisWeek: 0,
      streakDays: 0,
    };
  }

  // Check if health data is available
  isHealthDataAvailable(): boolean {
    return this.isInitialized;
  }

  // Get last sync time
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  // Request permissions manually
  async requestPermissions(): Promise<boolean> {
    console.log('HealthDataService: requestPermissions called');
    const result = await this.initialize();
    console.log('HealthDataService: requestPermissions result:', result);
    return result;
  }

  // Check if permissions are granted - Mock implementation
  async checkPermissions(): Promise<boolean> {
    try {
      // Simulate permission check
      return this.isInitialized;
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return false;
    }
  }

  // Get device info
  getDeviceInfo(): { platform: string; model: string; brand: string } {
    return {
      platform: Platform.OS,
      model: Device.modelName || 'Unknown',
      brand: Device.brand || 'Unknown',
    };
  }

  // Cleanup
  cleanup(): void {
    this.stopBackgroundSync();
    this.isInitialized = false;
  }
}

export const healthDataService = new HealthDataService();
export default healthDataService; 