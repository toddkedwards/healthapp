import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useQuest } from '../context/QuestContext';
import { QuestCard } from '../components/QuestCard';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { RetroButton } from '../components/RetroButton';
import RetroProfileBanner from '../components/RetroProfileBanner';
import PixelBackground from '../components/PixelBackground';
import PixelText from '../components/PixelText';
import PixelIcon from '../components/PixelIcon';
import { soundService } from '../services/soundService';
import { mockQuests } from '../data/mockData';
import { HealthDashboard } from '../components/HealthDashboard';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { user, fitnessData } = useUser();
  const { activeQuests, achievements } = useQuest();

  const dailyQuests = activeQuests.filter(quest => quest.type === 'daily');
  const recentAchievements = achievements.filter(achievement => achievement.isUnlocked).slice(0, 3);

  const progressPercentage = (user.xp / user.xpToNextLevel) * 100;

  // Check for new achievements when component mounts
  // Temporarily disabled to fix loading issues
  // useEffect(() => {
  //   checkAndUnlockAchievements();
  // }, []);



  return (
    <PixelBackground pattern="grid" animated={true}>
      <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]}>  
      {/* Retro RPG User Banner */}
      <RetroProfileBanner />

      {/* XP Progress */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>Experience</PixelText>
        <View style={styles.xpContainer}>
          <PixelText style={[styles.xpText, { color: theme.colors.textSecondary }]}>
            XP: {user.xp} / {user.xpToNextLevel} XP
          </PixelText>
          <ProgressBar progress={progressPercentage} color={theme.colors.primary} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>Stats</PixelText>
        <View style={styles.statsGrid}>
          <StatCard
            title="Health"
            value={`${user.health}/${user.maxHealth}`}
            icon="heart"
            color={theme.colors.health}
          />
          <StatCard
            title="Energy"
            value={`${user.energy}/${user.maxEnergy}`}
            icon="flash"
            color={theme.colors.energy}
          />
          <StatCard
            title="Strength"
            value={user.strength.toString()}
            icon="fitness"
            color={theme.colors.primary}
          />
          <StatCard
            title="Agility"
            value={user.agility.toString()}
            icon="speedometer"
            color={theme.colors.secondary}
          />
        </View>
      </View>

      {/* Health Data Dashboard */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>Health Data</PixelText>
          <RetroButton
            title="Settings"
            onPress={() => {
              soundService.playMenuNavigate();
              // Navigate to Health Settings screen
            }}
            variant="secondary"
            size="small"
          />
        </View>
        <HealthDashboard
          onSync={() => {
            soundService.playHealthSync();
            // Refresh dashboard data
          }}
          onViewWorkouts={() => {
            soundService.playMenuNavigate();
            // Navigate to workouts screen
          }}
        />
      </View>

      {/* Daily Quests */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>Daily Quests</PixelText>
          <RetroButton
            title="See All"
            onPress={() => {
              soundService.playMenuNavigate();
              // Navigate to Quests screen
            }}
            variant="secondary"
            size="small"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dailyQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} style={styles.questCard} />
          ))}
        </ScrollView>
      </View>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeader}>
            <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Achievements</PixelText>
            <RetroButton
              title="See All"
              onPress={() => {
                soundService.playMenuNavigate();
                // Navigate to Achievements screen
              }}
              variant="secondary"
              size="small"
            />
          </View>
          {recentAchievements.map(achievement => (
            <View key={achievement.id} style={styles.achievementItem}>
              <PixelIcon name={achievement.icon} size={24} />
              <View style={styles.achievementInfo}>
                <PixelText style={[styles.achievementTitle, { color: theme.colors.text }]}>
                  {achievement.title}
                </PixelText>
                <PixelText style={[styles.achievementDesc, { color: theme.colors.textSecondary }]}>
                  {achievement.description}
                </PixelText>
              </View>
            </View>
          ))}
        </View>
      )}
      </ScrollView>
      
      {/* Achievement Unlock Modal */}
      {/* Temporarily disabled to fix loading issues */}
      {/* <AchievementUnlockModal
        visible={achievementModal.visible}
        achievement={achievementModal.achievement}
        onClose={() => setAchievementModal({ visible: false, achievement: null })}
      /> */}
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 3,
    borderBottomColor: '#ffffff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  level: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  stats: {
    alignItems: 'flex-end',
  },
  coins: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  xpContainer: {
    marginBottom: 10,
  },
  xpText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fitnessGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questCard: {
    width: width * 0.7,
    marginRight: 15,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  achievementDesc: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
}); 