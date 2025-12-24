import { useEffect, useState, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { motion } from "framer-motion";

export type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface AIOrbProps {
  status: OrbState;
}

const AIOrb = ({ status }: AIOrbProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [hasError, setHasError] = useState(false);

  // Load Lottie animation
  useEffect(() => {
    fetch('https://lottie.host/5a6a6e86-8f3e-4682-8cc6-4927514758d4/C7p3j0Xg9s.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(() => setHasError(true));
  }, []);

  // Control animation based on state
  useEffect(() => {
    if (!lottieRef.current) return;

    switch (status) {
      case 'idle':
        lottieRef.current.setSpeed(0.5);
        break;
      case 'listening':
        lottieRef.current.setSpeed(1.5);
        break;
      case 'processing':
        lottieRef.current.setSpeed(1);
        break;
      case 'speaking':
        lottieRef.current.setSpeed(1.2);
        break;
      case 'error':
        lottieRef.current.setSpeed(0.3);
        break;
    }
  }, [status]);

  const getContainerStyles = () => {
    const baseStyles = "relative w-[300px] h-[300px] flex items-center justify-center rounded-full";
    
    switch (status) {
      case 'listening':
        return `${baseStyles} scale-110`;
      case 'error':
        return `${baseStyles} border-2 border-signal-red animate-pulse`;
      default:
        return baseStyles;
    }
  };

  const getGlowColor = () => {
    switch (status) {
      case 'listening':
        return 'hsl(var(--neon-blue) / 0.6)';
      case 'processing':
        return 'hsl(280 100% 60% / 0.5)'; // Purple
      case 'speaking':
        return 'hsl(var(--matrix-green) / 0.5)';
      case 'error':
        return 'hsl(var(--signal-red) / 0.6)';
      default:
        return 'hsl(var(--neon-blue) / 0.4)';
    }
  };

  const getFilterStyle = () => {
    if (status === 'processing') {
      return 'hue-rotate(60deg) saturate(1.5)'; // Shift to purple
    }
    if (status === 'error') {
      return 'hue-rotate(-60deg) saturate(2)'; // Shift to red
    }
    return 'none';
  };

  return (
    <div className="relative flex items-center justify-center perspective-1000">
      {/* Outer glow rings */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: status === 'listening' ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: status === 'error' ? [0.3, 0.8, 0.3] : 1
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: status === 'listening' ? 0.5 : 4, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 0.5, repeat: Infinity }
        }}
        className="absolute w-80 h-80 rounded-full"
        style={{
          border: `1px solid ${status === 'error' ? 'hsl(var(--signal-red) / 0.5)' : 'hsl(var(--neon-blue) / 0.3)'}`,
          boxShadow: `0 0 40px ${getGlowColor()}`
        }}
      />
      
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-72 h-72 rounded-full border border-matrix-green/20"
      />

      {/* Orbital rings */}
      <div className="absolute w-64 h-64 preserve-3d animate-ring-spin">
        <div 
          className="absolute inset-0 rounded-full border-2 border-neon-blue/40"
          style={{ transform: 'rotateX(60deg)' }}
        />
      </div>

      {/* Main Lottie container */}
      <motion.div
        animate={{ 
          scale: status === 'listening' ? 1.1 : 1,
          opacity: status === 'processing' ? [0.7, 1, 0.7] : 1
        }}
        transition={{ 
          scale: { duration: 0.3 },
          opacity: { duration: 1, repeat: status === 'processing' ? Infinity : 0 }
        }}
        className={getContainerStyles()}
        style={{
          boxShadow: `0 0 80px ${getGlowColor()}, inset 0 0 60px ${getGlowColor()}`
        }}
      >
        {animationData ? (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop
            autoplay
            style={{ 
              width: 280, 
              height: 280,
              filter: getFilterStyle()
            }}
          />
        ) : hasError ? (
          // Fallback animated orb if Lottie fails
          <div 
            className="w-48 h-48 rounded-full animate-orb-breathe"
            style={{
              background: `radial-gradient(circle at 30% 30%, 
                hsl(var(--neon-blue) / 0.8) 0%, 
                hsl(var(--matrix-green) / 0.4) 40%, 
                hsl(var(--neon-blue) / 0.2) 70%, 
                transparent 100%)`
            }}
          />
        ) : (
          // Loading state
          <div className="w-48 h-48 rounded-full animate-pulse bg-neon-blue/20" />
        )}
      </motion.div>

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -bottom-12 text-center"
      >
        <span className={`font-mono text-xs uppercase tracking-widest ${
          status === 'error' 
            ? 'text-signal-red text-glow-red' 
            : status === 'processing'
            ? 'text-purple-400'
            : 'text-neon-blue text-glow-blue'
        }`}>
          {status}
        </span>
      </motion.div>

      {/* Particle effects */}
      {status !== 'error' && [...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-20, -60, -20],
            x: [0, (i % 2 === 0 ? 10 : -10), 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-1 h-1 rounded-full bg-neon-blue"
          style={{
            left: `${50 + (i - 3) * 15}%`,
            bottom: '40%'
          }}
        />
      ))}
    </div>
  );
};

export default AIOrb;
