import { Boss, BossAbility, BossAI, BossPhase, StatusEffect } from '../types';

// Boss AI Patterns
export const BOSS_AI_PATTERNS = {
  AGGRESSIVE: 'aggressive',
  DEFENSIVE: 'defensive',
  TACTICAL: 'tactical',
  BERSERKER: 'berserker',
  SUPPORT: 'support',
  HYBRID: 'hybrid',
} as const;

// Status Effects
export const STATUS_EFFECTS: Record<string, StatusEffect> = {
  POISON: {
    id: 'poison',
    name: 'Poison',
    description: 'Takes damage over time',
    duration: 3,
    damagePerTurn: 10,
    icon: '💚',
  },
  BURN: {
    id: 'burn',
    name: 'Burn',
    description: 'Takes fire damage over time',
    duration: 2,
    damagePerTurn: 15,
    icon: '🔥',
  },
  STUN: {
    id: 'stun',
    name: 'Stun',
    description: 'Cannot act for 1 turn',
    duration: 1,
    icon: '⚡',
  },
  WEAKEN: {
    id: 'weaken',
    name: 'Weaken',
    description: 'Reduced attack power',
    duration: 2,
    attackReduction: 0.3,
    icon: '💔',
  },
  SHIELD: {
    id: 'shield',
    name: 'Shield',
    description: 'Reduced damage taken',
    duration: 2,
    damageReduction: 0.5,
    icon: '🛡️',
  },
  ENRAGE: {
    id: 'enrage',
    name: 'Enrage',
    description: 'Increased attack power',
    duration: 3,
    attackBoost: 0.5,
    icon: '😤',
  },
};

// Boss Abilities
export const BOSS_ABILITIES: Record<string, BossAbility> = {
  // Basic Attacks
  SLASH: {
    id: 'slash',
    name: 'Slash',
    description: 'A basic sword attack',
    damage: 25,
    energyCost: 0,
    cooldown: 0,
    type: 'physical',
    accuracy: 0.9,
    criticalChance: 0.1,
    effects: [],
  },
  FIREBALL: {
    id: 'fireball',
    name: 'Fireball',
    description: 'A magical fire attack',
    damage: 30,
    energyCost: 15,
    cooldown: 2,
    type: 'magical',
    accuracy: 0.85,
    criticalChance: 0.15,
    effects: [STATUS_EFFECTS.BURN],
  },
  POISON_DART: {
    id: 'poison_dart',
    name: 'Poison Dart',
    description: 'A poisoned projectile',
    damage: 20,
    energyCost: 10,
    cooldown: 3,
    type: 'physical',
    accuracy: 0.95,
    criticalChance: 0.05,
    effects: [STATUS_EFFECTS.POISON],
  },
  THUNDER_STRIKE: {
    id: 'thunder_strike',
    name: 'Thunder Strike',
    description: 'A powerful lightning attack',
    damage: 40,
    energyCost: 25,
    cooldown: 4,
    type: 'magical',
    accuracy: 0.8,
    criticalChance: 0.25,
    effects: [STATUS_EFFECTS.STUN],
  },
  SHIELD_BASH: {
    id: 'shield_bash',
    name: 'Shield Bash',
    description: 'A defensive counter-attack',
    damage: 15,
    energyCost: 5,
    cooldown: 2,
    type: 'physical',
    accuracy: 0.9,
    criticalChance: 0.05,
    effects: [STATUS_EFFECTS.WEAKEN],
  },
  HEAL: {
    id: 'heal',
    name: 'Heal',
    description: 'Restore health',
    damage: -30, // Negative damage = healing
    energyCost: 20,
    cooldown: 5,
    type: 'support',
    accuracy: 1.0,
    criticalChance: 0,
    effects: [],
  },
  BERSERK: {
    id: 'berserk',
    name: 'Berserk',
    description: 'Increase attack power',
    damage: 0,
    energyCost: 15,
    cooldown: 6,
    type: 'buff',
    accuracy: 1.0,
    criticalChance: 0,
    effects: [STATUS_EFFECTS.ENRAGE],
  },
  SHIELD_WALL: {
    id: 'shield_wall',
    name: 'Shield Wall',
    description: 'Increase defense',
    damage: 0,
    energyCost: 15,
    cooldown: 6,
    type: 'buff',
    accuracy: 1.0,
    criticalChance: 0,
    effects: [STATUS_EFFECTS.SHIELD],
  },
  ULTIMATE_ATTACK: {
    id: 'ultimate_attack',
    name: 'Ultimate Attack',
    description: 'A devastating final blow',
    damage: 60,
    energyCost: 40,
    cooldown: 8,
    type: 'physical',
    accuracy: 0.7,
    criticalChance: 0.4,
    effects: [],
  },
};

