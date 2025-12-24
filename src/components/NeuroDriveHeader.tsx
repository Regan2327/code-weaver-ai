import { motion } from "framer-motion";
import { Ghost, Terminal, Zap } from "lucide-react";
import { useState } from "react";

interface NeuroDriveHeaderProps {
  onWarRoomToggle: () => void;
  isGhostMode: boolean;
  onGhostModeToggle: () => void;
}

const NeuroDriveHeader = ({ 
  onWarRoomToggle, 
  isGhostMode, 
  onGhostModeToggle 
}: NeuroDriveHeaderProps) => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between max-w-md mx-auto">
        {/* Ghost Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGhostModeToggle}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
            isGhostMode 
              ? 'bg-neon-blue/20 text-neon-blue text-glow-blue' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Ghost className="w-5 h-5" />
          <span className="text-sm font-medium font-mono">GHOST</span>
        </motion.button>

        {/* Center Status */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-matrix-green"
          />
          <span className="text-xs font-mono text-muted-foreground">ONLINE</span>
        </div>

        {/* War Room Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onWarRoomToggle}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-neon-blue hover:bg-neon-blue/10 transition-all duration-300"
        >
          <Terminal className="w-5 h-5" />
          <span className="text-sm font-medium font-mono">WAR ROOM</span>
        </motion.button>
      </div>
    </motion.header>
  );
};

export default NeuroDriveHeader;
