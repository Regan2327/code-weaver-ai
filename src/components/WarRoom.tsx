import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface WarRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogEntry {
  timestamp: string;
  module: string;
  message: string;
}

const WarRoom = ({ isOpen, onClose }: WarRoomProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: "10:42:05", module: "INTENT_ROUTER", message: "Detected Transactional Intent" },
    { timestamp: "10:42:04", module: "NLP_ENGINE", message: "Parsing natural language input..." },
    { timestamp: "10:42:03", module: "CONTEXT_MGR", message: "Context window loaded (87% capacity)" },
    { timestamp: "10:42:02", module: "VOICE_MODULE", message: "Audio stream initialized" },
    { timestamp: "10:42:01", module: "NEURAL_NET", message: "Pathway optimization complete" },
    { timestamp: "10:42:00", module: "MEMORY_SYNC", message: "Short-term memory synced" },
    { timestamp: "10:41:58", module: "API_GATEWAY", message: "External service latency: 12ms" },
    { timestamp: "10:41:55", module: "SECURITY", message: "Session token validated" },
  ]);

  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Simulate new logs coming in
  useEffect(() => {
    if (!isOpen) return;
    
    const modules = ["INTENT_ROUTER", "NLP_ENGINE", "CONTEXT_MGR", "NEURAL_NET", "API_GATEWAY", "MEMORY_SYNC"];
    const messages = [
      "Processing semantic analysis...",
      "Vector embedding generated",
      "Response confidence: 94.7%",
      "Cache hit ratio: 89%",
      "Latency within threshold",
      "Token count: 2,847",
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false }).split(' ')[0];
      const newLog: LogEntry = {
        timestamp,
        module: modules[Math.floor(Math.random() * modules.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
      };
      
      setLogs(prev => [newLog, ...prev.slice(0, 19)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Terminal Drawer - Slides from bottom */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "20%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 h-[80%] z-50 rounded-t-3xl overflow-hidden"
            style={{ backgroundColor: '#000000' }}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-matrix-green/20">
              <div className="flex items-center gap-3">
                {/* Terminal dots */}
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-signal-red" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-matrix-green" />
                </div>
                <span className="font-mono text-sm text-matrix-green ml-4">
                  WAR_ROOM.exe
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg text-matrix-green/60 hover:text-matrix-green hover:bg-matrix-green/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Terminal Content */}
            <div className="p-6 h-full overflow-y-auto font-mono text-sm">
              {/* System Header */}
              <div className="mb-6 text-matrix-green/60">
                <p>╔══════════════════════════════════════════════════════════╗</p>
                <p>║  NEURODRIVE SYSTEM MONITOR v2.4.1                        ║</p>
                <p>║  STATUS: ACTIVE | UPTIME: 99.97% | NODES: 847            ║</p>
                <p>╚══════════════════════════════════════════════════════════╝</p>
              </div>

              {/* Log entries */}
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <motion.div
                    key={`${log.timestamp}-${index}`}
                    initial={index === 0 ? { opacity: 0, x: -10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-matrix-green/50">[{log.timestamp}]</span>
                    <span className="text-neon-blue">[{log.module}]</span>
                    <span className="text-matrix-green/30">&gt;</span>
                    <span className="text-matrix-green">{log.message}</span>
                    {index === 0 && (
                      <span 
                        className="text-matrix-green ml-1"
                        style={{ opacity: showCursor ? 1 : 0 }}
                      >
                        _
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Command prompt */}
              <div className="mt-8 flex items-center gap-2 text-matrix-green">
                <span className="text-neon-blue">neuro@system</span>
                <span className="text-matrix-green/50">:</span>
                <span className="text-matrix-green">~$</span>
                <span 
                  className="ml-1"
                  style={{ opacity: showCursor ? 1 : 0 }}
                >
                  █
                </span>
              </div>
            </div>

            {/* Scan line effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-matrix-green/5 to-transparent"
              />
            </div>

            {/* CRT effect lines */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 157, 0.03) 2px, rgba(0, 255, 157, 0.03) 4px)'
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WarRoom;
