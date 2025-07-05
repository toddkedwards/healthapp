import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  AuthError,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export interface AuthErrorDetails {
  code: string;
  message: string;
  userFriendlyMessage: string;
  action?: string;
}

export class EnhancedAuthService {
  private currentUser: User | null = null;
  private authUnsubscribe: (() => void) | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    console.log('🔐 Initializing Enhanced Auth Service...');
    
    try {
      this.authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log('🔄 Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
        
        if (firebaseUser) {
          try {
            const userProfile = await this.getUserProfile(firebaseUser.uid);
            this.currentUser = userProfile;
            console.log('✅ User profile loaded:', userProfile?.username);
          } catch (error) {
            console.error('❌ Error loading user profile:', error);
            this.currentUser = null;
          }
        } else {
          this.currentUser = null;
        }
      });
      
      this.isInitialized = true;
      console.log('✅ Enhanced Auth Service initialized');
    } catch (error) {
      console.error('❌ Error initializing auth service:', error);
    }
  }

  private getAuthErrorDetails(error: any): AuthErrorDetails {
    const authError = error as AuthError;
    const code = authError.code || 'unknown';
    
    const errorMap: Record<string, AuthErrorDetails> = {
      'auth/user-not-found': {
        code,
        message: authError.message,
        userFriendlyMessage: 'No account found with this email. Please check your email or create a new account.',
        action: 'Check email or sign up'
      },
      'auth/wrong-password': {
        code,
        message: authError.message,
        userFriendlyMessage: 'Incorrect password. Please try again.',
        action: 'Try again'
      },
      'auth/email-already-in-use': {
        code,
        message: authError.message,
        userFriendlyMessage: 'An account with this email already exists. Please sign in instead.',
        action: 'Sign in instead'
      },
      'auth/weak-password': {
        code,
        message: authError.message,
        userFriendlyMessage: 'Password is too weak. Please choose a stronger password (at least 6 characters).',
        action: 'Choose stronger password'
      },
      'auth/invalid-email': {
        code,
        message: authError.message,
        userFriendlyMessage: 'Invalid email address. Please check your email format.',
        action: 'Check email format'
      },
      'auth/too-many-requests': {
        code,
        message: authError.message,
        userFriendlyMessage: 'Too many failed attempts. Please wait a moment before trying again.',
        action: 'Wait and try again'
      },
      'auth/network-request-failed': {
        code,
        message: authError.message,
        userFriendlyMessage: 'Network error. Please check your internet connection and try again.',
        action: 'Check internet connection'
      },
      'auth/user-disabled': {
        code,
        message: authError.message,
        userFriendlyMessage: 'This account has been disabled. Please contact support.',
        action: 'Contact support'
      },
      'auth/operation-not-allowed': {
        code,
        message: authError.message,
        userFriendlyMessage: 'This operation is not allowed. Please contact support.',
        action: 'Contact support'
      },
      'auth/invalid-credential': {
        code,
        message: authError.message,
        userFriendlyMessage: 'Invalid credentials. Please check your email and password.',
        action: 'Check credentials'
      }
    };

    return errorMap[code] || {
      code,
      message: authError.message || 'Unknown error',
      userFriendlyMessage: 'An unexpected error occurred. Please try again.',
      action: 'Try again'
    };
  }

  async signUp(email: string, password: string, username: string): Promise<User> {
    console.log('📝 Starting sign up process for:', email);
    
    try {
      // Validate inputs
      if (!email || !password || !username) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }

      console.log('🔐 Creating Firebase user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Firebase user created:', firebaseUser.uid);

      // Update display name
      console.log('👤 Updating display name...');
      await updateProfile(firebaseUser, { displayName: username });

      // Create user profile in Firestore
      console.log('📊 Creating user profile...');
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
      
      console.log('🎉 Sign up completed successfully');
      return newUser;
    } catch (error) {
      console.error('❌ Sign up error:', error);
      
      if (error instanceof Error && 'code' in error) {
        const errorDetails = this.getAuthErrorDetails(error);
        throw new Error(errorDetails.userFriendlyMessage);
      }
      
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    console.log('🔑 Starting sign in process for:', email);
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('🔐 Authenticating with Firebase...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('✅ Firebase authentication successful:', firebaseUser.uid);
      
      console.log('📊 Loading user profile...');
      let userProfile = await this.getUserProfile(firebaseUser.uid);
      
      // If user profile doesn't exist, create it (recovery mechanism)
      if (!userProfile) {
        console.log('⚠️ User profile not found, creating recovery profile...');
        const username = firebaseUser.displayName || email.split('@')[0];
        
        const recoveryUser: User = {
          id: firebaseUser.uid,
          name: username,
          username,
          email: firebaseUser.email || email,
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

        await this.createUserProfile(firebaseUser.uid, recoveryUser);
        userProfile = recoveryUser;
        console.log('✅ Recovery user profile created successfully');
      }
      
      this.currentUser = userProfile;
      console.log('🎉 Sign in completed successfully');
      return userProfile;
    } catch (error) {
      console.error('❌ Sign in error:', error);
      
      if (error instanceof Error && 'code' in error) {
        const errorDetails = this.getAuthErrorDetails(error);
        throw new Error(errorDetails.userFriendlyMessage);
      }
      
      throw error;
    }
  }

  async signOut(): Promise<void> {
    console.log('🚪 Starting sign out process...');
    
    try {
      await signOut(auth);
      this.currentUser = null;
      console.log('✅ Sign out completed successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    console.log('👂 Setting up auth state listener...');
    
    return onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('🔄 Auth state change detected:', firebaseUser ? 'User present' : 'No user');
        
        if (firebaseUser) {
          let userProfile = await this.getUserProfile(firebaseUser.uid);
          
          // If user profile doesn't exist, create it (recovery mechanism)
          if (!userProfile) {
            console.log('⚠️ User profile not found in auth state change, creating recovery profile...');
            const username = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
            
            const recoveryUser: User = {
              id: firebaseUser.uid,
              name: username,
              username,
              email: firebaseUser.email || '',
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

            await this.createUserProfile(firebaseUser.uid, recoveryUser);
            userProfile = recoveryUser;
            console.log('✅ Recovery user profile created in auth state change');
          }
          
          console.log('📊 User profile loaded:', userProfile?.username);
          callback(userProfile);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
        callback(null);
      }
    });
  }

  private async createUserProfile(userId: string, userData: Partial<User>): Promise<void> {
    try {
      console.log('📝 Creating Firestore user document...');
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
      });
      console.log('✅ User profile created in Firestore');
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  private async getUserProfile(userId: string): Promise<User | null> {
    try {
      console.log('📖 Fetching user profile from Firestore...');
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        console.log('✅ User profile found:', userData.username);
        return userData;
      } else {
        console.log('❌ User profile not found in Firestore');
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
  }

  // Debug methods
  getAuthStatus(): { isInitialized: boolean; currentUser: User | null; authInstance: any } {
    return {
      isInitialized: this.isInitialized,
      currentUser: this.currentUser,
      authInstance: auth
    };
  }

  cleanup() {
    console.log('🧹 Cleaning up auth service...');
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
export const enhancedAuthService = new EnhancedAuthService(); 