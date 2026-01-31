
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface VisualTheme {
  primaryColor: string;
  suggestedBackgroundPrompt: string;
  fontVibe: string;
  emotionalTone: string;
}

export const getVisualThemeForVerse = async (verseText: string, translation: string): Promise<VisualTheme> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this Quranic verse and suggest a visual theme for a high-quality video edit.
    Arabic: ${verseText}
    Translation: ${translation}
    
    Provide suggestions for:
    - Emotional tone
    - A detailed prompt for a nature background image (Unsplash/Stock style)
    - Primary accent color (Hex)
    - Typography style (e.g., Elegant, Bold, Soft)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primaryColor: { type: Type.STRING },
          suggestedBackgroundPrompt: { type: Type.STRING },
          fontVibe: { type: Type.STRING },
          emotionalTone: { type: Type.STRING },
        },
        required: ["primaryColor", "suggestedBackgroundPrompt", "fontVibe", "emotionalTone"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};
