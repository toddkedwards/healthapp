import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import { QuestProvider } from './src/context/QuestContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { AudioProvider } from './src/context/AudioContext';
import { soundService } from './src/services/soundService';
import { notificationService } from './src/services/notificationService';
import RetroLoadingScreen from './src/components/RetroLoadingScreen';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import QuestsScreen from './src/screens/QuestsScreen';
import BossBattlesScreen from './src/screens/BossBattlesScreen';
import ShopScreen from './src/screens/ShopScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CharacterSheetScreen from './src/screens/CharacterSheetScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import PixelArtGalleryScreen from './src/screens/PixelArtGalleryScreen';
import AudioSettingsScreen from './src/screens/AudioSettingsScreen';
import { HealthSettingsScreen } from './src/screens/HealthSettingsScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import AuthScreen from './src/screens/AuthScreen';
import AdminScreen from './src/screens/AdminScreen';

const Tab = createBottomTabNavigator();

function MainApp() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Initialize sound service
    soundService.initialize();
    
    // Initialize notification service
    notificationService.initialize();
    
    // Simulate loading progress
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          setTimeout(() => setIsLoading(false), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000); // 10 seconds

    return () => {
      clearInterval(loadingInterval);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  if (isLoading || loading) {
    return (
      <ThemeProvider>
        <RetroLoadingScreen
          visible={true}
          progress={loadingProgress}
          message="Initializing GeekFit..."
          onComplete={() => setIsLoading(false)}
        />
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <NotificationProvider>
          <AuthScreen />
        </NotificationProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AudioProvider>
        <UserProvider>
          <QuestProvider>
            <NotificationProvider>
              <NavigationContainer>
                <StatusBar style="light" />
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName: keyof typeof Ionicons.glyphMap;

                  if (route.name === 'Dashboard') {
                    iconName = focused ? 'home' : 'home-outline';
                  } else if (route.name === 'Quests') {
                    iconName = focused ? 'list' : 'list-outline';
                  } else if (route.name === 'Boss Battles') {
                    iconName = focused ? 'flash' : 'flash-outline';
                  } else if (route.name === 'Shop') {
                    iconName = focused ? 'storefront' : 'storefront-outline';
                  } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                  } else if (route.name === 'Character Sheet') {
                    iconName = focused ? 'document-text' : 'document-text-outline';
                  } else if (route.name === 'Achievements') {
                    iconName = focused ? 'trophy' : 'trophy-outline';
                  } else if (route.name === 'Pixel Art') {
                    iconName = focused ? 'images' : 'images-outline';
                  } else if (route.name === 'Audio') {
                    iconName = focused ? 'volume-high' : 'volume-high-outline';
                  } else if (route.name === 'Health') {
                    iconName = focused ? 'fitness' : 'fitness-outline';
                  } else if (route.name === 'Admin') {
                    iconName = focused ? 'shield' : 'shield-outline';
                  } else if (route.name === 'Notifications') {
                    iconName = focused ? 'notifications' : 'notifications-outline';
                  } else {
                    iconName = 'help-outline';
                  }

                  return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#00ff88',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                  backgroundColor: '#1a1a1a',
                  borderTopColor: '#333',
                },
                headerStyle: {
                  backgroundColor: '#1a1a1a',
                },
                headerTintColor: '#00ff88',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              })}
            >
              <Tab.Screen name="Dashboard" component={DashboardScreen} />
              <Tab.Screen name="Quests" component={QuestsScreen} />
              <Tab.Screen name="Boss Battles" component={BossBattlesScreen} />
              <Tab.Screen name="Shop" component={ShopScreen} />
              <Tab.Screen name="Achievements" component={AchievementsScreen} />
              <Tab.Screen name="Pixel Art" component={PixelArtGalleryScreen} />
              <Tab.Screen name="Audio" component={AudioSettingsScreen} />
              <Tab.Screen name="Health" component={HealthSettingsScreen} />
              <Tab.Screen name="Notifications" component={NotificationSettingsScreen} />
              <Tab.Screen name="Profile" component={ProfileScreen} />
              <Tab.Screen name="Character Sheet" component={CharacterSheetScreen} />
              <Tab.Screen name="Admin" component={AdminScreen} />
            </Tab.Navigator>
          </NavigationContainer>
          </NotificationProvider>
        </QuestProvider>
      </UserProvider>
        </AudioProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
