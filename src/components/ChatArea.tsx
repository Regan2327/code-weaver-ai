import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ChatMessage, { Message } from "./ChatMessage";

interface ChatAreaProps {
  messages: Message[];
}

const ChatArea = ({ messages }: ChatAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin"
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground font-mono text-sm">
              AWAITING INPUT...
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message, index) => (
            <ChatMessage key={message.id} message={message} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ChatArea;
