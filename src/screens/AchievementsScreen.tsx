import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useQuest } from '../context/QuestContext';
import { useUser } from '../context/UserContext';
import PixelBackground from '../components/PixelBackground';
import PixelText from '../components/PixelText';
import UnifiedIcon from '../components/UnifiedIcon';
import { RetroButton } from '../components/RetroButton';
import { ProgressBar } from '../components/ProgressBar';
import { FadeInAnimation, SlideInAnimation } from '../components/RetroAnimations';
import AchievementUnlockModal from '../components/AchievementUnlockModal';
import { soundService } from '../services/soundService';
import { Achievement } from '../types';

const { width } = Dimensions.get('window');

type FilterCategory = 'all' | 'steps' | 'workout' | 'streak' | 'boss' | 'collection' | 'social' | 'special' | 'milestone';
type FilterRarity = 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export default function AchievementsScreen() {
  const { theme } = useTheme();
  const { achievements } = useQuest();
  const { user } = useUser();
  
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedRarity, setSelectedRarity] = useState<FilterRarity>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Filter achievements based on selected filters
  const filteredAchievements = useMemo(() => {
    return achievements.filter(achievement => {
      const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
      const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
      const unlockedMatch = !showUnlockedOnly || achievement.isUnlocked;
      
      return categoryMatch && rarityMatch && unlockedMatch;
    });
  }, [achievements, selectedCategory, selectedRarity, showUnlockedOnly]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.isUnlocked).length;
    const progress = total > 0 ? (unlocked / total) * 100 : 0;
    
    const byRarity = {
      common: achievements.filter(a => a.rarity === 'common' && a.isUnlocked).length,
      uncommon: achievements.filter(a => a.rarity === 'uncommon' && a.isUnlocked).length,
      rare: achievements.filter(a => a.rarity === 'rare' && a.isUnlocked).length,
      epic: achievements.filter(a => a.rarity === 'epic' && a.isUnlocked).length,
      legendary: achievements.filter(a => a.rarity === 'legendary' && a.isUnlocked).length,
    };

    return { total, unlocked, progress, byRarity };
  }, [achievements]);

  const handleAchievementPress = (achievement: Achievement) => {
    soundService.playButtonClick();
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  const handleFilterChange = (filter: FilterCategory | FilterRarity, type: 'category' | 'rarity') => {
    soundService.playMenuNavigate();
    if (type === 'category') {
      setSelectedCategory(filter as FilterCategory);
    } else {
      setSelectedRarity(filter as FilterRarity);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#1eff00';
      case 'uncommon': return '#0070dd';
      case 'rare': return '#a335ee';
      case 'epic': return '#ff8000';
      case 'legendary': return '#ff0000';
      default: return theme.colors.text;
    }
  };

  const renderFilterButton = (
    title: string,
    value: FilterCategory | FilterRarity,
    type: 'category' | 'rarity',
    icon?: string
  ) => {
    const isSelected = type === 'category' ? selectedCategory === value : selectedRarity === value;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.textSecondary,
          }
        ]}
        onPress={() => handleFilterChange(value, type)}
        activeOpacity={0.8}
      >
        {icon && <UnifiedIcon name={icon} size={16} color={isSelected ? '#fff' : theme.colors.text} />}
        <PixelText
          style={[
            styles.filterButtonText,
            { color: isSelected ? '#fff' : theme.colors.text }
          ]}
        >
          {title}
        </PixelText>
      </TouchableOpacity>
    );
  };

  const renderAchievementCard = (achievement: Achievement) => {
    const rarityColor = getRarityColor(achievement.rarity);
    const progressPercentage = achievement.maxProgress > 0 ? (achievement.progress / achievement.maxProgress) * 100 : 0;

    return (
      <TouchableOpacity
        key={achievement.id}
        style={[
          styles.achievementCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: achievement.isUnlocked ? rarityColor : theme.colors.textSecondary,
            opacity: achievement.isUnlocked ? 1 : 0.6,
          }
        ]}
        onPress={() => handleAchievementPress(achievement)}
        activeOpacity={0.8}
      >
        <View style={styles.achievementHeader}>
          <View style={styles.achievementIconContainer}>
            <UnifiedIcon 
              name={achievement.icon} 
              size={32} 
              color={achievement.isUnlocked ? rarityColor : theme.colors.textSecondary}
            />
            {achievement.isUnlocked && (
              <View style={[styles.unlockBadge, { backgroundColor: rarityColor }]}>
                <UnifiedIcon name="check" size={12} color="#fff" />
              </View>
            )}
          </View>
          
          <View style={styles.achievementInfo}>
            <PixelText style={[styles.achievementTitle, { color: theme.colors.text }]}>
              {achievement.title}
            </PixelText>
            <PixelText style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}>
              {achievement.description}
            </PixelText>
          </View>

          <View style={styles.achievementMeta}>
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <PixelText style={styles.rarityText}>
                {achievement.rarity.toUpperCase()}
              </PixelText>
            </View>
          </View>
        </View>

        {!achievement.isUnlocked && achievement.maxProgress > 1 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <PixelText style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                {achievement.progress} / {achievement.maxProgress}
              </PixelText>
              <PixelText style={[styles.progressPercentage, { color: theme.colors.textSecondary }]}>
                {Math.round(progressPercentage)}%
              </PixelText>
            </View>
            <ProgressBar progress={progressPercentage} color={rarityColor} height={6} />
          </View>
        )}

        {achievement.isUnlocked && achievement.unlockedAt && (
          <View style={styles.unlockInfo}>
            <PixelText style={[styles.unlockDate, { color: theme.colors.textSecondary }]}>
              Unlocked: {achievement.unlockedAt.toLocaleDateString()}
            </PixelText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <PixelBackground pattern="stars" animated={true}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <PixelText variant="title" style={[styles.title, { color: theme.colors.text }]}>
            ACHIEVEMENTS
          </PixelText>
          <PixelText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {stats.unlocked} / {stats.total} Unlocked
          </PixelText>
        </View>

        {/* Overall Progress */}
        <View style={[styles.progressSection, { backgroundColor: theme.colors.surface }]}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Overall Progress
          </PixelText>
          <ProgressBar progress={stats.progress} color={theme.colors.primary} height={12} />
          <PixelText style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            {Math.round(stats.progress)}% Complete
          </PixelText>
        </View>

        {/* Filters */}
        <View style={[styles.filtersSection, { backgroundColor: theme.colors.surface }]}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Filters
          </PixelText>
          
          {/* Category Filters */}
          <View style={styles.filterGroup}>
            <PixelText style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>
              Category:
            </PixelText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {renderFilterButton('All', 'all', 'category')}
              {renderFilterButton('Steps', 'steps', 'category', 'steps')}
              {renderFilterButton('Workout', 'workout', 'category', 'workout')}
              {renderFilterButton('Streak', 'streak', 'category', 'achievement_streak_3')}
              {renderFilterButton('Boss', 'boss', 'category', 'achievement_boss_1')}
              {renderFilterButton('Collection', 'collection', 'category', 'achievement_equipment')}
              {renderFilterButton('Social', 'social', 'category', 'achievement_friend')}
              {renderFilterButton('Special', 'special', 'category', 'achievement_early_bird')}
              {renderFilterButton('Milestone', 'milestone', 'category', 'achievement_level_5')}
            </ScrollView>
          </View>

          {/* Rarity Filters */}
          <View style={styles.filterGroup}>
            <PixelText style={[styles.filterLabel, { color: theme.colors.textSecondary }]}>
              Rarity:
            </PixelText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              {renderFilterButton('All', 'all', 'rarity')}
              {renderFilterButton('Common', 'common', 'rarity')}
              {renderFilterButton('Uncommon', 'uncommon', 'rarity')}
              {renderFilterButton('Rare', 'rare', 'rarity')}
              {renderFilterButton('Epic', 'epic', 'rarity')}
              {renderFilterButton('Legendary', 'legendary', 'rarity')}
            </ScrollView>
          </View>

          {/* Toggle Filters */}
          <View style={styles.toggleFilters}>
            <RetroButton
              title={showUnlockedOnly ? "Show All" : "Show Unlocked Only"}
              onPress={() => {
                soundService.playButtonClick();
                setShowUnlockedOnly(!showUnlockedOnly);
              }}
              variant={showUnlockedOnly ? "primary" : "secondary"}
              size="small"
            />
          </View>
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsSection}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {filteredAchievements.length} Achievement{filteredAchievements.length !== 1 ? 's' : ''}
          </PixelText>
          
          {filteredAchievements.length === 0 ? (
            <View style={styles.emptyState}>
              <UnifiedIcon name="achievement" size={48} color={theme.colors.textSecondary} />
              <PixelText style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No achievements match your filters
              </PixelText>
            </View>
          ) : (
            <FadeInAnimation duration={300}>
              {filteredAchievements.map((achievement, index) => (
                <SlideInAnimation key={achievement.id} direction="left" delay={index * 50}>
                  {renderAchievementCard(achievement)}
                </SlideInAnimation>
              ))}
            </FadeInAnimation>
          )}
        </View>
      </ScrollView>

      {/* Achievement Detail Modal */}
      <Modal
        visible={showAchievementModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAchievementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            {selectedAchievement && (
              <>
                <View style={styles.modalHeader}>
                  <UnifiedIcon 
                    name={selectedAchievement.icon} 
                    size={48} 
                    color={getRarityColor(selectedAchievement.rarity)}
                  />
                  <View style={styles.modalTitleContainer}>
                    <PixelText style={[styles.modalTitle, { color: theme.colors.text }]}>
                      {selectedAchievement.title}
                    </PixelText>
                    <View style={[styles.modalRarity, { backgroundColor: getRarityColor(selectedAchievement.rarity) }]}>
                      <PixelText style={styles.modalRarityText}>
                        {selectedAchievement.rarity.toUpperCase()}
                      </PixelText>
                    </View>
                  </View>
                </View>
                
                <PixelText style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
                  {selectedAchievement.description}
                </PixelText>
                
                {!selectedAchievement.isUnlocked && selectedAchievement.maxProgress > 1 && (
                  <View style={styles.modalProgress}>
                    <PixelText style={[styles.modalProgressText, { color: theme.colors.textSecondary }]}>
                      Progress: {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                    </PixelText>
                    <ProgressBar 
                      progress={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100} 
                      color={getRarityColor(selectedAchievement.rarity)} 
                      height={8} 
                    />
                  </View>
                )}
                
                {selectedAchievement.isUnlocked && selectedAchievement.unlockedAt && (
                  <PixelText style={[styles.modalUnlockDate, { color: theme.colors.textSecondary }]}>
                    Unlocked on {selectedAchievement.unlockedAt.toLocaleDateString()}
                  </PixelText>
                )}
                
                <RetroButton
                  title="Close"
                  onPress={() => setShowAchievementModal(false)}
                  variant="secondary"
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  progressSection: {
    margin: 16,
    padding: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  filtersSection: {
    margin: 16,
    padding: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 2,
    borderRadius: 0,
    minWidth: 80,
  },
  filterButtonText: {
    fontSize: 12,
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  toggleFilters: {
    alignItems: 'center',
  },
  achievementsSection: {
    margin: 16,
  },
  achievementCard: {
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderRadius: 0,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unlockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  achievementMeta: {
    alignItems: 'flex-end',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  progressPercentage: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  unlockInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  unlockDate: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 20,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  modalRarity: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  modalRarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  modalProgress: {
    marginBottom: 16,
  },
  modalProgressText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  modalUnlockDate: {
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});
