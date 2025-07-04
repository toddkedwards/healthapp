import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Quest, Achievement } from '../types';
import { mockQuests, mockAchievements } from '../data/mockData';
import { useUser } from './UserContext';
import { healthDataService } from '../services/healthDataService';
import { soundService } from '../services/soundService';

interface QuestContextType {
  quests: Quest[];
  achievements: Achievement[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  updateQuestProgress: (questId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  checkAndUnlockAchievements: () => void;
  checkHealthDataForQuests: () => Promise<void>;
  refreshDailyQuests: () => void;
  refreshWeeklyQuests: () => void;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const useQuest = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuest must be used within a QuestProvider');
  }
  return context;
};

interface QuestProviderProps {
  children: ReactNode;
}

export const QuestProvider: React.FC<QuestProviderProps> = ({ children }) => {
  const [quests, setQuests] = useState<Quest[]>(mockQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);

  const activeQuests = quests.filter(quest => quest.isActive && !quest.isCompleted);
  const completedQuests = quests.filter(quest => quest.isCompleted);

  const updateQuestProgress = (questId: string, progress: number) => {
    setQuests(prev => prev.map(quest => {
      if (quest.id === questId) {
        const newProgress = Math.min(progress, quest.maxProgress);
        const isCompleted = newProgress >= quest.maxProgress;
        
        return {
          ...quest,
          progress: newProgress,
          isCompleted,
          requirements: quest.requirements.map(req => ({
            ...req,
            current: Math.min(req.current + progress, req.value),
          })),
        };
      }
      return quest;
    }));
  };

  const completeQuest = (questId: string) => {
    console.log('QuestContext: completeQuest called with questId:', questId);
    setQuests(prev => {
      console.log('QuestContext: Previous quests:', prev.map(q => ({ id: q.id, title: q.title, isCompleted: q.isCompleted })));
      const updatedQuests = prev.map(quest => {
        if (quest.id === questId) {
          console.log('QuestContext: Marking quest as completed:', quest.title);
          return {
            ...quest,
            progress: quest.maxProgress,
            isCompleted: true,
          };
        }
        return quest;
      });
      console.log('QuestContext: Updated quests:', updatedQuests.map(q => ({ id: q.id, title: q.title, isCompleted: q.isCompleted })));
      return updatedQuests;
    });
  };

  const unlockAchievement = (achievementId: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === achievementId && !achievement.isUnlocked) {
        return {
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date(),
        };
      }
      return achievement;
    }));
  };

  const checkHealthDataForQuests = async () => {
    if (!healthDataService.isHealthDataAvailable()) return;

    try {
      const healthData = await healthDataService.syncHealthData();
      if (!healthData) return;

      // Check quests that can be completed with health data
      setQuests(prev => prev.map(quest => {
        if (quest.isCompleted) return quest;

        let newProgress = quest.progress;
        let shouldComplete = false;

        // Check step-based quests
        if (quest.type === 'daily' && quest.title.toLowerCase().includes('step')) {
          const stepRequirement = quest.maxProgress;
          if (healthData.steps >= stepRequirement) {
            newProgress = stepRequirement;
            shouldComplete = true;
          } else {
            newProgress = healthData.steps;
          }
        }

        // Check distance-based quests
        if (quest.type === 'daily' && quest.title.toLowerCase().includes('distance')) {
          const distanceRequirement = quest.maxProgress;
          const distanceKm = healthData.distance / 1000;
          if (distanceKm >= distanceRequirement) {
            newProgress = distanceRequirement;
            shouldComplete = true;
          } else {
            newProgress = distanceKm;
          }
        }

        // Check calorie-based quests
        if (quest.type === 'daily' && quest.title.toLowerCase().includes('calorie')) {
          const calorieRequirement = quest.maxProgress;
          if (healthData.calories >= calorieRequirement) {
            newProgress = calorieRequirement;
            shouldComplete = true;
          } else {
            newProgress = healthData.calories;
          }
        }

        // Check workout-based quests
        if (quest.type === 'daily' && quest.title.toLowerCase().includes('workout')) {
          const workoutRequirement = quest.maxProgress;
          if (healthData.workouts.length >= workoutRequirement) {
            newProgress = workoutRequirement;
            shouldComplete = true;
          } else {
            newProgress = healthData.workouts.length;
          }
        }

        if (shouldComplete) {
          soundService.playQuestComplete();
          soundService.triggerHaptic('success');
        }

        return {
          ...quest,
          progress: newProgress,
          isCompleted: shouldComplete,
        };
      }));
    } catch (error) {
      console.error('Failed to check health data for quests:', error);
    }
  };

  const checkAndUnlockAchievements = () => {
    // This function will check user progress and unlock achievements
    setAchievements(prev => prev.map(achievement => {
      if (achievement.isUnlocked) return achievement;
      
      let shouldUnlock = false;
      let newProgress = achievement.progress;
      
      // Check different achievement types
      switch (achievement.category) {
        case 'steps':
          // Check step-based achievements
          if (achievement.id === 'first_steps' && completedQuests.length >= 1) {
            shouldUnlock = true;
            newProgress = 1000;
          } else if (achievement.id === 'step_master' && completedQuests.length >= 5) {
            shouldUnlock = true;
            newProgress = 10000;
          } else if (achievement.id === 'steps_50k' && completedQuests.length >= 20) {
            shouldUnlock = true;
            newProgress = 50000;
          } else if (achievement.id === 'steps_100k' && completedQuests.length >= 50) {
            shouldUnlock = true;
            newProgress = 100000;
          }
          break;
          
        case 'workout':
          // Check workout-based achievements
          if (achievement.id === 'workout_warrior' && completedQuests.length >= 10) {
            shouldUnlock = true;
            newProgress = 10;
          } else if (achievement.id === 'workout_50' && completedQuests.length >= 50) {
            shouldUnlock = true;
            newProgress = 50;
          } else if (achievement.id === 'workout_100' && completedQuests.length >= 100) {
            shouldUnlock = true;
            newProgress = 100;
          } else if (achievement.id === 'workout_500' && completedQuests.length >= 500) {
            shouldUnlock = true;
            newProgress = 500;
          }
          break;
          
        case 'streak':
          // Check streak achievements (simplified logic for now)
          if (achievement.id === 'streak_3_days' && completedQuests.length >= 3) {
            shouldUnlock = true;
            newProgress = 3;
          } else if (achievement.id === 'streak_7_days' && completedQuests.length >= 7) {
            shouldUnlock = true;
            newProgress = 7;
          } else if (achievement.id === 'streak_30_days' && completedQuests.length >= 30) {
            shouldUnlock = true;
            newProgress = 30;
          } else if (achievement.id === 'streak_100_days' && completedQuests.length >= 100) {
            shouldUnlock = true;
            newProgress = 100;
          }
          break;
          
        case 'boss':
          // Check boss battle achievements
          if (achievement.id === 'boss_slayer' && completedQuests.length >= 5) {
            shouldUnlock = true;
            newProgress = 1;
          } else if (achievement.id === 'boss_slayer_3' && completedQuests.length >= 15) {
            shouldUnlock = true;
            newProgress = 3;
          } else if (achievement.id === 'boss_slayer_10' && completedQuests.length >= 50) {
            shouldUnlock = true;
            newProgress = 10;
          } else if (achievement.id === 'boss_perfect' && completedQuests.length >= 25) {
            shouldUnlock = true;
            newProgress = 1;
          } else if (achievement.id === 'boss_solo' && completedQuests.length >= 75) {
            shouldUnlock = true;
            newProgress = 1;
          }
          break;
          
        case 'collection':
          // Check collection achievements
          if (achievement.id === 'avatar_collector' && completedQuests.length >= 20) {
            shouldUnlock = true;
            newProgress = 10;
          } else if (achievement.id === 'equipment_collector' && completedQuests.length >= 30) {
            shouldUnlock = true;
            newProgress = 50;
          } else if (achievement.id === 'epic_collector' && completedQuests.length >= 40) {
            shouldUnlock = true;
            newProgress = 10;
          } else if (achievement.id === 'class_master' && completedQuests.length >= 60) {
            shouldUnlock = true;
            newProgress = 5;
          }
          break;
          
        case 'social':
          // Check social achievements (simplified for now)
          if (achievement.id === 'first_friend' && completedQuests.length >= 8) {
            shouldUnlock = true;
            newProgress = 1;
          } else if (achievement.id === 'party_leader' && completedQuests.length >= 12) {
            shouldUnlock = true;
            newProgress = 1;
          } else if (achievement.id === 'guild_master' && completedQuests.length >= 18) {
            shouldUnlock = true;
            newProgress = 1;
          } else if (achievement.id === 'helpful_hero' && completedQuests.length >= 35) {
            shouldUnlock = true;
            newProgress = 10;
          }
          break;
          
        case 'special':
          // Check special/time-based achievements
          const currentHour = new Date().getHours();
          if (achievement.id === 'early_bird' && currentHour < 6) {
            shouldUnlock = true;
            newProgress = 1;
          } else if (achievement.id === 'night_owl' && currentHour >= 22) {
            shouldUnlock = true;
            newProgress = 1;
          } else if (achievement.id === 'weekend_warrior' && completedQuests.length >= 25) {
            shouldUnlock = true;
            newProgress = 5;
          } else if (achievement.id === 'holiday_hero' && completedQuests.length >= 45) {
            shouldUnlock = true;
            newProgress = 1;
          }
          break;
          
        case 'milestone':
          // Check milestone achievements
          if (achievement.id === 'level_5' && completedQuests.length >= 5) {
            shouldUnlock = true;
            newProgress = 5;
          } else if (achievement.id === 'level_10' && completedQuests.length >= 15) {
            shouldUnlock = true;
            newProgress = 10;
          } else if (achievement.id === 'level_25' && completedQuests.length >= 35) {
            shouldUnlock = true;
            newProgress = 25;
          } else if (achievement.id === 'level_50' && completedQuests.length >= 70) {
            shouldUnlock = true;
            newProgress = 50;
          } else if (achievement.id === 'level_100' && completedQuests.length >= 150) {
            shouldUnlock = true;
            newProgress = 100;
          }
          break;
      }
      
      if (shouldUnlock) {
        return {
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date(),
          progress: newProgress,
        };
      }
      
      return achievement;
    }));
  };

  const refreshDailyQuests = () => {
    // In a real app, this would generate new daily quests
    // For now, we'll just reset progress on existing daily quests
    setQuests(prev => prev.map(quest => {
      if (quest.type === 'daily') {
        return {
          ...quest,
          progress: 0,
          isCompleted: false,
          requirements: quest.requirements.map(req => ({
            ...req,
            current: 0,
          })),
        };
      }
      return quest;
    }));
  };

  const refreshWeeklyQuests = () => {
    // In a real app, this would generate new weekly quests
    setQuests(prev => prev.map(quest => {
      if (quest.type === 'weekly') {
        return {
          ...quest,
          progress: 0,
          isCompleted: false,
          requirements: quest.requirements.map(req => ({
            ...req,
            current: 0,
          })),
        };
      }
      return quest;
    }));
  };

  // Auto-refresh daily quests at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const dailyRefreshTimer = setTimeout(() => {
      refreshDailyQuests();
      // Set up recurring daily refresh
      setInterval(refreshDailyQuests, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => clearTimeout(dailyRefreshTimer);
  }, []);

  // Auto-refresh weekly quests on Sunday at midnight
  useEffect(() => {
    const now = new Date();
    const daysUntilSunday = (7 - now.getDay()) % 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0);
    
    const timeUntilSunday = nextSunday.getTime() - now.getTime();
    
    const weeklyRefreshTimer = setTimeout(() => {
      refreshWeeklyQuests();
      // Set up recurring weekly refresh
      setInterval(refreshWeeklyQuests, 7 * 24 * 60 * 60 * 1000);
    }, timeUntilSunday);

    return () => clearTimeout(weeklyRefreshTimer);
  }, []);

  return (
    <QuestContext.Provider value={{
      quests,
      achievements,
      activeQuests,
      completedQuests,
      updateQuestProgress,
      completeQuest,
      unlockAchievement,
      checkAndUnlockAchievements,
      checkHealthDataForQuests,
      refreshDailyQuests,
      refreshWeeklyQuests,
    }}>
      {children}
    </QuestContext.Provider>
  );
}; 