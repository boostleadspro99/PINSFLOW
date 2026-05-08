import { GeneratePinDraftInput } from "../ai.types";

export const buildPinDraftPrompt = (input: GeneratePinDraftInput): string => {
  return `You are an expert Pinterest content creator.

Task:
Generate a high-quality, engaging Pin Draft based on the following Content Idea.

Project: ${input.projectName}
Description: ${input.projectDescription || "No description"}
Keyword: ${input.keyword}

Content Idea:
Title: ${input.ideaTitle}
Angle: ${input.ideaAngle}
Format: ${input.ideaFormat}

Requirements:
- Create an engaging Pinterest Pin title (max 140 chars).
- Create a compelling description that encourages clicks (max 500 chars).
- Suggested overlay text (short, impactful, 2-3 words, max 200 chars).
- Detailed image prompt for an AI image generator that visually captures the idea.
- Viral-friendly tags (hashtags, space separated).

IMPORTANT: Output ONLY a raw JSON object with NO other text, NO markdown, NO code fences, NO explanations. The JSON must match this exact schema:
{"title":"string","description":"string","overlayText":"string","imagePrompt":"string","hashtags":"string"}`;
};
