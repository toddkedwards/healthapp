import { User, Boss, BossAbility, StatusEffect, Ability } from '../types';
import { BOSS_AI_BEHAVIORS, STATUS_EFFECTS } from '../data/bossData';
import { soundService } from './soundService';

export interface CombatState {
  isActive: boolean;
  currentBoss: Boss | null;
  bossHealth: number;
  bossEnergy: number;
  playerHealth: number;
  playerEnergy: number;
  turn: 'player' | 'boss';
  turnNumber: number;
  battleLog: CombatLogEntry[];
  playerStatusEffects: StatusEffect[];
  bossStatusEffects: StatusEffect[];
  bossPhase: string;
  comboCount: number;
  lastPlayerAbility: string | null;
}

export interface CombatLogEntry {
  id: string;
  message: string;
  type: 'player' | 'boss' | 'system' | 'status' | 'critical' | 'miss' | 'heal';
  timestamp: number;
  damage?: number;
  healing?: number;
  statusEffect?: StatusEffect;
}

export interface CombatResult {
  success: boolean;
  damage: number;
  healing: number;
  critical: boolean;
  missed: boolean;
  statusEffects: StatusEffect[];
  message: string;
}

class CombatService {
  private combatState: CombatState = {
    isActive: false,
    currentBoss: null,
    bossHealth: 0,
    bossEnergy: 0,
    playerHealth: 0,
    playerEnergy: 0,
    turn: 'player',
    turnNumber: 1,
    battleLog: [],
    playerStatusEffects: [],
    bossStatusEffects: [],
    bossPhase: 'normal',
    comboCount: 0,
    lastPlayerAbility: null,
  };

  // Initialize combat
  startCombat(boss: Boss, player: User): CombatState {
    this.combatState = {
      isActive: true,
      currentBoss: boss,
      bossHealth: boss.health,
      bossEnergy: boss.energy,
      playerHealth: player.health,
      playerEnergy: player.energy,
      turn: 'player',
      turnNumber: 1,
      battleLog: [],
      playerStatusEffects: [],
      bossStatusEffects: [],
      bossPhase: 'normal',
      comboCount: 0,
      lastPlayerAbility: null,
    };

    this.addLogEntry('system', `Battle started against ${boss.name}!`);
    soundService.playBossBattle();
    soundService.triggerHaptic('medium');

    return this.combatState;
  }

  // Player turn
  playerAction(ability: Ability, player: User): CombatResult {
    if (!this.combatState.isActive || this.combatState.turn !== 'player') {
      return { success: false, damage: 0, healing: 0, critical: false, missed: false, statusEffects: [], message: 'Not your turn!' };
    }

    // Check energy cost
    if (this.combatState.playerEnergy < ability.cost) {
      this.addLogEntry('system', 'Not enough energy!');
      return { success: false, damage: 0, healing: 0, critical: false, missed: false, statusEffects: [], message: 'Not enough energy!' };
    }

    // Calculate combo bonus
    const comboBonus = this.calculateComboBonus(ability.id);
    
    // Execute ability
    const result = this.executeAbility(ability, player, 'player', comboBonus);
    
    // Update combat state
    this.combatState.playerEnergy -= ability.cost;
    this.combatState.lastPlayerAbility = ability.id;
    
    if (result.success) {
      this.combatState.turn = 'boss';
      this.addLogEntry('player', result.message);
      
      // Play appropriate sounds
      if (result.critical) {
        soundService.playCriticalHit();
        soundService.triggerHaptic('heavy');
      } else if (result.healing > 0) {
        soundService.playHealthRestore();
        soundService.triggerHaptic('success');
      } else if (result.damage > 0) {
        soundService.playButtonClick();
        soundService.triggerHaptic('medium');
      }
    }

    return result;
  }

