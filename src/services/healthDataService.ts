import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { soundService } from './soundService';

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

  // Initialize health data service
  async initialize(): Promise<boolean> {
    try {
      console.log('=== HEALTH SERVICE INITIALIZE START ===');
      console.log('Initializing health data service...');
      console.log('Current platform:', Platform.OS);
      console.log('Current isInitialized state:', this.isInitialized);
      
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

  // Initialize HealthKit (iOS) - Mock implementation
  private async initializeHealthKit(): Promise<boolean> {
    try {
      console.log('=== HEALTHKIT INITIALIZE START ===');
      // Simulate permission request
      console.log('Requesting HealthKit permissions...');
      
      // Simulate a small delay to make it feel more realistic
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate permission granted
      this.isInitialized = true;
      console.log('HealthKit permissions granted (mock)');
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

  // Initialize Google Fit (Android) - Mock implementation
  private async initializeGoogleFit(): Promise<boolean> {
    try {
      // Simulate permission request
      console.log('Requesting Google Fit permissions...');
      
      // Simulate permission granted
      this.isInitialized = true;
      console.log('Google Fit permissions granted (mock)');
      
      // Start background sync
      this.startBackgroundSync();
      
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

  // Sync health data - Mock implementation
  async syncHealthData(): Promise<HealthData | null> {
    if (!this.isInitialized) {
      console.log('Health data service not initialized');
      return null;
    }

    try {
      console.log('Syncing health data (mock)...');
      
      const now = new Date();
      
      // Generate mock health data
      const healthData: HealthData = {
        steps: Math.floor(Math.random() * 8000) + 2000, // 2000-10000 steps
        distance: Math.floor(Math.random() * 5000) + 1000, // 1-6km
        calories: Math.floor(Math.random() * 300) + 100, // 100-400 calories
        activeMinutes: Math.floor(Math.random() * 60) + 20, // 20-80 minutes
        workouts: this.generateMockWorkouts(),
        heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
        sleepHours: Math.floor(Math.random() * 3) + 6, // 6-9 hours
        lastSync: now,
        isConnected: true,
      };

      this.lastSyncTime = now;
      console.log('Health data sync completed (mock)');
      
      // Play success sound
      soundService.playHealthSync();
      
      return healthData;
    } catch (error) {
      console.error('Health data sync failed:', error);
      return null;
    }
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