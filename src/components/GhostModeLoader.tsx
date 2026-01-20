import { motion } from 'framer-motion';
import { Ghost, Cpu, Shield, Wifi } from 'lucide-react';

interface GhostModeLoaderProps {
  progress: number;
  status: string;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const GhostModeLoader = ({ progress, status, isLoading, error, onRetry }: GhostModeLoaderProps) => {
  if (!isLoading && !error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
    >
      {/* CRT scanlines effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 1px,
            rgba(255, 42, 109, 0.03) 1px,
            rgba(255, 42, 109, 0.03) 2px
          )`,
        }}
      />

      <div className="max-w-md w-full mx-4 p-6">
        {/* Ghost icon with pulse */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <Ghost className="w-20 h-20 text-signal-red" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <div 
                className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-signal-red"
                style={{ transform: 'translate(-50%, -150%)' }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-center font-mono text-lg text-signal-red mb-2 tracking-wider">
          GHOST MODE INITIALIZING
        </h2>
        
        <p className="text-center text-xs text-muted-foreground mb-6 font-mono">
          Downloading Local AI Model
        </p>

        {error ? (
          <div className="space-y-4">
            <div className="p-4 bg-signal-red/10 border border-signal-red/30 rounded">
              <p className="text-sm text-signal-red font-mono">{error}</p>
            </div>
            {onRetry && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="w-full py-3 glassmorphism font-mono text-sm text-signal-red hover:bg-signal-red/10 transition-colors"
              >
                RETRY INITIALIZATION
              </motion.button>
            )}
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="absolute inset-y-0 left-0 bg-signal-red"
                style={{
                  boxShadow: '0 0 10px rgba(255, 42, 109, 0.8)',
                }}
              />
            </div>

            {/* Progress text */}
            <p className="text-center font-mono text-xs text-muted-foreground mb-6">
              {status || `${progress}%`}
            </p>

            {/* Status indicators */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <StatusIndicator 
                icon={<Wifi className="w-4 h-4" />}
                label="NETWORK"
                status="offline"
              />
              <StatusIndicator 
                icon={<Cpu className="w-4 h-4" />}
                label="WebGPU"
                status={progress > 10 ? 'active' : 'pending'}
              />
              <StatusIndicator 
                icon={<Shield className="w-4 h-4" />}
                label="PRIVACY"
                status="active"
              />
            </div>

            {/* Info text */}
            <p className="text-center text-[10px] text-muted-foreground mt-8 font-mono">
              First load downloads ~2GB model to browser cache.<br />
              Subsequent loads will be instant.
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
};

interface StatusIndicatorProps {
  icon: React.ReactNode;
  label: string;
  status: 'active' | 'pending' | 'offline';
}

const StatusIndicator = ({ icon, label, status }: StatusIndicatorProps) => {
  const getColor = () => {
    switch (status) {
      case 'active': return 'text-matrix-green';
      case 'pending': return 'text-amber-500';
      case 'offline': return 'text-signal-red';
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${getColor()} transition-colors`}>
        {icon}
      </div>
      <span className="font-mono text-[9px] text-muted-foreground">{label}</span>
      <motion.div
        animate={status === 'active' ? { opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'active' ? 'bg-matrix-green' :
          status === 'pending' ? 'bg-amber-500' :
          'bg-signal-red'
        }`}
      />
    </div>
  );
};

export default GhostModeLoader;
