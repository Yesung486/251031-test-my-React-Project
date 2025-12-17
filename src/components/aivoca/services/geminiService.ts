
import { Word } from "../types";
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";

// Initialize AI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Cache Systems ---
const audioCache = new Map<string, Uint8Array>();
const validationCache = new Map<string, { isCorrect: boolean; explanation: string }>();
const audioPendingPromises = new Map<string, Promise<Uint8Array | null>>();

// --- Helper: Check for Quota Error ---
const isQuotaError = (error: any): boolean => {
  return (
    error.message?.includes('429') || 
    error.status === 429 || 
    error.code === 429 || 
    error.message?.toLowerCase().includes('quota') || 
    error.message?.toLowerCase().includes('resource_exhausted')
  );
};

// --- Helper: Retry with Exponential Backoff ---
async function retryWithBackoff<T>(operation: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = isQuotaError(error);
      const isServerOverload = error.status === 503 || error.status === 500 || error.message?.includes('Rpc failed');

      if ((isRateLimit || isServerOverload) && i < retries - 1) {
        // Silent retry for rate limits or temporary server errors
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const generateWordData = async (rawText: string): Promise<Word[]> => {
  // Normalize newlines
  const lines = rawText.split(/[\n\r]+/);
  const words: Word[] = [];

  // Helper to create a word object
  const createWord = (term: string, def: string): Word => ({
    id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    term: term.trim(),
    definition: def.trim(),
    exampleSentence: '', // No AI initially
    exampleTranslation: '', // No AI initially
    tags: ['Direct Input'],
    masteryLevel: 0,
    incorrectCount: 0,
    userNote: '',
    isFavorite: false
  });

  lines.forEach((line) => {
    if (!line.trim()) return;

    // STRATEGY 1: Tab-separated pairs (Common in Excel/Copy-paste)
    const tabParts = line.split('\t').map(p => p.trim()).filter(p => p !== '');
    
    if (tabParts.length >= 2 && tabParts.length % 2 === 0) {
      for (let i = 0; i < tabParts.length; i += 2) {
        words.push(createWord(tabParts[i], tabParts[i+1]));
      }
      return; 
    }

    // STRATEGY 2: Multi-space separated pairs
    const spaceParts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p !== '');
    if (spaceParts.length >= 2 && spaceParts.length % 2 === 0) {
      for (let i = 0; i < spaceParts.length; i += 2) {
        words.push(createWord(spaceParts[i], spaceParts[i+1]));
      }
      return; 
    }

    // STRATEGY 3: Single Pair Handling
    let term = '';
    let definition = '';

    const koreanMatchIndex = line.search(/[가-힣]/);
    
    if (koreanMatchIndex > 0) {
        term = line.substring(0, koreanMatchIndex).trim();
        definition = line.substring(koreanMatchIndex).trim();
    } else {
        const separatorMatch = line.match(/[:=-]/);
        if (separatorMatch) {
             const parts = line.split(separatorMatch[0]);
             term = parts[0];
             definition = parts.slice(1).join(separatorMatch[0]);
        } else {
             if (line.includes('\t')) {
                const parts = line.split('\t');
                term = parts[0];
                definition = parts.slice(1).join(', ');
             } else {
                const firstSpace = line.indexOf(' ');
                if (firstSpace > 0) {
                    term = line.substring(0, firstSpace);
                    definition = line.substring(firstSpace + 1);
                } else {
                    term = line;
                    definition = '???'; 
                }
             }
        }
    }

    if (term && definition) {
        words.push(createWord(term, definition));
    }
  });

  return words;
};

export const getFeedbackAnalysis = async (words: Word[]) => {
  return "학습 데이터가 쌓이면 분석이 제공됩니다.";
};

/**
 * Validates if the user's answer is semantically correct using AI.
 * Now returns an object with details. Includes Caching.
 */
export const validateAnswerWithAI = async (term: string, definition: string, userAnswer: string): Promise<{ isCorrect: boolean; explanation: string }> => {
  const cacheKey = `${term}|${userAnswer}`;
  if (validationCache.has(cacheKey)) {
      return validationCache.get(cacheKey)!;
  }

  try {
    const response = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a strict but reasonable language teacher grading a vocabulary quiz.
        
        Task: Assess if the [User Answer] is correct for the given [Word] and [Reference Definition].

        Word: "${term}"
        Reference Definition: "${definition}"
        User Answer: "${userAnswer}"

        Grading Rules:
        1. **Strict Homonym Check**: 
           - Distinctly differentiate words with similar spellings or sounds but different meanings.
        2. **Partial Credit for Lists**: 
           - If the User Answer contains multiple meanings, mark it **CORRECT** if **AT LEAST ONE** meaning is valid.
        3. **Polysemy**: Accept valid alternate meanings.
        4. **Grammar**: Ignore minor typos.
        
        Output:
        - isCorrect: boolean
        - explanation: A short, helpful sentence in Korean explaining the judgment. 

        Respond strictly in JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING }
          }
        }
      }
    }));

    const responseText = response.text;
    if (!responseText) throw new Error("No response text from AI");

    const result = JSON.parse(responseText);
    const finalResult = { 
        isCorrect: result.isCorrect, 
        explanation: result.explanation || (result.isCorrect ? "정답입니다." : "의미가 다릅니다.") 
    };
    
    validationCache.set(cacheKey, finalResult);
    return finalResult;

  } catch (error: any) {
    if (isQuotaError(error)) {
        // Silent fallback for quota errors
        return { isCorrect: false, explanation: "AI 할당량 초과로 정밀 채점을 건너뜁니다." };
    }
    console.warn("AI Validation Warning:", error.message);
    return { isCorrect: false, explanation: "AI 서버 연결 불안정으로 오답 처리되었습니다." };
  }
};

