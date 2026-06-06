import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from '../config/apiConfig';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const analyzePetImage = async (base64Image: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg" as const,
      },
    };

    const prompt = `Analiza esta imagen de una mascota. Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin explicaciones, sin bloques de código:
{
  "especie": "Perro",
  "raza": "nombre de la raza en español o Mestizo si no se identifica",
  "estadoFisico": "descripción breve del estado físico visible del animal"
}
Si en la imagen no hay ningún animal, usa especie "No identificado". El campo estadoFisico debe describir si el animal parece saludable, delgado, herido, sucio, con sobrepeso, etc.`;

    const result = await model.generateContent([imagePart, prompt]);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Respuesta sin JSON");

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      species: (parsed.especie || "No identificado").trim(),
      breed: (parsed.raza || "Mestizo / Común").trim(),
      physicalState: (parsed.estadoFisico || "Estado normal").trim(),
    };
  } catch (error) {
    console.error("Error IA Gemini:", error);
    return {
      species: "No identificado",
      breed: "Sin información",
      physicalState: "No se pudo analizar la imagen",
    };
  }
};
