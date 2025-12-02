import { GoogleGenAI } from "@google/genai";
import { CaricatureResult, StyleOption } from "../types";
import { CARICATURE_STYLES } from "../constants";

// Initialize Gemini Client
// NOTE: In a Next.js production environment, ensure this key is only available server-side
// or usage is protected. For this SPA demo, it uses process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a Base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Clean = result.split(',')[1];
      resolve(base64Clean);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Generates a single caricature for a specific style.
 */
const generateSingleCaricature = async (
  base64Image: string,
  mimeType: string,
  style: StyleOption
): Promise<CaricatureResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: style.prompt
          }
        ]
      },
      // Config to ensure we get an image back if supported by the model version
      // or simply rely on the multimodal capability to "edit" or "transform".
    });

    // Check for inline data (image) in response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      // Iterate to find the image part
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return {
            id: style.id,
            styleName: style.name,
            imageBase64: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`
          };
        }
      }
    }
    
    throw new Error(`No image generated for style: ${style.name}`);

  } catch (error) {
    console.error(`Error generating ${style.name}:`, error);
    // Return a placeholder or re-throw depending on desired UX. 
    // Here we re-throw to be handled by Promise.allSettled or caught upstream.
    throw error;
  }
};

/**
 * Main function to generate all 5 caricatures.
 * Simulates the backend logic requested for /api/caricaturas.
 */
export const generateCaricatures = async (file: File): Promise<CaricatureResult[]> => {
  const base64Image = await fileToBase64(file);
  
  // Create an array of promises to run in parallel
  const promises = CARICATURE_STYLES.map((style) => 
    generateSingleCaricature(base64Image, file.type, style)
  );

  // Use allSettled to allow some to fail while others succeed, 
  // or Promise.all if we want strict success.
  // Given the user wants 5 specific images, we try to get all.
  const results = await Promise.all(promises);
  
  return results;
};