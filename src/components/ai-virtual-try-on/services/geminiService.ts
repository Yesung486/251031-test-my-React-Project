import { GoogleGenAI, Modality, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Converts a data URL string to a Gemini Part object.
 * @param dataUrl The data URL (e.g., "data:image/jpeg;base64,...").
 * @returns A Gemini Part object.
 */
function dataUrlToGeminiPart(dataUrl: string): Part {
  const [header, base64Data] = dataUrl.split(",");
  const mimeType = header.match(/:(.*?);/)?.[1];

  if (!mimeType || !base64Data) {
    throw new Error("Invalid data URL format");
  }

  return {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };
}

export const generateVirtualTryOn = async (
  userImageDataUrl: string,
  clothingImageDataUrl: string
): Promise<string> => {
  const userImagePart = dataUrlToGeminiPart(userImageDataUrl);
  const clothingImagePart = dataUrlToGeminiPart(clothingImageDataUrl);

  const textPart: Part = {
    text: `You are a fashion AI expert. Your task is to perform a virtual try-on.
        - The first image contains a person.
        - The second image contains an article of clothing.
        Generate a new, photorealistic image where the person from the first image is wearing the clothing from the second image.
        The clothing must be realistically adjusted to fit the person's body and pose. Preserve the original background, head, and limbs from the first image.
        The output must be only the generated image. Do not output any text.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [userImagePart, clothingImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
    }

    // This case handles if the model returns text instead of an image.
    const fallbackText = response.text?.trim();
    if (fallbackText) {
       throw new Error(`The model returned an unexpected text response: "${fallbackText}"`);
    }

    throw new Error("The AI model did not return an image. Please try again with different images.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};
