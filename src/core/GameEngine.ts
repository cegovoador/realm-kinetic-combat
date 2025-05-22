
import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Enemy, Character } from '../types/gameTypes';

// Game loop frequency (frames per second)
const FPS = 30;
const FRAME_TIME = 1000 / FPS;

// Calculate movement speed (tiles per second)
const BASE_PLAYER_SPEED = 3; // tiles per second
const BASE_ENEMY_SPEED = 2; // tiles per second

// Helper to calculate distance between two points
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// Movement helpers
export const moveTowards = (
  currentX: number, 
  currentY: number, 
  targetX: number, 
  targetY: number, 
  speed: number
): { x: number; y: number } => {
  // If already at target, don't move
  if (currentX === targetX && currentY === targetY) {
    return { x: currentX, y: currentY };
  }
  
  const dx = targetX - currentX;
  const dy = targetY - currentY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Normalize the direction and multiply by speed
  const vx = (dx / distance) * speed;
  const vy = (dy / distance) * speed;
  
  // Calculate new position
  // For grid-based movement, we'll round to the nearest tile
  return { 
    x: Math.round(currentX + vx),
    y: Math.round(currentY + vy)
  };
};

// Check if a tile is walkable on the map
export const isTileWalkable = (map: any, x: number, y: number): boolean => {
  if (!map) return false;
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return false;
  return map.tiles[y][x].walkable;
};

// Hook to run the game engine
export const useGameEngine = () => {
  const { state, dispatch } = useGame();
  const { player, map } = state;
  const lastTickTime = useRef<number>(0);
  const targetPosition = useRef<{ x: number, y: number } | null>(null);
  
  // Handle game ticks
  useEffect(() => {
    if (!player || !map) return;
    
    const gameTick = (timestamp: number) => {
      // Calculate delta time since last frame
      if (!lastTickTime.current) lastTickTime.current = timestamp;
      const deltaTime = timestamp - lastTickTime.current;
      
      // Only update if enough time has passed
      if (deltaTime >= FRAME_TIME) {
        lastTickTime.current = timestamp;
        
        // Update enemy movements
        updateEnemies(deltaTime);
        
        // Update player movement if we have a target position
        if (targetPosition.current) {
          updatePlayerPosition(deltaTime);
        }
        
        // Handle combat interactions
        handleCombat();
        
        // Respawn enemies if needed
        respawnEnemies();
      }
      
      // Request next animation frame
      requestAnimationFrame(gameTick);
    };
    
    // Start the game loop
    const animationId = requestAnimationFrame(gameTick);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [player, map, dispatch]);
  
  // Update enemy positions
  const updateEnemies = (deltaTime: number) => {
    if (!map || !player) return;
    
    const updatedEnemies = map.enemies.map(enemy => {
      // Skip if enemy is dead
      if (enemy.health <= 0) return enemy;
      
      // Calculate distance to player
      const distance = calculateDistance(enemy.x, enemy.y, player.x, player.y);
      
      // If player is within aggro range, move towards player
      if (distance < 5) {
        // Calculate movement based on speed
        const moveSpeed = (BASE_ENEMY_SPEED * enemy.speed / 5) * (deltaTime / 1000);
        
        // Try to move towards player
        const newPosition = moveTowards(enemy.x, enemy.y, player.x, player.y, moveSpeed);
        
        // Check if the new position is valid (walkable and not occupied by another enemy)
        if (isTileWalkable(map, newPosition.x, newPosition.y) && 
            !isPositionOccupiedByEnemy(newPosition.x, newPosition.y, enemy.id)) {
          return { ...enemy, x: newPosition.x, y: newPosition.y };
        }
      }
      
      return enemy;
    });
    
    // Update enemies in the map
    if (JSON.stringify(updatedEnemies) !== JSON.stringify(map.enemies)) {
      dispatch({
        type: 'UPDATE_ENEMIES',
        payload: updatedEnemies
      });
    }
  };
  
  // Check if a position is occupied by an enemy
  const isPositionOccupiedByEnemy = (x: number, y: number, excludeId: string): boolean => {
    if (!map) return false;
    return map.enemies.some(e => e.id !== excludeId && e.x === x && e.y === y);
  };
  
  // Update player position
  const updatePlayerPosition = (deltaTime: number) => {
    if (!player || !map || !targetPosition.current) return;
    
    // Calculate movement based on speed
    const moveSpeed = (BASE_PLAYER_SPEED * player.speed / 5) * (deltaTime / 1000);
    
    // Try to move towards target
    const newPosition = moveTowards(
      player.x, 
      player.y, 
      targetPosition.current.x, 
      targetPosition.current.y, 
      moveSpeed
    );
    
    // Check if the new position is valid
    if (isTileWalkable(map, newPosition.x, newPosition.y)) {
      dispatch({ 
        type: 'MOVE_PLAYER', 
        payload: { x: newPosition.x, y: newPosition.y } 
      });
      
      // If we've reached the target, clear it
      if (newPosition.x === targetPosition.current.x && 
          newPosition.y === targetPosition.current.y) {
        targetPosition.current = null;
      }
    } else {
      // If we can't move there, clear the target
      targetPosition.current = null;
    }
  };
  
  // Handle combat
  const handleCombat = () => {
    if (!player || !map) return;
    
    // Find enemies in combat range
    const enemiesInRange = map.enemies.filter(enemy => 
      enemy.health > 0 && calculateDistance(player.x, player.y, enemy.x, enemy.y) <= 1.5
    );
    
    // If we have an enemy in range and enough time has passed since last attack
    if (enemiesInRange.length > 0 && player.lastAttackTime && 
        Date.now() - player.lastAttackTime > player.attackSpeed) {
      // Attack the closest enemy
      const closestEnemy = enemiesInRange.reduce((closest, current) => {
        const closestDist = calculateDistance(player.x, player.y, closest.x, closest.y);
        const currentDist = calculateDistance(player.x, player.y, current.x, current.y);
        return currentDist < closestDist ? current : closest;
      });
      
      dispatch({ 
        type: 'ATTACK_ENEMY', 
        payload: closestEnemy.id 
      });
    }
  };
  
  // Respawn enemies
  const respawnEnemies = () => {
    if (!map) return;
    
    // Check if we need to spawn more enemies
    const livingEnemies = map.enemies.filter(enemy => enemy.health > 0);
    const maxEnemies = 10; // Maximum enemies on the map
    
    if (livingEnemies.length < maxEnemies) {
      dispatch({ type: 'RESPAWN_ENEMIES', payload: maxEnemies - livingEnemies.length });
    }
  };
  
  // Public methods to control the game
  return {
    // Method to set player's target position for movement
    setPlayerTargetPosition: (x: number, y: number) => {
      if (map && isTileWalkable(map, x, y)) {
        targetPosition.current = { x, y };
      }
    },
    
    // Method to initiate an attack on an enemy
    attackEnemy: (enemyId: string) => {
      dispatch({ type: 'ATTACK_ENEMY', payload: enemyId });
    }
  };
};