  // Boss turn
  bossAction(): CombatResult | null {
    if (!this.combatState.isActive || this.combatState.turn !== 'boss' || !this.combatState.currentBoss) {
      return null;
    }

    const boss = this.combatState.currentBoss;
    
    // Update boss phase based on health
    this.updateBossPhase();
    
    // Get AI behavior
    const aiBehavior = BOSS_AI_BEHAVIORS[boss.aiPattern];
    if (!aiBehavior) {
      return null;
    }

    // Let AI choose ability
    const chosenAbility = aiBehavior.behavior(boss, this.combatState.playerHealth, this.combatState.playerEnergy);
    
    // Check if ability can be used
    if (this.combatState.bossEnergy < chosenAbility.energyCost) {
      // Boss skips turn if not enough energy
      this.addLogEntry('boss', `${boss.name} is gathering energy...`);
      this.combatState.turn = 'player';
      this.combatState.turnNumber++;
      return null;
    }

    // Execute boss ability
    const result = this.executeAbility(chosenAbility, boss, 'boss');
    
    // Update combat state
    this.combatState.bossEnergy -= chosenAbility.energyCost;
    this.combatState.turn = 'player';
    this.combatState.turnNumber++;
    
    if (result.success) {
      this.addLogEntry('boss', result.message);
      
      // Play appropriate sounds
      if (result.critical) {
        soundService.playCriticalHit();
        soundService.triggerHaptic('heavy');
      } else if (result.damage > 0) {
        soundService.playButtonClick();
        soundService.triggerHaptic('medium');
      }
    }

    return result;
  }

  // Execute ability
  private executeAbility(ability: Ability | BossAbility, actor: User | Boss, actorType: 'player' | 'boss', comboBonus: number = 0): CombatResult {
    const isPlayer = actorType === 'player';
    const target = isPlayer ? this.combatState.currentBoss! : { health: this.combatState.playerHealth, defense: 0 };
    
    // Check accuracy
    const accuracy = 'accuracy' in ability ? ability.accuracy : 0.9;
    if (Math.random() > accuracy) {
      return {
        success: true,
        damage: 0,
        healing: 0,
        critical: false,
        missed: true,
        statusEffects: [],
        message: `${actor.name} missed!`,
      };
    }

    // Calculate damage/healing
    let finalValue = 0;
    if ('effect' in ability && ability.effect) {
      finalValue = ability.effect.value;
    } else if ('damage' in ability) {
      finalValue = ability.damage;
    }
    
    if (isPlayer) {
      // Player damage calculation
      const baseDamage = finalValue + (actor as User).strength;
      const defense = target.defense || 0;
      finalValue = Math.max(1, baseDamage - defense);
      
      // Apply combo bonus
      finalValue += comboBonus;
    } else {
      // Boss damage calculation
      const baseDamage = finalValue + (actor as Boss).attack;
      const playerDefense = 0; // TODO: Get from player stats
      finalValue = Math.max(1, baseDamage - playerDefense);
      
      // Apply phase multiplier
      const phase = this.getCurrentBossPhase();
      if (phase) {
        finalValue = Math.round(finalValue * phase.damageMultiplier);
      }
    }

    // Check for critical hit
    const criticalChance = 'criticalChance' in ability ? ability.criticalChance : 0.1;
    const isCritical = Math.random() < criticalChance;
    if (isCritical) {
      finalValue = Math.round(finalValue * 1.5);
    }

    // Apply damage/healing
    if (finalValue > 0) {
      if (isPlayer) {
        this.combatState.bossHealth = Math.max(0, this.combatState.bossHealth - finalValue);
      } else {
        this.combatState.playerHealth = Math.max(0, this.combatState.playerHealth - finalValue);
      }
    } else if (finalValue < 0) {
      // Healing
      if (isPlayer) {
        this.combatState.playerHealth = Math.min((actor as User).maxHealth, this.combatState.playerHealth - finalValue);
      } else {
        this.combatState.bossHealth = Math.min((actor as Boss).maxHealth, this.combatState.bossHealth - finalValue);
      }
    }

    // Apply status effects
    const statusEffects: StatusEffect[] = [];
    if ('effects' in ability && ability.effects) {
      statusEffects.push(...ability.effects);
      this.applyStatusEffects(ability.effects, actorType);
    }

    // Generate message
    let message = '';
    if (finalValue > 0) {
      message = `${actor.name} used ${ability.name} and dealt ${finalValue} damage!`;
      if (isCritical) message += ' (Critical!)';
    } else if (finalValue < 0) {
      message = `${actor.name} used ${ability.name} and healed ${-finalValue} health!`;
    } else {
      message = `${actor.name} used ${ability.name}!`;
    }

    return {
      success: true,
      damage: finalValue > 0 ? finalValue : 0,
      healing: finalValue < 0 ? -finalValue : 0,
      critical: isCritical,
      missed: false,
      statusEffects,
      message,
    };
  }

  // Calculate combo bonus
  private calculateComboBonus(abilityId: string): number {
    if (this.combatState.lastPlayerAbility === abilityId) {
      this.combatState.comboCount++;
      return this.combatState.comboCount * 5; // 5 damage per combo
    } else {
      this.combatState.comboCount = 0;
      return 0;
    }
  }

