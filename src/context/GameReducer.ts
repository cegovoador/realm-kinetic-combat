
import { GameState, Enemy, Item, ChatMessage } from '../types/gameTypes';
import { GameAction } from './GameActions';
import { mockMaps } from '../data/mockData';
import { generateEnemy } from '../utils/enemyGenerator';

// Reducer function
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'CREATE_CHARACTER':
      return {
        ...state,
        player: action.payload,
      };
    case 'LOAD_MAP':
      // Check if payload is a string (map ID) or a map object
      if (typeof action.payload === 'string') {
        const mapId = action.payload;
        const map = mockMaps.find(m => m.id === mapId)?.map;
        if (!map) return { ...state, error: 'Map not found' };
        return {
          ...state,
          map,
        };
      } else {
        // Direct map object provided
        return {
          ...state,
          map: action.payload,
        };
      }
    case 'MOVE_PLAYER':
      if (!state.player || !state.map) return state;
      const { x, y } = action.payload;
      // Check if the tile is walkable
      if (x < 0 || y < 0 || x >= state.map.width || y >= state.map.height || !state.map.tiles[y][x].walkable) {
        return state;
      }
      return {
        ...state,
        player: {
          ...state.player,
          x,
          y,
          // Update last move time for animation and movement speed calculations
          lastMoveTime: Date.now()
        },
      };
    case 'ATTACK_ENEMY':
      return handleAttackEnemy(state, action.payload);
    case 'GAIN_XP':
      return handleGainXP(state, action.payload);
    case 'LEVEL_UP':
      return handleLevelUp(state);
    case 'ADD_ITEM':
      return handleAddItem(state, action.payload);
    case 'EQUIP_ITEM':
      return handleEquipItem(state, action.payload);
    case 'UNEQUIP_ITEM':
      return handleUnequipItem(state, action.payload);
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          action.payload,
        ].slice(-50), // Keep only the last 50 messages
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'UPDATE_ENEMIES':
      if (!state.map) return state;
      return {
        ...state,
        map: {
          ...state.map,
          enemies: action.payload,
        },
      };
    case 'RESPAWN_ENEMIES':
      return handleRespawnEnemies(state, action.payload);
    default:
      return state;
  }
};

// Helper functions for different actions
function handleAttackEnemy(state: GameState, enemyId: string): GameState {
  if (!state.player || !state.map) return state;
  const enemyIndex = state.map.enemies.findIndex(e => e.id === enemyId);
  if (enemyIndex === -1) return state;

  const enemy = state.map.enemies[enemyIndex];
  const player = state.player;

  // Record last attack time for cooldown
  const updatedPlayer = {
    ...player,
    lastAttackTime: Date.now(),
    attackSpeed: 1000 // 1 second cooldown between attacks
  };

  // Calculate damage
  const playerDamage = Math.max(1, player.attack - enemy.defense / 2);
  const newEnemyHealth = Math.max(0, enemy.health - playerDamage);

  // If enemy is defeated
  if (newEnemyHealth <= 0) {
    // Add message about defeating the enemy
    const messages = [
      ...state.messages,
      {
        id: Date.now().toString(),
        sender: 'System',
        content: `You defeated ${enemy.name} and gained ${enemy.xpReward} XP!`,
        timestamp: Date.now(),
        type: 'system' as const,
      },
    ];

    // Update enemy to defeated state (we'll leave it on the map but dead)
    const updatedEnemies = [
      ...state.map.enemies.slice(0, enemyIndex),
      { ...enemy, health: 0, deathTime: Date.now() },
      ...state.map.enemies.slice(enemyIndex + 1),
    ];

    // Add XP to player
    const newPlayer = {
      ...updatedPlayer,
      xp: updatedPlayer.xp + enemy.xpReward,
    };

    // Check if player leveled up
    const shouldLevelUp = newPlayer.xp >= newPlayer.maxXp;
    
    return {
      ...state,
      player: shouldLevelUp ? {
        ...newPlayer,
        level: newPlayer.level + 1,
        xp: newPlayer.xp - newPlayer.maxXp,
        maxXp: Math.floor(newPlayer.maxXp * 1.5),
        attack: newPlayer.attack + 2,
        defense: newPlayer.defense + 1,
        maxHealth: newPlayer.maxHealth + 10,
        health: newPlayer.maxHealth + 10,
        maxMana: newPlayer.maxMana + 5,
        mana: newPlayer.maxMana + 5,
      } : newPlayer,
      map: {
        ...state.map,
        enemies: updatedEnemies,
      },
      messages,
    };
  } else {
    // Enemy takes damage but survives
    // Calculate enemy counter-attack damage
    const enemyDamage = Math.max(1, enemy.attack - player.defense / 2);
    const newPlayerHealth = Math.max(0, player.health - enemyDamage);
    
    return {
      ...state,
      player: {
        ...updatedPlayer,
        health: newPlayerHealth,
      },
      map: {
        ...state.map,
        enemies: [
          ...state.map.enemies.slice(0, enemyIndex),
          {
            ...enemy,
            health: newEnemyHealth,
            lastAttackTime: Date.now()
          },
          ...state.map.enemies.slice(enemyIndex + 1),
        ],
      },
    };
  }
}

