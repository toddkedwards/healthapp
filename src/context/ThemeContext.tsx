import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Theme } from '../types';

const defaultTheme: Theme = {
  colors: {
    primary: '#4ecdc4', // Retro cyan
    secondary: '#ff6b35', // Retro orange
    background: '#1a1a2e', // Dark navy
    surface: '#16213e', // Darker navy
    text: '#ffffff',
    textSecondary: '#a8a8a8',
    accent: '#ffd93d', // Retro yellow
    success: '#4ecdc4', // Retro green
    warning: '#ffaa00', // Retro amber
    error: '#ff6b6b', // Retro red
    health: '#ff6b6b', // Health red
    energy: '#ffd93d', // Energy yellow
    xp: '#4ecdc4', // XP cyan
    coins: '#ffd93d', // Coins gold
  },
  dark: true,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const toggleTheme = () => {
    setTheme(prev => ({
      ...prev,
      dark: !prev.dark,
      colors: prev.dark ? {
        ...prev.colors,
        background: '#ffffff',
        surface: '#f5f5f5',
        text: '#000000',
        textSecondary: '#666666',
      } : {
        ...prev.colors,
        background: '#0a0a0a',
        surface: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#cccccc',
      }
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 