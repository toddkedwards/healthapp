import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PixelText from '../components/PixelText';
import PixelIcon from '../components/PixelIcon';
import { RetroButton } from '../components/RetroButton';
import { healthDataService } from '../services/healthDataService';
import { soundService } from '../services/soundService';
import PixelBackground from '../components/PixelBackground';

export const HealthSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(5); // minutes
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    platform: '',
    model: '',
    brand: '',
  });
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    loadHealthSettings();
    
    // Check connection status periodically
    const interval = setInterval(() => {
      const connected = healthDataService.isHealthDataAvailable();
      if (connected !== isConnected) {
        setIsConnected(connected);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isConnected]);

  const loadHealthSettings = async () => {
    setIsLoading(true);
    try {
      const connected = healthDataService.isHealthDataAvailable();
      const permissions = await healthDataService.checkPermissions();
      const device = healthDataService.getDeviceInfo();

      setIsConnected(connected);
      setHasPermissions(permissions);
      setDeviceInfo(device);
    } catch (error) {
      console.error('Failed to load health settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectHealth = async () => {
    console.log('=== HEALTH CONNECTION START ===');
    setIsLoading(true);
    console.log('HealthSettingsScreen: Starting health connection...');
    
    try {
      console.log('HealthSettingsScreen: Calling requestPermissions...');
      const success = await healthDataService.requestPermissions();
      console.log('HealthSettingsScreen: Connection result:', success);
      
      if (success) {
        console.log('HealthSettingsScreen: Connection successful, updating state...');
        
        // Update state immediately
        setIsConnected(true);
        setHasPermissions(true);
        setForceUpdate(prev => prev + 1); // Force re-render
        
        console.log('HealthSettingsScreen: State updated, playing feedback...');
        
        // Play feedback
        soundService.playHealthSync();
        soundService.triggerHaptic('success');
        
        console.log('HealthSettingsScreen: Showing success alert...');
        
        // Show success message with a simpler approach
        setTimeout(() => {
          Alert.alert(
            'Health Data Connected! 🎉',
            `Successfully connected to ${Platform.OS === 'ios' ? 'HealthKit' : 'Google Fit'} (Mock Mode).\n\nYour fitness data will now sync automatically with simulated data.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  console.log('HealthSettingsScreen: OK pressed, updating device info...');
                  setDeviceInfo(healthDataService.getDeviceInfo());
                }
              }
            ]
          );
        }, 100);
        
        console.log('HealthSettingsScreen: Success flow completed');
      } else {
        console.log('HealthSettingsScreen: Connection failed, showing error...');
        Alert.alert(
          'Connection Failed',
          'Unable to connect to health data. Please check your permissions and try again.'
        );
      }
    } catch (error) {
      console.error('Health connection failed:', error);
      Alert.alert('Error', 'Failed to connect to health data service.');
    } finally {
      console.log('HealthSettingsScreen: Setting loading to false');
      setIsLoading(false);
      console.log('=== HEALTH CONNECTION END ===');
    }
  };

  const handleDisconnectHealth = () => {
    Alert.alert(
      'Disconnect Health Data',
      'Are you sure you want to disconnect from health data? This will stop automatic syncing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            healthDataService.cleanup();
            setIsConnected(false);
            setHasPermissions(false);
            soundService.triggerHaptic('warning');
          },
        },
      ]
    );
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      console.log('HealthSettingsScreen: Starting manual sync...');
      const data = await healthDataService.syncHealthData();
      console.log('HealthSettingsScreen: Sync result:', data ? 'Success' : 'Failed');
      
      if (data) {
        soundService.playHealthSync();
        soundService.triggerHaptic('success');
        Alert.alert(
          'Sync Complete! 📊',
          `Synced ${data.steps} steps, ${data.calories} calories, and ${data.workouts.length} workouts.`
        );
      } else {
        Alert.alert('Sync Failed', 'Unable to sync health data. Please try again.');
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      Alert.alert('Error', 'Failed to sync health data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    console.log('=== TEST CONNECTION START ===');
    console.log('HealthSettingsScreen: Testing connection...');
    
    const isAvailable = healthDataService.isHealthDataAvailable();
    const lastSync = healthDataService.getLastSyncTime();
    const deviceInfo = healthDataService.getDeviceInfo();
    
    console.log('HealthSettingsScreen: Connection test results:', {
      isAvailable,
      lastSync,
      deviceInfo
    });
    
    // Play feedback
    soundService.playButtonClick();
    
    // Use setTimeout to ensure Alert shows up
    setTimeout(() => {
      Alert.alert(
        'Connection Test Results',
        `Available: ${isAvailable ? 'Yes' : 'No'}\nLast Sync: ${lastSync ? lastSync.toLocaleString() : 'Never'}\nDevice: ${deviceInfo.platform} ${deviceInfo.model}`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('HealthSettingsScreen: Test alert OK pressed');
            }
          }
        ]
      );
    }, 50);
    
    console.log('=== TEST CONNECTION END ===');
  };

  const handleSimpleTest = () => {
    console.log('HealthSettingsScreen: Simple test button pressed');
    soundService.playButtonClick();
    Alert.alert('Simple Test', 'This is a simple test alert to verify Alert.alert is working!');
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    rightElement?: React.ReactNode
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingLeft}>
        <PixelIcon name={icon} size={24} color={theme.colors.primary} />
        <View style={styles.settingText}>
          <PixelText style={[styles.settingTitle, { color: theme.colors.text }]}>
            {title}
          </PixelText>
          <PixelText style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </PixelText>
        </View>
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
    </View>
  );

  const renderStatusIndicator = (isActive: boolean, text: string) => (
    <View style={styles.statusContainer}>
      <View style={[
        styles.statusDot,
        { backgroundColor: isActive ? theme.colors.success : theme.colors.error }
      ]} />
      <PixelText style={[
        styles.statusText,
        { color: isActive ? theme.colors.success : theme.colors.error }
      ]}>
        {text}
      </PixelText>
    </View>
  );

  return (
    <PixelBackground pattern="gallery">
      <ScrollView style={styles.content} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <PixelText style={[styles.headerTitle, { color: theme.colors.text }]}>
            Health Data Settings
          </PixelText>
          <PixelText style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Manage your fitness data connections
          </PixelText>
        </View>

        {/* Connection Status */}
        <View style={styles.section}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Connection Status
          </PixelText>
          
          {renderSettingItem(
            'wifi',
            'Health Data Connection',
            `${Platform.OS === 'ios' ? 'HealthKit' : 'Google Fit'} Integration`,
            renderStatusIndicator(isConnected, isConnected ? 'Connected' : 'Disconnected')
          )}

          {renderSettingItem(
            'shield',
            'Permissions',
            'Data access permissions',
            renderStatusIndicator(hasPermissions, hasPermissions ? 'Granted' : 'Required')
          )}

          {renderSettingItem(
            'device',
            'Device',
            `${deviceInfo.platform} • ${deviceInfo.model}`,
            <PixelIcon name="info" size={16} color={theme.colors.textSecondary} />
          )}
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sync Settings
          </PixelText>
          
          {renderSettingItem(
            'refresh',
            'Auto Sync',
            'Automatically sync health data',
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
              thumbColor={autoSync ? theme.colors.background : theme.colors.textSecondary}
            />
          )}

          {renderSettingItem(
            'clock',
            'Sync Interval',
            `Every ${syncInterval} minutes`,
            <View style={styles.intervalContainer}>
              <RetroButton
                title="-"
                onPress={() => setSyncInterval(Math.max(1, syncInterval - 1))}
                variant="secondary"
                size="small"
              />
              <PixelText style={[styles.intervalValue, { color: theme.colors.text }]}>
                {syncInterval}
              </PixelText>
              <RetroButton
                title="+"
                onPress={() => setSyncInterval(Math.min(60, syncInterval + 1))}
                variant="secondary"
                size="small"
              />
            </View>
          )}
        </View>

        {/* Data Sources */}
        <View style={styles.section}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Data Sources
          </PixelText>
          
          {renderSettingItem(
            'footsteps',
            'Step Count',
            'Daily step tracking',
            <PixelIcon name="check" size={16} color={theme.colors.success} />
          )}

          {renderSettingItem(
            'flame',
            'Calories',
            'Calories burned',
            <PixelIcon name="check" size={16} color={theme.colors.success} />
          )}

          {renderSettingItem(
            'map',
            'Distance',
            'Walking/running distance',
            <PixelIcon name="check" size={16} color={theme.colors.success} />
          )}

          {renderSettingItem(
            'heart',
            'Heart Rate',
            'Heart rate monitoring',
            <PixelIcon name="check" size={16} color={theme.colors.success} />
          )}

          {renderSettingItem(
            'moon',
            'Sleep',
            'Sleep tracking',
            <PixelIcon name="check" size={16} color={theme.colors.success} />
          )}

          {renderSettingItem(
            'workout',
            'Workouts',
            'Exercise sessions',
            <PixelIcon name="check" size={16} color={theme.colors.success} />
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Actions
          </PixelText>
          
          <View style={styles.actionButtons}>
            {!isConnected ? (
              <RetroButton
                title={isLoading ? "Connecting..." : "Connect Health Data"}
                onPress={handleConnectHealth}
                variant="primary"
                size="large"
                disabled={isLoading}
              />
            ) : (
              <>
                <RetroButton
                  title={isLoading ? "Syncing..." : "Manual Sync"}
                  onPress={handleManualSync}
                  variant="secondary"
                  size="medium"
                  disabled={isLoading}
                />
                <RetroButton
                  title="Disconnect"
                  onPress={handleDisconnectHealth}
                  variant="danger"
                  size="medium"
                  disabled={isLoading}
                />
              </>
            )}
            <RetroButton
              title="Test Connection"
              onPress={handleTestConnection}
              variant="secondary"
              size="small"
            />
            <RetroButton
              title="Simple Test"
              onPress={handleSimpleTest}
              variant="secondary"
              size="small"
            />
          </View>
        </View>

        {/* Debug Info */}
        <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
          <PixelIcon name="bug" size={20} color={theme.colors.warning} />
          <View style={styles.infoContent}>
            <PixelText style={[styles.infoTitle, { color: theme.colors.text }]}>
              Debug Info
            </PixelText>
            <PixelText style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              Connected: {isConnected ? 'Yes' : 'No'}{'\n'}
              Permissions: {hasPermissions ? 'Granted' : 'Required'}{'\n'}
              Loading: {isLoading ? 'Yes' : 'No'}{'\n'}
              Force Update: {forceUpdate}
            </PixelText>
          </View>
        </View>

        {/* Info */}
        <View style={[styles.infoSection, { backgroundColor: theme.colors.surface }]}>
          <PixelIcon name="info" size={20} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <PixelText style={[styles.infoTitle, { color: theme.colors.text }]}>
              About Health Data
            </PixelText>
            <PixelText style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              GeekFit connects to your device's health data to automatically track your fitness progress. 
              Your data is processed locally and never shared with third parties.
            </PixelText>
          </View>
        </View>
      </ScrollView>
    </PixelBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  settingRight: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  intervalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    fontFamily: 'monospace',
  },
  actionButtons: {
    gap: 12,
  },
  infoSection: {
    flexDirection: 'row',
    padding: 16,
    marginTop: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
}); 