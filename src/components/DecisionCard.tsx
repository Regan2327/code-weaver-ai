import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Plane } from "lucide-react";
import { useState } from "react";

export interface FlightOption {
  id: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  stops: number;
  origin?: string;
  destination?: string;
}

interface DecisionCardProps {
  option: FlightOption;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const DecisionCard = ({ option, onAccept, onReject }: DecisionCardProps) => {
  const [isExiting, setIsExiting] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  
  // Transform x position to rotation and opacity
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const leftOpacity = useTransform(x, [-100, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, 100], [0, 1]);
  const cardOpacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Gold glow on interaction
  const glowOpacity = useTransform(x, [-50, 0, 50], [0, 0, 0.8]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      setIsExiting('right');
      setTimeout(() => onAccept(option.id), 200);
    } else if (info.offset.x < -threshold) {
      setIsExiting('left');
      setTimeout(() => onReject(option.id), 200);
    }
  };

  return (
    <motion.div
      className="relative cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity: cardOpacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      animate={
        isExiting === 'right' 
          ? { x: 400, opacity: 0 } 
          : isExiting === 'left' 
          ? { x: -400, opacity: 0 } 
          : {}
      }
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gold glow effect on hover/drag */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ 
          opacity: glowOpacity,
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.4), 0 0 80px rgba(255, 215, 0, 0.2)',
          border: '1px solid rgba(255, 215, 0, 0.5)'
        }}
      />

      {/* Card */}
      <div 
        className="relative rounded-2xl p-5 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        {/* Reject indicator (left) */}
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 text-signal-red font-mono text-sm"
          style={{ opacity: leftOpacity }}
        >
          ✕ REJECT
        </motion.div>

        {/* Accept indicator (right) */}
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2 text-matrix-green font-mono text-sm"
          style={{ opacity: rightOpacity }}
        >
          ACCEPT ✓
        </motion.div>

        {/* Card Content */}
        <div className="relative z-10">
          {/* Header - Airline */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-neon-blue" />
              </div>
              <span className="font-display font-semibold text-foreground">{option.airline}</span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {option.stops === 0 ? 'DIRECT' : `${option.stops} STOP${option.stops > 1 ? 'S' : ''}`}
            </span>
          </div>

          {/* Route */}
          {(option.origin || option.destination) && (
            <div className="flex items-center justify-between mb-2 text-xs font-mono text-muted-foreground">
              <span>{option.origin || 'Origin'}</span>
              <span>→</span>
              <span>{option.destination || 'Destination'}</span>
            </div>
          )}

          {/* Time */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-foreground">{option.departureTime}</div>
              <div className="text-xs font-mono text-muted-foreground">DEPART</div>
            </div>
            
            <div className="flex-1 mx-4 flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-neon-blue/50 via-muted-foreground/30 to-neon-blue/50" />
              <div className="px-2 text-xs font-mono text-muted-foreground">{option.duration}</div>
              <div className="flex-1 h-px bg-gradient-to-r from-neon-blue/50 via-muted-foreground/30 to-neon-blue/50" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-display font-bold text-foreground">{option.arrivalTime}</div>
              <div className="text-xs font-mono text-muted-foreground">ARRIVE</div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-xs font-mono text-muted-foreground">TOTAL FARE</span>
            <span className="text-3xl font-display font-bold text-neon-blue text-glow-blue">
              ${option.price}
            </span>
          </div>
        </div>

        {/* Subtle shimmer effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
              'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
              'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
};

export default DecisionCard;
