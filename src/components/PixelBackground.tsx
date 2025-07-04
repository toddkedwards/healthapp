import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface PixelBackgroundProps {
  children: React.ReactNode;
  pattern?: 'grid' | 'dots' | 'stars' | 'mountains' | 'forest' | 'cave' | 'castle' | 'desert' | 'ocean' | 'battle' | 'magic' | 'dungeon' | 'shop' | 'gallery';
  animated?: boolean;
}

export default function PixelBackground({
  children,
  pattern = 'grid',
  animated = true,
}: PixelBackgroundProps) {
  const { theme } = useTheme();
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Create continuous floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Create continuous scroll animation
      Animated.loop(
        Animated.timing(scrollAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [animated]);

  const renderGridPattern = () => (
    <View style={styles.gridContainer}>
      {[...Array(20)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.gridLine,
            {
              backgroundColor: theme.colors.primary + '20',
              top: i * 40,
            }
          ]}
        />
      ))}
      {[...Array(15)].map((_, i) => (
        <View
          key={`v${i}`}
          style={[
            styles.gridLineVertical,
            {
              backgroundColor: theme.colors.primary + '20',
              left: i * 40,
            }
          ]}
        />
      ))}
    </View>
  );

  const renderDotsPattern = () => (
    <View style={styles.dotsContainer}>
      {[...Array(50)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: theme.colors.accent + '30',
              left: (i * 23) % width,
              top: Math.floor(i / 8) * 40 + 20,
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderStarsPattern = () => (
    <View style={styles.starsContainer}>
      {[...Array(30)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.star,
            {
              backgroundColor: theme.colors.warning,
              left: (i * 37) % width,
              top: Math.floor(i / 6) * 60 + 30,
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -15],
                  }),
                },
                {
                  scale: floatAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 1.2, 0.8],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderMountainsPattern = () => (
    <View style={styles.mountainsContainer}>
      <Animated.View
        style={[
          styles.mountain,
          {
            backgroundColor: theme.colors.secondary + '40',
            transform: [
              {
                translateX: scrollAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -100],
                }),
              },
            ],
          }
        ]}
      />
      <Animated.View
        style={[
          styles.mountain,
          {
            backgroundColor: theme.colors.accent + '30',
            left: 200,
            transform: [
              {
                translateX: scrollAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -150],
                }),
              },
            ],
          }
        ]}
      />
      <Animated.View
        style={[
          styles.mountain,
          {
            backgroundColor: theme.colors.primary + '20',
            left: 400,
            transform: [
              {
                translateX: scrollAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -200],
                }),
              },
            ],
          }
        ]}
      />
    </View>
  );

  const renderForestPattern = () => (
    <View style={styles.forestContainer}>
      {[...Array(20)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.tree,
            {
              backgroundColor: theme.colors.success + '60',
              left: (i * 45) % width,
              bottom: Math.floor(i / 5) * 30 + 20,
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderCavePattern = () => (
    <View style={styles.caveContainer}>
      {[...Array(15)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.caveRock,
            {
              backgroundColor: theme.colors.textSecondary + '40',
              left: (i * 60) % width,
              top: Math.floor(i / 3) * 50 + 30,
              transform: [
                {
                  scale: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderCastlePattern = () => (
    <View style={styles.castleContainer}>
      {[...Array(8)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.castleTower,
            {
              backgroundColor: theme.colors.primary + '30',
              left: (i * 80) % width,
              bottom: 0,
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -3],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderDesertPattern = () => (
    <View style={styles.desertContainer}>
      {[...Array(12)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.sandDune,
            {
              backgroundColor: theme.colors.warning + '40',
              left: (i * 70) % width,
              bottom: Math.floor(i / 4) * 40 + 10,
              transform: [
                {
                  translateX: scrollAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -50],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderOceanPattern = () => (
    <View style={styles.oceanContainer}>
      {[...Array(25)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.wave,
            {
              backgroundColor: theme.colors.accent + '30',
              left: (i * 30) % width,
              bottom: Math.floor(i / 8) * 20 + 10,
              transform: [
                {
                  translateX: scrollAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderBattlePattern = () => (
    <View style={styles.battleContainer}>
      {[...Array(40)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.battleEffect,
            {
              backgroundColor: theme.colors.error + '20',
              left: (i * 25) % width,
              top: Math.floor(i / 10) * 30 + 20,
              transform: [
                {
                  scale: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.5],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderMagicPattern = () => (
    <View style={styles.magicContainer}>
      {[...Array(35)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.magicSparkle,
            {
              backgroundColor: theme.colors.accent,
              left: (i * 28) % width,
              top: Math.floor(i / 7) * 40 + 25,
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
                {
                  scale: floatAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1.2, 0.3],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderDungeonPattern = () => (
    <View style={styles.dungeonContainer}>
      {[...Array(30)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dungeonElement,
            {
              backgroundColor: theme.colors.textSecondary + '50',
              left: (i * 35) % width,
              top: Math.floor(i / 6) * 45 + 15,
              transform: [
                {
                  scale: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1.1],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderShopPattern = () => (
    <View style={styles.shopContainer}>
      {[...Array(18)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.shopItem,
            {
              backgroundColor: theme.colors.warning + '30',
              left: (i * 50) % width,
              top: Math.floor(i / 6) * 35 + 20,
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderGalleryPattern = () => (
    <View style={styles.galleryContainer}>
      {[...Array(45)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.galleryFrame,
            {
              backgroundColor: theme.colors.primary + '20',
              left: (i * 22) % width,
              top: Math.floor(i / 9) * 25 + 15,
              transform: [
                {
                  scale: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1.4],
                  }),
                },
              ],
            }
          ]}
        />
      ))}
    </View>
  );

  const renderPattern = () => {
    switch (pattern) {
      case 'grid':
        return renderGridPattern();
      case 'dots':
        return renderDotsPattern();
      case 'stars':
        return renderStarsPattern();
      case 'mountains':
        return renderMountainsPattern();
      case 'forest':
        return renderForestPattern();
      case 'cave':
        return renderCavePattern();
      case 'castle':
        return renderCastlePattern();
      case 'desert':
        return renderDesertPattern();
      case 'ocean':
        return renderOceanPattern();
      case 'battle':
        return renderBattlePattern();
      case 'magic':
        return renderMagicPattern();
      case 'dungeon':
        return renderDungeonPattern();
      case 'shop':
        return renderShopPattern();
      case 'gallery':
        return renderGalleryPattern();
      default:
        return renderGridPattern();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Background pattern */}
      {renderPattern()}
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  gridContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
  },
  dotsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  mountainsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 200,
    zIndex: 0,
  },
  mountain: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 100,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // Forest pattern styles
  forestContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  tree: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // Cave pattern styles
  caveContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  caveRock: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  // Castle pattern styles
  castleContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
    zIndex: 0,
  },
  castleTower: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: 80,
    borderRadius: 5,
  },
  // Desert pattern styles
  desertContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 120,
    zIndex: 0,
  },
  sandDune: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // Ocean pattern styles
  oceanContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
    zIndex: 0,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // Battle pattern styles
  battleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  battleEffect: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Magic pattern styles
  magicContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  magicSparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // Dungeon pattern styles
  dungeonContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  dungeonElement: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Shop pattern styles
  shopContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  shopItem: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  // Gallery pattern styles
  galleryContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  galleryFrame: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
}); 