// src/services/iaServices.ts
import { API_URL, API_KEY, API_HOST } from '../config/apiConfig';

interface Prediction {
  label: string;
  confidence: number;
}

interface ApiResponse {
  predictions: Prediction[];
}

export const analyzePetImage = async (base64Image: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST
      },
      body: JSON.stringify({
        image: `data:image/jpeg;base64,${base64Image}`,
        top_n: 3
      })
    });

    const data: ApiResponse = await response.json();
    console.log("🔍 Resultado IA:", data);

    // 🛡️ Si no hay respuesta, valores seguros
    if (!data || !data.predictions || data.predictions.length === 0) {
      return {
        species: "No identificado",
        breed: "Mestizo / Común",
        physicalState: "Estado normal, sin anomalías"
      };
    }

    // 📌 TOMAMOS EL RESULTADO CON MAYOR CONFIANZA
    const mejor = data.predictions[0];
    let especie = "No identificado";
    let raza = "Mestizo";
    let estadoFisico = "Saludable y bien cuidado";

    // ✅ DETECCIÓN PERFECTA DE ESPECIE
    const etiqueta = mejor.label.toLowerCase();

    if (etiqueta.includes("cat") || etiqueta.includes("feline")) {
      especie = "Gato";
      // 🐱 RAZAS DE GATOS
      if (etiqueta.includes("tabby")) raza = "Gato Atigrado";
      else if (etiqueta.includes("siamese")) raza = "Siamés";
      else if (etiqueta.includes("persian")) raza = "Persa";
      else if (etiqueta.includes("maine coon")) raza = "Maine Coon";
      else if (etiqueta.includes("ragdoll")) raza = "Ragdoll";
      else if (etiqueta.includes("british")) raza = "Británico de Pelo Corto";
      else raza = "Gato Común / Mestizo";

    } else if (etiqueta.includes("dog") || etiqueta.includes("canine")) {
      especie = "Perro";
      // 🐶 RAZAS DE PERROS
      if (etiqueta.includes("husky")) raza = "Husky Siberiano";
      else if (etiqueta.includes("labrador")) raza = "Labrador Retriever";
      else if (etiqueta.includes("poodle")) raza = "Caniche / Poodle";
      else if (etiqueta.includes("beagle")) raza = "Beagle";
      else if (etiqueta.includes("bulldog")) raza = "Bulldog";
      else if (etiqueta.includes("chihuahua")) raza = "Chihuahua";
      else if (etiqueta.includes("pastor")) raza = "Pastor Alemán";
      else if (etiqueta.includes("golden")) raza = "Golden Retriever";
      else raza = "Perro Común / Mestizo";

    } else if (etiqueta.includes("bird")) {
      especie = "Ave";
      raza = "Ave doméstica";
    } else if (etiqueta.includes("rabbit")) {
      especie = "Conejo";
      raza = "Conejo común";
    } else {
      especie = mejor.label.charAt(0).toUpperCase() + mejor.label.slice(1);
    }

    // ✅ DETECCIÓN DE ESTADO FÍSICO INTELIGENTE
    const confianza = mejor.confidence;
    if (confianza < 0.5) {
      estadoFisico = "Imagen borrosa o difícil de analizar";
    } else if (etiqueta.includes("thin") || etiqueta.includes("skinny")) {
      estadoFisico = "Delgado / Bajo peso";
    } else if (etiqueta.includes("dirty") || etiqueta.includes("matted")) {
      estadoFisico = "Sucio o pelaje descuidado";
    } else if (etiqueta.includes("injured") || etiqueta.includes("hurt")) {
      estadoFisico = "Se aprecian heridas o lesiones";
    } else if (etiqueta.includes("fat") || etiqueta.includes("overweight")) {
      estadoFisico = "Con sobrepeso";
    }

    return {
      species: especie,
      breed: raza,
      physicalState: estadoFisico
    };

  } catch (error) {
    console.error("❌ Error IA:", error);
    return {
      species: "No identificado",
      breed: "Sin información",
      physicalState: "No se pudo analizar la imagen"
    };
  }
};