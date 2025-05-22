
import { Item, MapTile, GameMap } from '../types/gameTypes';

// Mock items
export const mockItems: Item[] = [
  {
    id: 'sword1',
    name: 'Bronze Sword',
    type: 'weapon',
    description: 'A basic sword made of bronze.',
    stats: {
      attack: 5,
    },
    slot: 'weapon',
    requiredClass: ['warrior'],
    requiredLevel: 1,
  },
  {
    id: 'staff1',
    name: 'Apprentice Staff',
    type: 'weapon',
    description: 'A basic staff for apprentice mages.',
    stats: {
      attack: 3,
      mana: 5,
    },
    slot: 'weapon',
    requiredClass: ['mage'],
    requiredLevel: 1,
  },
  {
    id: 'bow1',
    name: 'Short Bow',
    type: 'weapon',
    description: 'A short bow for beginners.',
    stats: {
      attack: 4,
    },
    slot: 'weapon',
    requiredClass: ['archer'],
    requiredLevel: 1,
  },
  {
    id: 'armor1',
    name: 'Leather Armor',
    type: 'armor',
    description: 'Basic leather armor.',
    stats: {
      defense: 3,
    },
    slot: 'armor',
    requiredLevel: 1,
  },
  {
    id: 'helmet1',
    name: 'Leather Cap',
    type: 'armor',
    description: 'A simple leather cap.',
    stats: {
      defense: 1,
    },
    slot: 'helmet',
    requiredLevel: 1,
  },
  {
    id: 'boots1',
    name: 'Leather Boots',
    type: 'armor',
    description: 'Simple leather boots.',
    stats: {
      defense: 1,
    },
    slot: 'boots',
    requiredLevel: 1,
  },
  {
    id: 'potion1',
    name: 'Health Potion',
    type: 'consumable',
    description: 'Restores 20 health points.',
    stats: {
      health: 20,
    },
    requiredLevel: 1,
  },
  {
    id: 'potion2',
    name: 'Mana Potion',
    type: 'consumable',
    description: 'Restores 15 mana points.',
    stats: {
      mana: 15,
    },
    requiredLevel: 1,
  },
];

// Create a mock map
const createMockMap = (width: number, height: number): GameMap => {
  const tiles: MapTile[][] = [];

  // Create a basic map with mostly grass and some water/obstacles
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      // Map borders are water
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        tiles[y][x] = { type: 'water', walkable: false };
      } 
      // Create some water bodies
      else if (
        (x > width / 3 && x < width / 2 && y > height / 3 && y < height / 2) ||
        (x > width * 0.7 && x < width * 0.9 && y > height * 0.6 && y < height * 0.8)
      ) {
        tiles[y][x] = { type: 'water', walkable: false };
      } 
      // Create some obstacles
      else if (
        (x === 5 && y === 5) || 
        (x === 6 && y === 5) || 
        (x === 15 && y === 10) || 
        (x === 15 && y === 11)
      ) {
        tiles[y][x] = { type: 'obstacle', walkable: false };
      } 
      // Random ground and grass
      else {
        const random = Math.random();
        if (random < 0.7) {
          tiles[y][x] = { type: 'grass', walkable: true };
        } else {
          tiles[y][x] = { type: 'ground', walkable: true };
        }
      }
    }
  }

  return {
    width,
    height,
    tiles,
    enemies: [],
    npcs: [],
  };
};

// Create map data
export const mockMaps = [
  {
    id: 'start',
    name: 'Starter Village',
    map: createMockMap(20, 15),
    minLevel: 1,
    maxLevel: 5,
  },
  {
    id: 'forest',
    name: 'Enchanted Forest',
    map: createMockMap(25, 20),
    minLevel: 5,
    maxLevel: 10,
  },
];

// Starting stats for each class
export const classStats = {
  warrior: {
    health: 100,
    maxHealth: 100,
    mana: 20,
    maxMana: 20,
    attack: 10,
    defense: 8,
    speed: 3,
  },
  mage: {
    health: 70,
    maxHealth: 70,
    mana: 100,
    maxMana: 100,
    attack: 15,
    defense: 4,
    speed: 4,
  },
  archer: {
    health: 85,
    maxHealth: 85,
    mana: 50,
    maxMana: 50,
    attack: 12,
    defense: 6,
    speed: 5,
  },
};
