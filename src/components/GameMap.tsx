
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { MapTile, Enemy } from '../types/gameTypes';
import { Sword } from 'lucide-react';
import { useGameEngine } from '../core/GameEngine';

// Tile size in pixels
const TILE_SIZE = 32;

const GameMap = () => {
  const { state } = useGame();
  const { player, map } = state;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  
  // Use our game engine
  const { setPlayerTargetPosition, attackEnemy } = useGameEngine();

  // Calculate visible area based on player position
  useEffect(() => {
    if (mapContainerRef.current) {
      setViewportWidth(mapContainerRef.current.clientWidth);
      setViewportHeight(mapContainerRef.current.clientHeight);
    }

    const handleResize = () => {
      if (mapContainerRef.current) {
        setViewportWidth(mapContainerRef.current.clientWidth);
        setViewportHeight(mapContainerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle map click for movement
  const handleMapClick = (x: number, y: number) => {
    if (!player || !map) return;
    
    // Check if clicked on an enemy first
    const clickedEnemy = map.enemies.find(enemy => 
      enemy.x === x && enemy.y === y && enemy.health > 0
    );
    
    if (clickedEnemy) {
      // If enemy is in range, attack it
      const distance = Math.sqrt(
        Math.pow(player.x - clickedEnemy.x, 2) + 
        Math.pow(player.y - clickedEnemy.y, 2)
      );
      
      if (distance <= 1.5) { // Attack range
        attackEnemy(clickedEnemy.id);
      } else {
        // Move towards the enemy if not in range
        setPlayerTargetPosition(x, y);
      }
    } else if (map.tiles[y][x].walkable) {
      // Move to the clicked position if it's walkable
      setPlayerTargetPosition(x, y);
    }
  };

  // Handle enemy interaction
  const handleEnemyClick = (enemyId: string) => {
    if (!player) return;
    attackEnemy(enemyId);
  };

  if (!player || !map) return <div className="text-white ui-font">Loading...</div>;

  // Calculate visible tiles (simple viewport)
  const visibleTilesX = Math.ceil(viewportWidth / TILE_SIZE);
  const visibleTilesY = Math.ceil(viewportHeight / TILE_SIZE);
  const startX = Math.max(0, Math.min(map.width - visibleTilesX, player.x - Math.floor(visibleTilesX / 2)));
  const startY = Math.max(0, Math.min(map.height - visibleTilesY, player.y - Math.floor(visibleTilesY / 2)));
  const endX = Math.min(map.width, startX + visibleTilesX);
  const endY = Math.min(map.height, startY + visibleTilesY);

  // Get visible tiles
  const visibleTiles: MapTile[][] = [];
  for (let y = startY; y < endY; y++) {
    visibleTiles[y] = [];
    for (let x = startX; x < endX; x++) {
      visibleTiles[y][x] = map.tiles[y][x];
    }
  }

  // Get visible enemies (only living ones)
  const visibleEnemies = map.enemies.filter(
    enemy => enemy.health > 0 && 
    enemy.x >= startX && enemy.x < endX && 
    enemy.y >= startY && enemy.y < endY
  );

  // Calculate player offset for centered view
  const playerOffsetX = (player.x - startX) * TILE_SIZE;
  const playerOffsetY = (player.y - startY) * TILE_SIZE;

  // Helper function to get tile color based on type
  const getTileColor = (type: MapTile['type']) => {
    switch (type) {
      case 'ground':
        return 'bg-game-ground';
      case 'grass':
        return 'bg-game-grass';
      case 'water':
        return 'bg-game-water';
      case 'obstacle':
        return 'bg-gray-700';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div 
      ref={mapContainerRef}
      className="relative flex-grow overflow-hidden bg-black"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Map tiles */}
      <div className="absolute">
        {Array.from({ length: endY - startY }).map((_, relY) => {
          const y = relY + startY;
          return (
            <div key={`row-${y}`} className="flex">
              {Array.from({ length: endX - startX }).map((_, relX) => {
                const x = relX + startX;
                return (
                  <div
                    key={`tile-${x}-${y}`}
                    className={`${getTileColor(map.tiles[y][x].type)} border border-black border-opacity-20`}
                    style={{ width: TILE_SIZE, height: TILE_SIZE }}
                    onClick={() => handleMapClick(x, y)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Player character */}
      <div
        className={`absolute transition-all duration-200 flex items-center justify-center
          ${player.class === 'warrior' ? 'bg-game-warrior' : 
            player.class === 'mage' ? 'bg-game-mage' : 'bg-game-archer'} 
          rounded-full z-10 pixel-border`}
        style={{
          width: TILE_SIZE - 4,
          height: TILE_SIZE - 4,
          left: playerOffsetX + 2,
          top: playerOffsetY + 2,
        }}
      >
        <span className="text-white text-xs font-bold">P</span>
      </div>

      {/* Enemies */}
      {visibleEnemies.map((enemy) => (
        <div
          key={enemy.id}
          className="absolute bg-red-700 rounded-full cursor-pointer flex items-center justify-center hover:bg-red-600 transition-colors z-10 pixel-border"
          style={{
            width: TILE_SIZE - 4,
            height: TILE_SIZE - 4,
            left: (enemy.x - startX) * TILE_SIZE + 2,
            top: (enemy.y - startY) * TILE_SIZE + 2,
          }}
          onClick={() => handleEnemyClick(enemy.id)}
        >
          <div className="relative h-full w-full">
            <span className="text-white text-xs font-bold absolute inset-0 flex items-center justify-center">
              {enemy.level}
            </span>
            
            {/* Health bar */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-full px-1">
              <div className="h-1 w-full bg-gray-700">
                <div 
                  className="h-1 bg-red-500" 
                  style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameMap;
