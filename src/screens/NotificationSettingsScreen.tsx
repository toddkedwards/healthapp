import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { notificationService, NotificationSettings } from '../services/notificationService';
import { soundService } from '../services/soundService';

interface NotificationSettingsScreenProps {
  navigation: any;
}

export default function NotificationSettingsScreen({ navigation }: NotificationSettingsScreenProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
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
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    initializeNotifications();
    loadSettings();
  }, []);

  const initializeNotifications = async () => {
    try {
      const success = await notificationService.initialize();
      setIsInitialized(success);
      if (success) {
        setPushToken(notificationService.getPushToken());
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const loadSettings = () => {
    const currentSettings = notificationService.getSettings();
    setSettings(currentSettings);
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const updateQuietHours = (key: 'enabled' | 'start' | 'end', value: any) => {
    const newQuietHours = { ...settings.quietHours, [key]: value };
    const newSettings = { ...settings, quietHours: newQuietHours };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const sendTestNotification = async () => {
    if (!isInitialized) {
      Alert.alert('Notifications Not Available', 'Please enable notifications in your device settings.');
      return;
    }

    try {
      soundService.playSound('ui_click');
      const notificationId = await notificationService.sendTestNotification();
      if (notificationId) {
        Alert.alert('Test Sent', 'Check your notification panel for the test notification!');
      } else {
        Alert.alert('Test Failed', 'Unable to send test notification. Please check your settings.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const scheduleRecurringNotifications = async () => {
    try {
      await notificationService.scheduleDailyQuestReminder(9, 0); // 9:00 AM
      await notificationService.scheduleWeeklySummary(0, 18, 0); // Sunday 6:00 PM
      await notificationService.scheduleStreakReminder(20, 0); // 8:00 PM
      Alert.alert('Scheduled', 'Recurring notifications have been scheduled!');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
      Alert.alert('Error', 'Failed to schedule recurring notifications.');
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      'This will cancel all scheduled notifications. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.cancelAllNotifications();
              Alert.alert('Cleared', 'All notifications have been cancelled.');
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications.');
            }
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#4a4a4a', true: '#8B5CF6' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor="#4a4a4a"
      />
    </View>
  );

  const renderTimePicker = (title: string, value: string, onPress: () => void) => (
    <TouchableOpacity style={styles.timePickerItem} onPress={onPress}>
      <Text style={styles.timePickerTitle}>{title}</Text>
      <Text style={styles.timePickerValue}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Notification Settings</Text>
        <Text style={styles.subtitle}>Customize your GeekFit experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Push Notifications</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Status</Text>
          <Text style={[styles.statusText, { color: isInitialized ? '#10B981' : '#EF4444' }]}>
            {isInitialized ? '✅ Enabled' : '❌ Disabled'}
          </Text>
          {pushToken && (
            <Text style={styles.tokenText}>Token: {pushToken.substring(0, 20)}...</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Quest Notifications</Text>
        {renderSettingItem(
          'Daily Quest Reminders',
          'Get notified when new daily quests are available',
          settings.questReminders,
          (value) => updateSetting('questReminders', value),
          '🎯'
        )}
        {renderSettingItem(
          'Achievement Alerts',
          'Celebrate when you unlock new achievements',
          settings.achievementNotifications,
          (value) => updateSetting('achievementNotifications', value),
          '🏆'
        )}
        {renderSettingItem(
          'Boss Battle Invitations',
          'Get notified when boss battles become available',
          settings.bossBattles,
          (value) => updateSetting('bossBattles', value),
          '⚔️'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Streak & Progress</Text>
        {renderSettingItem(
          'Streak Alerts',
          'Stay motivated with streak maintenance reminders',
          settings.streakAlerts,
          (value) => updateSetting('streakAlerts', value),
          '🔥'
        )}
        {renderSettingItem(
          'Daily Fitness Summary',
          'Get a daily digest of your fitness progress',
          settings.dailyDigest,
          (value) => updateSetting('dailyDigest', value),
          '📊'
        )}
        {renderSettingItem(
          'Weekly Progress Report',
          'Review your weekly achievements and progress',
          settings.weeklySummary,
          (value) => updateSetting('weeklySummary', value),
          '📈'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌙 Quiet Hours</Text>
        {renderSettingItem(
          'Enable Quiet Hours',
          'Pause notifications during specified hours',
          settings.quietHours.enabled,
          (value) => updateQuietHours('enabled', value),
          '🌙'
        )}
        {settings.quietHours.enabled && (
          <View style={styles.quietHoursContainer}>
            {renderTimePicker(
              'Start Time',
              settings.quietHours.start,
              () => {
                // In a real app, you'd show a time picker here
                Alert.alert('Time Picker', 'Time picker would open here');
              }
            )}
            {renderTimePicker(
              'End Time',
              settings.quietHours.end,
              () => {
                // In a real app, you'd show a time picker here
                Alert.alert('Time Picker', 'Time picker would open here');
              }
            )}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Testing & Management</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={sendTestNotification}>
          <Text style={styles.actionButtonIcon}>🧪</Text>
          <Text style={styles.actionButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={scheduleRecurringNotifications}>
          <Text style={styles.actionButtonIcon}>⏰</Text>
          <Text style={styles.actionButtonText}>Schedule Recurring Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={clearAllNotifications}
        >
          <Text style={styles.actionButtonIcon}>🗑️</Text>
          <Text style={styles.actionButtonText}>Clear All Notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Tip: Enable notifications to stay motivated and never miss a quest!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 12,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  quietHoursContainer: {
    marginTop: 16,
    paddingLeft: 40,
  },
  timePickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timePickerTitle: {
    fontSize: 16,
    color: '#ffffff',
  },
  timePickerValue: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  dangerButton: {
    borderColor: '#EF4444',
    backgroundColor: '#2a1a1a',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 