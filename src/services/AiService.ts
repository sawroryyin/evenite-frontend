import { GoogleGenerativeAI } from '@google/generative-ai';
import type { EventData } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const AiService = {

  // Translates a raw prompt into structured EventData JSON
  async generateEventFromPrompt(prompt: string): Promise<Partial<EventData>> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemInstruction = `
        You are an event data extraction assistant. Extract the provided text into a JSON object 
        matching these keys: titleEn, titleTh, descriptionEn, descriptionTh, category, location, 
        isOnline, startAt, endAt. Leave unknown fields empty. Return ONLY valid JSON.
      `;
      
      const result = await model.generateContent(`${systemInstruction}\n\nUser Input: ${prompt}`);
      const text = result.response.text();
      
      // Clean markdown formatting if Gemini returns code blocks
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(cleanedText) as Partial<EventData>;
    } catch (error) {
      console.error("Failed to connect to AI API:", error);
      throw error;
    }
  },

  
  // Translates missing bilingual fields without overwriting existing ones
  async translateMissingFields(currentData: Partial<EventData>): Promise<Partial<EventData>> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemInstruction = `
        You are a Thai/English translator for an event app. Look at the provided JSON. 
        If an 'En' field has data but the 'Th' field is empty, translate it to Thai. 
        If a 'Th' field has data but the 'En' field is empty, translate it to English. 
        If BOTH have data, or BOTH are empty, do nothing. Return the updated JSON.
      `;
      
      const result = await model.generateContent(`${systemInstruction}\n\n${JSON.stringify(currentData)}`);
      const text = result.response.text();
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(cleanedText) as Partial<EventData>;
    } catch (error) {
      console.error("Translation failed:", error);
      throw error;
    }
  }
}