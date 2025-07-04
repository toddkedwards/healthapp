import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { characterClasses } from '../data/characterClasses';
import { CharacterClass, CharacterClassData } from '../types';
import { soundService } from '../services/soundService';

interface CharacterClassPickerProps {
  selectedClass: CharacterClass | null;
  onSelectClass: (characterClass: CharacterClass) => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const CharacterClassPicker: React.FC<CharacterClassPickerProps> = ({
  selectedClass,
  onSelectClass,
  onClose,
}) => {
  const handleClassSelect = (characterClass: CharacterClass) => {
    soundService.playButtonClick();
    onSelectClass(characterClass);
  };

  const renderStatBar = (value: number, maxValue: number, label: string) => (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarContainer}>
        <View style={[styles.statBar, { width: `${(value / maxValue) * 100}%` }]} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderClassCard = (characterClass: CharacterClassData) => {
    const isSelected = selectedClass === characterClass.id;
    const maxStat = 20; // For visual scaling

    return (
      <TouchableOpacity
        key={characterClass.id}
        style={[styles.classCard, isSelected && styles.selectedCard]}
        onPress={() => handleClassSelect(characterClass.id)}
        activeOpacity={0.8}
      >
        <View style={styles.classHeader}>
          <Text style={styles.classIcon}>{characterClass.icon}</Text>
          <Text style={styles.className}>{characterClass.name}</Text>
        </View>
        
        <Text style={styles.classDescription}>{characterClass.description}</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Base Stats:</Text>
          {renderStatBar(characterClass.baseStats.strength, maxStat, 'STR')}
          {renderStatBar(characterClass.baseStats.agility, maxStat, 'AGI')}
          {renderStatBar(characterClass.baseStats.intelligence, maxStat, 'INT')}
          {renderStatBar(characterClass.baseStats.defense, maxStat, 'DEF')}
        </View>
        
        <View style={styles.bonusesContainer}>
          <Text style={styles.bonusesTitle}>Class Bonuses:</Text>
          <Text style={styles.bonusText}>
            XP: +{Math.round((characterClass.bonusXpMultiplier - 1) * 100)}%
          </Text>
          <Text style={styles.bonusText}>
            Coins: +{Math.round((characterClass.bonusCoinMultiplier - 1) * 100)}%
          </Text>
        </View>
        
        <View style={styles.abilitiesContainer}>
          <Text style={styles.abilitiesTitle}>Starting Abilities:</Text>
          {characterClass.startingAbilities.map((ability, index) => (
            <Text key={index} style={styles.abilityText}>• {ability.replace('_', ' ')}</Text>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Class</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.classesContainer}>
          {characterClasses.map(renderClassCard)}
        </View>
      </ScrollView>
      
      {selectedClass && (
        <View style={styles.confirmContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              soundService.playButtonClick();
              onClose();
            }}
          >
            <Text style={styles.confirmButtonText}>Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#8B4513',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#8B4513',
    backgroundColor: '#2a2a2a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    fontFamily: 'monospace',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  classesContainer: {
    padding: 16,
  },
  classCard: {
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#8B4513',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  selectedCard: {
    borderColor: '#FFD700',
    backgroundColor: '#3a3a3a',
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    fontFamily: 'monospace',
  },
  classDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  statsContainer: {
    marginBottom: 12,
  },
  statsTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    width: 30,
    fontFamily: 'monospace',
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#444444',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  statBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  statValue: {
    color: '#CCCCCC',
    fontSize: 12,
    width: 25,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  bonusesContainer: {
    marginBottom: 12,
  },
  bonusesTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  bonusText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  abilitiesContainer: {
    marginBottom: 8,
  },
  abilitiesTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  abilityText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'monospace',
    textTransform: 'capitalize',
  },
  confirmContainer: {
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#8B4513',
    backgroundColor: '#2a2a2a',
  },
  confirmButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
}); 