export interface CloudflareTextChoice {
  index: number;
  text: string;
  finish_reason: string;
}

export interface CloudflareTextResponse {
  result: {
    id?: string;
    object?: string;
    created?: number;
    model?: string;
    choices: CloudflareTextChoice[];
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  success: boolean;
  errors?: Array<{ message: string }>;
}

export interface CloudflareImageResult {
  result?: {
    image?: string;
  };
  success: boolean;
  errors?: Array<{ message: string }>;
}

export interface CloudflareEnvConfig {
  accountId: string;
  apiToken: string;
  baseUrl: string;
  textModel: string;
  imageModel?: string;
}

export interface CloudflareImageInput {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
}
