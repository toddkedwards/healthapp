import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useQuest } from '../context/QuestContext';
import { ProgressBar } from '../components/ProgressBar';
import PixelIcon from '../components/PixelIcon';
import PixelBackground from '../components/PixelBackground';
import { RetroButton } from '../components/RetroButton';
import { FadeInAnimation, SlideInAnimation, PulseAnimation } from '../components/RetroAnimations';
import { soundService } from '../services/soundService';
import { getCharacterClass, calculateStatsForLevel } from '../data/characterClasses';
import { Equipment } from '../types';
import EquipmentComparisonModal from '../components/EquipmentComparisonModal';
import DetailedProgressionChart from '../components/DetailedProgressionChart';
import { calculateCharacterStats, getCharacterPowerLevel, getEquipmentScore } from '../utils/statCalculations';

const { width } = Dimensions.get('window');

export default function CharacterSheetScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  const { achievements } = useQuest();
  
  const [selectedTab, setSelectedTab] = useState<'stats' | 'equipment' | 'abilities' | 'progression'>('stats');
  const [comparisonModalVisible, setComparisonModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  const characterClass = getCharacterClass(user.characterClass);
  const calculatedStats = characterClass ? calculateStatsForLevel(characterClass, user.level) : null;
  const characterStats = calculateCharacterStats(user);
  const powerLevel = getCharacterPowerLevel(user);
  
  const equippedItems = user.equipment?.filter(item => item.isEquipped) || [];
  const unlockedAchievements = achievements.filter(achievement => achievement.isUnlocked);
  
  const renderStatRow = (label: string, current: number, max: number, color: string) => (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      <View style={styles.statBarContainer}>
        <ProgressBar progress={(current / max) * 100} color={color} height={8} />
      </View>
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{current}/{max}</Text>
    </View>
  );

  const renderEquipmentSlot = (slot: string, equippedItem?: Equipment) => {
    const slotIcons = {
      weapon: '⚔️',
      head: '🪖',
      chest: '🛡️',
      legs: '👖',
      feet: '👢',
      accessory1: '💍',
      accessory2: '📿',
    };
    
    return (
      <TouchableOpacity 
        style={[styles.equipmentSlot, { borderColor: theme.colors.primary }]}
        onPress={() => {
          if (equippedItem) {
            setSelectedEquipment(equippedItem);
            setComparisonModalVisible(true);
          }
        }}
      >
        <Text style={styles.slotIcon}>{slotIcons[slot as keyof typeof slotIcons] || '❓'}</Text>
        {equippedItem ? (
          <View style={styles.equippedItem}>
            <Text style={styles.itemIcon}>{equippedItem.icon}</Text>
            <Text style={[styles.itemName, { color: theme.colors.text }]}>{equippedItem.name}</Text>
            <Text style={[styles.itemRarity, { color: getRarityColor(equippedItem.rarity) }]}>
              {equippedItem.rarity.toUpperCase()}
            </Text>
            <Text style={[styles.itemScore, { color: theme.colors.accent }]}>
              Score: {getEquipmentScore(equippedItem)}
            </Text>
          </View>
        ) : (
          <Text style={[styles.emptySlot, { color: theme.colors.textSecondary }]}>Empty</Text>
        )}
      </TouchableOpacity>
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9d9d9d';
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      default: return '#9d9d9d';
    }
  };

  const renderTabButton = (tab: string, icon: string, label: string) => (
    <RetroButton
      title={label}
      onPress={() => {
        soundService.playTabSwitch();
        setSelectedTab(tab as any);
      }}
      variant={selectedTab === tab ? 'primary' : 'secondary'}
      size="small"
      style={styles.tabButton}
    />
  );

  const renderStatsTab = () => (
    <FadeInAnimation duration={300}>
      <View style={styles.tabContent}>
        {/* Character Class Info */}
        <SlideInAnimation direction="left" delay={100}>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Class Information</Text>
            <View style={styles.classInfo}>
              <PulseAnimation>
                <Text style={styles.classIcon}>
                  {user.characterClass === 'warrior' ? '⚔️' : 
                   user.characterClass === 'mage' ? '🔮' : 
                   user.characterClass === 'rogue' ? '🗡️' : 
                   user.characterClass === 'archer' ? '🏹' : '⛪'}
                </Text>
              </PulseAnimation>
              <View style={styles.classDetails}>
                <Text style={[styles.className, { color: theme.colors.text }]}>
                  {user.characterClass.charAt(0).toUpperCase() + user.characterClass.slice(1)}
                </Text>
                <Text style={[styles.classDescription, { color: theme.colors.textSecondary }]}>
                  Level {user.level} • {characterClass?.description}
                </Text>
              </View>
            </View>
          </View>
        </SlideInAnimation>

        {/* Power Level */}
        <SlideInAnimation direction="left" delay={200}>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Power Level</Text>
            <View style={styles.powerLevelContainer}>
              <Text style={[styles.powerLevelValue, { color: theme.colors.primary }]}>
                {powerLevel}
              </Text>
              <Text style={[styles.powerLevelLabel, { color: theme.colors.textSecondary }]}>
                Combat Power
              </Text>
            </View>
          </View>
        </SlideInAnimation>

        {/* Core Stats */}
        <SlideInAnimation direction="left" delay={300}>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Core Stats</Text>
            {renderStatRow('Health', user.health, characterStats.total.health, theme.colors.health)}
            {renderStatRow('Energy', user.energy, characterStats.total.energy, theme.colors.energy)}
            {renderStatRow('Strength', user.strength, characterStats.total.strength, theme.colors.primary)}
            {renderStatRow('Agility', user.agility, characterStats.total.agility, theme.colors.secondary)}
            {renderStatRow('Intelligence', user.intelligence, characterStats.total.intelligence, theme.colors.accent)}
            {renderStatRow('Stamina', user.stamina, characterStats.total.stamina, theme.colors.success)}
            {renderStatRow('Defense', user.defense, characterStats.total.defense, theme.colors.warning)}
          </View>
        </SlideInAnimation>

        {/* Equipment Bonuses */}
        <SlideInAnimation direction="left" delay={400}>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Equipment Bonuses</Text>
            {renderStatRow('Health', characterStats.base.health, characterStats.total.health, theme.colors.health)}
            {renderStatRow('Energy', characterStats.base.energy, characterStats.total.energy, theme.colors.energy)}
            {renderStatRow('Strength', characterStats.base.strength, characterStats.total.strength, theme.colors.primary)}
            {renderStatRow('Agility', characterStats.base.agility, characterStats.total.agility, theme.colors.secondary)}
            {renderStatRow('Intelligence', characterStats.base.intelligence, characterStats.total.intelligence, theme.colors.accent)}
            {renderStatRow('Stamina', characterStats.base.stamina, characterStats.total.stamina, theme.colors.success)}
            {renderStatRow('Defense', characterStats.base.defense, characterStats.total.defense, theme.colors.warning)}
          </View>
        </SlideInAnimation>

        {/* Class Bonuses */}
        {characterClass && (
          <SlideInAnimation direction="left" delay={500}>
            <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Class Bonuses</Text>
              <View style={styles.bonusRow}>
                <Text style={[styles.bonusLabel, { color: theme.colors.textSecondary }]}>XP Multiplier:</Text>
                <Text style={[styles.bonusValue, { color: theme.colors.primary }]}>
                  +{Math.round((characterClass.bonusXpMultiplier - 1) * 100)}%
                </Text>
              </View>
              <View style={styles.bonusRow}>
                <Text style={[styles.bonusLabel, { color: theme.colors.textSecondary }]}>Coin Multiplier:</Text>
                <Text style={[styles.bonusValue, { color: theme.colors.accent }]}>
                  +{Math.round((characterClass.bonusCoinMultiplier - 1) * 100)}%
                </Text>
              </View>
            </View>
          </SlideInAnimation>
        )}
      </View>
    </FadeInAnimation>
  );

  const renderEquipmentTab = () => (
    <FadeInAnimation duration={300}>
      <View style={styles.tabContent}>
        <SlideInAnimation direction="left" delay={100}>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Equipment</Text>
            <View style={styles.equipmentGrid}>
              {renderEquipmentSlot('weapon', equippedItems.find(item => item.slot === 'weapon'))}
              {renderEquipmentSlot('head', equippedItems.find(item => item.slot === 'head'))}
              {renderEquipmentSlot('chest', equippedItems.find(item => item.slot === 'chest'))}
              {renderEquipmentSlot('legs', equippedItems.find(item => item.slot === 'legs'))}
              {renderEquipmentSlot('feet', equippedItems.find(item => item.slot === 'feet'))}
              {renderEquipmentSlot('accessory1', equippedItems.find(item => item.slot === 'accessory1'))}
              {renderEquipmentSlot('accessory2', equippedItems.find(item => item.slot === 'accessory2'))}
            </View>
          </View>
        </SlideInAnimation>
      </View>
    </FadeInAnimation>
  );

  const renderAbilitiesTab = () => (
    <FadeInAnimation duration={300}>
      <View style={styles.tabContent}>
        <SlideInAnimation direction="left" delay={100}>
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Unlocked Abilities</Text>
            {user.unlockedAbilities.length > 0 ? (
              user.unlockedAbilities.map((ability, index) => (
                <View key={index} style={styles.abilityItem}>
                  <Text style={styles.abilityIcon}>⚡</Text>
                  <Text style={[styles.abilityName, { color: theme.colors.text }]}>
                    {ability.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No abilities unlocked yet. Complete quests to unlock new abilities!
              </Text>
            )}
          </View>
        </SlideInAnimation>
      </View>
    </FadeInAnimation>
  );

  const renderProgressionTab = () => (
    <FadeInAnimation duration={300}>
      <View style={styles.tabContent}>
        <SlideInAnimation direction="left" delay={100}>
          <DetailedProgressionChart
            currentLevel={user.level}
            currentXp={user.xp}
            xpToNextLevel={user.xpToNextLevel}
            totalXp={user.totalXp}
          />
          
          {/* Achievements */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
            <View style={styles.achievementProgress}>
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                {unlockedAchievements.length}/{achievements.length} Unlocked
              </Text>
              <ProgressBar progress={(unlockedAchievements.length / achievements.length) * 100} color={theme.colors.success} height={12} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsList}>
              {achievements.map(achievement => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <PixelIcon 
                    name={achievement.icon} 
                    size={32} 
                    color={achievement.isUnlocked ? theme.colors.text : theme.colors.textSecondary}
                  />
                  <Text style={[
                    styles.achievementTitle,
                    { color: achievement.isUnlocked ? theme.colors.text : theme.colors.textSecondary }
                  ]}>
                    {achievement.title}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </SlideInAnimation>
      </View>
    </FadeInAnimation>
  );

  return (
    <PixelBackground pattern="grid" animated={true}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Character Sheet</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Level {user.level} • {user.characterClass.charAt(0).toUpperCase() + user.characterClass.slice(1)}
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
          {renderTabButton('stats', 'stats-chart', 'Stats')}
          {renderTabButton('equipment', 'shield', 'Equipment')}
          {renderTabButton('abilities', 'flash', 'Abilities')}
          {renderTabButton('progression', 'trending-up', 'Progress')}
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTab === 'stats' && renderStatsTab()}
          {selectedTab === 'equipment' && renderEquipmentTab()}
          {selectedTab === 'abilities' && renderAbilitiesTab()}
          {selectedTab === 'progression' && renderProgressionTab()}
        </ScrollView>

        {/* Equipment Comparison Modal */}
        {selectedEquipment && (
          <EquipmentComparisonModal
            visible={comparisonModalVisible}
            onClose={() => {
              setComparisonModalVisible(false);
              setSelectedEquipment(null);
            }}
            currentEquipment={equippedItems.find(item => item.slot === selectedEquipment.slot)}
            newEquipment={selectedEquipment}
            onEquip={() => {
              // Handle equipment change logic here
              setComparisonModalVisible(false);
              setSelectedEquipment(null);
            }}
          />
        )}
      </View>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'monospace',
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    paddingBottom: 8,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  classDetails: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  classDescription: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statBarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  bonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bonusLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  bonusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  equipmentSlot: {
    width: (width - 80) / 2,
    height: 80,
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  equippedItem: {
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  itemName: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  itemRarity: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  itemScore: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  emptySlot: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  abilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  abilityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  abilityName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'monospace',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  achievementProgress: {
    marginBottom: 16,
  },
  achievementsList: {
    flexDirection: 'row',
  },
  achievementItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  achievementLocked: {
    opacity: 0.3,
  },
  achievementTitle: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  powerLevelContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  powerLevelValue: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  powerLevelLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
}); 