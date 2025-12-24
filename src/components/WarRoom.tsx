import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Cpu, Database, Wifi, AlertTriangle } from "lucide-react";

interface WarRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

const WarRoom = ({ isOpen, onClose }: WarRoomProps) => {
  const systemLogs = [
    { time: "14:32:01", message: "Neural pathway optimized", type: "success" },
    { time: "14:31:58", message: "Memory sync complete", type: "info" },
    { time: "14:31:45", message: "External API latency detected", type: "warning" },
    { time: "14:31:30", message: "Context window: 87% capacity", type: "info" },
    { time: "14:31:15", message: "Voice module initialized", type: "success" },
  ];

  const metrics = [
    { label: "CPU", value: "23%", icon: Cpu },
    { label: "MEMORY", value: "4.2GB", icon: Database },
    { label: "LATENCY", value: "12ms", icon: Wifi },
    { label: "UPTIME", value: "99.9%", icon: Activity },
  ];

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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass border-l border-border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-matrix-green animate-pulse" />
                <h2 className="font-display font-semibold text-lg">WAR ROOM</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Metrics Grid */}
            <div className="p-4 border-b border-border">
              <h3 className="text-xs font-mono text-muted-foreground mb-3">SYSTEM METRICS</h3>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-xl p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <metric.icon className="w-4 h-4 text-neon-blue" />
                      <span className="text-xs font-mono text-muted-foreground">{metric.label}</span>
                    </div>
                    <span className="text-lg font-mono text-neon-blue text-glow-blue">{metric.value}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* System Logs */}
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-xs font-mono text-muted-foreground mb-3">SYSTEM LOGS</h3>
              <div className="space-y-2">
                {systemLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="glass rounded-lg p-3 flex items-start gap-3"
                  >
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {log.time}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {log.type === 'warning' && (
                          <AlertTriangle className="w-3 h-3 text-signal-red" />
                        )}
                        <span className={`text-sm font-mono ${
                          log.type === 'success' ? 'text-matrix-green' :
                          log.type === 'warning' ? 'text-signal-red' :
                          'text-foreground/80'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 animate-scan-line bg-gradient-to-b from-transparent via-neon-blue/5 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WarRoom;
