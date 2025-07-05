import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import PixelBackground from '../components/PixelBackground';
import PixelText from '../components/PixelText';
import PixelIcon from '../components/PixelIcon';
import PixelArtSpriteComponent from '../components/PixelArtSprite';
import { RetroButton } from '../components/RetroButton';
import { FadeInAnimation, SlideInAnimation } from '../components/RetroAnimations';
import { soundService } from '../services/soundService';
import {
  getAllSprites,
  getSpritesByCategory,
  getSpritesByRarity,
  getUnlockedSprites,
  PixelArtSprite,
} from '../assets/pixelArtAssets';

const { width } = Dimensions.get('window');

type FilterCategory = 'all' | 'character' | 'boss' | 'enemy' | 'equipment' | 'item' | 'background' | 'ui';
type FilterRarity = 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export default function PixelArtGalleryScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedRarity, setSelectedRarity] = useState<FilterRarity>('all');
  const [selectedSprite, setSelectedSprite] = useState<PixelArtSprite | null>(null);
  const [showSpriteModal, setShowSpriteModal] = useState(false);

  // Get all sprites and filter based on user level
  const allSprites = useMemo(() => getUnlockedSprites(user.level), [user.level]);
  
  // Filter sprites based on selected filters
  const filteredSprites = useMemo(() => {
    return allSprites.filter(sprite => {
      const categoryMatch = selectedCategory === 'all' || sprite.category === selectedCategory;
      const rarityMatch = selectedRarity === 'all' || sprite.rarity === selectedRarity;
      
      return categoryMatch && rarityMatch;
    });
  }, [allSprites, selectedCategory, selectedRarity]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = getAllSprites().length;
    const unlocked = allSprites.length;
    const progress = total > 0 ? (unlocked / total) * 100 : 0;
    
    const byCategory = {
      character: allSprites.filter(s => s.category === 'character').length,
      boss: allSprites.filter(s => s.category === 'boss').length,
      enemy: allSprites.filter(s => s.category === 'enemy').length,
      equipment: allSprites.filter(s => s.category === 'equipment').length,
      item: allSprites.filter(s => s.category === 'item').length,
      background: allSprites.filter(s => s.category === 'background').length,
      ui: allSprites.filter(s => s.category === 'ui').length,
    };

    const byRarity = {
      common: allSprites.filter(s => s.rarity === 'common').length,
      uncommon: allSprites.filter(s => s.rarity === 'uncommon').length,
      rare: allSprites.filter(s => s.rarity === 'rare').length,
      epic: allSprites.filter(s => s.rarity === 'epic').length,
      legendary: allSprites.filter(s => s.rarity === 'legendary').length,
    };

    return { total, unlocked, progress, byCategory, byRarity };
  }, [allSprites]);



  const handleSpritePress = (sprite: PixelArtSprite) => {
    soundService.playButtonClick();
    setSelectedSprite(sprite);
    setShowSpriteModal(true);
  };

  const handleFilterChange = (filter: FilterCategory | FilterRarity, type: 'category' | 'rarity') => {
    soundService.playMenuNavigate();
    if (type === 'category') {
      setSelectedCategory(filter as FilterCategory);
    } else {
      setSelectedRarity(filter as FilterRarity);
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return '#1eff00';
      case 'uncommon': return '#0070dd';
      case 'rare': return '#a335ee';
      case 'epic': return '#ff8000';
      case 'legendary': return '#ff0000';
      default: return theme.colors.text;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'character': return '👤';
      case 'boss': return '👹';
      case 'enemy': return '👺';
      case 'equipment': return '⚔️';
      case 'item': return '🎒';
      case 'background': return '🌲';
      case 'ui': return '▢';
      default: return '❓';
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
        {icon && <PixelText style={[styles.filterIcon, { color: isSelected ? '#fff' : theme.colors.text }]}>{icon}</PixelText>}
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

  const renderSpriteCard = (sprite: PixelArtSprite, index: number) => {
    const rarityColor = getRarityColor(sprite.rarity);
    const isUnlocked = !sprite.unlockLevel || sprite.unlockLevel <= user.level;

    return (
      <TouchableOpacity
        key={sprite.id}
        style={[
          styles.spriteCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isUnlocked ? rarityColor : theme.colors.textSecondary,
            opacity: isUnlocked ? 1 : 0.5,
          }
        ]}
        onPress={() => isUnlocked && handleSpritePress(sprite)}
        activeOpacity={0.8}
        disabled={!isUnlocked}
      >
        <View style={styles.spriteContainer}>
          <PixelArtSpriteComponent
            sprite={sprite}
            size={40}
            animated={true}
            glow={sprite.rarity === 'legendary'}
            pulse={sprite.rarity === 'epic'}
          />
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <PixelIcon name="lock" size={20} color={theme.colors.textSecondary} />
            </View>
          )}
        </View>
        
        <View style={styles.spriteInfo}>
          <PixelText style={[styles.spriteName, { color: theme.colors.text }]}>
            {sprite.name}
          </PixelText>
          <PixelText style={[styles.spriteCategory, { color: theme.colors.textSecondary }]}>
            {sprite.category.toUpperCase()}
          </PixelText>
        </View>

        <View style={styles.spriteMeta}>
          {sprite.rarity && (
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
              <PixelText style={styles.rarityText}>
                {sprite.rarity.toUpperCase()}
              </PixelText>
            </View>
          )}
          {sprite.unlockLevel && (
            <PixelText style={[styles.unlockLevel, { color: theme.colors.textSecondary }]}>
              Lv {sprite.unlockLevel}
            </PixelText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PixelBackground pattern="gallery" animated={true}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <PixelText variant="title" style={[styles.title, { color: theme.colors.text }]}>
            PIXEL ART GALLERY
          </PixelText>
          <PixelText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {stats.unlocked} / {stats.total} Unlocked
          </PixelText>
        </View>

        {/* Progress Section */}
        <View style={[styles.progressSection, { backgroundColor: theme.colors.surface }]}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Collection Progress
          </PixelText>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${stats.progress}%`,
                  backgroundColor: theme.colors.primary 
                }
              ]} 
            />
          </View>
          <PixelText style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            {Math.round(stats.progress)}% Complete
          </PixelText>
        </View>

        {/* Category Breakdown */}
        <View style={[styles.statsSection, { backgroundColor: theme.colors.surface }]}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            By Category
          </PixelText>
          <View style={styles.statsGrid}>
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <View key={category} style={styles.statItem}>
                <View style={styles.statIcon}>
                  <PixelText style={[styles.statIconText, { color: theme.colors.text }]}>
                    {getCategoryIcon(category)}
                  </PixelText>
                </View>
                <PixelText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  {category.toUpperCase()}
                </PixelText>
                <PixelText style={[styles.statValue, { color: theme.colors.text }]}>
                  {count}
                </PixelText>
              </View>
            ))}
          </View>
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
              {renderFilterButton('Characters', 'character', 'category', '👤')}
              {renderFilterButton('Bosses', 'boss', 'category', '👹')}
              {renderFilterButton('Enemies', 'enemy', 'category', '👺')}
              {renderFilterButton('Equipment', 'equipment', 'category', '⚔️')}
              {renderFilterButton('Items', 'item', 'category', '🎒')}
              {renderFilterButton('Backgrounds', 'background', 'category', '🌲')}
              {renderFilterButton('UI', 'ui', 'category', '▢')}
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
        </View>

        {/* Sprites Grid */}
        <View style={styles.spritesSection}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {filteredSprites.length} Sprite{filteredSprites.length !== 1 ? 's' : ''}
          </PixelText>
          
          {filteredSprites.length === 0 ? (
            <View style={styles.emptyState}>
              <PixelIcon name="question" size={48} color={theme.colors.textSecondary} />
              <PixelText style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No sprites match your filters
              </PixelText>
            </View>
          ) : (
            <View style={styles.spritesGrid}>
              <FadeInAnimation duration={300}>
                {filteredSprites.map((sprite, index) => (
                  <SlideInAnimation key={sprite.id} direction="up" delay={index * 50}>
                    {renderSpriteCard(sprite, index)}
                  </SlideInAnimation>
                ))}
              </FadeInAnimation>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sprite Detail Modal */}
      <Modal
        visible={showSpriteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSpriteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            {selectedSprite && (
              <>
                <View style={styles.modalHeader}>
                  <PixelArtSpriteComponent
                    sprite={selectedSprite}
                    size={80}
                    animated={true}
                    glow={selectedSprite.rarity === 'legendary'}
                    pulse={selectedSprite.rarity === 'epic'}
                  />
                  <View style={styles.modalTitleContainer}>
                    <PixelText style={[styles.modalTitle, { color: theme.colors.text }]}>
                      {selectedSprite.name}
                    </PixelText>
                    {selectedSprite.rarity && (
                      <View style={[styles.modalRarity, { backgroundColor: getRarityColor(selectedSprite.rarity) }]}>
                        <PixelText style={styles.modalRarityText}>
                          {selectedSprite.rarity.toUpperCase()}
                        </PixelText>
                      </View>
                    )}
                  </View>
                </View>
                
                <PixelText style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
                  {selectedSprite.description}
                </PixelText>
                
                <View style={styles.modalDetails}>
                  <View style={styles.modalDetail}>
                    <PixelText style={[styles.modalDetailLabel, { color: theme.colors.textSecondary }]}>
                      Category:
                    </PixelText>
                    <PixelText style={[styles.modalDetailValue, { color: theme.colors.text }]}>
                      {selectedSprite.category.toUpperCase()}
                    </PixelText>
                  </View>
                  
                  {selectedSprite.unlockLevel && (
                    <View style={styles.modalDetail}>
                      <PixelText style={[styles.modalDetailLabel, { color: theme.colors.textSecondary }]}>
                        Unlock Level:
                      </PixelText>
                      <PixelText style={[styles.modalDetailValue, { color: theme.colors.text }]}>
                        {selectedSprite.unlockLevel}
                      </PixelText>
                    </View>
                  )}
                </View>
                
                <RetroButton
                  title="Close"
                  onPress={() => setShowSpriteModal(false)}
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
  progressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  statsSection: {
    margin: 16,
    padding: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIconText: {
    fontSize: 16,
    fontFamily: 'monospace',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
  filterIcon: {
    fontSize: 16,
    marginRight: 4,
    fontFamily: 'monospace',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  spritesSection: {
    margin: 16,
  },
  spritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spriteCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    padding: 12,
    borderWidth: 2,
    borderRadius: 0,
    alignItems: 'center',
  },
  spriteContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spriteInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  spriteName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  spriteCategory: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  spriteMeta: {
    alignItems: 'center',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  unlockLevel: {
    fontSize: 10,
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
  modalDetails: {
    marginBottom: 16,
  },
  modalDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalDetailLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});
