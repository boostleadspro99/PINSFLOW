import { GeneratePinDraftInput } from "../ai.types";

export const buildPinDraftPrompt = (input: GeneratePinDraftInput): string => {
  return `You are an expert Pinterest content creator. Output ONLY valid JSON. No other text.

Generate a Pin Draft from this Content Idea:
Project: ${input.projectName}
Keyword: ${input.keyword}
Title: ${input.ideaTitle}
Angle: ${input.ideaAngle}
Format: ${input.ideaFormat}

Rules:
- title: max 140 chars, engaging
- description: max 500 chars, compelling
- overlayText: 2-3 words, short
- imagePrompt: detailed AI image prompt capturing the idea
- hashtags: space-separated tags

JSON format (ONLY this, no markdown, no backticks, no text):
{"title":"...","description":"...","overlayText":"...","imagePrompt":"...","hashtags":"..."}`;
};
