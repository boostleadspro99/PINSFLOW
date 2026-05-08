import { GenerateContentIdeasInput } from "../ai.types";

export const buildContentIdeasPrompt = (input: GenerateContentIdeasInput): string => {
  return `You are an expert Pinterest strategist and content creator.

Project Details:
Name: ${input.projectName}
Description: ${input.projectDescription || "Not provided"}
Target Audience: ${input.targetAudience || "General Pinterest audience"}

Task:
Generate ${input.count} highly engaging Pinterest content ideas for the keyword: "${input.keyword}".

Requirements:
- The ideas must be specifically tailored for Pinterest (visual, highly actionable, inspiring, or educational).
- Formats allowed: LISTICLE, HOW_TO, CHECKLIST, QUOTE, INFOGRAPHIC, RECIPE, BEFORE_AFTER, GUIDE, TIPS.
- Provide a catchy 'title' (max 100 chars).
- Provide a specifically angled 'angle' (a short description of what makes this pin unique or why users will click it, max 300 chars).
- Re-state the ideal 'audience' for this specific pin.
- Provide an 'aiScore' from 0-100 indicating how well this idea performs on Pinterest historically.

IMPORTANT: Output ONLY a raw JSON object with NO other text, NO markdown, NO code fences, NO explanations. The JSON must match this exact schema:
{"ideas":[{"title":"string","angle":"string","audience":"string","format":"LISTICLE","aiScore":85}]}`;
};
