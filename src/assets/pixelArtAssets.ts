// Pixel Art Assets for GeekFit
// This file contains all pixel art sprites and assets used throughout the app

export interface PixelArtSprite {
  id: string;
  name: string;
  category: 'character' | 'boss' | 'enemy' | 'equipment' | 'item' | 'background' | 'ui';
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  sprite: string; // ASCII/Unicode representation
  description: string;
  unlockLevel?: number;
}

// CHARACTER SPRITES
export const CHARACTER_SPRITES: PixelArtSprite[] = [
  {
    id: 'warrior_male',
    name: 'Warrior',
    category: 'character',
    rarity: 'common',
    sprite: '🗡️',
    description: 'A mighty warrior with sword and shield',
    unlockLevel: 1,
  },
  {
    id: 'warrior_female',
    name: 'Warrior',
    category: 'character',
    rarity: 'common',
    sprite: '⚔️',
    description: 'A fierce female warrior',
    unlockLevel: 1,
  },
  {
    id: 'mage_male',
    name: 'Mage',
    category: 'character',
    rarity: 'uncommon',
    sprite: '🔮',
    description: 'A powerful spellcaster',
    unlockLevel: 5,
  },
  {
    id: 'mage_female',
    name: 'Mage',
    category: 'character',
    rarity: 'uncommon',
    sprite: '🧙‍♀️',
    description: 'A wise female mage',
    unlockLevel: 5,
  },
  {
    id: 'archer_male',
    name: 'Archer',
    category: 'character',
    rarity: 'uncommon',
    sprite: '🏹',
    description: 'A skilled archer with deadly aim',
    unlockLevel: 10,
  },
  {
    id: 'archer_female',
    name: 'Archer',
    category: 'character',
    rarity: 'uncommon',
    sprite: '🏹',
    description: 'A precise female archer',
    unlockLevel: 10,
  },
  {
    id: 'rogue_male',
    name: 'Rogue',
    category: 'character',
    rarity: 'rare',
    sprite: '🗡️',
    description: 'A stealthy assassin',
    unlockLevel: 15,
  },
  {
    id: 'rogue_female',
    name: 'Rogue',
    category: 'character',
    rarity: 'rare',
    sprite: '⚔️',
    description: 'A cunning female rogue',
    unlockLevel: 15,
  },
  {
    id: 'cleric_male',
    name: 'Cleric',
    category: 'character',
    rarity: 'rare',
    sprite: '⛪',
    description: 'A holy healer and protector',
    unlockLevel: 20,
  },
  {
    id: 'cleric_female',
    name: 'Cleric',
    category: 'character',
    rarity: 'rare',
    sprite: '⛪',
    description: 'A divine female cleric',
    unlockLevel: 20,
  },
  {
    id: 'paladin',
    name: 'Paladin',
    category: 'character',
    rarity: 'epic',
    sprite: '🛡️',
    description: 'A holy warrior of light',
    unlockLevel: 25,
  },
  {
    id: 'druid',
    name: 'Druid',
    category: 'character',
    rarity: 'epic',
    sprite: '🌿',
    description: 'A nature-wielding mystic',
    unlockLevel: 30,
  },
  {
    id: 'warlock',
    name: 'Warlock',
    category: 'character',
    rarity: 'epic',
    sprite: '👹',
    description: 'A dark magic wielder',
    unlockLevel: 35,
  },
  {
    id: 'monk',
    name: 'Monk',
    category: 'character',
    rarity: 'legendary',
    sprite: '🥋',
    description: 'A martial arts master',
    unlockLevel: 40,
  },
  {
    id: 'dragon_knight',
    name: 'Dragon Knight',
    category: 'character',
    rarity: 'legendary',
    sprite: '🐉',
    description: 'A legendary dragon rider',
    unlockLevel: 50,
  },
];

