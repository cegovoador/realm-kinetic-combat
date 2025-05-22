
import { Enemy, Item } from '../types/gameTypes';
import { mockItems } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

// List of enemy types with their base stats
const enemyTypes = [
  {
    name: 'Slime',
    baseAttack: 2,
    baseDefense: 1,
    baseHealth: 15,
    baseSpeed: 2,
    xpMultiplier: 1,
  },
  {
    name: 'Wolf',
    baseAttack: 5,
    baseDefense: 2,
    baseHealth: 25,
    baseSpeed: 4,
    xpMultiplier: 1.5,
  },
  {
    name: 'Goblin',
    baseAttack: 6,
    baseDefense: 3,
    baseHealth: 30,
    baseSpeed: 3,
    xpMultiplier: 1.8,
  },
  {
    name: 'Skeleton',
    baseAttack: 7,
    baseDefense: 4,
    baseHealth: 35,
    baseSpeed: 2,
    xpMultiplier: 2,
  },
  {
    name: 'Troll',
    baseAttack: 10,
    baseDefense: 8,
    baseHealth: 70,
    baseSpeed: 1,
    xpMultiplier: 3,
  },
];

// Function to generate a random position (avoiding obstacles)
export const generateRandomPosition = (
  mapWidth: number, 
  mapHeight: number, 
  isPositionOccupied: (x: number, y: number) => boolean
): { x: number; y: number } => {
  let x, y;
  let attempts = 0;
  
  // Avoid infinite loop by limiting attempts
  const maxAttempts = 50;
  
  do {
    x = Math.floor(Math.random() * (mapWidth - 2)) + 1; // Avoid borders
    y = Math.floor(Math.random() * (mapHeight - 2)) + 1; // Avoid borders
    attempts++;
  } while (isPositionOccupied(x, y) && attempts < maxAttempts);
  
  // If we couldn't find a position after max attempts, use a fallback
  if (attempts >= maxAttempts) {
    x = Math.floor(mapWidth / 2);
    y = Math.floor(mapHeight / 2);
  }
  
  return { x, y };
};

// Function to generate item drops based on enemy level
const generateItemDrops = (level: number): { item: Item; chance: number }[] => {
  // Filter items that match the level range (enemy level - 2 to enemy level + 1)
  const potentialItems = mockItems.filter(
    item => item.requiredLevel >= Math.max(1, level - 2) && 
            item.requiredLevel <= level + 1
  );
  
  // Randomly select 1-2 items
  const numberOfItems = Math.floor(Math.random() * 2) + 1;
  const selectedItems: { item: Item; chance: number }[] = [];
  
  // If there are potential items
  if (potentialItems.length > 0) {
    for (let i = 0; i < numberOfItems && i < potentialItems.length; i++) {
      const randomIndex = Math.floor(Math.random() * potentialItems.length);
      const item = potentialItems[randomIndex];
      
      // Consumables are more common than equipment
      const dropChance = item.type === 'consumable' ? 0.3 : 0.1;
      
      selectedItems.push({
        item,
        chance: dropChance,
      });
      
      // Remove the item to avoid duplicates
      potentialItems.splice(randomIndex, 1);
    }
  }
  
  return selectedItems;
};

// Main function to generate an enemy
export const generateEnemy = (level: number): Enemy => {
  // Select a random enemy type
  const randomIndex = Math.floor(Math.random() * enemyTypes.length);
  const enemyType = enemyTypes[randomIndex];
  
  // Calculate stats based on level and enemy type
  const levelMultiplier = 1 + (level - 1) * 0.2; // 20% increase per level
  
  // Add some randomness to stats (±10%)
  const randomFactor = () => 0.9 + Math.random() * 0.2;
  
  const health = Math.round(enemyType.baseHealth * levelMultiplier * randomFactor());
  const attack = Math.round(enemyType.baseAttack * levelMultiplier * randomFactor());
  const defense = Math.round(enemyType.baseDefense * levelMultiplier * randomFactor());
  const speed = Math.round(enemyType.baseSpeed * randomFactor());
  
  // XP reward based on level and type
  const xpReward = Math.round(10 * level * enemyType.xpMultiplier);
  
  return {
    id: uuidv4(),
    name: `${level > 5 ? 'Veteran ' : ''}${enemyType.name}`,
    level,
    health,
    maxHealth: health,
    attack,
    defense,
    speed,
    x: 0, // Position will be set later
    y: 0, // Position will be set later
    xpReward,
    itemDrops: generateItemDrops(level),
  };
};
