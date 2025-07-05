import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { firebaseService } from './firebaseService';

export interface NotificationData {
  type: 'quest' | 'achievement' | 'boss' | 'streak' | 'daily' | 'weekly' | 'reminder';
  title: string;
  body: string;
  data?: any;
  scheduled?: boolean;
  trigger?: Notifications.NotificationTriggerInput;
}

export interface NotificationSettings {
  questReminders: boolean;
  achievementNotifications: boolean;
  bossBattles: boolean;
  streakAlerts: boolean;
  dailyDigest: boolean;
  weeklySummary: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
}

class NotificationService {
  private isInitialized = false;
  private expoPushToken: string | null = null;
  private settings: NotificationSettings = {
    questReminders: true,
    achievementNotifications: true,
    bossBattles: true,
    streakAlerts: true,
    dailyDigest: true,
    weeklySummary: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00"
    }
  };

  // Initialize notification service
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing notification service...');

      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Get push token
      if (Platform.OS !== 'web') {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'geekfit-d84a7', // Your Expo project ID
        });
        this.expoPushToken = token.data;
        console.log('Push token:', this.expoPushToken);
      }

      this.isInitialized = true;
      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  // Get push token
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  // Check if service is initialized
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Send immediate notification
  async sendNotification(notification: NotificationData): Promise<string | null> {
    if (!this.isInitialized) {
      console.log('Notification service not initialized');
      return null;
    }

    try {
      // Check quiet hours
      if (this.settings.quietHours.enabled && this.isInQuietHours()) {
        console.log('Notification blocked due to quiet hours');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          badge: 1,
        },
        trigger: notification.trigger || null,
      });

      console.log('Notification sent:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  // Schedule notification for later
  async scheduleNotification(notification: NotificationData, trigger: Notifications.NotificationTriggerInput): Promise<string | null> {
    if (!this.isInitialized) {
      console.log('Notification service not initialized');
      return null;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
          badge: 1,
        },
        trigger,
      });

      console.log('Notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Cancel notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Quest-specific notifications
  async sendQuestReminder(questTitle: string, questDescription: string): Promise<string | null> {
    if (!this.settings.questReminders) return null;

    return this.sendNotification({
      type: 'quest',
      title: '🎯 Quest Reminder',
      body: `${questTitle}: ${questDescription}`,
      data: { questTitle, questDescription }
    });
  }

  async sendDailyQuestRefresh(): Promise<string | null> {
    if (!this.settings.questReminders) return null;

    return this.sendNotification({
      type: 'daily',
      title: '🌅 New Daily Quests Available!',
      body: 'Your daily quests have been refreshed. Time to level up!',
      data: { type: 'daily_refresh' }
    });
  }

  // Achievement notifications
  async sendAchievementUnlock(achievementTitle: string, achievementDescription: string): Promise<string | null> {
    if (!this.settings.achievementNotifications) return null;

    return this.sendNotification({
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      body: `${achievementTitle}: ${achievementDescription}`,
      data: { achievementTitle, achievementDescription }
    });
  }

  // Boss battle notifications
  async sendBossBattleInvitation(bossName: string, bossLevel: number): Promise<string | null> {
    if (!this.settings.bossBattles) return null;

    return this.sendNotification({
      type: 'boss',
      title: '⚔️ Boss Battle Available!',
      body: `Level ${bossLevel} ${bossName} is ready for battle!`,
      data: { bossName, bossLevel }
    });
  }

  // Streak notifications
  async sendStreakAlert(currentStreak: number, daysToNextMilestone: number): Promise<string | null> {
    if (!this.settings.streakAlerts) return null;

    return this.sendNotification({
      type: 'streak',
      title: '🔥 Streak Alert!',
      body: `You're on a ${currentStreak}-day streak! ${daysToNextMilestone} days until your next milestone.`,
      data: { currentStreak, daysToNextMilestone }
    });
  }

  async sendStreakBreakAlert(previousStreak: number): Promise<string | null> {
    if (!this.settings.streakAlerts) return null;

    return this.sendNotification({
      type: 'streak',
      title: '💔 Streak Broken',
      body: `Your ${previousStreak}-day streak has ended. Don't give up!`,
      data: { previousStreak }
    });
  }

  // Daily digest
  async sendDailyDigest(stats: {
    steps: number;
    calories: number;
    questsCompleted: number;
    xpEarned: number;
  }): Promise<string | null> {
    if (!this.settings.dailyDigest) return null;

    return this.sendNotification({
      type: 'daily',
      title: '📊 Daily Fitness Summary',
      body: `${stats.steps} steps • ${stats.calories} calories • ${stats.questsCompleted} quests completed • +${stats.xpEarned} XP`,
      data: { stats }
    });
  }

  // Weekly summary
  async sendWeeklySummary(stats: {
    totalSteps: number;
    totalCalories: number;
    questsCompleted: number;
    achievementsUnlocked: number;
    levelGained: number;
  }): Promise<string | null> {
    if (!this.settings.weeklySummary) return null;

    return this.sendNotification({
      type: 'weekly',
      title: '📈 Weekly Progress Report',
      body: `${stats.totalSteps.toLocaleString()} steps • ${stats.totalCalories} calories • ${stats.questsCompleted} quests • ${stats.achievementsUnlocked} achievements • +${stats.levelGained} levels`,
      data: { stats }
    });
  }

  // Schedule recurring notifications
  async scheduleDailyQuestReminder(hour: number = 9, minute: number = 0): Promise<string | null> {
    const trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    };

    return this.scheduleNotification({
      type: 'daily',
      title: '🌅 Daily Quest Check-in',
      body: 'Time to check your daily quests and start your fitness journey!',
      data: { type: 'daily_reminder' }
    }, trigger);
  }

  async scheduleWeeklySummary(dayOfWeek: number = 0, hour: number = 18, minute: number = 0): Promise<string | null> {
    const trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      weekday: dayOfWeek,
      hour,
      minute,
      repeats: true,
    };

    return this.scheduleNotification({
      type: 'weekly',
      title: '📈 Weekly Progress Report',
      body: 'Check out your weekly fitness achievements!',
      data: { type: 'weekly_summary' }
    }, trigger);
  }

  async scheduleStreakReminder(hour: number = 20, minute: number = 0): Promise<string | null> {
    const trigger: Notifications.NotificationTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    };

    return this.scheduleNotification({
      type: 'streak',
      title: '🔥 Don\'t Break Your Streak!',
      body: 'Complete a quick workout to maintain your streak!',
      data: { type: 'streak_reminder' }
    }, trigger);
  }

  // Settings management
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Notification settings updated:', this.settings);
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Quiet hours check
  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = this.settings.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = this.settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      // Same day (e.g., 08:00 to 22:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight (e.g., 22:00 to 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Get notification history
  async getNotificationHistory(): Promise<Notifications.Notification[]> {
    try {
      return await Notifications.getPresentedNotificationsAsync();
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  // Clear notification history
  async clearNotificationHistory(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('Notification history cleared');
    } catch (error) {
      console.error('Error clearing notification history:', error);
    }
  }

  // Test notification
  async sendTestNotification(): Promise<string | null> {
    return this.sendNotification({
      type: 'reminder',
      title: '🧪 Test Notification',
      body: 'This is a test notification from GeekFit!',
      data: { type: 'test' }
    });
  }

  // Cleanup
  cleanup(): void {
    this.isInitialized = false;
    this.expoPushToken = null;
  }
}

export const notificationService = new NotificationService(); 