// BOSS MONSTERS
export const BOSS_SPRITES: PixelArtSprite[] = [
  {
    id: 'boss_goblin_king',
    name: 'Goblin King',
    category: 'boss',
    rarity: 'common',
    sprite: '👺',
    description: 'A cunning goblin leader',
    unlockLevel: 1,
  },
  {
    id: 'boss_orc_warlord',
    name: 'Orc Warlord',
    category: 'boss',
    rarity: 'uncommon',
    sprite: '👹',
    description: 'A fierce orc commander',
    unlockLevel: 5,
  },
  {
    id: 'boss_skeleton_lord',
    name: 'Skeleton Lord',
    category: 'boss',
    rarity: 'uncommon',
    sprite: '💀',
    description: 'An undead warrior',
    unlockLevel: 10,
  },
  {
    id: 'boss_ghost_queen',
    name: 'Ghost Queen',
    category: 'boss',
    rarity: 'rare',
    sprite: '👻',
    description: 'A spectral ruler',
    unlockLevel: 15,
  },
  {
    id: 'boss_robot_overlord',
    name: 'Robot Overlord',
    category: 'boss',
    rarity: 'rare',
    sprite: '🤖',
    description: 'A mechanical tyrant',
    unlockLevel: 20,
  },
  {
    id: 'boss_alien_invader',
    name: 'Alien Invader',
    category: 'boss',
    rarity: 'epic',
    sprite: '👽',
    description: 'An otherworldly threat',
    unlockLevel: 25,
  },
  {
    id: 'boss_dragon_ancient',
    name: 'Ancient Dragon',
    category: 'boss',
    rarity: 'epic',
    sprite: '🐉',
    description: 'A primordial dragon',
    unlockLevel: 30,
  },
  {
    id: 'boss_demon_lord',
    name: 'Demon Lord',
    category: 'boss',
    rarity: 'legendary',
    sprite: '😈',
    description: 'A lord of darkness',
    unlockLevel: 40,
  },
  {
    id: 'boss_angel_archon',
    name: 'Archon Angel',
    category: 'boss',
    rarity: 'legendary',
    sprite: '👼',
    description: 'A celestial being',
    unlockLevel: 50,
  },
];

// ENEMY SPRITES
export const ENEMY_SPRITES: PixelArtSprite[] = [
  {
    id: 'enemy_goblin',
    name: 'Goblin',
    category: 'enemy',
    rarity: 'common',
    sprite: '👺',
    description: 'A small, green creature',
  },
  {
    id: 'enemy_orc',
    name: 'Orc',
    category: 'enemy',
    rarity: 'common',
    sprite: '👹',
    description: 'A brutish warrior',
  },
  {
    id: 'enemy_skeleton',
    name: 'Skeleton',
    category: 'enemy',
    rarity: 'uncommon',
    sprite: '💀',
    description: 'An animated skeleton',
  },
  {
    id: 'enemy_ghost',
    name: 'Ghost',
    category: 'enemy',
    rarity: 'uncommon',
    sprite: '👻',
    description: 'A spectral entity',
  },
  {
    id: 'enemy_robot',
    name: 'Robot',
    category: 'enemy',
    rarity: 'rare',
    sprite: '🤖',
    description: 'A mechanical enemy',
  },
  {
    id: 'enemy_alien',
    name: 'Alien',
    category: 'enemy',
    rarity: 'rare',
    sprite: '👽',
    description: 'An extraterrestrial being',
  },
  {
    id: 'enemy_demon',
    name: 'Demon',
    category: 'enemy',
    rarity: 'epic',
    sprite: '😈',
    description: 'A creature of darkness',
  },
  {
    id: 'enemy_angel',
    name: 'Angel',
    category: 'enemy',
    rarity: 'epic',
    sprite: '👼',
    description: 'A celestial being',
  },
];

