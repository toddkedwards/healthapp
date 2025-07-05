import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Alert, Platform } from 'react-native';
import { Quest } from '../types';
import { ProgressBar } from './ProgressBar';
import { useQuest } from '../context/QuestContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { soundService } from '../services/soundService';
import { notificationService } from '../services/notificationService';
import UnifiedIcon from './UnifiedIcon';
import { RetroButton } from './RetroButton';

interface QuestCardProps {
  quest: Quest;
  style?: ViewStyle;
  onPress?: () => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, style, onPress }) => {
  const { completeQuest } = useQuest();
  const { addXP, addCoins } = useUser();
  const { showNotification } = useNotification();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const progressPercentage = (quest.progress / quest.maxProgress) * 100;
  const isCompleted = quest.isCompleted;
  const canComplete = quest.progress >= quest.maxProgress && !isCompleted;

  const getQuestIcon = () => {
    switch (quest.category) {
      case 'steps':
        return 'steps';
      case 'workout':
        return 'strength';
      case 'streak':
        return 'fire';
      case 'boss':
        return 'boss';
      case 'social':
        return 'star';
      default:
        return 'star';
    }
  };

  const handleCompleteQuest = () => {
    console.log('handleCompleteQuest called');
    console.log('canComplete:', canComplete);
    console.log('quest:', quest.title, quest.id, quest.progress, quest.maxProgress, quest.isCompleted);
    
    if (!canComplete) {
      console.log('Quest cannot be completed');
      return;
    }
    
    // Play button click sound
    soundService.playButtonClick();
    
    if (Platform.OS === 'web') {
      // Use custom dialog for web
      setShowConfirmDialog(true);
    } else {
      // Use native Alert for mobile
      Alert.alert(
        'Complete Quest',
        `Complete "${quest.title}" and claim your rewards?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            onPress: () => {
              console.log('Alert confirmed - completing quest');
              completeQuest(quest.id);
              addXP(quest.rewards.xp);
              addCoins(quest.rewards.coins);
              
              // Play quest completion sound and show notification
              soundService.playQuestComplete();
              showNotification(
                `Quest completed! +${quest.rewards.xp} XP, +${quest.rewards.coins} coins!`,
                'success'
              );
              
              // Send push notification
              notificationService.sendNotification({
                type: 'quest',
                title: '🎯 Quest Completed!',
                body: `${quest.title}: +${quest.rewards.xp} XP, +${quest.rewards.coins} coins earned!`,
                data: { questId: quest.id, questTitle: quest.title, rewards: quest.rewards }
              });
              
              console.log('Quest completion process finished');
            },
          },
        ]
      );
    }
  };

  const confirmCompleteQuest = () => {
    console.log('Alert confirmed - completing quest');
    completeQuest(quest.id);
    addXP(quest.rewards.xp);
    addCoins(quest.rewards.coins);
    
    // Play quest completion sound and show notification
    soundService.playQuestComplete();
    showNotification(
      `Quest completed! +${quest.rewards.xp} XP, +${quest.rewards.coins} coins!`,
      'success'
    );
    
    // Send push notification
    notificationService.sendNotification({
      type: 'quest',
      title: '🎯 Quest Completed!',
      body: `${quest.title}: +${quest.rewards.xp} XP, +${quest.rewards.coins} coins earned!`,
      data: { questId: quest.id, questTitle: quest.title, rewards: quest.rewards }
    });
    
    console.log('Quest completion process finished');
    setShowConfirmDialog(false);
  };

  const getQuestColor = () => {
    if (isCompleted) return '#00ff88';
    switch (quest.type) {
      case 'daily':
        return '#ff6b35';
      case 'weekly':
        return '#4ecdc4';
      case 'special':
        return '#ffd93d';
      default:
        return '#6c5ce7';
    }
  };

  return (
    <View style={[styles.container, style, isCompleted && styles.completed]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getQuestColor() + '20' }]}>
          <UnifiedIcon name={getQuestIcon()} size={20} color={getQuestColor()} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.type}>{quest.type.toUpperCase()}</Text>
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <UnifiedIcon name="star" size={20} color="#4ecdc4" />
          </View>
        )}
      </View>
      
      <Text style={styles.description}>{quest.description}</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {quest.progress} / {quest.maxProgress}
        </Text>
        <ProgressBar progress={progressPercentage} color={getQuestColor()} height={6} />
      </View>
      
      <View style={styles.rewards}>
        <Text style={styles.rewardsTitle}>Rewards:</Text>
        <View style={styles.rewardItems}>
          <Text style={styles.rewardItem}>⭐ {quest.rewards.xp} XP</Text>
          <Text style={styles.rewardItem}>🪙 {quest.rewards.coins} Coins</Text>
        </View>
      </View>
      
      {canComplete && (
        <RetroButton
          title="Complete Quest"
          onPress={handleCompleteQuest}
          variant="success"
          size="medium"
          style={styles.completeButton}
        />
      )}

      {/* Custom Confirmation Dialog for Web */}
      {showConfirmDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Complete Quest</Text>
            <Text style={styles.dialogMessage}>
              Complete "{quest.title}" and claim your rewards?
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={() => setShowConfirmDialog(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.confirmButton]}
                onPress={confirmCompleteQuest}
              >
                <Text style={styles.confirmButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
    padding: 15,
    marginBottom: 15,
  },
  completed: {
    borderColor: '#4ecdc4',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  type: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  completedBadge: {
    marginLeft: 'auto',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  rewards: {
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
    paddingTop: 10,
  },
  rewardsTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  rewardItems: {
    flexDirection: 'row',
    gap: 15,
  },
  rewardItem: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  completeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderWidth: 2,
    borderColor: '#4ecdc4',
    borderRadius: 0,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ecdc4',
    fontFamily: 'monospace',
  },
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  dialogMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dialogButton: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderRadius: 0,
    alignItems: 'center',
  },
  cancelButton: {
    borderColor: '#666',
    backgroundColor: 'rgba(102, 102, 102, 0.2)',
  },
  confirmButton: {
    borderColor: '#4ecdc4',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  confirmButtonText: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
}); 