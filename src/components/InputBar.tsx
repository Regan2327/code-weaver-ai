import { motion, AnimatePresence } from "framer-motion";
import { Mic, Camera, Send, MicOff, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "@/hooks/use-toast";

interface InputBarProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
  isSpeechSupported?: boolean;
}

const InputBar = ({ 
  onSendMessage, 
  disabled = false,
  isSpeaking = false,
  onStopSpeaking,
  isSpeechSupported = true,
}: InputBarProps) => {
  const [inputText, setInputText] = useState("");

  const { 
    isListening, 
    isSupported, 
    interimTranscript,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: (result) => {
      if (result.isFinal && result.transcript.trim()) {
        // Append final transcript to input
        setInputText(prev => {
          const newText = prev ? `${prev} ${result.transcript}` : result.transcript;
          return newText.trim();
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Voice Input Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  // Show interim results in the input while speaking
  const displayText = isListening && interimTranscript 
    ? (inputText ? `${inputText} ${interimTranscript}` : interimTranscript)
    : inputText;

  const handleSend = () => {
    if (inputText.trim() && !disabled) {
      onSendMessage(inputText.trim());
      setInputText("");
      if (isListening) {
        stopListening();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }
    toggleListening();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8"
    >
      <div className="glass rounded-2xl p-2 flex items-center gap-2 max-w-md mx-auto">
        {/* Camera Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300"
        >
          <Camera className="w-5 h-5" />
        </motion.button>

        {/* Text Input */}
        <input
          type="text"
          value={displayText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isListening ? "Listening..." : "Type or speak..."}
          className={`flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground font-mono text-sm px-2 ${
            isListening && interimTranscript ? 'text-neon-blue/70' : ''
          }`}
          disabled={disabled}
        />

        {/* Send Button (when text) */}
        <AnimatePresence>
          {inputText.trim() && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={disabled}
              className="p-3 rounded-xl bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 transition-all duration-300 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Speaker Button - shows when AI is speaking */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onStopSpeaking}
              className="p-3 rounded-xl bg-matrix-green/20 text-matrix-green hover:bg-matrix-green/30 transition-all duration-300 animate-pulse"
              title="Stop speaking"
            >
              <Volume2 className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Microphone Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMicClick}
          disabled={disabled}
          className={`p-3 rounded-xl transition-all duration-300 disabled:opacity-50 ${
            isListening 
              ? 'bg-signal-red/20 text-signal-red animate-pulse' 
              : isSupported
              ? 'bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Listening indicator with waveform */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center mt-3 gap-2"
          >
            {/* Audio waveform visualization */}
            <div className="flex items-center gap-1 h-6">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-signal-red rounded-full"
                  animate={{
                    height: [8, 20, 12, 24, 8],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-signal-red text-glow-red">
              ● LISTENING...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InputBar;
