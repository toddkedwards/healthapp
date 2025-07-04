import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useQuest } from '../context/QuestContext';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import RetroProfileBanner from '../components/RetroProfileBanner';
import PixelAvatarPicker from '../components/PixelAvatarPicker';
import { CharacterClassPicker } from '../components/CharacterClassPicker';
import { Picker } from '@react-native-picker/picker';
import { useNotification } from '../context/NotificationContext';
import { CharacterClass } from '../types';
import PixelBackground from '../components/PixelBackground';
import { RetroButton } from '../components/RetroButton';
import { FadeInAnimation, SlideInAnimation } from '../components/RetroAnimations';
import PixelIcon from '../components/PixelIcon';
import { soundService } from '../services/soundService';

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const { user, fitnessData, updateUser, addWorkout } = useUser();
  const { achievements } = useQuest();
  const { showNotification } = useNotification();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthKitEnabled, setHealthKitEnabled] = useState(false);
  const [googleFitEnabled, setGoogleFitEnabled] = useState(false);

  // Manual workout modal state
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [workoutType, setWorkoutType] = useState<'walking'|'running'|'cycling'|'swimming'|'strength'|'yoga'>('walking');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [distance, setDistance] = useState('');

  // Character class picker state
  const [classPickerVisible, setClassPickerVisible] = useState(false);

  const unlockedAchievements = achievements.filter(achievement => achievement.isUnlocked);
  const totalAchievements = achievements.length;
  const achievementProgress = (unlockedAchievements.length / totalAchievements) * 100;

  const handleHealthKitToggle = () => {
    if (!healthKitEnabled) {
      Alert.alert(
        'Connect Apple Health',
        'This will allow GeekFit to sync your fitness data from Apple Health. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: () => {
              setHealthKitEnabled(true);
              Alert.alert('Success', 'Apple Health connected! Your fitness data will now sync automatically.');
            },
          },
        ]
      );
    } else {
      setHealthKitEnabled(false);
    }
  };

  const handleGoogleFitToggle = () => {
    if (!googleFitEnabled) {
      Alert.alert(
        'Connect Google Fit',
        'This will allow GeekFit to sync your fitness data from Google Fit. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: () => {
              setGoogleFitEnabled(true);
              Alert.alert('Success', 'Google Fit connected! Your fitness data will now sync automatically.');
            },
          },
        ]
      );
    } else {
      setGoogleFitEnabled(false);
    }
  };

  const handleManualWorkout = () => {
    soundService.playModalOpen();
    setWorkoutModalVisible(true);
  };

  const handleClassSelect = (characterClass: CharacterClass) => {
    soundService.playStatIncrease();
    updateUser({ characterClass });
    showNotification(`Class changed to ${characterClass}!`, 'success');
    setClassPickerVisible(false);
  };

  const handleWorkoutSubmit = () => {
    soundService.playStatIncrease();
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      showNotification('Please enter a valid duration.', 'error');
      return;
    }
    if (calories && (isNaN(Number(calories)) || Number(calories) < 0)) {
      showNotification('Please enter a valid calories value.', 'error');
      return;
    }
    if (distance && (isNaN(Number(distance)) || Number(distance) < 0)) {
      showNotification('Please enter a valid distance.', 'error');
      return;
    }
    const now = new Date();
    const dur = Number(duration);
    const cal = calories ? Number(calories) : Math.round(dur * 5);
    const dist = distance ? Number(distance) : undefined;
    const workout = {
      id: 'manual_' + Date.now(),
      type: workoutType,
      duration: dur,
      calories: cal,
      distance: dist,
      startTime: now,
      endTime: new Date(now.getTime() + dur * 60000),
    };
    addWorkout(workout);
    setWorkoutModalVisible(false);
    setDuration('');
    setCalories('');
    setDistance('');
    setWorkoutType('walking');
    showNotification('Workout logged!', 'success');
  };

  return (
    <PixelBackground pattern="dots" animated={true}>
      <ScrollView style={styles.container}>  
        {/* Retro RPG Profile Banner */}
        <RetroProfileBanner />

        {/* Avatar Picker */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 0 }]}>Choose Your Avatar</Text>
        <PixelAvatarPicker
          selected={user.avatar || ''}
          onSelect={avatar => updateUser({ avatar })}
        />

        {/* Character Class */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Character Class</Text>
            <View style={styles.sectionButtons}>
              <RetroButton
                title="Change"
                onPress={() => setClassPickerVisible(true)}
                variant="secondary"
                size="small"
              />
              <RetroButton
                title="Character Sheet"
                onPress={() => {
                  // Navigate to Character Sheet tab
                  // This will be handled by the tab navigator
                }}
                variant="warning"
                size="small"
              />
            </View>
          </View>
          <View style={styles.classInfo}>
            <Text style={styles.classIcon}>
              {user.characterClass === 'warrior' ? '⚔️' : 
               user.characterClass === 'mage' ? '🔮' : 
               user.characterClass === 'rogue' ? '🗡️' : 
               user.characterClass === 'archer' ? '🏹' : '⛪'}
            </Text>
            <View style={styles.classDetails}>
              <Text style={[styles.className, { color: theme.colors.text }]}>
                {user.characterClass.charAt(0).toUpperCase() + user.characterClass.slice(1)}
              </Text>
              <Text style={[styles.classDescription, { color: theme.colors.textSecondary }]}>
                {user.characterClass === 'warrior' ? 'A mighty fighter with high strength and defense' :
                 user.characterClass === 'mage' ? 'A powerful spellcaster with high intelligence' :
                 user.characterClass === 'rogue' ? 'A stealthy fighter with high agility' :
                 user.characterClass === 'archer' ? 'A skilled ranged fighter with high precision' :
                 'A supportive character with healing abilities'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Stats Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Level"
              value={user.level.toString()}
              icon="trophy"
              color={theme.colors.primary}
            />
            <StatCard
              title="Total XP"
              value={user.totalXp.toLocaleString()}
              icon="star"
              color={theme.colors.warning}
            />
            <StatCard
              title="Coins"
              value={user.coins.toString()}
              icon="wallet"
              color={theme.colors.accent}
            />
            <StatCard
              title="Abilities"
              value={user.unlockedAbilities.length.toString()}
              icon="flash"
              color={theme.colors.secondary}
            />
          </View>
        </View>

        {/* Character Stats */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Character Stats</Text>
          <View style={styles.characterStats}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Strength</Text>
              <View style={styles.statBar}>
                <ProgressBar progress={(user.strength / 20) * 100} color={theme.colors.primary} height={8} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{user.strength}</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Agility</Text>
              <View style={styles.statBar}>
                <ProgressBar progress={(user.agility / 20) * 100} color={theme.colors.secondary} height={8} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{user.agility}</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Intelligence</Text>
              <View style={styles.statBar}>
                <ProgressBar progress={(user.intelligence / 20) * 100} color={theme.colors.accent} height={8} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{user.intelligence}</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Stamina</Text>
              <View style={styles.statBar}>
                <ProgressBar progress={(user.stamina / 20) * 100} color={theme.colors.success} height={8} />
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{user.stamina}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
            <Text style={[styles.achievementCount, { color: theme.colors.textSecondary }]}>
              {unlockedAchievements.length}/{totalAchievements}
            </Text>
          </View>
          <View style={styles.achievementProgress}>
            <ProgressBar progress={achievementProgress} color={theme.colors.primary} height={10} />
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              {Math.round(achievementProgress)}% Complete
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsList}>
            {achievements.map(achievement => (
              <View key={achievement.id} style={styles.achievementItem}>
                <PixelIcon 
                  name={achievement.icon} 
                  size={32} 
                  color={achievement.isUnlocked ? theme.colors.text : theme.colors.textSecondary}
                />
                <Text style={[
                  styles.achievementTitle,
                  { color: achievement.isUnlocked ? theme.colors.text : theme.colors.textSecondary }
                ]}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Fitness Integration */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Fitness Integration</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color={theme.colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Push Notifications</Text>
                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                  Get notified about quests, achievements, and boss battles
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: theme.colors.primary + '40' }}
              thumbColor={notificationsEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="medical" size={24} color={theme.colors.success} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Apple Health</Text>
                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                  Sync steps, workouts, and health data
                </Text>
              </View>
            </View>
            <Switch
              value={healthKitEnabled}
              onValueChange={handleHealthKitToggle}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: theme.colors.success + '40' }}
              thumbColor={healthKitEnabled ? theme.colors.success : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="fitness" size={24} color={theme.colors.warning} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Google Fit</Text>
                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                  Sync steps, workouts, and health data
                </Text>
              </View>
            </View>
            <Switch
              value={googleFitEnabled}
              onValueChange={handleGoogleFitToggle}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: theme.colors.warning + '40' }}
              thumbColor={googleFitEnabled ? theme.colors.warning : '#f4f3f4'}
            />
          </View>

          <RetroButton
            title="Log Manual Workout"
            onPress={handleManualWorkout}
            variant="primary"
          />
        </View>

        {/* Manual Workout Modal */}
        <Modal
          visible={workoutModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            soundService.playModalClose();
            setWorkoutModalVisible(false);
          }}
        >
          <FadeInAnimation duration={300}>
            <View style={styles.modalOverlay}>
              <SlideInAnimation direction="up" delay={100}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>Log Manual Workout</Text>
                  <Text style={styles.modalLabel}>Type</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={workoutType}
                      onValueChange={v => setWorkoutType(v)}
                      style={Platform.OS === 'ios' ? styles.pickerIOS : undefined}
                    >
                      <Picker.Item label="Walking" value="walking" />
                      <Picker.Item label="Running" value="running" />
                      <Picker.Item label="Cycling" value="cycling" />
                      <Picker.Item label="Swimming" value="swimming" />
                      <Picker.Item label="Strength" value="strength" />
                      <Picker.Item label="Yoga" value="yoga" />
                    </Picker>
                  </View>
                  <Text style={styles.modalLabel}>Duration (minutes)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    placeholder="e.g. 30"
                    placeholderTextColor="#aaa"
                  />
                  <Text style={styles.modalLabel}>Calories Burned (optional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={calories}
                    onChangeText={setCalories}
                    keyboardType="numeric"
                    placeholder="e.g. 200"
                    placeholderTextColor="#aaa"
                  />
                  {(workoutType === 'walking' || workoutType === 'running' || workoutType === 'cycling' || workoutType === 'swimming') && (
                    <>
                      <Text style={styles.modalLabel}>Distance (meters, optional)</Text>
                      <TextInput
                        style={styles.modalInput}
                        value={distance}
                        onChangeText={setDistance}
                        keyboardType="numeric"
                        placeholder="e.g. 3000"
                        placeholderTextColor="#aaa"
                      />
                    </>
                  )}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setWorkoutModalVisible(false)}>
                      <Text style={[styles.modalButtonText, styles.modalButtonCancelText]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleWorkoutSubmit}>
                      <Text style={[styles.modalButtonText, styles.modalButtonPrimaryText]}>Log Workout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SlideInAnimation>
            </View>
          </FadeInAnimation>
        </Modal>

        {/* App Settings */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>App Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={24} color={theme.colors.accent} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDesc, { color: theme.colors.textSecondary }]}>
                  Toggle between light and dark themes
                </Text>
              </View>
            </View>
            <Switch
              value={theme.dark}
              onValueChange={toggleTheme}
              trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: theme.colors.accent + '40' }}
              thumbColor={theme.dark ? theme.colors.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
          <Text style={[styles.appInfo, { color: theme.colors.textSecondary }]}>
            GeekFit v1.0.0{'\n'}
            A gamified fitness app for geeks and nerds{'\n'}
            Built with React Native & Expo
          </Text>
        </View>

        {/* Character Class Picker Modal */}
        <Modal
          visible={classPickerVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            soundService.playModalClose();
            setClassPickerVisible(false);
          }}
        >
          <FadeInAnimation duration={300}>
            <View style={styles.modalOverlay}>
              <SlideInAnimation direction="up" delay={100}>
                <View style={[styles.modalContainer, { height: '80%' }]}>
                  <CharacterClassPicker
                    selectedClass={user.characterClass}
                    onSelectClass={handleClassSelect}
                    onClose={() => {
                      soundService.playModalClose();
                      setClassPickerVisible(false);
                    }}
                  />
                </View>
              </SlideInAnimation>
            </View>
          </FadeInAnimation>
        </Modal>
      </ScrollView>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#ffffff',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'monospace',
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    paddingBottom: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  characterStats: {
    gap: 15,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  achievementCount: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  achievementProgress: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  achievementsList: {
    flexDirection: 'row',
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  achievementLocked: {
    opacity: 0.3,
  },
  achievementTitle: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  settingDesc: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
  manualWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 15,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderWidth: 2,
    borderColor: '#4ecdc4',
    borderRadius: 0,
  },
  manualWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    fontFamily: 'monospace',
  },
  appInfo: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'monospace',
  },
  pickerWrapper: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  pickerIOS: {
    height: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalButtonPrimary: {
    backgroundColor: '#4ecdc4',
    borderColor: '#4ecdc4',
  },
  modalButtonCancel: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'monospace',
  },
  modalButtonPrimaryText: {
    color: 'white',
  },
  modalButtonCancelText: {
    color: 'white',
  },
  sectionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#4ecdc4',
    borderRadius: 4,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderWidth: 2,
    borderColor: '#4ecdc4',
    borderRadius: 8,
  },
  classIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  classDetails: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  classDescription: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
}); 