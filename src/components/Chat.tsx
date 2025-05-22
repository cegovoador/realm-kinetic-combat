
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

const Chat = () => {
  const { state, dispatch } = useGame();
  const [message, setMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { messages, player } = state;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && chatOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !player) return;
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: uuidv4(),
        sender: player.name,
        content: message.trim(),
        timestamp: Date.now(),
        type: 'global', // for now, all player messages are global
      },
    });
    
    setMessage('');
  };
  
  // Get only the last 100 messages for performance
  const displayMessages = messages.slice(-100);
  
  return (
    <div className={`
      fixed bottom-12 left-0 w-full sm:w-80 transition-all duration-300 z-30
      ${chatOpen ? 'h-64' : 'h-10'}
    `}>
      {/* Chat toggle button */}
      <button
        className="absolute top-0 left-0 bg-game-ui-background px-4 py-1 rounded-t border-t border-l border-r border-game-ui-border z-10 ui-font text-sm text-white"
        onClick={() => setChatOpen(!chatOpen)}
      >
        {chatOpen ? '▼ Chat' : '▲ Chat'}
      </button>
      
      {/* Chat container */}
      <div className={`
        bg-game-ui-background border-t border-r border-game-ui-border h-full
        flex flex-col rounded-tr overflow-hidden
        ${chatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-2 text-sm">
          {displayMessages.map((msg) => (
            <div key={msg.id} className={`mb-1 ${msg.type === 'system' ? 'text-yellow-300' : 'text-white'}`}>
              <span className="font-medium">
                {msg.type === 'system' ? '[System]' : `[${msg.sender}]`}:
              </span>{' '}
              <span>{msg.content}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-2 border-t border-game-ui-border flex">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-game-ui-accent bg-opacity-20 border-game-ui-border text-white text-sm"
          />
          <Button 
            type="submit" 
            className="ml-1 game-button py-1 px-2 text-sm"
            disabled={!message.trim()}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
