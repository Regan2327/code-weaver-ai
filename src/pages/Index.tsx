import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NeuroDriveHeader from "@/components/NeuroDriveHeader";
import AIOrb from "@/components/AIOrb";
import ChatArea from "@/components/ChatArea";
import InputBar from "@/components/InputBar";
import WarRoom from "@/components/WarRoom";
import VoiceSettings from "@/components/VoiceSettings";
import DecisionCard, { FlightOption } from "@/components/DecisionCard";
import GhostModeLoader from "@/components/GhostModeLoader";
import AgentSwarmVisualizer from "@/components/AgentSwarmVisualizer";
import { Message } from "@/components/ChatMessage";
import { toast } from "@/hooks/use-toast";
import { useNeuroDriveChat } from "@/hooks/useNeuroDriveChat";
import { useGhostBrain } from "@/hooks/useGhostBrain";
import { useVoidSecurity } from "@/hooks/useVoidSecurity";
import { searchFlightsAPI, searchFlightsMock, isFlightQuery } from "@/lib/flightSearch";

const Index = () => {
  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [showDecisionCards, setShowDecisionCards] = useState(false);
  const [flightOptions, setFlightOptions] = useState<FlightOption[]>([]);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isSearchingFlights, setIsSearchingFlights] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [swarmLogs, setSwarmLogs] = useState<string[]>([]);

  // Ghost Brain (local LLM)
  const ghostBrain = useGhostBrain();

  // Void Security (encryption)
  const voidSecurity = useVoidSecurity();

  // Use the real AI chat hook
  const { 
    messages: aiMessages, 
    sendMessage: sendCloudMessage, 
    isLoading: isCloudLoading, 
    orbStatus: cloudOrbStatus,
    setOrbStatus,
    isSpeaking,
    isSpeechSupported,
    stopSpeaking,
    // Voice settings
    voices,
    currentVoice,
    setCurrentVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    testVoice,
  } = useNeuroDriveChat();

  // Ghost mode messages (local only)
  const [ghostMessages, setGhostMessages] = useState<Message[]>([
    {
      id: 'ghost-1',
      content: "Ghost Mode initialized. Running locally on your device. No data leaves this machine.",
      sender: 'ai',
      sentiment: 'calm',
      timestamp: new Date(),
    },
  ]);
  const [isGhostProcessing, setIsGhostProcessing] = useState(false);

  // Determine which messages to show
  const displayMessages = isGhostMode ? ghostMessages : aiMessages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.isUser ? 'user' as const : 'ai' as const,
    sentiment: msg.sentiment || 'neutral',
    timestamp: msg.timestamp,
  }));

  // Determine loading state
  const isLoading = isGhostMode ? isGhostProcessing : isCloudLoading;

  // Determine orb status
  const orbStatus = isGhostMode 
    ? (isGhostProcessing ? 'processing' : 'idle')
    : cloudOrbStatus;

  // Toggle ghost mode
  const handleGhostModeToggle = useCallback(async () => {
    if (!isGhostMode) {
      // Entering ghost mode - initialize local LLM
      if (!ghostBrain.isInitialized && !ghostBrain.isLoading) {
        try {
          await ghostBrain.init();
          setIsGhostMode(true);
          toast({
            title: "Ghost Mode Active",
            description: "Running locally. No data leaves your device.",
          });
        } catch (error) {
          toast({
            title: "Ghost Mode Failed",
            description: ghostBrain.error || "Could not initialize local AI",
            variant: "destructive",
          });
        }
      } else if (ghostBrain.isInitialized) {
        setIsGhostMode(true);
        toast({
          title: "Ghost Mode Active",
          description: "Running locally. No data leaves your device.",
        });
      }
    } else {
      // Exiting ghost mode
      setIsGhostMode(false);
      toast({
        title: "Cloud Mode Active",
        description: "Connected to NeuroDrive cloud services.",
      });
    }
  }, [isGhostMode, ghostBrain]);

  // Send message (routes to ghost or cloud)
  const handleSendMessage = useCallback(async (content: string) => {
    if (isGhostMode) {
      // Ghost mode - use local LLM
      if (!ghostBrain.isInitialized) {
        toast({
          title: "Ghost Brain Not Ready",
          description: "Please wait for initialization to complete.",
          variant: "destructive",
        });
        return;
      }

      const userMessage: Message = {
        id: `ghost-user-${Date.now()}`,
        content,
        sender: 'user',
        sentiment: 'neutral',
        timestamp: new Date(),
      };

      setGhostMessages(prev => [...prev, userMessage]);
      setIsGhostProcessing(true);

      try {
        let assistantContent = '';
        const assistantId = `ghost-ai-${Date.now()}`;

        // Add placeholder message
        setGhostMessages(prev => [...prev, {
          id: assistantId,
          content: '',
          sender: 'ai',
          sentiment: 'neutral',
          timestamp: new Date(),
        }]);

        // Stream response
        await ghostBrain.chat(
          [{ role: 'user', content }],
          (token) => {
            assistantContent += token;
            setGhostMessages(prev => 
              prev.map(msg => 
                msg.id === assistantId 
                  ? { ...msg, content: assistantContent }
                  : msg
              )
            );
          }
        );
      } catch (error) {
        console.error('[GhostMode] Chat error:', error);
        setGhostMessages(prev => [...prev, {
          id: `ghost-error-${Date.now()}`,
          content: "Local processing error. Please try again.",
          sender: 'ai',
          sentiment: 'urgent',
          timestamp: new Date(),
        }]);
      } finally {
        setIsGhostProcessing(false);
      }
    } else {
      // Cloud mode - show swarm visualization
      if (isFlightQuery(content)) {
        setActiveAgent('travel');
        setSwarmLogs(prev => [...prev, 'Delegating to Travel Agent...']);
        setIsSearchingFlights(true);
        
        try {
          const result = await searchFlightsAPI({ query: content });
          setSwarmLogs(prev => [...prev, 'Travel Agent searching flights...']);
          
          if (result.flights.length > 0) {
            setFlightOptions(result.flights);
            setShowDecisionCards(true);
            setSwarmLogs(prev => [...prev, `Found ${result.flights.length} flights`]);
            toast({
              title: "Live Flights Found",
              description: `Found ${result.flights.length} flights via Amadeus API`,
            });
          } else if (result.error) {
            setSwarmLogs(prev => [...prev, 'Primary API failed, using backup...']);
            const mockFlights = searchFlightsMock({ query: content });
            setFlightOptions(mockFlights);
            setShowDecisionCards(true);
            toast({
              title: "Using Demo Data",
              description: result.error,
              variant: "destructive",
            });
          }
        } catch (error) {
          setSwarmLogs(prev => [...prev, 'Fallback to mock data']);
          const mockFlights = searchFlightsMock({ query: content });
          setFlightOptions(mockFlights);
          setShowDecisionCards(true);
        } finally {
          setIsSearchingFlights(false);
          setTimeout(() => setActiveAgent(null), 2000);
        }
      } else {
        // General query - show search agent
        setActiveAgent('search');
        setSwarmLogs(prev => [...prev, 'Orchestrator processing query...']);
      }

      await sendCloudMessage(content);
      
      // Clear active agent after response
      setTimeout(() => {
        setActiveAgent(null);
        setSwarmLogs([]);
      }, 1000);
    }
  }, [isGhostMode, ghostBrain, sendCloudMessage]);

  const handleAcceptFlight = useCallback((id: string) => {
    const flight = flightOptions.find(f => f.id === id);
    setFlightOptions(prev => prev.filter(f => f.id !== id));
    
    toast({
      title: "Flight Booked!",
      description: `${flight?.airline} ${flight?.origin ? `from ${flight.origin}` : ''} ${flight?.destination ? `to ${flight.destination}` : ''} - $${flight?.price} confirmed.`,
    });

    const routeInfo = flight?.origin && flight?.destination 
      ? ` from ${flight.origin} to ${flight.destination}` 
      : '';
    sendCloudMessage(`I accept the ${flight?.airline} flight${routeInfo} for $${flight?.price}`);
    
    if (flightOptions.length <= 1) {
      setShowDecisionCards(false);
    }
  }, [flightOptions, sendCloudMessage]);

  const handleRejectFlight = useCallback((id: string) => {
    setFlightOptions(prev => prev.filter(f => f.id !== id));
    
    if (flightOptions.length <= 1) {
      setShowDecisionCards(false);
      sendCloudMessage("I've rejected all the flight options. Can you find alternatives?");
    }
  }, [flightOptions, sendCloudMessage]);

  // Handle void session
  const handleVoidSession = useCallback(async () => {
    const success = await voidSecurity.voidSession();
    if (success) {
      toast({
        title: "Session Voided",
        description: "All encrypted data is now permanently unreadable.",
        variant: "destructive",
      });
    }
    return success;
  }, [voidSecurity]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ghost Mode Loader */}
      <AnimatePresence>
        {ghostBrain.isLoading && (
          <GhostModeLoader
            progress={ghostBrain.loadProgress}
            status={ghostBrain.loadingStatus}
            isLoading={ghostBrain.isLoading}
            error={ghostBrain.error}
            onRetry={() => ghostBrain.init()}
          />
        )}
      </AnimatePresence>

      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-500 ${
          isGhostMode ? 'bg-signal-red/5' : 'bg-neon-blue/5'
        }`} />
        <div className={`absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] transition-colors duration-500 ${
          isGhostMode ? 'bg-signal-red/3' : 'bg-matrix-green/5'
        }`} />
      </div>

      {/* CRT scanlines for ghost mode */}
      {isGhostMode && (
        <div 
          className="fixed inset-0 pointer-events-none z-10 opacity-5"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 1px,
              rgba(255, 42, 109, 0.1) 1px,
              rgba(255, 42, 109, 0.1) 2px
            )`,
          }}
        />
      )}

      {/* Header */}
      <NeuroDriveHeader
        onWarRoomToggle={() => setIsWarRoomOpen(true)}
        isGhostMode={isGhostMode}
        onGhostModeToggle={handleGhostModeToggle}
        isGhostLoading={ghostBrain.isLoading}
        isVoided={voidSecurity.isVoided}
        onVoidSession={handleVoidSession}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-20 pb-4 relative">
        {/* Orb Section with Swarm Visualizer */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-shrink-0 py-8 flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            {isLoading && !isGhostMode ? (
              <AgentSwarmVisualizer
                key="swarm"
                activeAgent={activeAgent}
                isVisible={true}
                logs={swarmLogs}
              />
            ) : (
              <motion.div
                key="orb"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <AIOrb status={isGhostMode ? 'error' : orbStatus} />
              </motion.div>
            )}
          </AnimatePresence>
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
          <ChatArea messages={displayMessages} />
          <InputBar 
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            isSpeaking={isSpeaking}
            onStopSpeaking={stopSpeaking}
            isSpeechSupported={isSpeechSupported && !isGhostMode}
            onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
          />
        </section>
      </main>

      {/* War Room Drawer */}
      <WarRoom 
        isOpen={isWarRoomOpen} 
        onClose={() => setIsWarRoomOpen(false)} 
      />

      {/* Voice Settings Panel */}
      <VoiceSettings
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        voices={voices}
        currentVoice={currentVoice}
        onVoiceChange={setCurrentVoice}
        rate={rate}
        onRateChange={setRate}
        pitch={pitch}
        onPitchChange={setPitch}
        onTestVoice={testVoice}
      />

      {/* Ghost Mode Status Bar */}
      <AnimatePresence>
        {isGhostMode && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-0 right-0 flex justify-center z-40 pointer-events-none"
          >
            <div className="glassmorphism px-4 py-2 rounded-full border border-signal-red/30">
              <span className="font-mono text-xs text-signal-red">
                ⚡ LOCAL AI • ZERO NETWORK • AIR-GAPPED
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;