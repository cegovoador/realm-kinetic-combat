
import { Character, Item, ChatMessage, GameMap } from '../types/gameTypes';

// Action types
export type GameAction =
  | { type: 'CREATE_CHARACTER'; payload: Character }
  | { type: 'LOAD_MAP'; payload: string | GameMap }
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
