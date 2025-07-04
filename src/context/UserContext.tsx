import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FitnessData, Workout } from '../types';
import { mockUserData, mockFitnessData } from '../data/mockData';

interface UserContextType {
  user: User;
  fitnessData: FitnessData;
  updateUser: (updates: Partial<User>) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateFitnessData: (data: Partial<FitnessData>) => void;
  addWorkout: (workout: Workout) => void;
  levelUp: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>(mockUserData);
  const [fitnessData, setFitnessData] = useState<FitnessData>(mockFitnessData);

  // Calculate XP needed for next level (simple formula: level * 100)
  const calculateXPToNextLevel = (level: number) => level * 100;

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const addXP = (amount: number) => {
    setUser(prev => {
      const newXP = prev.xp + amount;
      const newTotalXP = prev.totalXp + amount;
      const newXPToNextLevel = calculateXPToNextLevel(prev.level);
      
      // Check if user should level up
      if (newXP >= newXPToNextLevel) {
        return {
          ...prev,
          xp: newXP - newXPToNextLevel,
          totalXp: newTotalXP,
          level: prev.level + 1,
          xpToNextLevel: calculateXPToNextLevel(prev.level + 1),
          maxHealth: prev.maxHealth + 10,
          health: prev.maxHealth + 10, // Full heal on level up
          maxEnergy: prev.maxEnergy + 5,
          energy: prev.maxEnergy + 5,
        };
      }
      
      return {
        ...prev,
        xp: newXP,
        totalXp: newTotalXP,
      };
    });
  };

  const addCoins = (amount: number) => {
    setUser(prev => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  };

  const updateFitnessData = (data: Partial<FitnessData>) => {
    setFitnessData(prev => ({ ...prev, ...data }));
  };

  const addWorkout = (workout: Workout) => {
    setFitnessData(prev => ({
      ...prev,
      workouts: [...prev.workouts, workout],
    }));
  };

  const levelUp = () => {
    setUser(prev => ({
      ...prev,
      level: prev.level + 1,
      xpToNextLevel: calculateXPToNextLevel(prev.level + 1),
      maxHealth: prev.maxHealth + 10,
      health: prev.maxHealth + 10,
      maxEnergy: prev.maxEnergy + 5,
      energy: prev.maxEnergy + 5,
    }));
  };

  // Sync fitness data periodically (in a real app, this would sync with HealthKit/Google Fit)
  useEffect(() => {
    const syncFitnessData = async () => {
      // TODO: Implement actual health data sync
      // For now, we'll just update the last sync time
      setFitnessData(prev => ({
        ...prev,
        lastSync: new Date(),
      }));
    };

    const interval = setInterval(syncFitnessData, 300000); // Sync every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      fitnessData,
      updateUser,
      addXP,
      addCoins,
      updateFitnessData,
      addWorkout,
      levelUp,
    }}>
      {children}
    </UserContext.Provider>
  );
}; 