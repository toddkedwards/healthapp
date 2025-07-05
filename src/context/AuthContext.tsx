import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { enhancedAuthService } from '../services/enhancedAuthService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAuthStatus: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth state listener...');
    
    // Listen for authentication state changes
    const unsubscribe = enhancedAuthService.onAuthStateChange((user) => {
      console.log('🔄 AuthProvider: Auth state changed:', user ? `User: ${user.username}` : 'No user');
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('🧹 AuthProvider: Cleaning up...');
      unsubscribe();
      enhancedAuthService.cleanup();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 AuthProvider: Starting sign in...');
      setLoading(true);
      await enhancedAuthService.signIn(email, password);
      console.log('✅ AuthProvider: Sign in completed');
    } catch (error) {
      console.error('❌ AuthProvider: Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('📝 AuthProvider: Starting sign up...');
      setLoading(true);
      await enhancedAuthService.signUp(email, password, username);
      console.log('✅ AuthProvider: Sign up completed');
    } catch (error) {
      console.error('❌ AuthProvider: Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 AuthProvider: Starting sign out...');
      setLoading(true);
      await enhancedAuthService.signOut();
      console.log('✅ AuthProvider: Sign out completed');
    } catch (error) {
      console.error('❌ AuthProvider: Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAuthStatus = () => {
    return enhancedAuthService.getAuthStatus();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    getAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 