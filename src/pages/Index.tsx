import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import NeuroDriveHeader from "@/components/NeuroDriveHeader";
import AIOrb from "@/components/AIOrb";
import ChatArea from "@/components/ChatArea";
import InputBar from "@/components/InputBar";
import WarRoom from "@/components/WarRoom";
import { Message } from "@/components/ChatMessage";

const Index = () => {
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [orbStatus, setOrbStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'NeuroDrive initialized. All systems nominal. How may I assist you today?',
      sender: 'ai',
      sentiment: 'positive',
      timestamp: new Date(),
    }
  ]);

  const handleSendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      sentiment: 'neutral',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setOrbStatus('thinking');

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        { content: "Processing your request through neural pathways...", sentiment: 'neutral' as const },
        { content: "Analysis complete. I've optimized the parameters for maximum efficiency.", sentiment: 'positive' as const },
        { content: "Understood. Initiating protocol sequence now.", sentiment: 'neutral' as const },
        { content: "Warning: This action requires elevated permissions.", sentiment: 'urgent' as const },
      ];
      
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        sender: 'ai',
        sentiment: response.sentiment,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setOrbStatus('speaking');
      
      setTimeout(() => setOrbStatus('idle'), 2000);
    }, 1500);
  }, []);

  const handleToggleListening = useCallback(() => {
    setIsListening(prev => {
      const newState = !prev;
      setOrbStatus(newState ? 'listening' : 'idle');
      return newState;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-neon-blue/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-matrix-green/5 blur-[100px]" />
      </div>

      {/* Header */}
      <NeuroDriveHeader
        onWarRoomToggle={() => setIsWarRoomOpen(true)}
        isGhostMode={isGhostMode}
        onGhostModeToggle={() => setIsGhostMode(!isGhostMode)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-20 pb-4 relative">
        {/* Orb Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 py-8 flex items-center justify-center"
        >
          <AIOrb status={orbStatus} />
        </motion.section>

        {/* Chat Section */}
        <section className="flex-1 flex flex-col min-h-0 max-w-md mx-auto w-full">
          <ChatArea messages={messages} />
          <InputBar 
            onSendMessage={handleSendMessage}
            isListening={isListening}
            onToggleListening={handleToggleListening}
          />
        </section>
      </main>

      {/* War Room Drawer */}
      <WarRoom 
        isOpen={isWarRoomOpen} 
        onClose={() => setIsWarRoomOpen(false)} 
      />

      {/* Ghost Mode Overlay */}
      {isGhostMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 pointer-events-none bg-background/50 backdrop-blur-sm z-40"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs text-muted-foreground">GHOST MODE ACTIVE</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
