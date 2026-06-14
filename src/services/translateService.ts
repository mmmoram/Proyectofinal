import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GEMINI_API_KEY } from '../config/apiConfig';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function translateInstructions(mealId: string, english: string): Promise<string> {
  const key = `trans_instr_${mealId}`;
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) return cached;
  } catch { /* ignorar */ }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(
      'Traduce al español esta receta de cocina de forma clara y natural. ' +
      'Responde únicamente con la traducción, sin texto adicional ni explicaciones:\n\n' +
      english
    );
    const translated = result.response.text().trim();
    try { await AsyncStorage.setItem(key, translated); } catch { /* ignorar */ }
    return translated;
  } catch {
    return english;
  }
}
