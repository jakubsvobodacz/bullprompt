import { Prompt, PromptInput, ApiResponse } from "./types.js";

export class ChromeStorageService {
  private readonly storageKey = "prompts";

  constructor() {
    console.log("Chrome Storage Service initialized");
  }

  private generateId(name: string): string {
    const timestamp = Date.now();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${sanitizedName}_${timestamp}`;
  }

  private sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, "");
  }

  private validatePromptInput(input: PromptInput): string | null {
    if (!input.name?.trim()) {
      return "Name is required";
    }
    if (!input.prompt?.trim()) {
      return "Prompt text is required";
    }
    if (!input.tags || input.tags.length === 0) {
      return "At least one tag is required";
    }
    if (input.tags.length > 5) {
      return "Maximum 5 tags allowed";
    }
    return null;
  }

  private async getStoredPrompts(): Promise<Prompt[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.storageKey], (result) => {
        const prompts = result[this.storageKey] || [];
        resolve(prompts);
      });
    });
  }

  private async setStoredPrompts(prompts: Prompt[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.storageKey]: prompts }, () => {
        resolve();
      });
    });
  }

  async savePrompt(promptInput: PromptInput): Promise<ApiResponse<Prompt>> {
    try {
      const validationError = this.validatePromptInput(promptInput);
      if (validationError) {
        return { success: false, error: validationError };
      }

      const id = this.generateId(promptInput.name);
      const newPrompt: Prompt = {
        id: id,
        name: this.sanitizeInput(promptInput.name.trim()),
        prompt: this.sanitizeInput(promptInput.prompt.trim()),
        tags: promptInput.tags.map((tag) => this.sanitizeInput(tag.trim())),
        timestamp: new Date(),
      };

      const existingPrompts = await this.getStoredPrompts();
      existingPrompts.push(newPrompt);
      await this.setStoredPrompts(existingPrompts);

      return { success: true, data: newPrompt };
    } catch (error) {
      console.error("Error saving prompt:", error);
      return { success: false, error: "Failed to save prompt" };
    }
  }

  async getPrompts(): Promise<ApiResponse<Prompt[]>> {
    try {
      const prompts = await this.getStoredPrompts();

      // Convert timestamp strings back to Date objects if needed
      const processedPrompts = prompts.map((prompt) => ({
        ...prompt,
        timestamp: prompt.timestamp ? new Date(prompt.timestamp) : undefined,
      }));

      return { success: true, data: processedPrompts };
    } catch (error) {
      console.error("Error getting prompts:", error);
      return { success: false, error: "Failed to retrieve prompts" };
    }
  }

  async updatePrompt(
    id: string,
    promptInput: PromptInput
  ): Promise<ApiResponse<Prompt>> {
    try {
      const validationError = this.validatePromptInput(promptInput);
      if (validationError) {
        return { success: false, error: validationError };
      }

      const existingPrompts = await this.getStoredPrompts();
      const promptIndex = existingPrompts.findIndex((p) => p.id === id);

      if (promptIndex === -1) {
        return { success: false, error: "Prompt not found" };
      }

      const updatedPrompt: Prompt = {
        id: id,
        name: this.sanitizeInput(promptInput.name.trim()),
        prompt: this.sanitizeInput(promptInput.prompt.trim()),
        tags: promptInput.tags.map((tag) => this.sanitizeInput(tag.trim())),
        timestamp: new Date(),
      };

      existingPrompts[promptIndex] = updatedPrompt;
      await this.setStoredPrompts(existingPrompts);

      return { success: true, data: updatedPrompt };
    } catch (error) {
      console.error("Error updating prompt:", error);
      return { success: false, error: "Failed to update prompt" };
    }
  }

  async deletePrompt(id: string): Promise<ApiResponse<void>> {
    try {
      const existingPrompts = await this.getStoredPrompts();
      const filteredPrompts = existingPrompts.filter((p) => p.id !== id);

      if (filteredPrompts.length === existingPrompts.length) {
        return { success: false, error: "Prompt not found" };
      }

      await this.setStoredPrompts(filteredPrompts);
      return { success: true };
    } catch (error) {
      console.error("Error deleting prompt:", error);
      return { success: false, error: "Failed to delete prompt" };
    }
  }
}
