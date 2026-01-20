import { useState, useCallback, useRef, useEffect } from 'react';

// WebLLM types (simplified for compatibility)
interface ChatCompletionMessageParam {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GhostBrainState {
  isInitialized: boolean;
  isLoading: boolean;
  loadProgress: number;
  loadingStatus: string;
  error: string | null;
}

// Model configuration - using smaller models for faster loading
const GHOST_MODEL = 'Phi-3-mini-4k-instruct-q4f16_1-MLC';

export const useGhostBrain = () => {
  const [state, setState] = useState<GhostBrainState>({
    isInitialized: false,
    isLoading: false,
    loadProgress: 0,
    loadingStatus: '',
    error: null,
  });

  const engineRef = useRef<any>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize the local LLM engine
  const init = useCallback(async () => {
    if (state.isInitialized || state.isLoading || initPromiseRef.current) {
      return initPromiseRef.current;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, loadProgress: 0 }));

    initPromiseRef.current = (async () => {
      try {
        // Dynamically import WebLLM to avoid SSR issues
        const webllm = await import('@mlc-ai/web-llm');
        
        setState(prev => ({ ...prev, loadingStatus: 'Initializing WebGPU...' }));

        // Check WebGPU support
        if (!(navigator as any).gpu) {
          throw new Error('WebGPU not supported. Ghost Mode requires a modern browser with WebGPU enabled.');
        }

        const engine = await webllm.CreateMLCEngine(GHOST_MODEL, {
          initProgressCallback: (progress) => {
            const percent = Math.round(progress.progress * 100);
            setState(prev => ({
              ...prev,
              loadProgress: percent,
              loadingStatus: progress.text || `Downloading model: ${percent}%`,
            }));
          },
        });

        engineRef.current = engine;
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          loadProgress: 100,
          loadingStatus: 'Ghost Brain ready',
        }));

        console.log('[GhostBrain] Local LLM initialized successfully');
      } catch (error) {
        console.error('[GhostBrain] Initialization failed:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize Ghost Brain',
        }));
        initPromiseRef.current = null;
        throw error;
      }
    })();

    return initPromiseRef.current;
  }, [state.isInitialized, state.isLoading]);

  // Chat with the local model
  const chat = useCallback(async (
    messages: ChatCompletionMessageParam[],
    onToken?: (token: string) => void
  ): Promise<string> => {
    if (!engineRef.current) {
      throw new Error('Ghost Brain not initialized. Call init() first.');
    }

    try {
      // Add NeuroDrive system prompt
      const systemMessage: ChatCompletionMessageParam = {
        role: 'system',
        content: `You are NeuroDrive Ghost Mode - an AI assistant running entirely locally on the user's device. 
No data leaves this device. You are privacy-focused and direct.
Respond concisely. You have limited context due to running locally.
Current mode: GHOST (Air-Gapped, Zero-Knowledge)`,
      };

      const fullMessages = [systemMessage, ...messages];

      if (onToken) {
        // Streaming response
        let fullResponse = '';
        const asyncChunkGenerator = await engineRef.current.chat.completions.create({
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 512,
          stream: true,
        });

        for await (const chunk of asyncChunkGenerator) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            onToken(content);
          }
        }

        return fullResponse;
      } else {
        // Non-streaming response
        const response = await engineRef.current.chat.completions.create({
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 512,
        });

        return response.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('[GhostBrain] Chat error:', error);
      throw error;
    }
  }, []);

  // Reset the engine (for new conversations)
  const reset = useCallback(async () => {
    if (engineRef.current) {
      await engineRef.current.resetChat();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.unload?.();
      }
    };
  }, []);

  return {
    ...state,
    init,
    chat,
    reset,
    modelName: GHOST_MODEL,
  };
};
