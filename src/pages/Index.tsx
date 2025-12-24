import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NeuroDriveHeader from "@/components/NeuroDriveHeader";
import AIOrb from "@/components/AIOrb";
import { OrbState } from "@/components/AIOrb";
import ChatArea from "@/components/ChatArea";
import InputBar from "@/components/InputBar";
import WarRoom from "@/components/WarRoom";
import DecisionCard, { FlightOption } from "@/components/DecisionCard";
import { Message } from "@/components/ChatMessage";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [orbStatus, setOrbStatus] = useState<OrbState>('idle');
  const [showDecisionCards, setShowDecisionCards] = useState(false);
  const [flightOptions, setFlightOptions] = useState<FlightOption[]>([
    {
      id: '1',
      airline: 'SkyNova Airlines',
      departureTime: '08:45',
      arrivalTime: '11:30',
      duration: '2h 45m',
      price: 459,
      stops: 0,
    },
    {
      id: '2',
      airline: 'Quantum Air',
      departureTime: '14:20',
      arrivalTime: '18:05',
      duration: '3h 45m',
      price: 329,
      stops: 1,
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'NeuroDrive initialized. All systems nominal. How may I assist you today?',
      sender: 'ai',
      sentiment: 'calm',
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
    setOrbStatus('processing');

    // Check for flight-related keywords
    const isFlightQuery = content.toLowerCase().includes('flight') || 
                          content.toLowerCase().includes('book') ||
                          content.toLowerCase().includes('travel');

    setTimeout(() => {
      let aiResponse: Message;

      if (isFlightQuery) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          content: "I found 2 optimal flight options for you. Swipe right to accept, left to reject.",
          sender: 'ai',
          sentiment: 'success',
          timestamp: new Date(),
        };
        setShowDecisionCards(true);
      } else {
        const responses = [
          { content: "Processing your request through neural pathways. Analysis indicates optimal solution found.", sentiment: 'calm' as const },
          { content: "WARNING: Elevated security protocol required for this operation. Proceed with caution.", sentiment: 'urgent' as const },
          { content: "Task completed successfully. All parameters within expected thresholds.", sentiment: 'success' as const },
          { content: "Understood. Initiating protocol sequence. Estimated completion: 2.3 seconds.", sentiment: 'calm' as const },
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        aiResponse = {
          id: (Date.now() + 1).toString(),
          content: response.content,
          sender: 'ai',
          sentiment: response.sentiment,
          timestamp: new Date(),
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
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

  const handleAcceptFlight = useCallback((id: string) => {
    const flight = flightOptions.find(f => f.id === id);
    setFlightOptions(prev => prev.filter(f => f.id !== id));
    
    toast({
      title: "Flight Booked!",
      description: `${flight?.airline} - $${flight?.price} confirmed.`,
    });

    const aiMessage: Message = {
      id: Date.now().toString(),
      content: `Excellent choice. ${flight?.airline} flight booked for $${flight?.price}. Confirmation sent to your neural link.`,
      sender: 'ai',
      sentiment: 'success',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);
    
    if (flightOptions.length <= 1) {
      setShowDecisionCards(false);
    }
  }, [flightOptions]);

  const handleRejectFlight = useCallback((id: string) => {
    setFlightOptions(prev => prev.filter(f => f.id !== id));
    
    if (flightOptions.length <= 1) {
      setShowDecisionCards(false);
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: "All options rejected. Shall I search for alternative flights?",
        sender: 'ai',
        sentiment: 'calm',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  }, [flightOptions]);

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

        {/* Decision Cards Overlay */}
        <AnimatePresence>
          {showDecisionCards && flightOptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-30 max-w-md mx-auto"
            >
              <div className="text-center mb-4">
                <span className="font-mono text-xs text-muted-foreground">
                  SWIPE TO DECIDE
                </span>
              </div>
              <div className="space-y-4">
                {flightOptions.map(option => (
                  <DecisionCard
                    key={option.id}
                    option={option}
                    onAccept={handleAcceptFlight}
                    onReject={handleRejectFlight}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
