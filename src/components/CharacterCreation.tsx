
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CharacterClass } from '../types/gameTypes';
import { classStats } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Shield, Sword, Heart } from 'lucide-react';

const CharacterCreation = () => {
  const { dispatch } = useGame();
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null);
  const [error, setError] = useState('');

  const handleCreateCharacter = () => {
    if (!name.trim()) {
      setError('Please enter a character name');
      return;
    }

    if (!characterClass) {
      setError('Please select a character class');
      return;
    }

    // Clear any previous errors
    setError('');

    // Get stats based on class
    const stats = classStats[characterClass];

    // Create the character
    dispatch({
      type: 'CREATE_CHARACTER',
      payload: {
        id: uuidv4(),
        name: name.trim(),
        class: characterClass,
        level: 1,
        xp: 0,
        maxXp: 100,
        ...stats,
        x: 10, // Starting position
        y: 7,  // Starting position
        inventory: [],
        equipment: {},
      },
    });

    // Load the starting map
    dispatch({
      type: 'LOAD_MAP',
      payload: 'start',
    });
  };

  return (
    <div className="min-h-screen bg-game-ui-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-game-ui-background border-game-ui-border">
        <CardHeader className="text-center">
          <CardTitle className="ui-font text-3xl text-white">Create Your Hero</CardTitle>
          <CardDescription className="text-gray-300">Choose your path in the world of Rucoy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block ui-font text-white mb-2">Hero Name</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-game-ui-accent bg-opacity-20 border-game-ui-border text-white"
                placeholder="Enter your hero name"
              />
            </div>
            
            <div>
              <h3 className="ui-font text-white mb-3">Choose your class</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['warrior', 'mage', 'archer'] as CharacterClass[]).map((cls) => (
                  <div 
                    key={cls}
                    className={`
                      p-4 rounded cursor-pointer transition-all transform hover:scale-105
                      ${characterClass === cls 
                        ? 'bg-game-ui-accent border-2 border-white' 
                        : 'bg-game-ui-accent bg-opacity-30 border-2 border-game-ui-border'
                      }
                    `}
                    onClick={() => setCharacterClass(cls)}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center
                          ${cls === 'warrior' ? 'bg-game-warrior' : 
                            cls === 'mage' ? 'bg-game-mage' : 'bg-game-archer'}`
                        }
                      >
                        {cls === 'warrior' && <Sword className="text-white" />}
                        {cls === 'mage' && <Shield className="text-white" />}
                        {cls === 'archer' && <Heart className="text-white" />}
                      </div>
                      <h4 className="ui-font text-white capitalize">{cls}</h4>
                      <div className="text-xs text-gray-300">
                        {cls === 'warrior' && 'High defense, melee combat'}
                        {cls === 'mage' && 'Powerful spells, low defense'}
                        {cls === 'archer' && 'Fast attacks, medium defense'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {error && <div className="text-red-500 text-center">{error}</div>}
            
            <Button 
              onClick={handleCreateCharacter} 
              className="w-full game-button"
            >
              Begin Adventure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterCreation;
