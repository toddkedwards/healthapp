import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import PixelBackground from './PixelBackground';

const { width } = Dimensions.get('window');

interface RetroLoadingScreenProps {
  visible: boolean;
  progress?: number;
  message?: string;
  onComplete?: () => void;
}

export default function RetroLoadingScreen({
  visible,
  progress = 0,
  message = 'Loading...',
  onComplete,
}: RetroLoadingScreenProps) {
  const { theme } = useTheme();
  const [loadingText, setLoadingText] = useState('');
  const [currentDot, setCurrentDot] = useState(0);
  
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 500,
        useNativeDriver: false,
      }).start();

      // Animate text appearance
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animate loading dots
      const dotInterval = setInterval(() => {
        setCurrentDot(prev => (prev + 1) % 4);
      }, 500);

      // Typewriter effect for loading text
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        if (currentIndex <= message.length) {
          setLoadingText(message.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
        }
      }, 100);

      return () => {
        clearInterval(dotInterval);
        clearInterval(typeInterval);
      };
    }
  }, [visible, progress, message]);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [progress, onComplete]);

  if (!visible) return null;

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const textOpacity = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderLoadingDots = () => {
    return [...Array(4)].map((_, i) => (
      <Text
        key={i}
        style={[
          styles.dot,
          {
            color: i <= currentDot ? theme.colors.primary : theme.colors.textSecondary,
          }
        ]}
      >
        .
      </Text>
    ));
  };

  return (
    <PixelBackground pattern="stars" animated={true}>
      <View style={styles.container}>
        {/* Logo/Title */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: pulseScale }],
            }
          ]}
        >
          <Text style={[styles.logo, { color: theme.colors.primary }]}>
            GEEKFIT
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            RPG FITNESS ADVENTURE
          </Text>
        </Animated.View>

        {/* Loading Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            { opacity: textOpacity },
          ]}
        >
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {loadingText}
            <View style={styles.dotsContainer}>
              {renderLoadingDots()}
            </View>
          </Text>
        </Animated.View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.surface }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {Math.round(progress)}%
          </Text>
        </View>

        {/* Loading Animation */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.loadingIcon,
              {
                borderColor: theme.colors.primary,
                transform: [
                  {
                    rotate: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              }
            ]}
          >
            <Text style={[styles.iconText, { color: theme.colors.primary }]}>
              ⚔️
            </Text>
          </Animated.View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={[styles.tipTitle, { color: theme.colors.accent }]}>
            TIP OF THE DAY:
          </Text>
          <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
            "Every step counts towards your next level!"
          </Text>
        </View>
      </View>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  messageContainer: {
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  dot: {
    fontSize: 18,
    fontFamily: 'monospace',
  },
  progressContainer: {
    width: width * 0.8,
    maxWidth: 300,
    marginBottom: 40,
  },
  progressBar: {
    height: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  animationContainer: {
    marginBottom: 40,
  },
  loadingIcon: {
    width: 60,
    height: 60,
    borderWidth: 3,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  tipsContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tipText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
}); 