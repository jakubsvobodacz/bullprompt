export interface Prompt {
  id: string;
  name: string;
  prompt: string;
  tags: string[]; // Array of tags instead of comma-separated string
  timestamp?: Date;
}

export interface PromptInput {
  name: string;
  prompt: string;
  tags: string[];
}

export interface SearchFilters {
  query: string;
  selectedTags: string[];
}

export interface PromptDisplayData {
  id: string;
  name: string;
  prompt: string;
  tags: string[];
  preview: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
