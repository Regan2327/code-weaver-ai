import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  rate: number;
  onRateChange: (rate: number) => void;
  pitch: number;
  onPitchChange: (pitch: number) => void;
  onTestVoice: () => void;
}

const VoiceSettings = ({
  isOpen,
  onClose,
  voices,
  currentVoice,
  onVoiceChange,
  rate,
  onRateChange,
  pitch,
  onPitchChange,
  onTestVoice,
}: VoiceSettingsProps) => {
  // Group voices by language
  const groupedVoices = voices.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0].toUpperCase();
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, SpeechSynthesisVoice[]>);

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
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50"
          >
            <div className="glass rounded-2xl p-6 border border-border/50">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-neon-blue" />
                  <h3 className="font-mono text-sm font-semibold text-foreground">
                    VOICE SETTINGS
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Voice Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-muted-foreground">
                    VOICE
                  </Label>
                  <Select
                    value={currentVoice?.name || ''}
                    onValueChange={(name) => {
                      const voice = voices.find(v => v.name === name);
                      if (voice) onVoiceChange(voice);
                    }}
                  >
                    <SelectTrigger className="glass border-border/50 font-mono text-sm">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent className="glass border-border/50 max-h-60">
                      {Object.entries(groupedVoices).map(([lang, langVoices]) => (
                        <div key={lang}>
                          <div className="px-2 py-1 text-[10px] font-mono text-muted-foreground/60">
                            {lang}
                          </div>
                          {langVoices.map((voice) => (
                            <SelectItem 
                              key={voice.name} 
                              value={voice.name}
                              className="font-mono text-sm"
                            >
                              {voice.name.replace(/^(Microsoft|Google) /, '')}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Speech Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-xs text-muted-foreground">
                      SPEED
                    </Label>
                    <span className="font-mono text-xs text-neon-blue">
                      {rate.toFixed(1)}x
                    </span>
                  </div>
                  <Slider
                    value={[rate]}
                    onValueChange={([value]) => onRateChange(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
                    <span>SLOW</span>
                    <span>FAST</span>
                  </div>
                </div>

                {/* Pitch */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-mono text-xs text-muted-foreground">
                      PITCH
                    </Label>
                    <span className="font-mono text-xs text-neon-blue">
                      {pitch.toFixed(1)}
                    </span>
                  </div>
                  <Slider
                    value={[pitch]}
                    onValueChange={([value]) => onPitchChange(value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
                    <span>LOW</span>
                    <span>HIGH</span>
                  </div>
                </div>

                {/* Test Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onTestVoice}
                  className="w-full mt-4 py-3 rounded-xl glass border border-neon-blue/30 text-neon-blue font-mono text-sm hover:bg-neon-blue/10 transition-colors"
                >
                  TEST VOICE
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VoiceSettings;