function handleGainXP(state: GameState, xpAmount: number): GameState {
  if (!state.player) return state;
  const newXp = state.player.xp + xpAmount;
  const levelUp = newXp >= state.player.maxXp;
  
  if (levelUp) {
    return {
      ...state,
      player: {
        ...state.player,
        level: state.player.level + 1,
        xp: newXp - state.player.maxXp,
        maxXp: Math.floor(state.player.maxXp * 1.5),
        attack: state.player.attack + 2,
        defense: state.player.defense + 1,
        maxHealth: state.player.maxHealth + 10,
        health: state.player.maxHealth + 10,
        maxMana: state.player.maxMana + 5,
        mana: state.player.maxMana + 5,
      },
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          sender: 'System',
          content: `You leveled up to level ${state.player.level + 1}!`,
          timestamp: Date.now(),
          type: 'system' as const,
        },
      ],
    };
  } else {
    return {
      ...state,
      player: {
        ...state.player,
        xp: newXp,
      },
    };
  }
}

function handleLevelUp(state: GameState): GameState {
  if (!state.player) return state;
  return {
    ...state,
    player: {
      ...state.player,
      level: state.player.level + 1,
      xp: 0,
      maxXp: Math.floor(state.player.maxXp * 1.5),
      attack: state.player.attack + 2,
      defense: state.player.defense + 1,
      maxHealth: state.player.maxHealth + 10,
      health: state.player.maxHealth + 10,
      maxMana: state.player.maxMana + 5,
      mana: state.player.maxMana + 5,
    },
    messages: [
      ...state.messages,
      {
        id: Date.now().toString(),
        sender: 'System',
        content: `You leveled up to level ${state.player.level + 1}!`,
        timestamp: Date.now(),
        type: 'system' as const,
      },
    ],
  };
}

function handleAddItem(state: GameState, item: Item): GameState {
  if (!state.player) return state;
  return {
    ...state,
    player: {
      ...state.player,
      inventory: [...state.player.inventory, item],
    },
    messages: [
      ...state.messages,
      {
        id: Date.now().toString(),
        sender: 'System',
        content: `You obtained ${item.name}!`,
        timestamp: Date.now(),
        type: 'system' as const,
      },
    ],
  };
}

function handleEquipItem(state: GameState, item: Item): GameState {
  if (!state.player) return state;
  if (!item.slot) return state;
  
  // Remove item from inventory
  const updatedInventory = state.player.inventory.filter(i => i.id !== item.id);
  
  // Add previously equipped item (if any) to inventory
  let newInventory = [...updatedInventory];
  const currentEquipped = state.player.equipment[item.slot];
  if (currentEquipped) {
    newInventory = [...newInventory, currentEquipped];
  }
  
  return {
    ...state,
    player: {
      ...state.player,
      inventory: newInventory,
      equipment: {
        ...state.player.equipment,
        [item.slot]: item,
      },
    },
    messages: [
      ...state.messages,
      {
        id: Date.now().toString(),
        sender: 'System',
        content: `Equipped ${item.name}!`,
        timestamp: Date.now(),
        type: 'system' as const,
      },
    ],
  };
}

function handleUnequipItem(state: GameState, slotToUnequip: string): GameState {
  if (!state.player) return state;
  const typedSlot = slotToUnequip as 'weapon' | 'armor' | 'helmet' | 'boots';
  const itemToUnequip = state.player.equipment[typedSlot];
  
  if (!itemToUnequip) return state;
  
  return {
    ...state,
    player: {
      ...state.player,
      inventory: [...state.player.inventory, itemToUnequip],
      equipment: {
        ...state.player.equipment,
        [typedSlot]: undefined,
      },
    },
  };
}

function handleRespawnEnemies(state: GameState, count: number): GameState {
  if (!state.map) return state;
  
  // Get current time
  const currentTime = Date.now();
  
  // Filter out dead enemies that are ready to be removed (dead for more than 30 seconds)
  const remainingEnemies = state.map.enemies.filter(enemy => {
    if (enemy.health <= 0 && enemy.deathTime && currentTime - enemy.deathTime > 30000) {
      return false; // Remove this enemy
    }
    return true; // Keep this enemy
  });
  
  // Generate new enemies to replace the ones we're removing
  const newEnemies: Enemy[] = [];
  for (let i = 0; i < count; i++) {
    // Generate an enemy with level appropriate for the area
    const level = Math.floor(Math.random() * 3) + 1; // Level 1-3 for starter area
    const enemy = generateEnemy(level);
    
    // Find a valid spawn position (not occupied and walkable)
    const isPositionOccupied = (x: number, y: number) => {
      // Check if tile is walkable
      if (!state.map || !state.map.tiles[y][x].walkable) return true;
      
      // Check if player is at this position
      if (state.player && state.player.x === x && state.player.y === y) return true;
      
      // Check if any enemy is at this position
      return state.map.enemies.some(e => e.x === x && e.y === y);
    };
    
    // Position the enemy randomly, but not on obstacles or water or near the player
    const position = {
      x: 0,
      y: 0
    };
    
    let found = false;
    let attempts = 0;
    const maxAttempts = 50;
    
    while (!found && attempts < maxAttempts) {
      // Generate random position
      position.x = Math.floor(Math.random() * (state.map.width - 2)) + 1;
      position.y = Math.floor(Math.random() * (state.map.height - 2)) + 1;
      
      // Check if position is valid
      if (!isPositionOccupied(position.x, position.y)) {
        // If player exists, make sure enemy is not too close to player
        if (state.player) {
          const distToPlayer = Math.sqrt(
            Math.pow(position.x - state.player.x, 2) + 
            Math.pow(position.y - state.player.y, 2)
          );
          
          if (distToPlayer > 5) { // Spawn at least 5 tiles away from player
            found = true;
          }
        } else {
          found = true;
        }
      }
      
      attempts++;
    }
    
    // If we found a valid position, add the enemy
    if (found) {
      enemy.x = position.x;
      enemy.y = position.y;
      newEnemies.push(enemy);
    }
  }
  
  return {
    ...state,
    map: {
      ...state.map,
      enemies: [...remainingEnemies, ...newEnemies],
    },
  };
}
