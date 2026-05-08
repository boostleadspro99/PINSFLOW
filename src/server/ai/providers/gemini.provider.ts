import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AiProvider, GenerateContentIdeasInput, AiContentIdea, GeneratePinDraftInput, AiPinDraft } from "../ai.types";
import { buildContentIdeasPrompt } from "../prompts/content-ideas.prompt";
import { buildPinDraftPrompt } from "../prompts/pin-draft.prompt";

const contentIdeaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ideas: {
      type: Type.ARRAY,
      description: "List of generated content ideas",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Engaging title (max 140 chars)" },
          angle: { type: Type.STRING, description: "Unique perspective or slant (max 300 chars)" },
          audience: { type: Type.STRING, description: "Target audience (max 200 chars)" },
          format: { 
            type: Type.STRING, 
            enum: ["LISTICLE", "HOW_TO", "CHECKLIST", "QUOTE", "INFOGRAPHIC", "RECIPE", "BEFORE_AFTER", "GUIDE", "TIPS"],
            description: "Format type"
          },
          aiScore: { type: Type.INTEGER, description: "Estimated engagement score 0-100" }
        },
        required: ["title", "angle", "format", "aiScore"]
      }
    }
  },
  required: ["ideas"]
};

const pinDraftSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    overlayText: { type: Type.STRING },
    imagePrompt: { type: Type.STRING },
    hashtags: { type: Type.STRING },
  },
  required: ["title", "description", "imagePrompt"]                
};

export class GeminiProvider implements AiProvider {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Gemini API Key missing. Ensure NEXT_PUBLIC_GEMINI_API_KEY is set in environment.");
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateContentIdeas(input: GenerateContentIdeasInput): Promise<AiContentIdea[]> {
    const prompt = buildContentIdeasPrompt(input);

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: contentIdeaSchema,
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      
      return parsed.ideas || [];
    } catch (error) {
      console.error("Gemini Provider Error:", error);
      throw new Error("Failed to generate content ideas using Gemini.");
    }
  }

  async generatePinDraft(input: GeneratePinDraftInput): Promise<AiPinDraft> {
    const prompt = buildPinDraftPrompt(input);

    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: pinDraftSchema,
        }
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      
      return parsed as AiPinDraft;
    } catch (error) {
      console.error("Gemini Provider Error (PinDraft):", error);
      throw new Error("Failed to generate PinDraft using Gemini.");
    }
  }
}
