import { motion } from "framer-motion";

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  sentiment: 'neutral' | 'positive' | 'negative' | 'urgent';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  index: number;
}

const ChatMessage = ({ message, index }: ChatMessageProps) => {
  const getSentimentStyles = () => {
    switch (message.sentiment) {
      case 'positive':
        return 'border-matrix-green/30 text-glow-green';
      case 'negative':
        return 'border-signal-red/30';
      case 'urgent':
        return 'border-signal-red/50 text-glow-red';
      default:
        return 'border-neon-blue/20';
    }
  };

  const isAI = message.sender === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: isAI ? -20 : 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div
        className={`
          max-w-[85%] px-4 py-3 rounded-2xl glass
          ${getSentimentStyles()}
          ${isAI 
            ? 'rounded-tl-sm' 
            : 'rounded-tr-sm bg-neon-blue/10 border-neon-blue/30'
          }
        `}
      >
        {isAI && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse-glow" />
            <span className="text-xs font-mono text-neon-blue">NEURO</span>
          </div>
        )}
        
        <p className={`text-sm leading-relaxed ${isAI ? 'font-mono text-foreground/90' : 'text-foreground'}`}>
          {message.content}
        </p>
        
        <div className="mt-2 flex items-center justify-end gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
