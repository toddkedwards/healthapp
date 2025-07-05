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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { soundService } from '../services/soundService';
import { notificationService, NotificationSettings } from '../services/notificationService';
import { adminService, AdminUser } from '../services/adminService';
import { healthDataService } from '../services/healthDataService';
import PixelBackground from '../components/PixelBackground';
import { RetroButton } from '../components/RetroButton';

type SettingsTab = 'profile' | 'audio' | 'notifications' | 'health' | 'admin';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const { updateUser } = useUser();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthDataConnected, setHealthDataConnected] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    questReminders: true,
    bossBattleAlerts: true,
    achievementCelebrations: true,
    dailyMotivation: true,
    weeklyProgress: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  useEffect(() => {
    loadSettings();
    checkAdminStatus();
  }, []);

  const loadSettings = async () => {
    try {
      // Load audio settings
      const audioSettings = await soundService.getSettings();
      setAudioEnabled(audioSettings.enabled);
      setSoundEffectsEnabled(audioSettings.soundEffectsEnabled);

      // Load notification settings
      const notifSettings = await notificationService.getSettings();
      setNotificationSettings(notifSettings);
      setNotificationsEnabled(notifSettings.enabled);

      // Check health data connection
      const healthStatus = await healthDataService.getConnectionStatus();
      setHealthDataConnected(healthStatus.isConnected);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const adminStatus = await adminService.checkAdminStatus(user.id);
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        setAdminUser(adminService.getAdminUser());
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleTabPress = (tab: SettingsTab) => {
    soundService.playTabSwitch();
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              showNotification('Signed out successfully', 'success');
            } catch (error) {
              showNotification('Error signing out', 'error');
            }
          },
        },
      ]
    );
  };

  const renderTabButton = (tab: SettingsTab, icon: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && { backgroundColor: theme.colors.primary }
      ]}
      onPress={() => handleTabPress(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? '#fff' : theme.colors.text}
      />
      <Text style={[
        styles.tabLabel,
        { color: activeTab === tab ? '#fff' : theme.colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>👤 User Profile</Text>
        
        <View style={styles.profileInfo}>
          <Text style={[styles.profileLabel, { color: theme.colors.textSecondary }]}>Username</Text>
          <Text style={[styles.profileValue, { color: theme.colors.text }]}>{user?.username}</Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={[styles.profileLabel, { color: theme.colors.textSecondary }]}>Email</Text>
          <Text style={[styles.profileValue, { color: theme.colors.text }]}>{user?.email}</Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={[styles.profileLabel, { color: theme.colors.textSecondary }]}>Level</Text>
          <Text style={[styles.profileValue, { color: theme.colors.text }]}>{user?.level}</Text>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={[styles.profileLabel, { color: theme.colors.textSecondary }]}>Character Class</Text>
          <Text style={[styles.profileValue, { color: theme.colors.text }]}>
            {user?.characterClass?.charAt(0).toUpperCase() + user?.characterClass?.slice(1)}
          </Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🎮 Game Stats</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{user?.totalXp || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Total XP</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{user?.coins || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Coins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{user?.achievements?.length || 0}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Achievements</Text>
          </View>
        </View>
      </View>

      <RetroButton
        title="Sign Out"
        onPress={handleSignOut}
        variant="danger"
        style={styles.signOutButton}
      />
    </View>
  );

  const renderAudioTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🔊 Audio Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="volume-high" size={24} color={theme.colors.text} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Master Audio</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Enable all audio features
              </Text>
            </View>
          </View>
          <Switch
            value={audioEnabled}
            onValueChange={setAudioEnabled}
            trackColor={{ false: '#4a4a4a', true: theme.colors.primary }}
            thumbColor={audioEnabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="musical-notes" size={24} color={theme.colors.text} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Sound Effects</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Play sound effects for actions
              </Text>
            </View>
          </View>
          <Switch
            value={soundEffectsEnabled}
            onValueChange={setSoundEffectsEnabled}
            trackColor={{ false: '#4a4a4a', true: theme.colors.primary }}
            thumbColor={soundEffectsEnabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.testButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => soundService.playSoundEffect('button_click')}
      >
        <Text style={[styles.testButtonText, { color: theme.colors.text }]}>
          🎵 Test Sound Effect
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🔔 Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="notifications" size={24} color={theme.colors.text} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Enable Notifications</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Receive push notifications
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#4a4a4a', true: theme.colors.primary }}
            thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="list" size={24} color={theme.colors.text} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Quest Reminders</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Remind me about active quests
              </Text>
            </View>
          </View>
          <Switch
            value={notificationSettings.questReminders}
            onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, questReminders: value }))}
            trackColor={{ false: '#4a4a4a', true: theme.colors.primary }}
            thumbColor={notificationSettings.questReminders ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="flash" size={24} color={theme.colors.text} />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Boss Battle Alerts</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                Notify when boss battles are available
              </Text>
            </View>
          </View>
          <Switch
            value={notificationSettings.bossBattleAlerts}
            onValueChange={(value) => setNotificationSettings(prev => ({ ...prev, bossBattleAlerts: value }))}
            trackColor={{ false: '#4a4a4a', true: theme.colors.primary }}
            thumbColor={notificationSettings.bossBattleAlerts ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.testButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => showNotification('Test notification!', 'success')}
      >
        <Text style={[styles.testButtonText, { color: theme.colors.text }]}>
          🧪 Test Notification
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHealthTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 Health Data</Text>
        
        <View style={styles.healthStatus}>
          <Text style={[styles.healthStatusText, { color: theme.colors.text }]}>
            Status: {healthDataConnected ? '✅ Connected' : '❌ Not Connected'}
          </Text>
          <Text style={[styles.healthStatusSubtext, { color: theme.colors.textSecondary }]}>
            {healthDataConnected 
              ? 'Your health data is being tracked and synced with quests'
              : 'Connect your health data to track fitness progress'
            }
          </Text>
        </View>

        <RetroButton
          title={healthDataConnected ? "Reconnect Health Data" : "Connect Health Data"}
          onPress={async () => {
            try {
              await healthDataService.connectHealthData();
              const status = await healthDataService.getConnectionStatus();
              setHealthDataConnected(status.isConnected);
              showNotification(
                status.isConnected ? 'Health data connected!' : 'Health data connection failed',
                status.isConnected ? 'success' : 'error'
              );
            } catch (error) {
              showNotification('Error connecting health data', 'error');
            }
          }}
          variant={healthDataConnected ? "secondary" : "primary"}
          style={styles.healthButton}
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📈 Data Sources</Text>
        
        <View style={styles.dataSourceItem}>
          <Ionicons name="logo-apple" size={24} color={theme.colors.text} />
          <Text style={[styles.dataSourceText, { color: theme.colors.text }]}>Apple HealthKit</Text>
          <Text style={[styles.dataSourceStatus, { color: theme.colors.success }]}>Available</Text>
        </View>
        
        <View style={styles.dataSourceItem}>
          <Ionicons name="logo-google" size={24} color={theme.colors.text} />
          <Text style={[styles.dataSourceText, { color: theme.colors.text }]}>Google Fit</Text>
          <Text style={[styles.dataSourceStatus, { color: theme.colors.success }]}>Available</Text>
        </View>
      </View>
    </View>
  );

  const renderAdminTab = () => (
    <View style={styles.tabContent}>
      {!isAdmin ? (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🛠️ Admin Access</Text>
          <Text style={[styles.adminMessage, { color: theme.colors.textSecondary }]}>
            You don't have admin privileges. Contact support if you believe this is an error.
          </Text>
        </View>
      ) : (
        <>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>🛠️ Admin Panel</Text>
            <Text style={[styles.adminWelcome, { color: theme.colors.text }]}>
              Welcome, {adminUser?.email} ({adminUser?.role})
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 Quick Actions</Text>
            
            <TouchableOpacity
              style={[styles.adminAction, { backgroundColor: theme.colors.primary }]}
              onPress={() => showNotification('Admin features coming soon!', 'info')}
            >
              <Ionicons name="analytics" size={24} color="#fff" />
              <Text style={styles.adminActionText}>View Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminAction, { backgroundColor: theme.colors.warning }]}
              onPress={() => showNotification('Content management coming soon!', 'info')}
            >
              <Ionicons name="create" size={24} color="#fff" />
              <Text style={styles.adminActionText}>Manage Content</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminAction, { backgroundColor: theme.colors.error }]}
              onPress={() => showNotification('User management coming soon!', 'info')}
            >
              <Ionicons name="people" size={24} color="#fff" />
              <Text style={styles.adminActionText}>Manage Users</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <PixelBackground pattern="grid" animated={true}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>⚙️ Settings</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Customize your GeekFit experience
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
          {renderTabButton('profile', 'person', 'Profile')}
          {renderTabButton('audio', 'volume-high', 'Audio')}
          {renderTabButton('notifications', 'notifications', 'Notifications')}
          {renderTabButton('health', 'fitness', 'Health')}
          {renderTabButton('admin', 'shield', 'Admin')}
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'audio' && renderAudioTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'health' && renderHealthTab()}
          {activeTab === 'admin' && renderAdminTab()}
        </ScrollView>
      </View>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'monospace',
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    paddingBottom: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profileLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  profileValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 4,
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
  settingText: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  testButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  healthStatus: {
    marginBottom: 16,
  },
  healthStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  healthStatusSubtext: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  healthButton: {
    marginTop: 8,
  },
  dataSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dataSourceText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'monospace',
    marginLeft: 16,
  },
  dataSourceStatus: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  adminMessage: {
    fontSize: 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 24,
  },
  adminWelcome: {
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  adminAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  adminActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'monospace',
    marginLeft: 12,
  },
  signOutButton: {
    marginTop: 16,
  },
}); 