// Boss AI Behaviors
export const BOSS_AI_BEHAVIORS: Record<string, BossAI> = {
  [BOSS_AI_PATTERNS.AGGRESSIVE]: {
    name: 'Aggressive',
    description: 'Always attacks with high damage abilities',
    behavior: (boss: Boss, playerHealth: number, playerEnergy: number) => {
      const availableAbilities = boss.abilities.filter(ability => 
        ability.cooldown === 0 && boss.energy >= ability.energyCost
      );
      
      // Prioritize high damage abilities
      const damageAbilities = availableAbilities.filter(ability => ability.damage > 0);
      if (damageAbilities.length > 0) {
        return damageAbilities.reduce((best, current) => 
          current.damage > best.damage ? current : best
        );
      }
      
      return availableAbilities[0] || BOSS_ABILITIES.SLASH;
    },
  },
  
  [BOSS_AI_PATTERNS.DEFENSIVE]: {
    name: 'Defensive',
    description: 'Focuses on defense and healing',
    behavior: (boss: Boss, playerHealth: number, playerEnergy: number) => {
      const availableAbilities = boss.abilities.filter(ability => 
        ability.cooldown === 0 && boss.energy >= ability.energyCost
      );
      
      // Heal if health is low
      if (boss.health < boss.maxHealth * 0.3) {
        const healAbility = availableAbilities.find(ability => ability.type === 'support');
        if (healAbility) return healAbility;
      }
      
      // Use defensive abilities
      const defensiveAbilities = availableAbilities.filter(ability => 
        ability.type === 'buff' || ability.effects.some(effect => effect.id === 'shield')
      );
      if (defensiveAbilities.length > 0) {
        return defensiveAbilities[0];
      }
      
      return availableAbilities[0] || BOSS_ABILITIES.SHIELD_BASH;
    },
  },
  
  [BOSS_AI_PATTERNS.TACTICAL]: {
    name: 'Tactical',
    description: 'Uses status effects and strategic abilities',
    behavior: (boss: Boss, playerHealth: number, playerEnergy: number) => {
      const availableAbilities = boss.abilities.filter(ability => 
        ability.cooldown === 0 && boss.energy >= ability.energyCost
      );
      
      // Use status effects if player has high health
      if (playerHealth > 50) {
        const statusAbilities = availableAbilities.filter(ability => 
          ability.effects.length > 0
        );
        if (statusAbilities.length > 0) {
          return statusAbilities[0];
        }
      }
      
      // Use ultimate if available and player is vulnerable
      if (playerHealth < 30) {
        const ultimate = availableAbilities.find(ability => ability.id === 'ultimate_attack');
        if (ultimate) return ultimate;
      }
      
      return availableAbilities[0] || BOSS_ABILITIES.SLASH;
    },
  },
  
  [BOSS_AI_PATTERNS.BERSERKER]: {
    name: 'Berserker',
    description: 'Becomes more aggressive as health decreases',
    behavior: (boss: Boss, playerHealth: number, playerEnergy: number) => {
      const availableAbilities = boss.abilities.filter(ability => 
        ability.cooldown === 0 && boss.energy >= ability.energyCost
      );
      
      const healthPercentage = boss.health / boss.maxHealth;
      
      // Use ultimate when health is very low
      if (healthPercentage < 0.2) {
        const ultimate = availableAbilities.find(ability => ability.id === 'ultimate_attack');
        if (ultimate) return ultimate;
      }
      
      // Use berserk when health is low
      if (healthPercentage < 0.5) {
        const berserk = availableAbilities.find(ability => ability.id === 'berserk');
        if (berserk) return berserk;
      }
      
      // Use high damage abilities
      const damageAbilities = availableAbilities.filter(ability => ability.damage > 0);
      if (damageAbilities.length > 0) {
        return damageAbilities.reduce((best, current) => 
          current.damage > best.damage ? current : best
        );
      }
      
      return availableAbilities[0] || BOSS_ABILITIES.SLASH;
    },
  },
  
  [BOSS_AI_PATTERNS.SUPPORT]: {
    name: 'Support',
    description: 'Focuses on buffing and healing',
    behavior: (boss: Boss, playerHealth: number, playerEnergy: number) => {
      const availableAbilities = boss.abilities.filter(ability => 
        ability.cooldown === 0 && boss.energy >= ability.energyCost
      );
      
      // Always heal if health is below 70%
      if (boss.health < boss.maxHealth * 0.7) {
        const healAbility = availableAbilities.find(ability => ability.type === 'support');
        if (healAbility) return healAbility;
      }
      
      // Use buffs if not at full power
      const buffAbilities = availableAbilities.filter(ability => ability.type === 'buff');
      if (buffAbilities.length > 0) {
        return buffAbilities[0];
      }
      
      return availableAbilities[0] || BOSS_ABILITIES.SLASH;
    },
  },
  
  [BOSS_AI_PATTERNS.HYBRID]: {
    name: 'Hybrid',
    description: 'Adapts strategy based on situation',
    behavior: (boss: Boss, playerHealth: number, playerEnergy: number) => {
      const availableAbilities = boss.abilities.filter(ability => 
        ability.cooldown === 0 && boss.energy >= ability.energyCost
      );
      
      const healthPercentage = boss.health / boss.maxHealth;
      
      // Defensive mode when health is low
      if (healthPercentage < 0.4) {
        const healAbility = availableAbilities.find(ability => ability.type === 'support');
        if (healAbility) return healAbility;
      }
      
      // Aggressive mode when player is weak
      if (playerHealth < 30) {
        const damageAbilities = availableAbilities.filter(ability => ability.damage > 0);
        if (damageAbilities.length > 0) {
          return damageAbilities.reduce((best, current) => 
            current.damage > best.damage ? current : best
          );
        }
      }
      
      // Tactical mode - use status effects
      const statusAbilities = availableAbilities.filter(ability => 
        ability.effects.length > 0
      );
      if (statusAbilities.length > 0) {
        return statusAbilities[0];
      }
      
      return availableAbilities[0] || BOSS_ABILITIES.SLASH;
    },
  },
};

