import { motion } from "framer-motion";
import { Mic, Camera, Send, MicOff } from "lucide-react";
import { useState } from "react";

interface InputBarProps {
  onSendMessage: (message: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  disabled?: boolean;
}

const InputBar = ({ onSendMessage, isListening, onToggleListening, disabled = false }: InputBarProps) => {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim() && !disabled) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type or speak..."
          className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground font-mono text-sm px-2"
        />

        {/* Send Button (when text) */}
        {inputText.trim() && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            className="p-3 rounded-xl bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 transition-all duration-300"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        )}

        {/* Microphone Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleListening}
          className={`p-3 rounded-xl transition-all duration-300 ${
            isListening 
              ? 'bg-signal-red/20 text-signal-red animate-pulse' 
              : 'bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30'
          }`}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-2"
        >
          <span className="text-xs font-mono text-signal-red text-glow-red">
            ● LISTENING...
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default InputBar;
