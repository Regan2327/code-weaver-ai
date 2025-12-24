import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  sentiment: 'neutral' | 'calm' | 'success' | 'urgent';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  index: number;
}

// Typewriter hook for AI messages
const useTypewriter = (text: string, speed: number = 30, enabled: boolean = true) => {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);
  const [isComplete, setIsComplete] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
};

const ChatMessage = ({ message, index }: ChatMessageProps) => {
  const isAI = message.sender === 'ai';
  const { displayedText, isComplete } = useTypewriter(message.content, 25, isAI);

  const getSentimentColor = () => {
    switch (message.sentiment) {
      case 'urgent':
        return '#FF4D4D'; // Red Glow
      case 'success':
        return '#00FF9D'; // Neon Green
      case 'calm':
        return '#A0E7E5'; // Cyan
      default:
        return 'hsl(var(--foreground))';
    }
  };

  const getSentimentGlow = () => {
    switch (message.sentiment) {
      case 'urgent':
        return '0 0 20px rgba(255, 77, 77, 0.5), 0 0 40px rgba(255, 77, 77, 0.3)';
      case 'success':
        return '0 0 20px rgba(0, 255, 157, 0.5), 0 0 40px rgba(0, 255, 157, 0.3)';
      case 'calm':
        return '0 0 20px rgba(160, 231, 229, 0.4), 0 0 40px rgba(160, 231, 229, 0.2)';
      default:
        return 'none';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, x: isAI ? -20 : 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
    >
      {isAI ? (
        // AI Message - No background, just text with sentiment color
        <div className="max-w-[85%] px-2">
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: getSentimentColor() }}
            />
            <span className="text-xs font-mono text-muted-foreground">NEURO</span>
          </div>
          
          <p 
            className="text-sm leading-relaxed font-mono"
            style={{ 
              color: getSentimentColor(),
              textShadow: getSentimentGlow()
            }}
          >
            {displayedText}
            {!isComplete && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block ml-0.5"
              >
                _
              </motion.span>
            )}
          </p>
          
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/60">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ) : (
        // User Message - Glassmorphic bubble
        <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tr-sm glass">
          <p className="text-sm leading-relaxed text-foreground">
            {message.content}
          </p>
          
          <div className="mt-2 flex items-center justify-end">
            <span className="text-[10px] font-mono text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
