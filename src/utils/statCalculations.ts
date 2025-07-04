import { User, Equipment, CharacterClassData } from '../types';
import { getCharacterClass, calculateStatsForLevel } from '../data/characterClasses';

export interface CalculatedStats {
  base: {
    health: number;
    energy: number;
    strength: number;
    agility: number;
    intelligence: number;
    stamina: number;
    defense: number;
  };
  equipment: {
    health: number;
    energy: number;
    strength: number;
    agility: number;
    intelligence: number;
    stamina: number;
    defense: number;
  };
  total: {
    health: number;
    energy: number;
    strength: number;
    agility: number;
    intelligence: number;
    stamina: number;
    defense: number;
  };
  bonuses: {
    xpMultiplier: number;
    coinMultiplier: number;
    healthRegen: number;
    energyRegen: number;
  };
}

export function calculateCharacterStats(user: User): CalculatedStats {
  const characterClass = getCharacterClass(user.characterClass);
  const baseStats = characterClass ? calculateStatsForLevel(characterClass, user.level) : null;
  
  // Initialize base stats
  const base = {
    health: baseStats?.health || user.maxHealth,
    energy: baseStats?.energy || user.maxEnergy,
    strength: baseStats?.strength || user.strength,
    agility: baseStats?.agility || user.agility,
    intelligence: baseStats?.intelligence || user.intelligence,
    stamina: baseStats?.stamina || user.stamina,
    defense: baseStats?.defense || user.defense,
  };

  // Calculate equipment bonuses
  const equippedItems = user.equipment?.filter(item => item.isEquipped) || [];
  const equipment = {
    health: 0,
    energy: 0,
    strength: 0,
    agility: 0,
    intelligence: 0,
    stamina: 0,
    defense: 0,
  };

  equippedItems.forEach(item => {
    if (item.stats.health) equipment.health += item.stats.health;
    if (item.stats.energy) equipment.energy += item.stats.energy;
    if (item.stats.strength) equipment.strength += item.stats.strength;
    if (item.stats.agility) equipment.agility += item.stats.agility;
    if (item.stats.intelligence) equipment.intelligence += item.stats.intelligence;
    if (item.stats.stamina) equipment.stamina += item.stats.stamina;
    if (item.stats.defense) equipment.defense += item.stats.defense;
  });

  // Calculate total stats
  const total = {
    health: base.health + equipment.health,
    energy: base.energy + equipment.energy,
    strength: base.strength + equipment.strength,
    agility: base.agility + equipment.agility,
    intelligence: base.intelligence + equipment.intelligence,
    stamina: base.stamina + equipment.stamina,
    defense: base.defense + equipment.defense,
  };

  // Calculate bonuses
  const bonuses = {
    xpMultiplier: characterClass?.bonusXpMultiplier || 1,
    coinMultiplier: characterClass?.bonusCoinMultiplier || 1,
    healthRegen: calculateHealthRegen(total.stamina, characterClass),
    energyRegen: calculateEnergyRegen(total.intelligence, characterClass),
  };

  return { base, equipment, total, bonuses };
}

function calculateHealthRegen(stamina: number, characterClass?: CharacterClassData): number {
  let baseRegen = 1; // Base health regen per hour
  
  // Stamina bonus
  baseRegen += Math.floor(stamina / 10);
  
  // Class-specific bonuses
  if (characterClass) {
    switch (characterClass.id) {
      case 'warrior':
        baseRegen += 2; // Warriors have better health regen
        break;
      case 'healer':
        baseRegen += 3; // Healers have the best health regen
        break;
    }
  }
  
  return baseRegen;
}

function calculateEnergyRegen(intelligence: number, characterClass?: CharacterClassData): number {
  let baseRegen = 2; // Base energy regen per hour
  
  // Intelligence bonus
  baseRegen += Math.floor(intelligence / 8);
  
  // Class-specific bonuses
  if (characterClass) {
    switch (characterClass.id) {
      case 'mage':
        baseRegen += 3; // Mages have better energy regen
        break;
      case 'healer':
        baseRegen += 2; // Healers have good energy regen
        break;
    }
  }
  
  return baseRegen;
}

export function calculateCombatPower(stats: CalculatedStats): number {
  const { total } = stats;
  
  // Combat power formula: weighted combination of combat stats
  return Math.floor(
    (total.strength * 2) + 
    (total.agility * 1.5) + 
    (total.intelligence * 1.2) + 
    (total.defense * 1.8) + 
    (total.stamina * 0.8)
  );
}

export function calculateMaxHealth(stats: CalculatedStats): number {
  const { total } = stats;
  
  // Health formula: base + stamina bonus + class modifier
  let maxHealth = 100; // Base health
  maxHealth += total.stamina * 5; // Stamina provides health
  maxHealth += total.defense * 2; // Defense provides some health
  
  return maxHealth;
}

export function calculateMaxEnergy(stats: CalculatedStats): number {
  const { total } = stats;
  
  // Energy formula: base + intelligence bonus + class modifier
  let maxEnergy = 50; // Base energy
  maxEnergy += total.intelligence * 3; // Intelligence provides energy
  maxEnergy += total.agility * 1; // Agility provides some energy
  
  return maxEnergy;
}

export function getEquipmentComparison(currentEquipment: Equipment | undefined, newEquipment: Equipment) {
  const currentStats = currentEquipment?.stats || {};
  const newStats = newEquipment.stats;
  
  const comparison: Record<string, { current: number; new: number; difference: number }> = {};
  
  // Get all stat names
  const allStats = [...new Set([...Object.keys(currentStats), ...Object.keys(newStats)])];
  
  allStats.forEach(stat => {
    const current = currentStats[stat as keyof typeof currentStats] || 0;
    const newValue = newStats[stat as keyof typeof newStats] || 0;
    const difference = newValue - current;
    
    comparison[stat] = {
      current,
      new: newValue,
      difference,
    };
  });
  
  return comparison;
}

export function getEquipmentScore(equipment: Equipment): number {
  const { stats, rarity } = equipment;
  
  // Base score from stats
  let score = 0;
  Object.values(stats).forEach(value => {
    if (value) score += value;
  });
  
  // Rarity multiplier
  const rarityMultipliers = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  };
  
  score *= rarityMultipliers[rarity] || 1;
  
  return Math.floor(score);
}

export function getCharacterPowerLevel(user: User): number {
  const stats = calculateCharacterStats(user);
  const combatPower = calculateCombatPower(stats);
  
  // Power level includes combat power, level, and equipment quality
  let powerLevel = combatPower;
  powerLevel += user.level * 10; // Level bonus
  
  // Equipment quality bonus
  const equippedItems = user.equipment?.filter(item => item.isEquipped) || [];
  const equipmentScore = equippedItems.reduce((total, item) => total + getEquipmentScore(item), 0);
  powerLevel += equipmentScore * 0.5;
  
  return Math.floor(powerLevel);
} 