import { CharacterClassData } from '../types';

export const characterClasses: CharacterClassData[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'A mighty fighter with high strength and defense. Excels in close combat and can take heavy damage.',
    icon: '⚔️',
    baseStats: {
      health: 120,
      energy: 40,
      strength: 20,
      agility: 8,
      intelligence: 6,
      stamina: 16,
      defense: 15,
    },
    statGrowth: {
      health: 15,
      energy: 3,
      strength: 3,
      agility: 1,
      intelligence: 1,
      stamina: 2,
      defense: 2,
    },
    startingAbilities: ['shield_bash'],
    classAbilities: ['berserker_rage', 'iron_will', 'battle_cry'],
    bonusXpMultiplier: 1.0,
    bonusCoinMultiplier: 1.0,
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'A powerful spellcaster with high intelligence and energy. Masters of magical abilities and elemental attacks.',
    icon: '🔮',
    baseStats: {
      health: 80,
      energy: 80,
      strength: 6,
      agility: 8,
      intelligence: 20,
      stamina: 10,
      defense: 8,
    },
    statGrowth: {
      health: 8,
      energy: 8,
      strength: 1,
      agility: 1,
      intelligence: 3,
      stamina: 1,
      defense: 1,
    },
    startingAbilities: ['fireball'],
    classAbilities: ['arcane_burst', 'mana_shield', 'elemental_mastery'],
    bonusXpMultiplier: 1.2,
    bonusCoinMultiplier: 0.9,
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'A stealthy fighter with high agility and critical hit chance. Masters of speed and precision.',
    icon: '🗡️',
    baseStats: {
      health: 90,
      energy: 50,
      strength: 12,
      agility: 20,
      intelligence: 10,
      stamina: 14,
      defense: 8,
    },
    statGrowth: {
      health: 10,
      energy: 4,
      strength: 2,
      agility: 3,
      intelligence: 1,
      stamina: 2,
      defense: 1,
    },
    startingAbilities: ['backstab'],
    classAbilities: ['shadow_step', 'poison_dagger', 'stealth_mastery'],
    bonusXpMultiplier: 1.1,
    bonusCoinMultiplier: 1.3,
  },
  {
    id: 'archer',
    name: 'Archer',
    description: 'A skilled ranged fighter with high agility and precision. Masters of distance combat and critical hits.',
    icon: '🏹',
    baseStats: {
      health: 85,
      energy: 45,
      strength: 10,
      agility: 18,
      intelligence: 12,
      stamina: 15,
      defense: 6,
    },
    statGrowth: {
      health: 9,
      energy: 3,
      strength: 1,
      agility: 3,
      intelligence: 2,
      stamina: 2,
      defense: 1,
    },
    startingAbilities: ['precise_shot'],
    classAbilities: ['multi_shot', 'eagle_eye', 'ranger_mastery'],
    bonusXpMultiplier: 1.0,
    bonusCoinMultiplier: 1.1,
  },
  {
    id: 'healer',
    name: 'Healer',
    description: 'A supportive character with healing abilities and high intelligence. Masters of support and recovery.',
    icon: '⛪',
    baseStats: {
      health: 100,
      energy: 70,
      strength: 8,
      agility: 10,
      intelligence: 18,
      stamina: 12,
      defense: 10,
    },
    statGrowth: {
      health: 12,
      energy: 6,
      strength: 1,
      agility: 1,
      intelligence: 3,
      stamina: 2,
      defense: 1,
    },
    startingAbilities: ['heal'],
    classAbilities: ['divine_blessing', 'purify', 'life_mastery'],
    bonusXpMultiplier: 0.9,
    bonusCoinMultiplier: 1.2,
  },
];

export const getCharacterClass = (classId: string): CharacterClassData | undefined => {
  return characterClasses.find(cls => cls.id === classId);
};

export const calculateStatsForLevel = (characterClass: CharacterClassData, level: number) => {
  const baseStats = characterClass.baseStats;
  const statGrowth = characterClass.statGrowth;
  
  return {
    health: baseStats.health + (statGrowth.health * (level - 1)),
    energy: baseStats.energy + (statGrowth.energy * (level - 1)),
    strength: baseStats.strength + (statGrowth.strength * (level - 1)),
    agility: baseStats.agility + (statGrowth.agility * (level - 1)),
    intelligence: baseStats.intelligence + (statGrowth.intelligence * (level - 1)),
    stamina: baseStats.stamina + (statGrowth.stamina * (level - 1)),
    defense: baseStats.defense + (statGrowth.defense * (level - 1)),
  };
}; 