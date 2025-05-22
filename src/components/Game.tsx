
import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import CharacterCreation from './CharacterCreation';
import GameMap from './GameMap';
import PlayerStats from './PlayerStats';
import Chat from './Chat';
import Inventory from './Inventory';
import { generateEnemy, generateRandomPosition } from '../utils/enemyGenerator';

const Game = () => {
  const { state, dispatch } = useGame();
  const { player, map } = state;

  // If map is loaded, populate it with enemies
  useEffect(() => {
    if (map && map.enemies.length === 0) {
      // Populate the map with some initial enemies
      const enemyCount = 5; // Start with 5 enemies
      const newEnemies = [];
      
      for (let i = 0; i < enemyCount; i++) {
        // Generate enemies with levels appropriate for the map (assuming level 1-3 for start)
        const level = Math.floor(Math.random() * 3) + 1;
        const enemy = generateEnemy(level);
        
        // Position the enemy randomly, but not on obstacles or water
        const position = generateRandomPosition(
          map.width, 
          map.height, 
          (x, y) => !map.tiles[y][x].walkable || 
                     (player && player.x === x && player.y === y)
        );
        
        enemy.x = position.x;
        enemy.y = position.y;
        
        newEnemies.push(enemy);
      }
      
      // Update the map with the new enemies
      dispatch({
        type: 'LOAD_MAP',
        payload: {
          ...map,
          enemies: newEnemies,
        },
      });
    }
  }, [map, player, dispatch]);

  // Add some welcome system messages when the game starts
  useEffect(() => {
    if (player) {
      // Add welcome messages
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: 'welcome-1',
          sender: 'System',
          content: `Welcome to the world of Rucoy, ${player.name}!`,
          timestamp: Date.now(),
          type: 'system',
        },
      });
      
      setTimeout(() => {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: 'welcome-2',
            sender: 'System',
            content: 'Use arrow keys or WASD to move. Click on enemies to attack them.',
            timestamp: Date.now(),
            type: 'system',
          },
        });
      }, 1500);
    }
  }, [player, dispatch]);

  return (
    <div className="game-container">
      {!player ? (
        // Show character creation if no player exists
        <CharacterCreation />
      ) : (
        // Show game content when player exists
        <div className="flex flex-col h-full">
          <div className="flex-grow relative">
            <GameMap />
            <Inventory />
          </div>
          <PlayerStats />
          <Chat />
        </div>
      )}
    </div>
  );
};

export default Game;
