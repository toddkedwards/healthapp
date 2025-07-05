import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import PixelBackground from './PixelBackground';
import PixelText from './PixelText';
import UnifiedIcon from './UnifiedIcon';
import PixelArtSpriteComponent from './PixelArtSprite';
import { ProgressBar } from './ProgressBar';
import { RetroButton } from './RetroButton';
import { FadeInAnimation, SlideInAnimation } from './RetroAnimations';
import { CombatState, CombatLogEntry } from '../services/combatService';
import { StatusEffect } from '../types';
import { User, Boss, Ability } from '../types';

const { width, height } = Dimensions.get('window');

interface BattleUIProps {
  combatState: CombatState;
  player: User;
  playerAbilities: Ability[];
  onAbilitySelect: (ability: Ability) => void;
  onFlee: () => void;
}

export const BattleUI: React.FC<BattleUIProps> = ({
  combatState,
  player,
  playerAbilities,
  onAbilitySelect,
  onFlee,
}) => {
  const { theme } = useTheme();
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [glowAnimation] = useState(new Animated.Value(0));

  // Animate when taking damage
  useEffect(() => {
    if (combatState.turn === 'boss') {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [combatState.playerHealth]);

  // Animate when dealing damage
  useEffect(() => {
    if (combatState.turn === 'player') {
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [combatState.bossHealth]);

  const renderHealthBar = (
    current: number,
    max: number,
    label: string,
    color: string,
    isPlayer: boolean = false
  ) => (
    <View style={styles.healthBarContainer}>
      <View style={styles.healthBarHeader}>
        <PixelText style={[styles.healthBarLabel, { color: theme.colors.text }]}>
          {label}
        </PixelText>
        <PixelText style={[styles.healthBarValue, { color: theme.colors.text }]}>
          {current} / {max}
        </PixelText>
      </View>
      <View style={[styles.healthBar, isPlayer && { transform: [{ translateX: shakeAnimation }] }]}>
        <ProgressBar
          progress={(current / max) * 100}
          color={color}
        />
      </View>
    </View>
  );

  const renderEnergyBar = (current: number, max: number, label: string) => (
    <View style={styles.energyBarContainer}>
      <View style={styles.energyBarHeader}>
        <UnifiedIcon name="flash" size={16} color={theme.colors.energy} />
        <PixelText style={[styles.energyBarLabel, { color: theme.colors.textSecondary }]}>
          {label}
        </PixelText>
        <PixelText style={[styles.energyBarValue, { color: theme.colors.textSecondary }]}>
          {current} / {max}
        </PixelText>
      </View>
      <View style={styles.energyBar}>
        <ProgressBar
          progress={(current / max) * 100}
          color={theme.colors.energy}
        />
      </View>
    </View>
  );

  const renderStatusEffects = (effects: StatusEffect[], label: string) => (
    <View style={styles.statusEffectsContainer}>
      <PixelText style={[styles.statusEffectsLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </PixelText>
      <View style={styles.statusEffectsList}>
        {effects.map((effect, index) => (
          <View
            key={`${effect.id}-${index}`}
            style={[styles.statusEffectItem, { backgroundColor: theme.colors.surface }]}
          >
            <UnifiedIcon name={effect.icon} size={16} color={theme.colors.text} />
            <PixelText style={[styles.statusEffectName, { color: theme.colors.text }]}>
              {effect.name}
            </PixelText>
            <PixelText style={[styles.statusEffectDuration, { color: theme.colors.textSecondary }]}>
              {effect.duration}
            </PixelText>
          </View>
        ))}
      </View>
    </View>
  );

  const renderBattleLog = () => (
    <View style={[styles.battleLogContainer, { backgroundColor: theme.colors.surface }]}>
      <PixelText style={[styles.battleLogTitle, { color: theme.colors.text }]}>
        Battle Log
      </PixelText>
      <ScrollView style={styles.battleLogScroll} showsVerticalScrollIndicator={false}>
        {combatState.battleLog.map((entry, index) => (
          <View
            key={entry.id}
            style={[
              styles.battleLogEntry,
              { borderLeftColor: getLogEntryColor(entry.type) },
            ]}
          >
            <PixelText style={[styles.battleLogMessage, { color: theme.colors.text }]}>
              {entry.message}
            </PixelText>
            {entry.damage && (
              <PixelText style={[styles.battleLogDamage, { color: theme.colors.error }]}>
                -{entry.damage}
              </PixelText>
            )}
            {entry.healing && (
              <PixelText style={[styles.battleLogHealing, { color: theme.colors.success }]}>
                +{entry.healing}
              </PixelText>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderAbilityButton = (ability: Ability) => {
    const canUse = combatState.playerEnergy >= ability.cost && combatState.turn === 'player';
    const isCombo = combatState.lastPlayerAbility === ability.id;
    
    return (
      <TouchableOpacity
        key={ability.id}
        style={[
          styles.abilityButton,
          {
            backgroundColor: canUse ? theme.colors.primary : theme.colors.surface,
            borderColor: isCombo ? theme.colors.accent : theme.colors.textSecondary,
            opacity: canUse ? 1 : 0.5,
          },
        ]}
        onPress={() => canUse && onAbilitySelect(ability)}
        disabled={!canUse}
        activeOpacity={0.8}
      >
        <UnifiedIcon name={ability.icon} size={24} color={canUse ? '#fff' : theme.colors.text} />
        <View style={styles.abilityInfo}>
          <PixelText style={[styles.abilityName, { color: canUse ? '#fff' : theme.colors.text }]}>
            {ability.name}
          </PixelText>
          <PixelText style={[styles.abilityCost, { color: canUse ? '#fff' : theme.colors.textSecondary }]}>
            {ability.cost} Energy
          </PixelText>
        </View>
        {isCombo && (
          <View style={[styles.comboIndicator, { backgroundColor: theme.colors.accent }]}>
            <PixelText style={styles.comboText}>COMBO</PixelText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getLogEntryColor = (type: CombatLogEntry['type']) => {
    switch (type) {
      case 'player': return theme.colors.primary;
      case 'boss': return theme.colors.error;
      case 'system': return theme.colors.warning;
      case 'status': return theme.colors.secondary;
      case 'critical': return theme.colors.accent;
      case 'miss': return theme.colors.textSecondary;
      case 'heal': return theme.colors.success;
      default: return theme.colors.text;
    }
  };

  if (!combatState.currentBoss) return null;

  return (
    <View style={styles.container}>
      {/* Boss Section */}
      <Animated.View
        style={[
          styles.bossSection,
          {
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glowAnimation,
            shadowRadius: 10,
            elevation: glowAnimation,
          },
        ]}
      >
        <View style={styles.bossHeader}>
          <PixelArtSpriteComponent
            sprite={{ 
              id: combatState.currentBoss.sprite, 
              name: combatState.currentBoss.name, 
              category: 'boss', 
              rarity: 'rare',
              sprite: combatState.currentBoss.sprite,
              description: combatState.currentBoss.description
            }}
            size={60}
            animated={true}
            glow={combatState.bossPhase === 'desperate'}
            pulse={combatState.bossPhase === 'enraged'}
          />
          <View style={styles.bossInfo}>
            <PixelText style={[styles.bossName, { color: theme.colors.text }]}>
              {combatState.currentBoss.name}
            </PixelText>
            <PixelText style={[styles.bossPhase, { color: theme.colors.accent }]}>
              {combatState.bossPhase.toUpperCase()} PHASE
            </PixelText>
          </View>
        </View>
        
        {renderHealthBar(
          combatState.bossHealth,
          combatState.currentBoss.maxHealth,
          'Boss Health',
          theme.colors.error
        )}
        
        {renderEnergyBar(
          combatState.bossEnergy,
          combatState.currentBoss.maxEnergy,
          'Boss Energy'
        )}
        
        {renderStatusEffects(combatState.bossStatusEffects, 'Boss Status')}
      </Animated.View>

      {/* Player Section */}
      <Animated.View
        style={[
          styles.playerSection,
          {
            backgroundColor: theme.colors.surface,
            transform: [{ translateX: shakeAnimation }],
          },
        ]}
      >
        <View style={styles.playerHeader}>
          <PixelArtSpriteComponent
            sprite={{ 
              id: player.avatar || 'warrior_m', 
              name: player.name, 
              category: 'character', 
              rarity: 'common',
              sprite: player.avatar || 'warrior_m',
              description: `${player.name} - Level ${player.level} ${player.characterClass}`
            }}
            size={60}
            animated={true}
          />
          <View style={styles.playerInfo}>
            <PixelText style={[styles.playerName, { color: theme.colors.text }]}>
              {player.name}
            </PixelText>
            <PixelText style={[styles.playerLevel, { color: theme.colors.textSecondary }]}>
              Level {player.level}
            </PixelText>
          </View>
        </View>
        
        {renderHealthBar(
          combatState.playerHealth,
          player.maxHealth,
          'Your Health',
          theme.colors.health,
          true
        )}
        
        {renderEnergyBar(
          combatState.playerEnergy,
          player.maxEnergy,
          'Your Energy'
        )}
        
        {renderStatusEffects(combatState.playerStatusEffects, 'Your Status')}
      </Animated.View>

      {/* Battle Log */}
      {renderBattleLog()}

      {/* Abilities Section */}
      <View style={[styles.abilitiesSection, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.abilitiesHeader}>
          <PixelText style={[styles.abilitiesTitle, { color: theme.colors.text }]}>
            Abilities
          </PixelText>
          <PixelText style={[styles.turnIndicator, { color: theme.colors.accent }]}>
            {combatState.turn === 'player' ? 'YOUR TURN' : 'BOSS TURN'}
          </PixelText>
        </View>
        
        <View style={styles.abilitiesGrid}>
          {playerAbilities.map(renderAbilityButton)}
        </View>
        
        <View style={styles.battleControls}>
          <RetroButton
            title="Flee Battle"
            onPress={onFlee}
            variant="danger"
            size="medium"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  bossSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  bossHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bossInfo: {
    marginLeft: 12,
    flex: 1,
  },
  bossName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  bossPhase: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  healthBarContainer: {
    marginBottom: 8,
  },
  healthBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  healthBarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  healthBarValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  healthBar: {
    height: 12,
  },
  energyBarContainer: {
    marginBottom: 8,
  },
  energyBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  energyBarLabel: {
    fontSize: 12,
    marginLeft: 4,
    marginRight: 8,
    fontFamily: 'monospace',
  },
  energyBarValue: {
    fontSize: 12,
    marginLeft: 'auto',
    fontFamily: 'monospace',
  },
  energyBar: {
    height: 8,
  },
  statusEffectsContainer: {
    marginTop: 8,
  },
  statusEffectsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  statusEffectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusEffectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  statusEffectIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  statusEffectName: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  statusEffectDuration: {
    fontSize: 10,
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  playerSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  playerLevel: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  battleLogContainer: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
    maxHeight: 150,
  },
  battleLogTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  battleLogScroll: {
    flex: 1,
  },
  battleLogEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderLeftWidth: 3,
    marginBottom: 2,
  },
  battleLogMessage: {
    fontSize: 12,
    flex: 1,
    fontFamily: 'monospace',
  },
  battleLogDamage: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  battleLogHealing: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  abilitiesSection: {
    padding: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  abilitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  abilitiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  turnIndicator: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  abilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  abilityButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 0,
    borderWidth: 2,
    position: 'relative',
  },
  abilityInfo: {
    marginLeft: 8,
    flex: 1,
  },
  abilityName: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  abilityCost: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  comboIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 0,
  },
  comboText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  battleControls: {
    alignItems: 'center',
  },
}); 