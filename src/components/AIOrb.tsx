import { motion } from "framer-motion";

interface AIOrbProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
}

const AIOrb = ({ status }: AIOrbProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'from-neon-blue via-matrix-green to-neon-blue';
      case 'thinking':
        return 'from-matrix-green via-neon-blue to-matrix-green';
      case 'speaking':
        return 'from-neon-blue via-primary to-matrix-green';
      default:
        return 'from-neon-blue via-matrix-green to-neon-blue';
    }
  };

  return (
    <div className="relative flex items-center justify-center perspective-1000">
      {/* Outer glow rings */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute w-64 h-64 rounded-full border border-neon-blue/30"
        style={{
          boxShadow: '0 0 40px hsl(var(--neon-blue) / 0.2)'
        }}
      />
      
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-56 h-56 rounded-full border border-matrix-green/20"
      />

      {/* Orbital rings */}
      <div className="absolute w-48 h-48 preserve-3d animate-ring-spin">
        <div 
          className="absolute inset-0 rounded-full border-2 border-neon-blue/40"
          style={{ transform: 'rotateX(60deg)' }}
        />
      </div>
      
      <div className="absolute w-44 h-44 preserve-3d animate-ring-spin-reverse">
        <div 
          className="absolute inset-0 rounded-full border border-matrix-green/30"
          style={{ transform: 'rotateX(75deg) rotateY(20deg)' }}
        />
      </div>

      {/* Main orb */}
      <motion.div
        animate={{ 
          scale: status === 'listening' ? [1, 1.1, 1] : status === 'thinking' ? [1, 1.05, 1] : 1
        }}
        transition={{ 
          duration: status === 'listening' ? 0.5 : 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative w-32 h-32 animate-float"
      >
        {/* Core sphere */}
        <div 
          className="absolute inset-0 rounded-full animate-orb-breathe"
          style={{
            background: `radial-gradient(circle at 30% 30%, 
              hsl(var(--neon-blue) / 0.8) 0%, 
              hsl(var(--matrix-green) / 0.4) 40%, 
              hsl(var(--neon-blue) / 0.2) 70%, 
              transparent 100%)`
          }}
        />

        {/* Inner glow */}
        <div 
          className="absolute inset-2 rounded-full animate-orb-pulse"
          style={{
            background: `radial-gradient(circle at 40% 40%, 
              hsl(var(--neon-blue-glow) / 0.9) 0%, 
              hsl(var(--matrix-green) / 0.5) 50%, 
              transparent 80%)`
          }}
        />

        {/* Highlight */}
        <div 
          className="absolute top-3 left-4 w-8 h-8 rounded-full"
          style={{
            background: `radial-gradient(circle, 
              hsl(0 0% 100% / 0.4) 0%, 
              transparent 70%)`
          }}
        />

        {/* Scan line effect */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <motion.div
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-full h-8 bg-gradient-to-b from-transparent via-neon-blue/20 to-transparent"
          />
        </div>
      </motion.div>

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -bottom-8 text-center"
      >
        <span className="font-mono text-xs text-neon-blue text-glow-blue uppercase tracking-widest">
          {status}
        </span>
      </motion.div>

      {/* Particle effects */}
      {[...Array(6)].map((_, i) => (
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
