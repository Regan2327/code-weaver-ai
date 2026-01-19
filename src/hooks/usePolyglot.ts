import { useState, useCallback, useRef } from "react";

// Language detection patterns
const languagePatterns: Record<string, RegExp[]> = {
  en: [
    /\b(the|is|are|was|were|have|has|will|would|could|should|what|where|when|how|why|who|this|that|these|those|from|to|for|with|about)\b/i,
    /\b(hello|hi|hey|please|thank|thanks|yes|no|maybe|okay|ok|sure|good|great|nice)\b/i,
  ],
  es: [
    /\b(el|la|los|las|un|una|es|son|está|están|fue|fueron|hola|gracias|por favor|qué|cómo|cuándo|dónde|quién)\b/i,
    /\b(bueno|malo|bien|muy|más|menos|también|pero|porque|cuando|donde)\b/i,
  ],
  fr: [
    /\b(le|la|les|un|une|est|sont|était|étaient|bonjour|merci|s'il vous plaît|quoi|comment|quand|où|qui)\b/i,
    /\b(bon|mauvais|bien|très|plus|moins|aussi|mais|parce que|oui|non)\b/i,
  ],
  de: [
    /\b(der|die|das|ein|eine|ist|sind|war|waren|hallo|danke|bitte|was|wie|wann|wo|wer)\b/i,
    /\b(gut|schlecht|sehr|mehr|weniger|auch|aber|weil|ja|nein)\b/i,
  ],
  hi: [
    /[\u0900-\u097F]/,  // Devanagari script
    /\b(namaste|dhanyavaad|haan|nahi|kya|kaise|kab|kahan|kyun|kaun)\b/i,
  ],
  ja: [
    /[\u3040-\u309F\u30A0-\u30FF]/,  // Hiragana and Katakana
    /[\u4E00-\u9FAF]/,  // Kanji
  ],
  zh: [
    /[\u4E00-\u9FFF]/,  // Chinese characters
  ],
  ar: [
    /[\u0600-\u06FF]/,  // Arabic script
  ],
  pt: [
    /\b(o|a|os|as|um|uma|é|são|foi|foram|olá|obrigado|por favor|que|como|quando|onde|quem)\b/i,
    /\b(bom|mau|bem|muito|mais|menos|também|mas|porque|sim|não)\b/i,
  ],
  ru: [
    /[\u0400-\u04FF]/,  // Cyrillic script
  ],
};

// Voice language codes for Web Speech API
const languageVoiceCodes: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  hi: "hi-IN",
  ja: "ja-JP",
  zh: "zh-CN",
  ar: "ar-SA",
  pt: "pt-BR",
  ru: "ru-RU",
};

// Language display names
const languageNames: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  hi: "Hindi",
  ja: "Japanese",
  zh: "Chinese",
  ar: "Arabic",
  pt: "Portuguese",
  ru: "Russian",
};

export interface DetectedLanguage {
  code: string;
  name: string;
  voiceCode: string;
  confidence: number;
}

export function usePolyglot() {
  const [currentLanguage, setCurrentLanguage] = useState<DetectedLanguage>({
    code: "en",
    name: "English",
    voiceCode: "en-US",
    confidence: 1,
  });
  const [isAutoDetect, setIsAutoDetect] = useState(true);
  const lastDetectionRef = useRef<string>("en");

  // Detect language from text
  const detectLanguage = useCallback((text: string): DetectedLanguage => {
    if (!text || text.trim().length < 3) {
      return currentLanguage;
    }

    const scores: Record<string, number> = {};
    const normalizedText = text.toLowerCase();

    // Score each language
    for (const [lang, patterns] of Object.entries(languagePatterns)) {
      scores[lang] = 0;
      for (const pattern of patterns) {
        const matches = normalizedText.match(pattern);
        if (matches) {
          scores[lang] += matches.length;
        }
      }
    }

    // Find the best match
    let bestLang = "en";
    let bestScore = 0;
    for (const [lang, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestLang = lang;
      }
    }

    // Calculate confidence (0-1)
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalScore > 0 ? bestScore / totalScore : 0.5;

    // Only switch if confidence is high enough and it's different
    if (confidence < 0.3 || bestScore < 2) {
      bestLang = lastDetectionRef.current;
    }

    lastDetectionRef.current = bestLang;

    const detected: DetectedLanguage = {
      code: bestLang,
      name: languageNames[bestLang] || "Unknown",
      voiceCode: languageVoiceCodes[bestLang] || "en-US",
      confidence,
    };

    if (isAutoDetect) {
      setCurrentLanguage(detected);
    }

    return detected;
  }, [currentLanguage, isAutoDetect]);

  // Manually set language
  const setLanguage = useCallback((langCode: string) => {
    const language: DetectedLanguage = {
      code: langCode,
      name: languageNames[langCode] || "Unknown",
      voiceCode: languageVoiceCodes[langCode] || "en-US",
      confidence: 1,
    };
    setCurrentLanguage(language);
    lastDetectionRef.current = langCode;
  }, []);

  // Get appropriate voice for language
  const getVoiceForLanguage = useCallback(
    (voices: SpeechSynthesisVoice[], langCode?: string): SpeechSynthesisVoice | null => {
      const targetCode = langCode || currentLanguage.voiceCode;
      const baseCode = targetCode.split("-")[0];

      // Try exact match first
      let voice = voices.find((v) => v.lang === targetCode);
      if (voice) return voice;

      // Try base language match
      voice = voices.find((v) => v.lang.startsWith(baseCode));
      if (voice) return voice;

      // Fallback to English
      voice = voices.find((v) => v.lang.startsWith("en"));
      return voice || null;
    },
    [currentLanguage.voiceCode]
  );

  // Get all supported languages
  const getSupportedLanguages = useCallback(() => {
    return Object.entries(languageNames).map(([code, name]) => ({
      code,
      name,
      voiceCode: languageVoiceCodes[code],
    }));
  }, []);

  return {
    currentLanguage,
    detectLanguage,
    setLanguage,
    getVoiceForLanguage,
    getSupportedLanguages,
    isAutoDetect,
    setIsAutoDetect,
  };
}
