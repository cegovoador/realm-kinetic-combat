
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState } from '../types/gameTypes';
import { GameAction } from './GameActions';
import { gameReducer } from './GameReducer';

// Initial state
const initialState: GameState = {
  player: null,
  map: null,
  messages: [],
  nearbyPlayers: [],
  loading: false,
  error: null,
};

// Context
export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

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
