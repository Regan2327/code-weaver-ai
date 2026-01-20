import { motion } from "framer-motion";
import { Ghost, Terminal, Wifi, WifiOff, Shield } from "lucide-react";
import VoidButton from "./VoidButton";

interface NeuroDriveHeaderProps {
  onWarRoomToggle: () => void;
  isGhostMode: boolean;
  onGhostModeToggle: () => void;
  isGhostLoading?: boolean;
  isVoided?: boolean;
  onVoidSession?: () => Promise<boolean>;
}

const NeuroDriveHeader = ({ 
  onWarRoomToggle, 
  isGhostMode, 
  onGhostModeToggle,
  isGhostLoading = false,
  isVoided = false,
  onVoidSession,
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
          disabled={isGhostLoading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
            isGhostMode 
              ? 'bg-signal-red/20 text-signal-red' 
              : 'text-muted-foreground hover:text-foreground'
          } ${isGhostLoading ? 'opacity-50 cursor-wait' : ''}`}
          style={{
            boxShadow: isGhostMode ? '0 0 15px rgba(255, 42, 109, 0.3)' : 'none',
          }}
        >
          <Ghost className="w-5 h-5" />
          <span className="text-sm font-medium font-mono">GHOST</span>
        </motion.button>

        {/* Center Status */}
        <div className="flex items-center gap-2">
          {isGhostMode ? (
            <>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <WifiOff className="w-4 h-4 text-signal-red" />
              </motion.div>
              <span className="text-xs font-mono text-signal-red">AIR-GAPPED</span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-matrix-green"
              />
              <span className="text-xs font-mono text-muted-foreground">ONLINE</span>
            </>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Void Button */}
          {onVoidSession && (
            <VoidButton onVoid={onVoidSession} isVoided={isVoided} />
          )}

          {/* War Room Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onWarRoomToggle}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-neon-blue hover:bg-neon-blue/10 transition-all duration-300"
          >
            <Terminal className="w-5 h-5" />
            <span className="text-sm font-medium font-mono hidden sm:inline">WAR ROOM</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default NeuroDriveHeader;
