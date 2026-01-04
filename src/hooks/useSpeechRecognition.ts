import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: {
    isFinal: boolean;
    [index: number]: {
      transcript: string;
      confidence: number;
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const {
    onResult,
    onError,
    onEnd,
    continuous = false,
    interimResults = true,
    language = 'en-US',
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      console.log('[SpeechRecognition] Started listening');
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += text;
        } else {
          currentInterim += text;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        onResult?.({ transcript: finalTranscript, isFinal: true });
      }
      
      setInterimTranscript(currentInterim);
      
      if (currentInterim) {
        onResult?.({ transcript: currentInterim, isFinal: false });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[SpeechRecognition] Error:', event.error);
      setIsListening(false);
      
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition aborted.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }
      
      onError?.(errorMessage);
    };

    recognition.onend = () => {
      console.log('[SpeechRecognition] Stopped listening');
      setIsListening(false);
      setInterimTranscript('');
      onEnd?.();
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [continuous, interimResults, language, onResult, onError, onEnd]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      onError?.('Speech recognition not available');
      return;
    }

    setTranscript('');
    setInterimTranscript('');
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('[SpeechRecognition] Failed to start:', error);
      // Recognition might already be running
      if (error instanceof Error && error.message.includes('already started')) {
        recognitionRef.current.stop();
      }
    }
  }, [onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
  };
};
