import { GoogleGenAI, Modality } from "@google/genai";
import type { BrandSettings, AspectRatio } from "../../types/socialGenerator";
import { logger } from "../../utils/logger";

// Initialize Gemini AI with error handling
const getGeminiAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
  }
  return new GoogleGenAI({ apiKey });
};

const generateImagePrompt = (settings: BrandSettings, aspectRatio: AspectRatio, brandVoice: string): string => {
    const textToRender = settings.postText;

    let assetInstruction: string;
    if (settings.logo || settings.icon) {
        assetInstruction = "CRITICAL: You have been provided with a brand asset (logo or icon). You MUST incorporate this exact asset into the final graphic. Place it tastefully, for example in a corner or as a central design element, maintaining its original form and color."
    } else {
        assetInstruction = "The design should focus on typography and color. Do not add any placeholder logos or icons.";
    }

    const prompt = `
    **Objective:** Generate a single, high-quality social media graphic for an ${aspectRatio.name} post. The final image dimensions MUST strictly adhere to a ${aspectRatio.label} aspect ratio.

    **CRITICAL INSTRUCTION: Text to Display**
    The ONLY text content allowed in the final image is the following phrase. Render it exactly as written. Do not add any other text.
    Text: "${textToRender}"

    **VISUAL DESIGN BRIEF**
    You are an expert graphic designer. Follow these instructions precisely to create the visual style. DO NOT write any of these instructions in the image itself.

    1.  **Strict Color Palette:**
        -   You MUST use ONLY colors from this list for all backgrounds, elements, and text: ${settings.colors.join(', ')}.
        -   The design must feel cohesive and professional.

    2.  **Typography Rules:**
        -   The font for the text "${textToRender}" must be clean, professional, and highly legible.
        -   Emulate the style of '${settings.font1}' for the main, impactful parts of the text.
        -   If there are secondary lines of text (derived from the main phrase), emulate the style of '${settings.font2}' for those parts.

    3.  **Brand Asset Integration:**
        -   ${assetInstruction}

    4.  **Brand Voice & Mood:**
        -   The overall aesthetic MUST match this description: "${brandVoice}".

    **FINAL CHECK: FORBIDDEN CONTENT**
    -   ABSOLUTELY NO instructional text, font names (like '${settings.font1}'), or other text besides "${textToRender}" is allowed in the image.
    -   The output must be a clean, finished graphic.
    `;

    return prompt;
};

export const generateSocialGraphics = async (settings: BrandSettings, aspectRatio: AspectRatio, brandVoice: string): Promise<string[]> => {
    try {
        const ai = getGeminiAI();
        const promptText = generateImagePrompt(settings, aspectRatio, brandVoice);

        const parts: any[] = [{ text: promptText }];
        
        // Prioritize logo, then icon if available
        const imageAsset = settings.logo || settings.icon;
        if (imageAsset) {
            parts.unshift({
                inlineData: {
                    mimeType: imageAsset.mimeType,
                    data: imageAsset.data,
                }
            });
        }

        const generateSingleImage = async () => {
            const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData?.data) {
            return imagePart.inlineData.data;
        }
        
        const textResponse = response.text;
        if (textResponse) {
             throw new Error(`AI failed to generate image: ${textResponse}`);
        }

        throw new Error("The AI did not return an image. Please try again.");
    };

        try {
            const imagePromises = Array(2).fill(0).map(() => generateSingleImage());
            const images = await Promise.all(imagePromises);
            return images;
        } catch (error) {
            logger.error("Error generating images with nano-banana", error);
            if (error instanceof Error) {
                throw new Error(`Image generation failed: ${error.message}`);
            }
            throw new Error("An unexpected error occurred during image generation.");
        }
    } catch (error) {
        logger.error("Error initializing Gemini AI", error);
        if (error instanceof Error) {
            throw new Error(`API initialization failed: ${error.message}`);
        }
        throw new Error("An unexpected error occurred during API initialization.");
    }
};

export const describeImageStyle = async (imageBase64: string): Promise<string> => {
    try {
        const ai = getGeminiAI();
        const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: 'Analyze this social media graphic. Describe its visual style in a concise phrase, focusing on layout, color usage, typography, and overall mood (e.g., "Minimalist and clean with bold typography", "Vibrant and energetic with dynamic gradients", "Elegant and corporate with geometric patterns").' },
                { inlineData: { mimeType: 'image/png', data: imageBase64 } }
            ]
        }
        });
        return response.text;
    } catch (error) {
        logger.error("Error describing image style", error);
        if (error instanceof Error) {
            throw new Error(`Image analysis failed: ${error.message}`);
        }
        throw new Error("An unexpected error occurred during image analysis.");
    }
};


export const refineBrandVoice = async (currentVoice: string, selectionStyle: string): Promise<string> => {
    try {
        const ai = getGeminiAI();
        const prompt = `
        As a brand strategist AI, your task is to refine a user's brand style guide.
        The user's current brand style preference is: "${currentVoice}".
        They just selected a new design, and its style is described as: "${selectionStyle}".

        Synthesize these two descriptions into a new, updated brand style preference. The new description should be a single, concise sentence that is clear and actionable for future image generation prompts. It should smoothly blend the user's established preference with their latest choice.

        Output only the new, refined brand style preference sentence.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        return response.text.trim();
    } catch (error) {
        logger.error("Error refining brand voice", error);
        if (error instanceof Error) {
            throw new Error(`Brand voice refinement failed: ${error.message}`);
        }
        throw new Error("An unexpected error occurred during brand voice refinement.");
    }
};