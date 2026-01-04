import { motion } from "framer-motion";

export type OrbState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface AIOrbProps {
  status: OrbState;
}

const AIOrb = ({ status }: AIOrbProps) => {
  const getGlowColor = () => {
    switch (status) {
      case 'listening':
        return 'rgba(0, 243, 255, 0.6)';
      case 'processing':
        return 'rgba(168, 85, 247, 0.6)';
      case 'speaking':
        return 'rgba(5, 213, 250, 0.5)';
      case 'error':
        return 'rgba(255, 42, 109, 0.6)';
      default:
        return 'rgba(0, 243, 255, 0.4)';
    }
  };

  const getCoreGradient = () => {
    switch (status) {
      case 'listening':
        return 'radial-gradient(circle at 30% 30%, rgba(0, 243, 255, 1) 0%, rgba(0, 243, 255, 0.6) 30%, rgba(5, 213, 250, 0.3) 60%, transparent 100%)';
      case 'processing':
        return 'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 1) 0%, rgba(139, 92, 246, 0.6) 30%, rgba(168, 85, 247, 0.3) 60%, transparent 100%)';
      case 'speaking':
        return 'radial-gradient(circle at 30% 30%, rgba(5, 213, 250, 1) 0%, rgba(0, 243, 255, 0.6) 30%, rgba(5, 213, 250, 0.3) 60%, transparent 100%)';
      case 'error':
        return 'radial-gradient(circle at 30% 30%, rgba(255, 42, 109, 1) 0%, rgba(255, 42, 109, 0.6) 30%, rgba(255, 42, 109, 0.3) 60%, transparent 100%)';
      default:
        return 'radial-gradient(circle at 30% 30%, rgba(0, 243, 255, 0.9) 0%, rgba(5, 213, 250, 0.5) 30%, rgba(0, 243, 255, 0.2) 60%, transparent 100%)';
    }
  };

  const getPulseSpeed = () => {
    switch (status) {
      case 'idle': return 4;
      case 'listening': return 0.6;
      case 'processing': return 1.2;
      case 'speaking': return 0.8;
      case 'error': return 0.3;
    }
  };

  const getScale = () => {
    switch (status) {
      case 'listening': return [1, 1.15, 1];
      case 'processing': return [1, 1.08, 1];
      case 'speaking': return [1, 1.1, 1];
      case 'error': return [1, 0.95, 1];
      default: return [1, 1.05, 1];
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outermost glow ring */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: status === 'listening' ? [1, 1.1, 1] : 1,
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute w-80 h-80 rounded-full"
        style={{
          border: `1px solid ${status === 'error' ? 'rgba(255, 42, 109, 0.4)' : 'rgba(0, 243, 255, 0.2)'}`,
          boxShadow: `0 0 60px ${getGlowColor()}`
        }}
      />

      {/* Second ring - counter rotation */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-72 h-72 rounded-full"
        style={{
          border: '1px solid rgba(5, 213, 250, 0.15)'
        }}
      />

      {/* Third ring - 3D effect */}
      <motion.div
        animate={{ rotateX: [60, 70, 60], rotateY: [0, 360, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute w-64 h-64 rounded-full"
        style={{
          border: '2px solid rgba(0, 243, 255, 0.3)',
          transformStyle: 'preserve-3d'
        }}
      />

      {/* Inner pulsing ring */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ 
          duration: getPulseSpeed(),
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-56 h-56 rounded-full"
        style={{
          border: `1px solid ${status === 'error' ? 'rgba(255, 42, 109, 0.5)' : 'rgba(0, 243, 255, 0.4)'}`,
        }}
      />

      {/* Main orb container */}
      <motion.div
        animate={{ 
          scale: getScale(),
        }}
        transition={{ 
          duration: getPulseSpeed(),
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-[200px] h-[200px] flex items-center justify-center"
      >
        {/* Orb glow background */}
        <motion.div
          animate={{ 
            opacity: status === 'processing' ? [0.6, 1, 0.6] : [0.8, 1, 0.8],
          }}
          transition={{ 
            duration: getPulseSpeed() * 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: getCoreGradient(),
            boxShadow: `
              0 0 60px ${getGlowColor()},
              0 0 120px ${getGlowColor()},
              inset 0 0 60px ${getGlowColor()}
            `,
            filter: 'blur(1px)'
          }}
        />

        {/* Core sphere */}
        <motion.div
          animate={{ 
            scale: status === 'listening' ? [0.9, 1, 0.9] : [0.95, 1, 0.95],
          }}
          transition={{ 
            duration: getPulseSpeed() * 0.7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-32 h-32 rounded-full"
          style={{
            background: getCoreGradient(),
            boxShadow: `
              0 0 40px ${getGlowColor()},
              inset -10px -10px 30px rgba(0, 0, 0, 0.3),
              inset 10px 10px 30px rgba(255, 255, 255, 0.1)
            `
          }}
        >
          {/* Highlight */}
          <div 
            className="absolute top-4 left-6 w-8 h-6 rounded-full opacity-60"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)'
            }}
          />
          
          {/* Secondary highlight */}
          <div 
            className="absolute top-8 left-10 w-4 h-3 rounded-full opacity-40"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)'
            }}
          />
        </motion.div>

        {/* Energy waves */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            animate={{ 
              scale: [1, 2, 2.5],
              opacity: [0.6, 0.2, 0]
            }}
            transition={{ 
              duration: 2,
              delay: i * 0.6,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute w-32 h-32 rounded-full"
            style={{
              border: `1px solid ${status === 'error' ? 'rgba(255, 42, 109, 0.5)' : 'rgba(0, 243, 255, 0.5)'}`
            }}
          />
        ))}
      </motion.div>

      {/* Floating particles */}
      {status !== 'error' && [...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          animate={{
            y: [-30, -80, -30],
            x: [0, (i % 2 === 0 ? 15 : -15), 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3 + i * 0.3,
            delay: i * 0.4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${45 + (i - 4) * 8}%`,
            bottom: '35%',
            background: status === 'processing' 
              ? 'rgba(168, 85, 247, 0.8)' 
              : 'rgba(0, 243, 255, 0.8)',
            boxShadow: `0 0 10px ${status === 'processing' ? 'rgba(168, 85, 247, 0.8)' : 'rgba(0, 243, 255, 0.8)'}`
          }}
        />
      ))}

      {/* Orbiting dots */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute"
          style={{
            width: 220 + i * 30,
            height: 220 + i * 30,
          }}
        >
          <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              background: status === 'error' 
                ? 'rgba(255, 42, 109, 0.8)' 
                : 'rgba(0, 243, 255, 0.8)',
              boxShadow: `0 0 8px ${status === 'error' ? 'rgba(255, 42, 109, 0.8)' : 'rgba(0, 243, 255, 0.8)'}`
            }}
          />
        </motion.div>
      ))}

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -bottom-16 text-center"
      >
        <motion.span 
          animate={{ opacity: status === 'error' ? [1, 0.5, 1] : 1 }}
          transition={{ duration: 0.5, repeat: status === 'error' ? Infinity : 0 }}
          className={`font-mono text-xs uppercase tracking-[0.3em] ${
            status === 'error' 
              ? 'text-signal-red' 
              : status === 'processing'
              ? 'text-purple-400'
              : status === 'speaking'
              ? 'text-matrix-green'
              : 'text-neon-blue'
          }`}
          style={{
            textShadow: status === 'error' 
              ? '0 0 10px rgba(255, 42, 109, 0.8)' 
              : status === 'processing'
              ? '0 0 10px rgba(168, 85, 247, 0.8)'
              : '0 0 10px rgba(0, 243, 255, 0.8)'
          }}
        >
          {status}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default AIOrb;
