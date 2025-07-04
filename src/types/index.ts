// User and Progress Types
export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'archer' | 'healer';

export interface CharacterClassData {
  id: CharacterClass;
  name: string;
  description: string;
  icon: string;
  baseStats: {
    health: number;
    energy: number;
    strength: number;
    agility: number;
    intelligence: number;
    stamina: number;
    defense: number;
  };
  statGrowth: {
    health: number;
    energy: number;
    strength: number;
    agility: number;
    intelligence: number;
    stamina: number;
    defense: number;
  };
  startingAbilities: string[];
  classAbilities: string[];
  bonusXpMultiplier: number;
  bonusCoinMultiplier: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  strength: number;
  agility: number;
  intelligence: number;
  stamina: number;
  defense: number;
  coins: number;
  characterClass: CharacterClass;
  unlockedAbilities: string[];
  achievements: Achievement[];
  equipment: Equipment[];
  createdAt: Date;
  lastActive: Date;
  avatar?: string; // e.g., 'mage_m', 'warrior_f'
}

// Quest System Types
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'achievement';
  category: 'steps' | 'workout' | 'streak' | 'boss' | 'social';
  requirements: QuestRequirement[];
  rewards: QuestReward;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

export interface QuestRequirement {
  type: 'steps' | 'workouts' | 'streak' | 'boss_defeats' | 'xp_earned';
  value: number;
  current: number;
}

export interface QuestReward {
  xp: number;
  coins: number;
  abilities?: string[];
  achievements?: string[];
}

// Achievement System
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'steps' | 'workout' | 'streak' | 'boss' | 'social' | 'special' | 'collection' | 'milestone';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

// Boss Battle System
export interface Boss {
  id: string;
  name: string;
  description: string;
  level: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  attack: number;
  defense: number;
  abilities: BossAbility[];
  rewards: BossReward;
  isDefeated: boolean;
  defeatedAt?: Date;
  sprite: string;
  aiPattern: string;
  phases: BossPhase[];
  unlockLevel: number;
}

export interface BossAbility {
  id: string;
  name: string;
  description: string;
  damage: number;
  energyCost: number;
  cooldown: number;
  type: 'physical' | 'magical' | 'support' | 'buff';
  accuracy: number;
  criticalChance: number;
  effects: StatusEffect[];
}

export interface BossAI {
  name: string;
  description: string;
  behavior: (boss: Boss, playerHealth: number, playerEnergy: number) => BossAbility;
}

export interface BossPhase {
  id: string;
  name: string;
  description: string;
  healthThreshold: number;
  aiPattern: string;
  damageMultiplier: number;
  defenseMultiplier: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  duration: number;
  icon: string;
  damagePerTurn?: number;
  attackReduction?: number;
  attackBoost?: number;
  damageReduction?: number;
}

export interface BossReward {
  xp: number;
  coins: number;
  abilities?: string[];
  achievements?: string[];
}

// Ability System
export interface Ability {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'utility' | 'passive' | 'special';
  cost: number;
  level: number;
  maxLevel: number;
  isUnlocked: boolean;
  effect: AbilityEffect;
  icon: string;
}

export interface AbilityEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'passive';
  value: number;
  duration?: number;
  target: 'self' | 'enemy' | 'all';
}

// Fitness Data Types
export interface FitnessData {
  steps: number;
  distance: number;
  calories: number;
  workouts: Workout[];
  lastSync: Date;
}

export interface Workout {
  id: string;
  type: 'walking' | 'running' | 'cycling' | 'swimming' | 'strength' | 'yoga';
  duration: number; // in minutes
  calories: number;
  distance?: number; // in meters
  startTime: Date;
  endTime: Date;
}

// Equipment Types
export interface Equipment {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'accessory' | 'shield';
  slot: 'weapon' | 'head' | 'chest' | 'legs' | 'feet' | 'accessory1' | 'accessory2';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  stats: {
    strength?: number;
    agility?: number;
    intelligence?: number;
    stamina?: number;
    defense?: number;
    health?: number;
    energy?: number;
  };
  icon: string;
  isEquipped: boolean;
}

// Shop Types
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'ability' | 'cosmetic' | 'boost' | 'special' | 'equipment';
  cost: number;
  currency: 'coins' | 'xp';
  isAvailable: boolean;
  icon: string;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    health: string;
    energy: string;
    xp: string;
    coins: string;
  };
  dark: boolean;
}

// Navigation Types
export type RootTabParamList = {
  Dashboard: undefined;
  Quests: undefined;
  'Boss Battles': undefined;
  Shop: undefined;
  Profile: undefined;
}; 