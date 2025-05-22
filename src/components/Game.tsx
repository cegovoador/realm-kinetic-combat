
import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import CharacterCreation from './CharacterCreation';
import GameMap from './GameMap';
import PlayerStats from './PlayerStats';
import Chat from './Chat';
import Inventory from './Inventory';

const Game = () => {
  const { state, dispatch } = useGame();
  const { player, map } = state;

  // Load map when player is created
  useEffect(() => {
    if (player && !map) {
      // Load the starter map
      dispatch({ type: 'LOAD_MAP', payload: 'start' });
    }
  }, [player, map, dispatch]);

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
            content: 'Click on the map to move. Click on enemies to attack them.',
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
