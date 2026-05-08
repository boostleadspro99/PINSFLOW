export interface GenerateContentIdeasInput {
  projectName: string;
  projectDescription?: string | null;
  targetAudience?: string | null;
  keyword: string;
  count: number;
}

export interface AiContentIdea {
  title: string;
  angle: string;
  audience?: string;
  format: "LISTICLE" | "HOW_TO" | "CHECKLIST" | "QUOTE" | "INFOGRAPHIC" | "RECIPE" | "BEFORE_AFTER" | "GUIDE" | "TIPS";
  aiScore: number;
}

export interface GeneratePinDraftInput {
  projectName: string;
  projectDescription?: string | null;
  keyword: string;
  ideaTitle: string;
  ideaAngle: string;
  ideaFormat: string;
}

export interface AiPinDraft {
  title: string;
  description: string;
  overlayText?: string;
  imagePrompt: string;
  hashtags?: string;
  targetUrl?: string;
}

export interface AiProvider {
  generateContentIdeas(input: GenerateContentIdeasInput): Promise<AiContentIdea[]>;
  generatePinDraft(input: GeneratePinDraftInput): Promise<AiPinDraft>;
}
