import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSpeechSynthesis } from './useSpeechSynthesis';

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  sentiment?: 'urgent' | 'success' | 'calm' | 'neutral';
  timestamp: Date;
}

type OrbStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface UseNeuroDriveChatOptions {
  voiceEnabled?: boolean;
}

export const useNeuroDriveChat = (options: UseNeuroDriveChatOptions = {}) => {
  const { voiceEnabled = true } = options;
  
  const pendingSpeechRef = useRef<string | null>(null);
  
  const { speak, stop: stopSpeaking, isSpeaking, isSupported: isSpeechSupported } = useSpeechSynthesis({
    rate: 1.0,
    pitch: 1.0,
    onStart: () => setOrbStatus('speaking'),
    onEnd: () => setOrbStatus('idle'),
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "NeuroDrive online. All systems nominal. How may I assist you today?",
      isUser: false,
      sentiment: 'calm',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [orbStatus, setOrbStatus] = useState<OrbStatus>('idle');

  const analyzeSentiment = (text: string): 'urgent' | 'success' | 'calm' | 'neutral' => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('urgent') || lowerText.includes('error') || lowerText.includes('fail') || lowerText.includes('critical')) {
      return 'urgent';
    }
    if (lowerText.includes('success') || lowerText.includes('complete') || lowerText.includes('done') || lowerText.includes('booked') || lowerText.includes('confirmed')) {
      return 'success';
    }
    if (lowerText.includes('option') || lowerText.includes('recommend') || lowerText.includes('suggest')) {
      return 'calm';
    }
    return 'neutral';
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setOrbStatus('processing');

    // Build message history for context
    const messageHistory = messages.map(msg => ({
      role: msg.isUser ? 'user' as const : 'assistant' as const,
      content: msg.content,
    }));
    messageHistory.push({ role: 'user', content });

    let assistantContent = '';
    const assistantId = (Date.now() + 1).toString();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: messageHistory }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      setOrbStatus('speaking');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Create initial assistant message
      setMessages(prev => [...prev, {
        id: assistantId,
        content: '',
        isUser: false,
        sentiment: 'neutral',
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) {
              assistantContent += deltaContent;
              const sentiment = analyzeSentiment(assistantContent);
              
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantId 
                    ? { ...msg, content: assistantContent, sentiment }
                    : msg
                )
              );
            }
          } catch {
            // Incomplete JSON, put it back
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final sentiment analysis and speak the response
      const finalSentiment = analyzeSentiment(assistantContent);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantId 
            ? { ...msg, sentiment: finalSentiment }
            : msg
        )
      );

      // Speak the complete response if voice is enabled
      if (voiceEnabled && isSpeechSupported && assistantContent.trim()) {
        pendingSpeechRef.current = assistantContent;
      }

    } catch (error) {
      console.error('Chat error:', error);
      setOrbStatus('error');
      
      setMessages(prev => [...prev, {
        id: assistantId,
        content: error instanceof Error ? error.message : 'Connection interrupted. Reconnecting...',
        isUser: false,
        sentiment: 'urgent',
        timestamp: new Date(),
      }]);

      // Reset error state after 2 seconds
      setTimeout(() => setOrbStatus('idle'), 2000);
    } finally {
      setIsLoading(false);
      
      // Speak pending content after loading completes
      if (pendingSpeechRef.current) {
        speak(pendingSpeechRef.current);
        pendingSpeechRef.current = null;
      } else if (orbStatus !== 'error') {
        setOrbStatus('idle');
      }
    }
  }, [messages, isLoading, orbStatus, voiceEnabled, isSpeechSupported, speak]);

  // Toggle voice output
  const toggleVoice = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
  }, [isSpeaking, stopSpeaking]);

  return {
    messages,
    sendMessage,
    isLoading,
    orbStatus,
    setOrbStatus,
    isSpeaking,
    isSpeechSupported,
    stopSpeaking,
    toggleVoice,
  };
};
