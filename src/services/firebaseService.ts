import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, Quest, Achievement, Boss, ShopItem } from '../types';

export interface FirebaseService {
  // Authentication
  signUp(email: string, password: string, username: string): Promise<User>;
  signIn(email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
  
  // User Data
  createUserProfile(userId: string, userData: Partial<User>): Promise<void>;
  getUserProfile(userId: string): Promise<User | null>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<void>;
  
  // Quest System
  getUserQuests(userId: string): Promise<Quest[]>;
  updateQuestProgress(userId: string, questId: string, progress: number): Promise<void>;
  completeQuest(userId: string, questId: string): Promise<void>;
  
  // Achievements
  getUserAchievements(userId: string): Promise<Achievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<void>;
  
  // Boss Battles
  getBossBattles(userId: string): Promise<Boss[]>;
  saveBossBattle(userId: string, battle: Boss): Promise<void>;
  
  // Shop
  getUserInventory(userId: string): Promise<ShopItem[]>;
  purchaseItem(userId: string, itemId: string, cost: number): Promise<void>;
  
  // Real-time Updates
  subscribeToUserData(userId: string, callback: (user: User) => void): () => void;
  subscribeToQuests(userId: string, callback: (quests: Quest[]) => void): () => void;
}

class FirebaseServiceImpl implements FirebaseService {
  private currentUser: User | null = null;
  private authUnsubscribe: (() => void) | null = null;