  // Apply status effects
  private applyStatusEffects(effects: StatusEffect[], target: 'player' | 'boss') {
    const targetEffects = target === 'player' ? this.combatState.playerStatusEffects : this.combatState.bossStatusEffects;
    
    effects.forEach(effect => {
      const existingEffect = targetEffects.find(e => e.id === effect.id);
      if (existingEffect) {
        existingEffect.duration = effect.duration; // Refresh duration
      } else {
        targetEffects.push({ ...effect });
      }
    });
  }

  // Process status effects at turn start
  processStatusEffects(): void {
    // Process player status effects
    this.combatState.playerStatusEffects = this.combatState.playerStatusEffects.filter(effect => {
      effect.duration--;
      
      if (effect.damagePerTurn) {
        this.combatState.playerHealth = Math.max(0, this.combatState.playerHealth - effect.damagePerTurn);
        this.addLogEntry('status', `${effect.name} deals ${effect.damagePerTurn} damage!`);
      }
      
      return effect.duration > 0;
    });

    // Process boss status effects
    this.combatState.bossStatusEffects = this.combatState.bossStatusEffects.filter(effect => {
      effect.duration--;
      
      if (effect.damagePerTurn) {
        this.combatState.bossHealth = Math.max(0, this.combatState.bossHealth - effect.damagePerTurn);
        this.addLogEntry('status', `${effect.name} deals ${effect.damagePerTurn} damage to ${this.combatState.currentBoss?.name}!`);
      }
      
      return effect.duration > 0;
    });
  }

  // Update boss phase
  private updateBossPhase(): void {
    if (!this.combatState.currentBoss) return;
    
    const healthPercentage = this.combatState.bossHealth / this.combatState.currentBoss.maxHealth;
    const phases = this.combatState.currentBoss.phases;
    
    for (let i = phases.length - 1; i >= 0; i--) {
      if (healthPercentage <= phases[i].healthThreshold) {
        if (this.combatState.bossPhase !== phases[i].id) {
          this.combatState.bossPhase = phases[i].id;
          this.addLogEntry('system', `${this.combatState.currentBoss.name} enters ${phases[i].name} phase!`);
          soundService.playBossBattle();
          soundService.triggerHaptic('heavy');
        }
        break;
      }
    }
  }

  // Get current boss phase
  private getCurrentBossPhase() {
    if (!this.combatState.currentBoss) return null;
    return this.combatState.currentBoss.phases.find(phase => phase.id === this.combatState.bossPhase);
  }

  // Add log entry
  private addLogEntry(type: CombatLogEntry['type'], message: string, damage?: number, healing?: number, statusEffect?: StatusEffect): void {
    const entry: CombatLogEntry = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now(),
      damage,
      healing,
      statusEffect,
    };
    
    this.combatState.battleLog.push(entry);
    
    // Keep only last 20 entries
    if (this.combatState.battleLog.length > 20) {
      this.combatState.battleLog = this.combatState.battleLog.slice(-20);
    }
  }

  // Check battle end conditions
  checkBattleEnd(): { ended: boolean; winner: 'player' | 'boss' | null } {
    if (!this.combatState.isActive) {
      return { ended: false, winner: null };
    }

    if (this.combatState.playerHealth <= 0) {
      this.endBattle('boss');
      return { ended: true, winner: 'boss' };
    }

    if (this.combatState.bossHealth <= 0) {
      this.endBattle('player');
      return { ended: true, winner: 'player' };
    }

    return { ended: false, winner: null };
  }

  // End battle
  private endBattle(winner: 'player' | 'boss'): void {
    this.combatState.isActive = false;
    
    if (winner === 'player') {
      this.addLogEntry('system', `${this.combatState.currentBoss?.name} has been defeated!`);
      soundService.playVictory();
      soundService.triggerHaptic('success');
    } else {
      this.addLogEntry('system', 'You have been defeated!');
      soundService.playDefeat();
      soundService.triggerHaptic('error');
    }
  }

  // Get current combat state
  getCombatState(): CombatState {
    return { ...this.combatState };
  }

  // Reset combat
  resetCombat(): void {
    this.combatState = {
      isActive: false,
      currentBoss: null,
      bossHealth: 0,
      bossEnergy: 0,
      playerHealth: 0,
      playerEnergy: 0,
      turn: 'player',
      turnNumber: 1,
      battleLog: [],
      playerStatusEffects: [],
      bossStatusEffects: [],
      bossPhase: 'normal',
      comboCount: 0,
      lastPlayerAbility: null,
    };
  }
}

export const combatService = new CombatService();
export default combatService; 