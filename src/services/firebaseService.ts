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
  getDocs,
  increment,
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
      try {
        if (firebaseUser) {
          const userProfile = await this.getUserProfile(firebaseUser.uid);
          callback(userProfile);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        // If there's an error getting user profile, still call callback with null
        callback(null);
      }
    });
  }

  // User Data methods
  async createUserProfile(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      });
      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        return {
          ...userData,
          id: userId,
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
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
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
      const questsRef = collection(db, 'users', userId, 'quests');
      const questsSnap = await getDocs(questsRef);
      return questsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Quest));
    } catch (error) {
      console.error('Error getting user quests:', error);
      return [];
    }
  }

  async updateQuestProgress(userId: string, questId: string, progress: number): Promise<void> {
    try {
      const questRef = doc(db, 'users', userId, 'quests', questId);
      await updateDoc(questRef, { progress });
    } catch (error) {
      console.error('Error updating quest progress:', error);
      throw error;
    }
  }

  async completeQuest(userId: string, questId: string): Promise<void> {
    try {
      const questRef = doc(db, 'users', userId, 'quests', questId);
      await updateDoc(questRef, { 
        completed: true, 
        completedAt: serverTimestamp() 
      });
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  }

  // Achievement methods
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const achievementsRef = collection(db, 'users', userId, 'achievements');
      const achievementsSnap = await getDocs(achievementsRef);
      return achievementsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Achievement));
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const achievementRef = doc(db, 'users', userId, 'achievements', achievementId);
      await setDoc(achievementRef, {
        unlockedAt: serverTimestamp(),
        unlocked: true
      });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // Boss Battle methods
  async getBossBattles(userId: string): Promise<Boss[]> {
    try {
      const bossesRef = collection(db, 'users', userId, 'bossBattles');
      const bossesSnap = await getDocs(bossesRef);
      return bossesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Boss));
    } catch (error) {
      console.error('Error getting boss battles:', error);
      return [];
    }
  }

  async saveBossBattle(userId: string, battle: Boss): Promise<void> {
    try {
      const battleRef = doc(db, 'users', userId, 'bossBattles', battle.id);
      await setDoc(battleRef, {
        ...battle,
        savedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving boss battle:', error);
      throw error;
    }
  }

  // Shop methods
  async getUserInventory(userId: string): Promise<ShopItem[]> {
    try {
      const inventoryRef = collection(db, 'users', userId, 'inventory');
      const inventorySnap = await getDocs(inventoryRef);
      return inventorySnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as ShopItem));
    } catch (error) {
      console.error('Error getting user inventory:', error);
      return [];
    }
  }

  async purchaseItem(userId: string, itemId: string, cost: number): Promise<void> {
    try {
      // Add item to inventory
      const inventoryRef = collection(db, 'users', userId, 'inventory');
      await addDoc(inventoryRef, {
        itemId,
        purchasedAt: serverTimestamp(),
        cost
      });
      
      // Deduct coins from user profile
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coins: increment(-cost)
      });
    } catch (error) {
      console.error('Error purchasing item:', error);
      throw error;
    }
  }

  // Real-time subscription methods
  subscribeToUserData(userId: string, callback: (user: User) => void): () => void {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as User;
        callback({ ...userData, id: userId });
      }
    });
  }

  subscribeToQuests(userId: string, callback: (quests: Quest[]) => void): () => void {
    const questsRef = collection(db, 'users', userId, 'quests');
    return onSnapshot(questsRef, (snapshot) => {
      const quests = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Quest));
      callback(quests);
    });
  }

  // Generic document methods for admin service
  async getDocument(collection: string, docId: string): Promise<any> {
    try {
      const docRef = doc(db, collection, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collection}:`, error);
      throw error;
    }
  }

  async setDocument(collection: string, docId: string, data: any): Promise<void> {
    try {
      const docRef = doc(db, collection, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error setting document in ${collection}:`, error);
      throw error;
    }
  }

  async updateDocument(collection: string, docId: string, updates: any): Promise<void> {
    try {
      const docRef = doc(db, collection, docId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  }

  async deleteDocument(collection: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collection, docId);
      await updateDoc(docRef, { deletedAt: serverTimestamp() });
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  }

  async getCollection(collection: string, filters?: Array<{ field: string; operator: string; value: any }>): Promise<any[]> {
    try {
      let q = query(collection(db, collection));
      
      if (filters) {
        for (const filter of filters) {
          q = query(q, where(filter.field, filter.operator as any, filter.value));
        }
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error getting collection ${collection}:`, error);
      throw error;
    }
  }

  // Cleanup method
  cleanup() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }
}

export const firebaseService = new FirebaseServiceImpl(); 