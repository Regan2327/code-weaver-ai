import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Trash2, Activity, AlertCircle, CheckCircle2, Wrench } from "lucide-react";
import { useSystemLogs, SystemLog } from "@/hooks/useSystemLogs";

interface WarRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

const getLogIcon = (type: SystemLog["type"]) => {
  switch (type) {
    case "info":
      return <Activity className="w-3 h-3" />;
    case "healing":
      return <Wrench className="w-3 h-3" />;
    case "error":
      return <AlertCircle className="w-3 h-3" />;
    case "success":
      return <CheckCircle2 className="w-3 h-3" />;
  }
};

const getLogColor = (type: SystemLog["type"]) => {
  switch (type) {
    case "info":
      return "text-neon-blue";
    case "healing":
      return "text-amber-500";
    case "error":
      return "text-signal-red";
    case "success":
      return "text-matrix-green";
  }
};

const getLogBgColor = (type: SystemLog["type"]) => {
  switch (type) {
    case "healing":
      return "bg-amber-500/10 border-amber-500/30";
    case "error":
      return "bg-signal-red/10 border-signal-red/30";
    case "success":
      return "bg-matrix-green/10 border-matrix-green/30";
    default:
      return "bg-transparent border-transparent";
  }
};

const WarRoom = ({ isOpen, onClose }: WarRoomProps) => {
  const { logs, isLoading, healingActive, clearLogs, refresh } = useSystemLogs(50);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", { hour12: false });
  };

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
            style={{ backgroundColor: "#000000" }}
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
                <span className="font-mono text-sm text-matrix-green ml-4">WAR_ROOM.exe</span>

                {/* Healing indicator */}
                {healingActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Wrench className="w-3 h-3 text-amber-500" />
                    </motion.div>
                    <span className="font-mono text-xs text-amber-500">SELF-HEALING</span>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={refresh}
                  className="p-2 rounded-lg text-matrix-green/60 hover:text-matrix-green hover:bg-matrix-green/10 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={clearLogs}
                  className="p-2 rounded-lg text-signal-red/60 hover:text-signal-red hover:bg-signal-red/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg text-matrix-green/60 hover:text-matrix-green hover:bg-matrix-green/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 h-full overflow-y-auto font-mono text-sm pb-32">
              {/* System Header */}
              <div className="mb-6 text-matrix-green/60">
                <p>╔══════════════════════════════════════════════════════════╗</p>
                <p>
                  ║ NEURODRIVE SYSTEM MONITOR v3.0{" "}
                  <span className={healingActive ? "text-amber-500" : "text-matrix-green"}>
                    [{healingActive ? "HEALING" : "ONLINE"}]
                  </span>{" "}
                  ║
                </p>
                <p>║ REFLEXION ARCHITECTURE: ACTIVE | TOOLS: 7 ║</p>
                <p>╚══════════════════════════════════════════════════════════╝</p>
              </div>

              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center gap-2 text-matrix-green/60">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  <span>Loading system logs...</span>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && logs.length === 0 && (
                <div className="text-matrix-green/40 text-center py-8">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No system logs yet.</p>
                  <p className="text-xs mt-1">Logs will appear here as the system operates.</p>
                </div>
              )}

              {/* Log entries */}
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={index === 0 ? { opacity: 0, x: -10, scale: 0.98 } : false}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className={`flex items-start gap-2 p-2 rounded border ${getLogBgColor(log.type)}`}
                  >
                    <span className="text-matrix-green/50 shrink-0">[{formatTime(log.created_at)}]</span>
                    <span className={`shrink-0 flex items-center gap-1 ${getLogColor(log.type)}`}>
                      {getLogIcon(log.type)}
                      <span className="uppercase text-xs">[{log.type}]</span>
                    </span>
                    {log.tool_name && (
                      <span className="text-purple-400 shrink-0">[{log.tool_name}]</span>
                    )}
                    {log.backup_tool && (
                      <>
                        <span className="text-amber-500">→</span>
                        <span className="text-amber-400 shrink-0">[{log.backup_tool}]</span>
                      </>
                    )}
                    <span className="text-matrix-green/30">&gt;</span>
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </motion.div>
                ))}
              </div>

              {/* Command prompt */}
              <div className="mt-8 flex items-center gap-2 text-matrix-green">
                <span className="text-neon-blue">neuro@reflexion</span>
                <span className="text-matrix-green/50">:</span>
                <span className="text-matrix-green">~$</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="ml-1"
                >
                  █
                </motion.span>
              </div>
            </div>

            {/* Scan line effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ y: ["-100%", "100%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-matrix-green/5 to-transparent"
              />
            </div>

            {/* CRT effect lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 157, 0.03) 2px, rgba(0, 255, 157, 0.03) 4px)",
              }}
            />

            {/* Healing overlay effect */}
            <AnimatePresence>
              {healingActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.1) 0%, transparent 70%)",
                  }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WarRoom;
