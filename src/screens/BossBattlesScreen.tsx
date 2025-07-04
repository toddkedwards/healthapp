import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { soundService } from '../services/soundService';
import { ENHANCED_BOSSES } from '../data/bossData';
import { mockAbilities } from '../data/mockData';
import { Boss, Ability } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import PixelBackground from '../components/PixelBackground';
import { RetroButton } from '../components/RetroButton';
import PixelText from '../components/PixelText';
import PixelArtSpriteComponent from '../components/PixelArtSprite';
import { BattleUI } from '../components/BattleUI';
import { combatService, CombatState } from '../services/combatService';
import { getSpriteById } from '../assets/pixelArtAssets';

const { width } = Dimensions.get('window');

export default function BossBattlesScreen() {
  const { theme } = useTheme();
  const { user, addXP, addCoins } = useUser();
  const { showNotification } = useNotification();
  const [combatState, setCombatState] = useState<CombatState | null>(null);

  const availableBosses = ENHANCED_BOSSES.filter(boss => !boss.isDefeated && boss.unlockLevel <= user.level);
  const playerAbilities = mockAbilities.filter(ability => 
    user.unlockedAbilities.includes(ability.id)
  );



  const startBattle = (boss: Boss) => {
    const newCombatState = combatService.startCombat(boss, user);
    setCombatState(newCombatState);
    showNotification(`Battle started against ${boss.name}!`, 'warning');
  };

  const useAbility = (ability: Ability) => {
    if (!combatState) return;

    const result = combatService.playerAction(ability, user);
    
    if (result.success) {
      // Process boss turn after a delay
      setTimeout(() => {
        const bossResult = combatService.bossAction();
        if (bossResult) {
          // Process status effects
          combatService.processStatusEffects();
          
          // Check battle end
          const battleEnd = combatService.checkBattleEnd();
          if (battleEnd.ended) {
            if (battleEnd.winner === 'player') {
              showNotification(
                `${combatState.currentBoss?.name} defeated! +${combatState.currentBoss?.rewards.xp} XP, +${combatState.currentBoss?.rewards.coins} coins!`,
                'success'
              );
              
              addXP(combatState.currentBoss?.rewards.xp || 0);
              addCoins(combatState.currentBoss?.rewards.coins || 0);
              
              // Mark boss as defeated
              const bossIndex = ENHANCED_BOSSES.findIndex(b => b.id === combatState.currentBoss!.id);
              if (bossIndex !== -1) {
                ENHANCED_BOSSES[bossIndex].isDefeated = true;
                ENHANCED_BOSSES[bossIndex].defeatedAt = new Date();
              }
            } else {
              showNotification('You have been defeated!', 'error');
            }
            
            setCombatState(null);
            combatService.resetCombat();
          } else {
            // Update combat state
            setCombatState(combatService.getCombatState());
          }
        }
      }, 1500);
    } else {
      showNotification(result.message, 'error');
    }
  };

  const fleeBattle = () => {
    Alert.alert(
      'Flee Battle',
      'Are you sure you want to flee? You will lose this battle.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flee',
          style: 'destructive',
          onPress: () => {
            soundService.playError();
            showNotification('You fled from the battle!', 'warning');
            setCombatState(null);
            combatService.resetCombat();
          },
        },
      ]
    );
  };

  if (combatState?.isActive && combatState.currentBoss) {
    return (
      <PixelBackground pattern="battle" animated={true}>
        <View style={styles.container}>
          <View style={styles.header}>
            <PixelText style={[styles.headerTitle, { color: theme.colors.text }]}>
              Boss Battle
            </PixelText>
          </View>

          <BattleUI
            combatState={combatState}
            player={user}
            playerAbilities={playerAbilities}
            onAbilitySelect={useAbility}
            onFlee={fleeBattle}
          />
        </View>
      </PixelBackground>
    );
  }

  return (
    <PixelBackground pattern="dungeon" animated={true}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <PixelText variant="title" style={[styles.headerTitle, { color: theme.colors.text }]}>Boss Battles</PixelText>
          <PixelText style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Defeat bosses to earn XP and unlock new abilities!
          </PixelText>
        </View>

      {/* Available Bosses */}
      <View style={styles.bossesContainer}>
        <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Bosses</PixelText>
        {availableBosses.map(boss => (
          <TouchableOpacity
            key={boss.id}
            style={[styles.bossCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => startBattle(boss)}
          >
            <View style={styles.bossCardHeader}>
              {(() => {
                const bossSprite = getSpriteById(`boss_${boss.name.toLowerCase().replace(/\s+/g, '_')}`);
                return bossSprite ? (
                  <PixelArtSpriteComponent
                    sprite={bossSprite}
                    size={60}
                    animated={true}
                    glow={bossSprite.rarity === 'legendary'}
                    pulse={bossSprite.rarity === 'epic'}
                  />
                ) : (
                  <Text style={styles.bossEmoji}>👹</Text>
                );
              })()}
              <View style={styles.bossInfo}>
                <PixelText style={[styles.bossName, { color: theme.colors.text }]}>{boss.name}</PixelText>
                <PixelText style={[styles.bossTitle, { color: theme.colors.textSecondary }]}>
                  Level {boss.level} Boss
                </PixelText>
                <PixelText style={[styles.bossLevel, { color: theme.colors.warning }]}>
                  Level {boss.level}
                </PixelText>
              </View>
              <View style={styles.bossStats}>
                <PixelText style={[styles.bossStat, { color: theme.colors.textSecondary }]}>
                  HP: {boss.health}
                </PixelText>
                <PixelText style={[styles.bossStat, { color: theme.colors.textSecondary }]}>
                  ATK: {boss.attack}
                </PixelText>
              </View>
            </View>
            <PixelText style={[styles.bossDescription, { color: theme.colors.textSecondary }]}>
              {boss.description}
            </PixelText>
            <View style={styles.bossRewards}>
              <PixelText style={[styles.rewardsTitle, { color: theme.colors.text }]}>Rewards:</PixelText>
              <View style={styles.rewardItems}>
                <PixelText style={styles.rewardItem}>⭐ {boss.rewards.xp} XP</PixelText>
                <PixelText style={styles.rewardItem}>🪙 {boss.rewards.coins} Coins</PixelText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Defeated Bosses */}
      {ENHANCED_BOSSES.filter(boss => boss.isDefeated).length > 0 && (
        <View style={styles.defeatedContainer}>
          <PixelText style={[styles.sectionTitle, { color: theme.colors.text }]}>Defeated Bosses</PixelText>
          {ENHANCED_BOSSES
            .filter(boss => boss.isDefeated)
            .map(boss => (
              <View key={boss.id} style={[styles.defeatedBossCard, { backgroundColor: theme.colors.surface }]}>
                {(() => {
                  const bossSprite = getSpriteById(`boss_${boss.name.toLowerCase().replace(/\s+/g, '_')}`);
                                  return bossSprite ? (
                  <PixelArtSpriteComponent
                    sprite={bossSprite}
                    size={40}
                    animated={false}
                  />
                ) : (
                  <Text style={styles.bossEmoji}>👹</Text>
                );
                })()}
                <View style={styles.defeatedBossInfo}>
                  <PixelText style={[styles.bossName, { color: theme.colors.text }]}>{boss.name}</PixelText>
                  <PixelText style={[styles.defeatedText, { color: theme.colors.success }]}>
                    Defeated {boss.defeatedAt?.toLocaleDateString()}
                  </PixelText>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              </View>
            ))}
        </View>
      )}
      </ScrollView>
    </PixelBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    margin: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  bossesContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'monospace',
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    paddingBottom: 5,
  },
  bossCard: {
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
    marginBottom: 15,
  },
  bossCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bossEmoji: {
    fontSize: 48,
    marginRight: 15,
  },
  bossInfo: {
    flex: 1,
  },
  bossName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  bossTitle: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  bossLevel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  bossStats: {
    alignItems: 'flex-end',
  },
  bossStat: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  bossDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  bossRewards: {
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
    paddingTop: 10,
  },
  rewardsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  rewardItems: {
    flexDirection: 'row',
    gap: 15,
  },
  rewardItem: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  defeatedContainer: {
    padding: 15,
  },
  defeatedBossCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    marginBottom: 10,
  },
  defeatedBossInfo: {
    flex: 1,
    marginLeft: 15,
  },
  defeatedText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  // Battle styles
  battleHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#ffffff',
  },
  battleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  bossNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  battleArena: {
    padding: 20,
  },
  bossContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bossTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  playerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  healthBar: {
    width: '100%',
    marginBottom: 10,
  },
  healthText: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  energyBar: {
    width: '100%',
  },
  energyText: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  battleLog: {
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    maxHeight: 150,
  },
  battleLogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  battleLogContent: {
    flex: 1,
  },
  battleLogEntry: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  abilitiesContainer: {
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
  },
  abilitiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  abilityButton: {
    alignItems: 'center',
    padding: 15,
    marginRight: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 0,
    minWidth: 80,
  },
  abilityDisabled: {
    opacity: 0.5,
  },
  abilityIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  abilityName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  abilityCost: {
    fontSize: 10,
    color: '#ffaa00',
    fontFamily: 'monospace',
  },
  fleeButton: {
    margin: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: '#ff4444',
    borderRadius: 0,
    alignItems: 'center',
  },
  fleeButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
}); 