// EQUIPMENT SPRITES
export const EQUIPMENT_SPRITES: PixelArtSprite[] = [
  // Weapons
  {
    id: 'weapon_sword_basic',
    name: 'Basic Sword',
    category: 'equipment',
    rarity: 'common',
    sprite: '⚔️',
    description: 'A simple iron sword',
  },
  {
    id: 'weapon_sword_steel',
    name: 'Steel Sword',
    category: 'equipment',
    rarity: 'uncommon',
    sprite: '🗡️',
    description: 'A well-crafted steel sword',
  },
  {
    id: 'weapon_sword_magic',
    name: 'Magic Sword',
    category: 'equipment',
    rarity: 'rare',
    sprite: '✨⚔️',
    description: 'A sword imbued with magic',
  },
  {
    id: 'weapon_staff_basic',
    name: 'Basic Staff',
    category: 'equipment',
    rarity: 'common',
    sprite: '🔮',
    description: 'A simple wooden staff',
  },
  {
    id: 'weapon_staff_magic',
    name: 'Magic Staff',
    category: 'equipment',
    rarity: 'rare',
    sprite: '✨🔮',
    description: 'A staff of great power',
  },
  {
    id: 'weapon_bow_basic',
    name: 'Basic Bow',
    category: 'equipment',
    rarity: 'common',
    sprite: '🏹',
    description: 'A simple wooden bow',
  },
  {
    id: 'weapon_bow_enhanced',
    name: 'Enhanced Bow',
    category: 'equipment',
    rarity: 'uncommon',
    sprite: '🏹',
    description: 'A well-crafted bow',
  },
  {
    id: 'weapon_dagger',
    name: 'Dagger',
    category: 'equipment',
    rarity: 'common',
    sprite: '🗡️',
    description: 'A sharp dagger',
  },

  // Armor
  {
    id: 'armor_leather',
    name: 'Leather Armor',
    category: 'equipment',
    rarity: 'common',
    sprite: '🛡️',
    description: 'Light leather protection',
  },
  {
    id: 'armor_chain',
    name: 'Chain Mail',
    category: 'equipment',
    rarity: 'uncommon',
    sprite: '🛡️',
    description: 'Flexible metal armor',
  },
  {
    id: 'armor_plate',
    name: 'Plate Armor',
    category: 'equipment',
    rarity: 'rare',
    sprite: '🛡️',
    description: 'Heavy plate protection',
  },
  {
    id: 'armor_magic',
    name: 'Magic Armor',
    category: 'equipment',
    rarity: 'epic',
    sprite: '✨🛡️',
    description: 'Enchanted armor',
  },

  // Helmets
  {
    id: 'helmet_iron',
    name: 'Iron Helmet',
    category: 'equipment',
    rarity: 'common',
    sprite: '⛑️',
    description: 'Basic iron helmet',
  },
  {
    id: 'helmet_steel',
    name: 'Steel Helmet',
    category: 'equipment',
    rarity: 'uncommon',
    sprite: '⛑️',
    description: 'Sturdy steel helmet',
  },
  {
    id: 'helmet_magic',
    name: 'Magic Helmet',
    category: 'equipment',
    rarity: 'rare',
    sprite: '✨⛑️',
    description: 'Enchanted helmet',
  },

  // Boots
  {
    id: 'boots_leather',
    name: 'Leather Boots',
    category: 'equipment',
    rarity: 'common',
    sprite: '👢',
    description: 'Simple leather boots',
  },
  {
    id: 'boots_steel',
    name: 'Steel Boots',
    category: 'equipment',
    rarity: 'uncommon',
    sprite: '👢',
    description: 'Heavy steel boots',
  },
  {
    id: 'boots_magic',
    name: 'Magic Boots',
    category: 'equipment',
    rarity: 'rare',
    sprite: '✨👢',
    description: 'Enchanted boots',
  },

  // Accessories
  {
    id: 'accessory_ring',
    name: 'Magic Ring',
    category: 'equipment',
    rarity: 'rare',
    sprite: '💍',
    description: 'A ring of power',
  },
  {
    id: 'accessory_necklace',
    name: 'Magic Necklace',
    category: 'equipment',
    rarity: 'epic',
    sprite: '📿',
    description: 'A necklace of wisdom',
  },
  {
    id: 'accessory_crown',
    name: 'Crown',
    category: 'equipment',
    rarity: 'legendary',
    sprite: '👑',
    description: 'A royal crown',
  },
];

// ITEMS & CONSUMABLES
export const ITEM_SPRITES: PixelArtSprite[] = [
  // Potions
  {
    id: 'potion_health',
    name: 'Health Potion',
    category: 'item',
    rarity: 'common',
    sprite: '🧪',
    description: 'Restores health',
  },
  {
    id: 'potion_mana',
    name: 'Mana Potion',
    category: 'item',
    rarity: 'common',
    sprite: '🧪',
    description: 'Restores mana',
  },
  {
    id: 'potion_strength',
    name: 'Strength Potion',
    category: 'item',
    rarity: 'uncommon',
    sprite: '🧪',
    description: 'Temporarily increases strength',
  },
  {
    id: 'potion_speed',
    name: 'Speed Potion',
    category: 'item',
    rarity: 'uncommon',
    sprite: '🧪',
    description: 'Temporarily increases speed',
  },

  // Scrolls
  {
    id: 'scroll_fireball',
    name: 'Fireball Scroll',
    category: 'item',
    rarity: 'rare',
    sprite: '📜',
    description: 'Cast a powerful fireball',
  },
  {
    id: 'scroll_heal',
    name: 'Heal Scroll',
    category: 'item',
    rarity: 'rare',
    sprite: '📜',
    description: 'Cast a healing spell',
  },

  // Gems & Currency
  {
    id: 'gem_common',
    name: 'Common Gem',
    category: 'item',
    rarity: 'common',
    sprite: '💎',
    description: 'A common gemstone',
  },
  {
    id: 'gem_rare',
    name: 'Rare Gem',
    category: 'item',
    rarity: 'rare',
    sprite: '💎',
    description: 'A rare gemstone',
  },
  {
    id: 'gem_epic',
    name: 'Epic Gem',
    category: 'item',
    rarity: 'epic',
    sprite: '💎',
    description: 'An epic gemstone',
  },
  {
    id: 'coin_gold',
    name: 'Gold Coin',
    category: 'item',
    rarity: 'common',
    sprite: '🪙',
    description: 'A gold coin',
  },
  {
    id: 'key_basic',
    name: 'Basic Key',
    category: 'item',
    rarity: 'common',
    sprite: '🗝️',
    description: 'Opens basic locks',
  },
  {
    id: 'key_magic',
    name: 'Magic Key',
    category: 'item',
    rarity: 'rare',
    sprite: '✨🗝️',
    description: 'Opens magical locks',
  },
];

