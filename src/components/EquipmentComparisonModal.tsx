import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Equipment } from '../types';

const { width } = Dimensions.get('window');

interface EquipmentComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  currentEquipment?: Equipment;
  newEquipment: Equipment;
  onEquip: () => void;
}

export default function EquipmentComparisonModal({
  visible,
  onClose,
  currentEquipment,
  newEquipment,
  onEquip,
}: EquipmentComparisonModalProps) {
  const { theme } = useTheme();

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

  const renderStatComparison = (statName: string, currentValue: number, newValue: number) => {
    const difference = newValue - currentValue;
    const isImprovement = difference > 0;
    const isWorse = difference < 0;
    
    return (
      <View style={styles.statRow}>
        <Text style={[styles.statName, { color: theme.colors.textSecondary }]}>{statName}</Text>
        <View style={styles.statValues}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{currentValue}</Text>
          <Ionicons 
            name={isImprovement ? 'arrow-forward' : isWorse ? 'arrow-back' : 'remove'} 
            size={16} 
            color={isImprovement ? theme.colors.success : isWorse ? theme.colors.error : theme.colors.textSecondary} 
          />
          <Text style={[
            styles.statValue, 
            { color: isImprovement ? theme.colors.success : isWorse ? theme.colors.error : theme.colors.text }
          ]}>
            {newValue}
          </Text>
          {difference !== 0 && (
            <Text style={[
              styles.statDifference,
              { color: isImprovement ? theme.colors.success : theme.colors.error }
            ]}>
              {isImprovement ? '+' : ''}{difference}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const getTotalStats = (equipment?: Equipment) => {
    if (!equipment) return {};
    return equipment.stats;
  };

  const currentStats = getTotalStats(currentEquipment);
  const newStats = getTotalStats(newEquipment);

  const allStatNames = [...new Set([
    ...Object.keys(currentStats),
    ...Object.keys(newStats)
  ])];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Equipment Comparison</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Equipment Info */}
            <View style={styles.equipmentInfo}>
              <View style={styles.equipmentCard}>
                <Text style={[styles.equipmentTitle, { color: theme.colors.textSecondary }]}>
                  {currentEquipment ? 'Currently Equipped' : 'No Equipment'}
                </Text>
                {currentEquipment ? (
                  <View style={styles.equipmentDetails}>
                    <Text style={styles.equipmentIcon}>{currentEquipment.icon}</Text>
                    <Text style={[styles.equipmentName, { color: theme.colors.text }]}>
                      {currentEquipment.name}
                    </Text>
                    <Text style={[
                      styles.equipmentRarity,
                      { color: getRarityColor(currentEquipment.rarity) }
                    ]}>
                      {currentEquipment.rarity.toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.noEquipment, { color: theme.colors.textSecondary }]}>
                    Empty Slot
                  </Text>
                )}
              </View>

              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={24} color={theme.colors.primary} />
              </View>

              <View style={styles.equipmentCard}>
                <Text style={[styles.equipmentTitle, { color: theme.colors.primary }]}>
                  New Equipment
                </Text>
                <View style={styles.equipmentDetails}>
                  <Text style={styles.equipmentIcon}>{newEquipment.icon}</Text>
                  <Text style={[styles.equipmentName, { color: theme.colors.text }]}>
                    {newEquipment.name}
                  </Text>
                  <Text style={[
                    styles.equipmentRarity,
                    { color: getRarityColor(newEquipment.rarity) }
                  ]}>
                    {newEquipment.rarity.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Comparison */}
            <View style={styles.statsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Stats Comparison</Text>
              {allStatNames.map(statName => {
                const currentValue = currentStats[statName as keyof typeof currentStats] || 0;
                const newValue = newStats[statName as keyof typeof newStats] || 0;
                return renderStatComparison(
                  statName.charAt(0).toUpperCase() + statName.slice(1),
                  currentValue,
                  newValue
                );
              })}
              {allStatNames.length === 0 && (
                <Text style={[styles.noStats, { color: theme.colors.textSecondary }]}>
                  No stat changes
                </Text>
              )}
            </View>

            {/* Equipment Description */}
            <View style={styles.descriptionSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                {newEquipment.description}
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.equipButton, { backgroundColor: theme.colors.primary }]} 
              onPress={onEquip}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Equip Item</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  equipmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  equipmentCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 8,
  },
  equipmentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  equipmentDetails: {
    alignItems: 'center',
  },
  equipmentIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  equipmentRarity: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  noEquipment: {
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: 'monospace',
  },
  arrowContainer: {
    paddingHorizontal: 12,
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'monospace',
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    paddingBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  statName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    minWidth: 30,
    textAlign: 'center',
  },
  statDifference: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  noStats: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'monospace',
    paddingVertical: 20,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  equipButton: {
    borderColor: '#4ecdc4',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
}); 