/**
 * Generates natural TTS audio using Gemini.
 * Returns raw PCM Uint8Array.
 * Includes Caching and Promise Deduplication.
 */
export const generatePronunciation = async (text: string): Promise<Uint8Array | null> => {
  const normalizedText = text.trim().toLowerCase();
  
  // 1. Check Cache
  if (audioCache.has(normalizedText)) {
    return audioCache.get(normalizedText)!;
  }

  // 2. Check Pending Requests (Deduplication)
  if (audioPendingPromises.has(normalizedText)) {
      return audioPendingPromises.get(normalizedText)!;
  }

  // 3. Create New Request
  const promise = (async () => {
      try {
        const response = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: { parts: [{ text: text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' } // 'Kore' provides a natural, somewhat deeper voice.
                    }
                }
            }
        }));

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return null;

        // Base64 decoding manually
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        audioCache.set(normalizedText, bytes);
        return bytes;
      } catch (e: any) {
          // Gracefully handle ALL errors (429, 500, network) by returning null.
          // This triggers the native browser TTS fallback in the UI components.
          // We use console.warn instead of error to reduce alarm.
          console.warn(`TTS Generation Failed (using fallback): ${e.message || 'Unknown Error'}`);
          return null;
      } finally {
          audioPendingPromises.delete(normalizedText);
      }
  })();

  audioPendingPromises.set(normalizedText, promise);
  return promise;
};

/**
 * Generates an example sentence for a word using Gemini.
 */
export const generateExample = async (term: string, definition: string): Promise<{ sentence: string; translation: string }> => {
    try {
        const response = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                Create a simple, modern English example sentence for the word "${term}" (meaning: ${definition}).
                The sentence should be relevant to daily life or middle school context.
                Also provide a Korean translation.
                
                Respond in JSON:
                {
                    "sentence": "English sentence",
                    "translation": "Korean translation"
                }
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentence: { type: Type.STRING },
                        translation: { type: Type.STRING }
                    }
                }
            }
        }));

        const responseText = response.text;
        if (!responseText) return { sentence: "", translation: "" };

        const result = JSON.parse(responseText);
        return { sentence: result.sentence, translation: result.translation };
    } catch (e: any) {
        if (isQuotaError(e)) {
            // Silent fallback
            return { sentence: "", translation: "" };
        }
        console.warn("Example generation failed (silent fallback):", e.message);
        return { sentence: "", translation: "" };
    }
};