// BACKGROUND ENVIRONMENTS
export const BACKGROUND_SPRITES: PixelArtSprite[] = [
  {
    id: 'bg_forest',
    name: 'Forest',
    category: 'background',
    sprite: '🌲🌲🌲\n🌲🌲🌲\n🌲🌲🌲',
    description: 'A dense forest environment',
  },
  {
    id: 'bg_cave',
    name: 'Cave',
    category: 'background',
    sprite: '🕳️🕳️🕳️\n🕳️🕳️🕳️\n🕳️🕳️🕳️',
    description: 'A dark cave interior',
  },
  {
    id: 'bg_castle',
    name: 'Castle',
    category: 'background',
    sprite: '🏰🏰🏰\n🏰🏰🏰\n🏰🏰🏰',
    description: 'A grand castle',
  },
  {
    id: 'bg_desert',
    name: 'Desert',
    category: 'background',
    sprite: '🏜️🏜️🏜️\n🏜️🏜️🏜️\n🏜️🏜️🏜️',
    description: 'A vast desert',
  },
  {
    id: 'bg_mountain',
    name: 'Mountain',
    category: 'background',
    sprite: '⛰️⛰️⛰️\n⛰️⛰️⛰️\n⛰️⛰️⛰️',
    description: 'Towering mountains',
  },
  {
    id: 'bg_ocean',
    name: 'Ocean',
    category: 'background',
    sprite: '🌊🌊🌊\n🌊🌊🌊\n🌊🌊🌊',
    description: 'A vast ocean',
  },
];

// UI ELEMENTS
export const UI_SPRITES: PixelArtSprite[] = [
  {
    id: 'ui_button',
    name: 'Button',
    category: 'ui',
    sprite: '▢▢▢▢▢\n▢▢▢▢▢\n▢▢▢▢▢',
    description: 'A UI button',
  },
  {
    id: 'ui_frame',
    name: 'Frame',
    category: 'ui',
    sprite: '▢▢▢▢▢\n▢▢▢▢▢\n▢▢▢▢▢',
    description: 'A UI frame',
  },
  {
    id: 'ui_bar',
    name: 'Progress Bar',
    category: 'ui',
    sprite: '▰▰▰▰▰',
    description: 'A progress bar',
  },
  {
    id: 'ui_arrow',
    name: 'Arrow',
    category: 'ui',
    sprite: '➡️',
    description: 'A directional arrow',
  },
];

// Helper functions
export const getAllSprites = (): PixelArtSprite[] => {
  return [
    ...CHARACTER_SPRITES,
    ...BOSS_SPRITES,
    ...ENEMY_SPRITES,
    ...EQUIPMENT_SPRITES,
    ...ITEM_SPRITES,
    ...BACKGROUND_SPRITES,
    ...UI_SPRITES,
  ];
};

export const getSpritesByCategory = (category: string): PixelArtSprite[] => {
  return getAllSprites().filter(sprite => sprite.category === category);
};

export const getSpritesByRarity = (rarity: string): PixelArtSprite[] => {
  return getAllSprites().filter(sprite => sprite.rarity === rarity);
};

export const getSpriteById = (id: string): PixelArtSprite | undefined => {
  return getAllSprites().find(sprite => sprite.id === id);
};

export const getUnlockedSprites = (userLevel: number): PixelArtSprite[] => {
  return getAllSprites().filter(sprite => 
    !sprite.unlockLevel || sprite.unlockLevel <= userLevel
  );
}; 