  constructor() {
    // Listen for auth state changes
    this.authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userProfile = await this.getUserProfile(firebaseUser.uid);
        this.currentUser = userProfile;
      } else {
        // User is signed out
        this.currentUser = null;
      }
    });
  }

  // Authentication methods
  async signUp(email: string, password: string, username: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName: username });

      // Create user profile in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        name: username,
        username,
        email,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        totalXp: 0,
        health: 100,
        maxHealth: 100,
        energy: 50,
        maxEnergy: 50,
        strength: 10,
        agility: 10,
        intelligence: 10,
        stamina: 10,
        defense: 10,
        coins: 50,
        characterClass: 'warrior',
        unlockedAbilities: [],
        achievements: [],
        equipment: [],
        createdAt: new Date(),
        lastActive: new Date(),
      };

      await this.createUserProfile(firebaseUser.uid, newUser);
      this.currentUser = newUser;
      
      return newUser;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userProfile = await this.getUserProfile(firebaseUser.uid);
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      this.currentUser = userProfile;
      return userProfile;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await this.getUserProfile(firebaseUser.uid);
        callback(userProfile);
      } else {
        callback(null);
      }
    });
  }

  // User Data methods
  async createUserProfile(userId: string, userData: Partial<User>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userId,
          name: data.name || data.username,
          username: data.username,
          email: data.email,
          level: data.level || 1,
          xp: data.xp || 0,
          xpToNextLevel: data.xpToNextLevel || 100,
          totalXp: data.totalXp || 0,
          health: data.health || 100,
          maxHealth: data.maxHealth || 100,
          energy: data.energy || 50,
          maxEnergy: data.maxEnergy || 50,
          strength: data.strength || 10,
          agility: data.agility || 10,
          intelligence: data.intelligence || 10,
          stamina: data.stamina || 10,
          defense: data.defense || 10,
          coins: data.coins || 50,
          characterClass: data.characterClass || 'warrior',
          unlockedAbilities: data.unlockedAbilities || [],
          achievements: data.achievements || [],
          equipment: data.equipment || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActive: data.lastActive?.toDate() || new Date(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        lastActive: serverTimestamp(),
      });
      
      // Update local user if it's the current user
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...updates };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Quest System methods
  async getUserQuests(userId: string): Promise<Quest[]> {
    try {
      const questsQuery = query(
        collection(db, 'userQuests'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      // For now, return mock quests until we implement the full quest system
      // TODO: Implement actual quest retrieval from Firestore
      return [];
    } catch (error) {
      console.error('Error getting user quests:', error);
      return [];
    }
  }

  async updateQuestProgress(userId: string, questId: string, progress: number): Promise<void> {
    try {
      await updateDoc(doc(db, 'userQuests', `${userId}_${questId}`), {
        progress,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating quest progress:', error);
      throw error;
    }
  }

  async completeQuest(userId: string, questId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'userQuests', `${userId}_${questId}`), {
        completed: true,
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  }

  // Achievement methods
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const achievementsQuery = query(
        collection(db, 'userAchievements'),
        where('userId', '==', userId)
      );
      
      // For now, return mock achievements
      // TODO: Implement actual achievement retrieval from Firestore
      return [];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      await addDoc(collection(db, 'userAchievements'), {
        userId,
        achievementId,
        unlockedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // Boss Battle methods
  async getBossBattles(userId: string): Promise<Boss[]> {
    try {
      const battlesQuery = query(
        collection(db, 'bossBattles'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      // For now, return mock battles
      // TODO: Implement actual boss battle retrieval from Firestore
      return [];
    } catch (error) {
      console.error('Error getting boss battles:', error);
      return [];
    }
  }

  async saveBossBattle(userId: string, battle: Boss): Promise<void> {
    try {
      await addDoc(collection(db, 'bossBattles'), {
        userId,
        ...battle,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving boss battle:', error);
      throw error;
    }
  }

  // Shop methods
  async getUserInventory(userId: string): Promise<ShopItem[]> {
    try {
      const inventoryQuery = query(
        collection(db, 'userInventory'),
        where('userId', '==', userId)
      );
      
      // For now, return mock inventory
      // TODO: Implement actual inventory retrieval from Firestore
      return [];
    } catch (error) {
      console.error('Error getting user inventory:', error);
      return [];
    }
  }

  async purchaseItem(userId: string, itemId: string, cost: number): Promise<void> {
    try {
      // Add item to inventory
      await addDoc(collection(db, 'userInventory'), {
        userId,
        itemId,
        purchasedAt: serverTimestamp(),
      });
      
      // Deduct coins from user
      await this.updateUserProfile(userId, {
        coins: (this.currentUser?.coins || 0) - cost,
      });
    } catch (error) {
      console.error('Error purchasing item:', error);
      throw error;
    }
  }

  // Real-time subscription methods
  subscribeToUserData(userId: string, callback: (user: User) => void): () => void {
    return onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
                 const user: User = {
           id: userId,
           name: data.name || data.username,
           username: data.username,
           email: data.email,
           level: data.level || 1,
           xp: data.xp || 0,
           xpToNextLevel: data.xpToNextLevel || 100,
           totalXp: data.totalXp || 0,
           health: data.health || 100,
           maxHealth: data.maxHealth || 100,
           energy: data.energy || 50,
           maxEnergy: data.maxEnergy || 50,
           strength: data.strength || 10,
           agility: data.agility || 10,
           intelligence: data.intelligence || 10,
           stamina: data.stamina || 10,
           defense: data.defense || 10,
           coins: data.coins || 50,
           characterClass: data.characterClass || 'warrior',
           unlockedAbilities: data.unlockedAbilities || [],
           achievements: data.achievements || [],
           equipment: data.equipment || [],
           createdAt: data.createdAt?.toDate() || new Date(),
           lastActive: data.lastActive?.toDate() || new Date(),
         };
        callback(user);
      }
    });
  }

  subscribeToQuests(userId: string, callback: (quests: Quest[]) => void): () => void {
    const questsQuery = query(
      collection(db, 'userQuests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(questsQuery, (snapshot) => {
      const quests: Quest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // TODO: Convert Firestore data to Quest objects
      });
      callback(quests);
    });
  }

  // Cleanup method
  cleanup() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }
}

export const firebaseService = new FirebaseServiceImpl(); 