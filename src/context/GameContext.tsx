
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { GameState, Character, Item, ChatMessage, Enemy } from '../types/gameTypes';
import { mockItems, mockMaps } from '../data/mockData';
import { generateEnemy } from '../utils/enemyGenerator';

// Initial state
const initialState: GameState = {
  player: null,
  map: null,
  messages: [],
  nearbyPlayers: [],
  loading: false,
  error: null,
};

// Action types
type ActionType =
  | { type: 'CREATE_CHARACTER'; payload: Character }
  | { type: 'LOAD_MAP'; payload: string }
  | { type: 'MOVE_PLAYER'; payload: { x: number; y: number } }
  | { type: 'ATTACK_ENEMY'; payload: string }
  | { type: 'GAIN_XP'; payload: number }
  | { type: 'LEVEL_UP' }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'EQUIP_ITEM'; payload: Item }
  | { type: 'UNEQUIP_ITEM'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Reducer function
const gameReducer = (state: GameState, action: ActionType): GameState => {
  switch (action.type) {
    case 'CREATE_CHARACTER':
      return {
        ...state,
        player: action.payload,
      };
    case 'LOAD_MAP':
      const mapId = action.payload;
      const map = mockMaps.find(m => m.id === mapId)?.map;
      if (!map) return { ...state, error: 'Map not found' };
      return {
        ...state,
        map,
      };
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
        },
      };
    case 'ATTACK_ENEMY':
      if (!state.player || !state.map) return state;
      const enemyId = action.payload;
      const enemyIndex = state.map.enemies.findIndex(e => e.id === enemyId);
      if (enemyIndex === -1) return state;

      const enemy = state.map.enemies[enemyIndex];
      const player = state.player;

      // Calculate damage
      const playerDamage = Math.max(1, player.attack - enemy.defense / 2);
      const newEnemyHealth = Math.max(0, enemy.health - playerDamage);

      // If enemy is defeated
      if (newEnemyHealth <= 0) {
        // Generate new enemy
        const newEnemy = generateEnemy(enemy.level);
        
        // Add XP to player
        const newPlayer = {
          ...player,
          xp: player.xp + enemy.xpReward,
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
            enemies: [
              ...state.map.enemies.slice(0, enemyIndex),
              newEnemy,
              ...state.map.enemies.slice(enemyIndex + 1),
            ],
          },
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              sender: 'System',
              content: `You defeated ${enemy.name} and gained ${enemy.xpReward} XP!`,
              timestamp: Date.now(),
              type: 'system',
            },
          ],
        };
      } else {
        // Enemy takes damage but survives
        // Calculate enemy counter-attack damage
        const enemyDamage = Math.max(1, enemy.attack - player.defense / 2);
        const newPlayerHealth = Math.max(0, player.health - enemyDamage);
        
        return {
          ...state,
          player: {
            ...player,
            health: newPlayerHealth,
          },
          map: {
            ...state.map,
            enemies: [
              ...state.map.enemies.slice(0, enemyIndex),
              {
                ...enemy,
                health: newEnemyHealth,
              },
              ...state.map.enemies.slice(enemyIndex + 1),
            ],
          },
        };
      }
    case 'GAIN_XP':
      if (!state.player) return state;
      const newXp = state.player.xp + action.payload;
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
              type: 'system',
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
    case 'LEVEL_UP':
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
            type: 'system',
          },
        ],
      };
    case 'ADD_ITEM':
      if (!state.player) return state;
      return {
        ...state,
        player: {
          ...state.player,
          inventory: [...state.player.inventory, action.payload],
        },
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            sender: 'System',
            content: `You obtained ${action.payload.name}!`,
            timestamp: Date.now(),
            type: 'system',
          },
        ],
      };
    case 'EQUIP_ITEM':
      if (!state.player) return state;
      const item = action.payload;
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
            type: 'system',
          },
        ],
      };
    case 'UNEQUIP_ITEM':
      if (!state.player) return state;
      const slotToUnequip = action.payload as 'weapon' | 'armor' | 'helmet' | 'boots';
      const itemToUnequip = state.player.equipment[slotToUnequip];
      
      if (!itemToUnequip) return state;
      
      return {
        ...state,
        player: {
          ...state.player,
          inventory: [...state.player.inventory, itemToUnequip],
          equipment: {
            ...state.player.equipment,
            [slotToUnequip]: undefined,
          },
        },
      };
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
    default:
      return state;
  }
};

// Context
export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Add any side effects here

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
