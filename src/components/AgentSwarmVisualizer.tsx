import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calculator, Plane, Code, Brain, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

interface Agent {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  angle: number;
}

interface AgentSwarmVisualizerProps {
  activeAgent?: string | null;
  isVisible: boolean;
  logs?: string[];
}

const AGENTS: Agent[] = [
  { id: 'search', name: 'Search', icon: <Search className="w-4 h-4" />, color: 'rgba(0, 243, 255, 0.8)', angle: 0 },
  { id: 'calculator', name: 'Calculator', icon: <Calculator className="w-4 h-4" />, color: 'rgba(168, 85, 247, 0.8)', angle: 90 },
  { id: 'travel', name: 'Travel', icon: <Plane className="w-4 h-4" />, color: 'rgba(5, 213, 250, 0.8)', angle: 180 },
  { id: 'code', name: 'Code', icon: <Code className="w-4 h-4" />, color: 'rgba(0, 255, 135, 0.8)', angle: 270 },
];

const ORBIT_RADIUS = 100;
const CENTER_SIZE = 50;
const AGENT_SIZE = 36;

const AgentSwarmVisualizer = ({ activeAgent, isVisible, logs = [] }: AgentSwarmVisualizerProps) => {
  // Calculate agent positions
  const agentPositions = useMemo(() => {
    return AGENTS.map(agent => {
      const radians = (agent.angle * Math.PI) / 180;
      return {
        ...agent,
        x: Math.cos(radians) * ORBIT_RADIUS,
        y: Math.sin(radians) * ORBIT_RADIUS,
      };
    });
  }, []);

  const activeAgentData = agentPositions.find(a => a.id === activeAgent);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Radar Container */}
          <div 
            className="relative"
            style={{ 
              width: ORBIT_RADIUS * 2 + AGENT_SIZE * 2,
              height: ORBIT_RADIUS * 2 + AGENT_SIZE * 2,
            }}
          >
            {/* Orbit ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="rounded-full border border-neon-blue/20"
                style={{ 
                  width: ORBIT_RADIUS * 2,
                  height: ORBIT_RADIUS * 2,
                }}
              />
            </motion.div>

            {/* Secondary orbit ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="rounded-full border border-neon-blue/10"
                style={{ 
                  width: ORBIT_RADIUS * 2 + 40,
                  height: ORBIT_RADIUS * 2 + 40,
                }}
              />
            </motion.div>

            {/* SVG for connection lines */}
            <svg 
              className="absolute inset-0 pointer-events-none"
              style={{ 
                width: ORBIT_RADIUS * 2 + AGENT_SIZE * 2,
                height: ORBIT_RADIUS * 2 + AGENT_SIZE * 2,
              }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Connection lines from center to each agent */}
              {agentPositions.map(agent => {
                const centerX = ORBIT_RADIUS + AGENT_SIZE;
                const centerY = ORBIT_RADIUS + AGENT_SIZE;
                const agentX = centerX + agent.x;
                const agentY = centerY + agent.y;
                const isActive = agent.id === activeAgent;

                return (
                  <g key={agent.id}>
                    {/* Line */}
                    <motion.line
                      x1={centerX}
                      y1={centerY}
                      x2={agentX}
                      y2={agentY}
                      stroke={isActive ? agent.color : 'rgba(0, 243, 255, 0.2)'}
                      strokeWidth={isActive ? 2 : 1}
                      filter={isActive ? 'url(#glow)' : undefined}
                      animate={{
                        opacity: isActive ? [0.8, 1, 0.8] : 0.3,
                      }}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                    />

                    {/* Traveling particle */}
                    {isActive && (
                      <motion.circle
                        r={4}
                        fill={agent.color}
                        filter="url(#glow)"
                        initial={{ 
                          cx: centerX, 
                          cy: centerY,
                          opacity: 0 
                        }}
                        animate={{
                          cx: [centerX, agentX, centerX],
                          cy: [centerY, agentY, centerY],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Central Orchestrator Node */}
            <motion.div
              animate={{
                scale: activeAgent ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 1, repeat: activeAgent ? Infinity : 0 }}
              className="absolute flex items-center justify-center"
              style={{
                width: CENTER_SIZE,
                height: CENTER_SIZE,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div 
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(0, 243, 255, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%)',
                  border: '2px solid rgba(0, 243, 255, 0.6)',
                  boxShadow: '0 0 20px rgba(0, 243, 255, 0.4), inset 0 0 20px rgba(0, 243, 255, 0.2)',
                }}
              >
                <motion.div
                  animate={{ rotate: activeAgent ? 360 : 0 }}
                  transition={{ duration: 2, repeat: activeAgent ? Infinity : 0, ease: 'linear' }}
                >
                  <Brain className="w-6 h-6 text-neon-blue" />
                </motion.div>
              </div>

              {/* Orchestrator label */}
              <span className="absolute -bottom-6 font-mono text-[9px] text-neon-blue/80 whitespace-nowrap">
                ORCHESTRATOR
              </span>
            </motion.div>

            {/* Agent Nodes */}
            {agentPositions.map(agent => {
              const isActive = agent.id === activeAgent;
              
              return (
                <motion.div
                  key={agent.id}
                  className="absolute flex items-center justify-center"
                  style={{
                    width: AGENT_SIZE,
                    height: AGENT_SIZE,
                    left: `calc(50% + ${agent.x}px)`,
                    top: `calc(50% + ${agent.y}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={isActive ? {
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                >
                  <div 
                    className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'shadow-lg' : ''
                    }`}
                    style={{
                      background: isActive 
                        ? `radial-gradient(circle, ${agent.color.replace('0.8', '0.4')} 0%, rgba(0, 0, 0, 0.8) 100%)`
                        : 'rgba(0, 0, 0, 0.6)',
                      border: `2px solid ${isActive ? agent.color : 'rgba(255, 255, 255, 0.1)'}`,
                      boxShadow: isActive 
                        ? `0 0 20px ${agent.color}, inset 0 0 10px ${agent.color.replace('0.8', '0.3')}`
                        : 'none',
                    }}
                  >
                    <motion.div
                      animate={isActive ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 1, repeat: isActive ? Infinity : 0, ease: 'linear' }}
                      style={{ color: isActive ? agent.color : 'rgba(255, 255, 255, 0.4)' }}
                    >
                      {agent.icon}
                    </motion.div>
                  </div>

                  {/* Agent label */}
                  <span 
                    className={`absolute font-mono text-[9px] whitespace-nowrap transition-colors ${
                      isActive ? 'opacity-100' : 'opacity-50'
                    }`}
                    style={{
                      color: isActive ? agent.color : 'rgba(255, 255, 255, 0.5)',
                      top: agent.angle === 0 ? '50%' : agent.angle === 180 ? '50%' : agent.angle < 180 ? 'auto' : 'auto',
                      bottom: agent.angle > 90 && agent.angle < 270 ? '-20px' : agent.angle === 0 || agent.angle === 180 ? 'auto' : '-20px',
                      left: agent.angle === 0 ? 'calc(100% + 8px)' : agent.angle === 180 ? 'auto' : '50%',
                      right: agent.angle === 180 ? 'calc(100% + 8px)' : 'auto',
                      transform: agent.angle === 0 || agent.angle === 180 ? 'translateY(-50%)' : 'translateX(-50%)',
                    }}
                  >
                    {agent.name.toUpperCase()}
                  </span>

                  {/* Active sparkle */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="w-3 h-3" style={{ color: agent.color }} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Log display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xs px-4"
          >
            <div className="glassmorphism p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-matrix-green animate-pulse" />
                <span className="font-mono text-[10px] text-muted-foreground">SWARM LOG</span>
              </div>
              
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.slice(-3).map((log, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="font-mono text-[10px] text-neon-blue/80"
                    >
                      {log}
                    </motion.p>
                  ))
                ) : (
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {activeAgent 
                      ? `Orchestrator delegating to ${activeAgentData?.name || activeAgent}...`
                      : 'Awaiting task delegation...'
                    }
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentSwarmVisualizer;
