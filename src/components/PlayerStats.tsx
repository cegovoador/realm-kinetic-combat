
import React from 'react';
import { useGame } from '../context/GameContext';
import { Progress } from '@/components/ui/progress';
import { Heart, Sword, Shield } from 'lucide-react';

const PlayerStats = () => {
  const { state } = useGame();
  const { player } = state;

  if (!player) return null;

  return (
    <div className="bg-game-ui-background border-t-2 border-game-ui-border p-2 text-white">
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        {/* Character name and level */}
        <div className="flex items-center space-x-2">
          <div 
            className={`w-8 h-8 rounded-full flex items-center justify-center
              ${player.class === 'warrior' ? 'bg-game-warrior' : 
                player.class === 'mage' ? 'bg-game-mage' : 'bg-game-archer'}`
            }
          >
            {player.class === 'warrior' && <Sword className="h-4 w-4 text-white" />}
            {player.class === 'mage' && <Shield className="h-4 w-4 text-white" />}
            {player.class === 'archer' && <Heart className="h-4 w-4 text-white" />}
          </div>
          <div>
            <div className="ui-font text-sm font-bold">{player.name}</div>
            <div className="text-xs text-gray-300 capitalize">{player.class} Lvl {player.level}</div>
          </div>
        </div>

        {/* Health */}
        <div className="flex flex-col flex-grow min-w-[100px] max-w-[200px]">
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="flex items-center">
              <Heart className="h-3 w-3 mr-1 text-red-500" />
              HP
            </span>
            <span>{player.health}/{player.maxHealth}</span>
          </div>
          <Progress 
            className="h-2 bg-gray-700" 
            value={(player.health / player.maxHealth) * 100}
            style={{ transform: `translateX(0%)` }}
          />
        </div>

        {/* XP Bar */}
        <div className="flex flex-col flex-grow min-w-[100px] max-w-[200px]">
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span>XP</span>
            <span>{player.xp}/{player.maxXp}</span>
          </div>
          <Progress 
            className="h-2 bg-gray-700" 
            value={(player.xp / player.maxXp) * 100}
            style={{ transform: `translateX(0%)` }}
          />
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center space-x-3 text-xs">
          <div className="flex items-center">
            <Sword className="h-3 w-3 mr-1 text-game-warrior" />
            <span>{player.attack}</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-3 w-3 mr-1 text-game-archer" />
            <span>{player.defense}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
