
// Game Types

export type CharacterClass = 'warrior' | 'mage' | 'archer';

export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  xp: number;
  maxXp: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  x: number;
  y: number;
  inventory: Item[];
  equipment: Equipment;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable';
  description: string;
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
  };
  slot?: 'weapon' | 'armor' | 'helmet' | 'boots';
  requiredClass?: CharacterClass[];
  requiredLevel: number;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  helmet?: Item;
  boots?: Item;
}

export interface MapTile {
  type: 'ground' | 'grass' | 'water' | 'obstacle';
  walkable: boolean;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: MapTile[][];
  enemies: Enemy[];
  npcs: NPC[];
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  x: number;
  y: number;
  xpReward: number;
  itemDrops: {
    item: Item;
    chance: number;
  }[];
}

export interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  dialogue: string[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: 'global' | 'local' | 'system';
}

export interface GameState {
  player: Character | null;
  map: GameMap | null;
  messages: ChatMessage[];
  nearbyPlayers: Character[];
  loading: boolean;
  error: string | null;
}