// Boss Phases
export const BOSS_PHASES: Record<string, BossPhase> = {
  NORMAL: {
    id: 'normal',
    name: 'Normal',
    description: 'Standard combat phase',
    healthThreshold: 1.0,
    aiPattern: BOSS_AI_PATTERNS.AGGRESSIVE,
    damageMultiplier: 1.0,
    defenseMultiplier: 1.0,
  },
  ENRAGED: {
    id: 'enraged',
    name: 'Enraged',
    description: 'Increased damage and aggression',
    healthThreshold: 0.5,
    aiPattern: BOSS_AI_PATTERNS.BERSERKER,
    damageMultiplier: 1.5,
    defenseMultiplier: 0.8,
  },
  DESPERATE: {
    id: 'desperate',
    name: 'Desperate',
    description: 'Final stand with ultimate abilities',
    healthThreshold: 0.2,
    aiPattern: BOSS_AI_PATTERNS.TACTICAL,
    damageMultiplier: 2.0,
    defenseMultiplier: 0.5,
  },
};

// Enhanced Boss Data
export const ENHANCED_BOSSES: Boss[] = [
  {
    id: 'goblin_king',
    name: 'Goblin King',
    description: 'A cunning goblin leader with tactical abilities',
    health: 150,
    maxHealth: 150,
    energy: 50,
    maxEnergy: 50,
    attack: 25,
    defense: 15,
    level: 5,
    isDefeated: false,
    defeatedAt: null,
    sprite: 'goblin_king',
    aiPattern: BOSS_AI_PATTERNS.TACTICAL,
    phases: [BOSS_PHASES.NORMAL, BOSS_PHASES.ENRAGED],
    abilities: [
      BOSS_ABILITIES.SLASH,
      BOSS_ABILITIES.POISON_DART,
      BOSS_ABILITIES.SHIELD_BASH,
      BOSS_ABILITIES.HEAL,
    ],
    rewards: {
      xp: 100,
      coins: 50,
      items: ['goblin_crown', 'poison_dagger'],
    },
    unlockLevel: 5,
  },
  {
    id: 'fire_dragon',
    name: 'Fire Dragon',
    description: 'A fearsome dragon with devastating fire attacks',
    health: 300,
    maxHealth: 300,
    energy: 80,
    maxEnergy: 80,
    attack: 40,
    defense: 25,
    level: 10,
    isDefeated: false,
    defeatedAt: null,
    sprite: 'fire_dragon',
    aiPattern: BOSS_AI_PATTERNS.AGGRESSIVE,
    phases: [BOSS_PHASES.NORMAL, BOSS_PHASES.ENRAGED, BOSS_PHASES.DESPERATE],
    abilities: [
      BOSS_ABILITIES.SLASH,
      BOSS_ABILITIES.FIREBALL,
      BOSS_ABILITIES.THUNDER_STRIKE,
      BOSS_ABILITIES.ULTIMATE_ATTACK,
    ],
    rewards: {
      xp: 200,
      coins: 100,
      items: ['dragon_scales', 'fire_sword'],
    },
    unlockLevel: 10,
  },
  {
    id: 'dark_knight',
    name: 'Dark Knight',
    description: 'A fallen knight with defensive and support abilities',
    health: 250,
    maxHealth: 250,
    energy: 60,
    maxEnergy: 60,
    attack: 30,
    defense: 35,
    level: 15,
    isDefeated: false,
    defeatedAt: null,
    sprite: 'dark_knight',
    aiPattern: BOSS_AI_PATTERNS.DEFENSIVE,
    phases: [BOSS_PHASES.NORMAL, BOSS_PHASES.ENRAGED],
    abilities: [
      BOSS_ABILITIES.SLASH,
      BOSS_ABILITIES.SHIELD_BASH,
      BOSS_ABILITIES.SHIELD_WALL,
      BOSS_ABILITIES.HEAL,
      BOSS_ABILITIES.BERSERK,
    ],
    rewards: {
      xp: 150,
      coins: 75,
      items: ['dark_armor', 'shadow_blade'],
    },
    unlockLevel: 15,
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    description: 'A powerful mage with status effects and dark magic',
    health: 200,
    maxHealth: 200,
    energy: 100,
    maxEnergy: 100,
    attack: 35,
    defense: 20,
    level: 20,
    isDefeated: false,
    defeatedAt: null,
    sprite: 'necromancer',
    aiPattern: BOSS_AI_PATTERNS.HYBRID,
    phases: [BOSS_PHASES.NORMAL, BOSS_PHASES.ENRAGED, BOSS_PHASES.DESPERATE],
    abilities: [
      BOSS_ABILITIES.FIREBALL,
      BOSS_ABILITIES.POISON_DART,
      BOSS_ABILITIES.THUNDER_STRIKE,
      BOSS_ABILITIES.HEAL,
      BOSS_ABILITIES.ULTIMATE_ATTACK,
    ],
    rewards: {
      xp: 300,
      coins: 150,
      items: ['necromancer_staff', 'soul_gem'],
    },
    unlockLevel: 20,
  },
  {
    id: 'ancient_guardian',
    name: 'Ancient Guardian',
    description: 'An ancient construct with balanced abilities',
    health: 400,
    maxHealth: 400,
    energy: 70,
    maxEnergy: 70,
    attack: 45,
    defense: 40,
    level: 25,
    isDefeated: false,
    defeatedAt: null,
    sprite: 'ancient_guardian',
    aiPattern: BOSS_AI_PATTERNS.SUPPORT,
    phases: [BOSS_PHASES.NORMAL, BOSS_PHASES.ENRAGED, BOSS_PHASES.DESPERATE],
    abilities: [
      BOSS_ABILITIES.SLASH,
      BOSS_ABILITIES.SHIELD_BASH,
      BOSS_ABILITIES.SHIELD_WALL,
      BOSS_ABILITIES.BERSERK,
      BOSS_ABILITIES.ULTIMATE_ATTACK,
    ],
    rewards: {
      xp: 500,
      coins: 250,
      items: ['guardian_core', 'ancient_blade'],
    },
    unlockLevel: 25,
  },
];

export default ENHANCED_BOSSES; 