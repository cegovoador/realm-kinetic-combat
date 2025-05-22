
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Item } from '../types/gameTypes';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Inventory = () => {
  const { state, dispatch } = useGame();
  const { player } = state;
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  if (!player) return null;

  const handleEquipItem = (item: Item) => {
    if (item.slot) {
      dispatch({ type: 'EQUIP_ITEM', payload: item });
    }
    setSelectedItem(null);
  };

  const handleUnequipItem = (slot: string) => {
    dispatch({ type: 'UNEQUIP_ITEM', payload: slot });
  };

  // Check if the player can equip this item
  const canEquipItem = (item: Item): boolean => {
    // Check level requirement
    if (player.level < item.requiredLevel) return false;
    
    // Check class requirement
    if (item.requiredClass && !item.requiredClass.includes(player.class)) return false;
    
    return true;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="game-button absolute top-4 right-4 z-20"
        >
          Inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="game-panel border-2 border-game-ui-border max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="ui-font text-white">Inventory</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="items">
          <TabsList className="bg-game-ui-accent bg-opacity-30">
            <TabsTrigger value="items" className="ui-font text-white data-[state=active]:bg-game-ui-accent">Items</TabsTrigger>
            <TabsTrigger value="equipment" className="ui-font text-white data-[state=active]:bg-game-ui-accent">Equipment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="mt-4">
            <ScrollArea className="h-72">
              <div className="grid grid-cols-4 gap-2 p-1">
                {player.inventory.length === 0 ? (
                  <p className="col-span-4 text-center text-gray-400 py-8">Your inventory is empty</p>
                ) : (
                  player.inventory.map((item) => (
                    <div
                      key={item.id}
                      className="bg-game-ui-accent bg-opacity-30 border border-game-ui-border p-2 rounded cursor-pointer hover:bg-game-ui-accent hover:bg-opacity-40"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="h-8 flex items-center justify-center">
                        <span className="text-xs text-center">{item.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Weapon Slot */}
              <div className="bg-game-ui-accent bg-opacity-20 border border-game-ui-border p-2 rounded">
                <div className="text-xs mb-1">Weapon</div>
                {player.equipment.weapon ? (
                  <div className="flex justify-between">
                    <div>{player.equipment.weapon.name}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUnequipItem('weapon')}
                      className="h-6 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-400">- Empty -</div>
                )}
              </div>
              
              {/* Armor Slot */}
              <div className="bg-game-ui-accent bg-opacity-20 border border-game-ui-border p-2 rounded">
                <div className="text-xs mb-1">Armor</div>
                {player.equipment.armor ? (
                  <div className="flex justify-between">
                    <div>{player.equipment.armor.name}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUnequipItem('armor')}
                      className="h-6 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-400">- Empty -</div>
                )}
              </div>
              
              {/* Helmet Slot */}
              <div className="bg-game-ui-accent bg-opacity-20 border border-game-ui-border p-2 rounded">
                <div className="text-xs mb-1">Helmet</div>
                {player.equipment.helmet ? (
                  <div className="flex justify-between">
                    <div>{player.equipment.helmet.name}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUnequipItem('helmet')}
                      className="h-6 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-400">- Empty -</div>
                )}
              </div>
              
              {/* Boots Slot */}
              <div className="bg-game-ui-accent bg-opacity-20 border border-game-ui-border p-2 rounded">
                <div className="text-xs mb-1">Boots</div>
                {player.equipment.boots ? (
                  <div className="flex justify-between">
                    <div>{player.equipment.boots.name}</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleUnequipItem('boots')}
                      className="h-6 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-gray-400">- Empty -</div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Item detail dialog */}
        {selectedItem && (
          <div className="mt-4 p-3 bg-game-ui-accent bg-opacity-20 border border-game-ui-border rounded">
            <h3 className="ui-font text-lg">{selectedItem.name}</h3>
            <p className="text-gray-300 text-sm mt-1">{selectedItem.description}</p>
            
            {/* Stats */}
            <div className="mt-2 space-y-1">
              {selectedItem.stats.attack && (
                <div className="text-sm">Attack: +{selectedItem.stats.attack}</div>
              )}
              {selectedItem.stats.defense && (
                <div className="text-sm">Defense: +{selectedItem.stats.defense}</div>
              )}
              {selectedItem.stats.health && (
                <div className="text-sm">Health: +{selectedItem.stats.health}</div>
              )}
              {selectedItem.stats.mana && (
                <div className="text-sm">Mana: +{selectedItem.stats.mana}</div>
              )}
            </div>
            
            {/* Requirements */}
            <div className="mt-2 text-xs text-gray-400">
              Level required: {selectedItem.requiredLevel}
              {selectedItem.requiredClass && (
                <div>Class required: {selectedItem.requiredClass.join(', ')}</div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end mt-3">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedItem(null)}
                className="text-gray-300 hover:text-white mr-2"
              >
                Close
              </Button>
              {selectedItem.slot && (
                <Button 
                  onClick={() => handleEquipItem(selectedItem)}
                  disabled={!canEquipItem(selectedItem)}
                  className={`${canEquipItem(selectedItem) ? 'game-button' : 'opacity-50 cursor-not-allowed bg-gray-700 text-gray-400'}`}
                >
                  Equip
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Inventory;
