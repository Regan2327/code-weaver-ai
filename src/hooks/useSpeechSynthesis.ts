import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechSynthesisOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export const useSpeechSynthesis = (options: UseSpeechSynthesisOptions = {}) => {
  const {
    voice: preferredVoice,
    rate = 1,
    pitch = 1,
    volume = 1,
    onStart,
    onEnd,
    onError,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Find preferred voice or use a good default
        if (availableVoices.length > 0) {
          let selectedVoice = availableVoices.find(v => 
            v.name.toLowerCase().includes(preferredVoice?.toLowerCase() || '')
          );

          // Fallback to English voices with natural-sounding names
          if (!selectedVoice) {
            selectedVoice = availableVoices.find(v => 
              v.lang.startsWith('en') && 
              (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Enhanced'))
            );
          }

          // Final fallback to any English voice
          if (!selectedVoice) {
            selectedVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
          }

          setCurrentVoice(selectedVoice);
        }
      };

      // Voices may be loaded asynchronously
      loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [preferredVoice]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    if (currentVoice) {
      utterance.voice = currentVoice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      onError?.(event.error);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, currentVoice, rate, pitch, volume, onStart, onEnd, onError]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume();
    }
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    voices,
    currentVoice,
    setCurrentVoice,
    speak,
    stop,
    pause,
    resume,
  };
};
