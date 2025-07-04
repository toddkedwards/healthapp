import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ProgressBar } from './ProgressBar';

const { width } = Dimensions.get('window');

interface ProgressionData {
  level: number;
  xpRequired: number;
  totalXpAtLevel: number;
  rewards: string[];
  milestones: string[];
}

interface DetailedProgressionChartProps {
  currentLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  totalXp: number;
}

export default function DetailedProgressionChart({
  currentLevel,
  currentXp,
  xpToNextLevel,
  totalXp,
}: DetailedProgressionChartProps) {
  const { theme } = useTheme();

  // Generate progression data for next 5 levels
  const generateProgressionData = (): ProgressionData[] => {
    const data: ProgressionData[] = [];
    let cumulativeXp = totalXp;
    
    for (let i = currentLevel; i <= currentLevel + 4; i++) {
      const xpRequired = Math.floor(100 * Math.pow(1.5, i - 1)); // Exponential XP curve
      cumulativeXp += xpRequired;
      
      data.push({
        level: i,
        xpRequired,
        totalXpAtLevel: cumulativeXp,
        rewards: generateRewards(i),
        milestones: generateMilestones(i),
      });
    }
    
    return data;
  };

  const generateRewards = (level: number): string[] => {
    const rewards = [];
    if (level % 5 === 0) rewards.push('🏆 Special Achievement');
    if (level % 3 === 0) rewards.push('💰 Bonus Coins');
    if (level % 2 === 0) rewards.push('⚡ New Ability');
    rewards.push('📈 Stat Points');
    return rewards;
  };

  const generateMilestones = (level: number): string[] => {
    const milestones = [];
    if (level === 10) milestones.push('🎯 Novice Adventurer');
    if (level === 25) milestones.push('⚔️ Seasoned Warrior');
    if (level === 50) milestones.push('🏰 Elite Champion');
    if (level === 100) milestones.push('👑 Legendary Hero');
    return milestones;
  };

  const progressionData = generateProgressionData();

  const renderLevelCard = (data: ProgressionData, index: number) => {
    const isCurrentLevel = data.level === currentLevel;
    const isCompleted = data.level < currentLevel;
    const isNextLevel = data.level === currentLevel + 1;
    
    return (
      <View 
        key={data.level}
        style={[
          styles.levelCard,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: isCurrentLevel ? theme.colors.primary : 
                        isCompleted ? theme.colors.success : theme.colors.textSecondary
          }
        ]}
      >
        {/* Level Header */}
        <View style={styles.levelHeader}>
          <View style={styles.levelInfo}>
            <Text style={[
              styles.levelNumber,
              { color: isCurrentLevel ? theme.colors.primary : theme.colors.text }
            ]}>
              Level {data.level}
            </Text>
            {isCurrentLevel && (
              <Text style={[styles.currentLabel, { color: theme.colors.primary }]}>
                CURRENT
              </Text>
            )}
            {isCompleted && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            )}
          </View>
          <Text style={[styles.xpRequired, { color: theme.colors.textSecondary }]}>
            {data.xpRequired.toLocaleString()} XP
          </Text>
        </View>

        {/* Progress Bar for Current Level */}
        {isCurrentLevel && (
          <View style={styles.progressSection}>
            <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
              {currentXp}/{xpToNextLevel} XP
            </Text>
            <ProgressBar 
              progress={(currentXp / xpToNextLevel) * 100} 
              color={theme.colors.primary} 
              height={8} 
            />
          </View>
        )}

        {/* Rewards */}
        <View style={styles.rewardsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            Rewards:
          </Text>
          {data.rewards.map((reward, rewardIndex) => (
            <View key={rewardIndex} style={styles.rewardItem}>
              <Text style={styles.rewardIcon}>🎁</Text>
              <Text style={[styles.rewardText, { color: theme.colors.text }]}>
                {reward}
              </Text>
            </View>
          ))}
        </View>

        {/* Milestones */}
        {data.milestones.length > 0 && (
          <View style={styles.milestonesSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>
              Milestones:
            </Text>
            {data.milestones.map((milestone, milestoneIndex) => (
              <View key={milestoneIndex} style={styles.milestoneItem}>
                <Text style={styles.milestoneIcon}>🏅</Text>
                <Text style={[styles.milestoneText, { color: theme.colors.accent }]}>
                  {milestone}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Level Progression</Text>
      
      {/* Current Level Summary */}
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.summaryHeader}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            Level {currentLevel} Progress
          </Text>
          <Text style={[styles.summarySubtitle, { color: theme.colors.textSecondary }]}>
            {totalXp.toLocaleString()} Total XP
          </Text>
        </View>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {currentXp}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Current XP
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.accent }]}>
              {xpToNextLevel}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              XP to Next
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {Math.round((currentXp / xpToNextLevel) * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Progress
            </Text>
          </View>
        </View>
      </View>

      {/* Level Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.levelCardsContainer}
        contentContainerStyle={styles.levelCardsContent}
      >
        {progressionData.map((data, index) => renderLevelCard(data, index))}
      </ScrollView>

      {/* XP Rate Info */}
      <View style={[styles.rateInfo, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.rateTitle, { color: theme.colors.text }]}>XP Earning Rate</Text>
        <View style={styles.rateStats}>
          <View style={styles.rateItem}>
            <Text style={styles.rateIcon}>🏃</Text>
            <Text style={[styles.rateValue, { color: theme.colors.text }]}>50 XP</Text>
            <Text style={[styles.rateLabel, { color: theme.colors.textSecondary }]}>Per Workout</Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateIcon}>✅</Text>
            <Text style={[styles.rateValue, { color: theme.colors.text }]}>25 XP</Text>
            <Text style={[styles.rateLabel, { color: theme.colors.textSecondary }]}>Per Quest</Text>
          </View>
          <View style={styles.rateItem}>
            <Text style={styles.rateIcon}>🎯</Text>
            <Text style={[styles.rateValue, { color: theme.colors.text }]}>100 XP</Text>
            <Text style={[styles.rateLabel, { color: theme.colors.textSecondary }]}>Per Achievement</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  summaryCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    marginBottom: 16,
  },
  summaryHeader: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  summarySubtitle: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  levelCardsContainer: {
    marginBottom: 16,
  },
  levelCardsContent: {
    paddingRight: 16,
  },
  levelCard: {
    width: 200,
    marginRight: 12,
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  currentLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  xpRequired: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 10,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  rewardsSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rewardIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  rewardText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  milestonesSection: {
    marginTop: 8,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  milestoneIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  milestoneText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  rateInfo: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  rateStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rateItem: {
    alignItems: 'center',
  },
  rateIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  rateLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
}); 