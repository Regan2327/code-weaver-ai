import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, AlertTriangle } from 'lucide-react';

interface VoidButtonProps {
  onVoid: () => Promise<boolean>;
  isVoided: boolean;
}

const VoidButton = ({ onVoid, isVoided }: VoidButtonProps) => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 3000; // 3 seconds

  const startHold = useCallback(() => {
    if (isVoided || isVoiding) return;
    
    setIsHolding(true);
    setHoldProgress(0);

    // Progress update interval
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 50);

    // Trigger void after hold duration
    holdTimerRef.current = setTimeout(async () => {
      setShowConfirmation(true);
    }, HOLD_DURATION);
  }, [isVoided, isVoiding]);

  const endHold = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const confirmVoid = useCallback(async () => {
    setShowConfirmation(false);
    setIsVoiding(true);
    
    // Trigger glitch effect
    setShowGlitch(true);
    
    const success = await onVoid();
    
    if (success) {
      // Keep glitch for dramatic effect
      setTimeout(() => {
        setShowGlitch(false);
        setIsVoiding(false);
      }, 2000);
    } else {
      setShowGlitch(false);
      setIsVoiding(false);
    }
  }, [onVoid]);

  const cancelVoid = useCallback(() => {
    setShowConfirmation(false);
    endHold();
  }, [endHold]);

  return (
    <>
      {/* Glitch overlay */}
      <AnimatePresence>
        {showGlitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {/* CRT scanlines */}
            <div 
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  rgba(0, 0, 0, 0.1) 0px,
                  rgba(0, 0, 0, 0.1) 1px,
                  transparent 1px,
                  transparent 2px
                )`,
              }}
            />
            
            {/* Glitch color shifts */}
            <motion.div
              animate={{
                x: [0, -3, 3, -2, 2, 0],
                opacity: [0.5, 0.8, 0.3, 0.7, 0.4, 0.5],
              }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute inset-0 bg-signal-red/20"
              style={{ mixBlendMode: 'color-dodge' }}
            />
            
            {/* Void text */}
            <motion.div
              animate={{ opacity: [1, 0, 1, 0, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="font-mono text-4xl text-signal-red tracking-[0.5em]">
                ▓▓▓ VOID ▓▓▓
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glassmorphism p-6 max-w-sm mx-4 border border-signal-red/50"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-signal-red" />
                <h3 className="font-mono text-lg text-signal-red">VOID PROTOCOL</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                This will <span className="text-signal-red">permanently destroy</span> your encryption key. 
                All encrypted messages will become unreadable forever.
              </p>
              
              <p className="text-xs font-mono text-muted-foreground mb-6">
                THIS ACTION CANNOT BE UNDONE.
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelVoid}
                  className="flex-1 py-2 px-4 glassmorphism font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  CANCEL
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmVoid}
                  className="flex-1 py-2 px-4 bg-signal-red/20 border border-signal-red/50 font-mono text-xs text-signal-red hover:bg-signal-red/30 transition-colors"
                >
                  CONFIRM VOID
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Button */}
      <motion.button
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        disabled={isVoided || isVoiding}
        whileHover={{ scale: isVoided ? 1 : 1.05 }}
        className={`relative p-3 rounded-full transition-all ${
          isVoided 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:shadow-lg'
        }`}
        style={{
          background: isHolding 
            ? 'rgba(255, 42, 109, 0.3)' 
            : 'rgba(255, 42, 109, 0.1)',
          border: '1px solid rgba(255, 42, 109, 0.4)',
          boxShadow: isHolding 
            ? '0 0 20px rgba(255, 42, 109, 0.5)' 
            : 'none',
        }}
      >
        {/* Progress ring */}
        {isHolding && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 44 44"
          >
            <circle
              cx="22"
              cy="22"
              r="20"
              fill="none"
              stroke="rgba(255, 42, 109, 0.8)"
              strokeWidth="2"
              strokeDasharray={`${(holdProgress / 100) * 125.6} 125.6`}
              className="transition-all duration-100"
            />
          </svg>
        )}
        
        <motion.div
          animate={isHolding ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.2, repeat: isHolding ? Infinity : 0 }}
        >
          <Skull 
            className={`w-5 h-5 ${isVoided ? 'text-muted-foreground' : 'text-signal-red'}`}
          />
        </motion.div>
        
        {/* Tooltip */}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          {isVoided ? 'VOIDED' : 'HOLD 3s TO VOID'}
        </span>
      </motion.button>
    </>
  );
};

export default VoidButton;
