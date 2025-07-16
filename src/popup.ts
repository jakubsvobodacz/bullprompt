import {
  Prompt,
  PromptInput,
  PromptDisplayData,
  SearchFilters,
} from "./types.js";
import { ChromeStorageService } from "./chrome-storage-service.js";

class PopupManager {
  private storageService: ChromeStorageService;
  private prompts: Prompt[] = [];
  private allTags: string[] = [];
  private currentFilters: SearchFilters = { query: "", selectedTags: [] };
  private isEditing = false;
  private editingId: string | null = null;
  private currentTags: string[] = [];

  // DOM elements
  private searchInput!: HTMLInputElement;
  private tagFilters!: HTMLElement;
  private addPromptBtn!: HTMLButtonElement;
  private promptsList!: HTMLElement;
  private loadingState!: HTMLElement;
  private emptyState!: HTMLElement;
  private modal!: HTMLElement;
  private modalTitle!: HTMLElement;
  private promptForm!: HTMLFormElement;
  private promptName!: HTMLInputElement;
  private promptTags!: HTMLInputElement;
  private promptText!: HTMLTextAreaElement;
  private saveBtn!: HTMLButtonElement;
  private cancelBtn!: HTMLButtonElement;
  private clearFiltersBtn!: HTMLButtonElement;
  private tagContainer!: HTMLElement;
  private errorMessage!: HTMLElement;
  private notification!: HTMLElement;
  private notificationText!: HTMLElement;
  private closeModalBtn!: HTMLButtonElement;

  constructor() {
    this.storageService = new ChromeStorageService();
    this.initializeElements();
    this.attachEventListeners();
    this.loadPrompts();
  }

  private initializeElements(): void {
    this.searchInput = document.getElementById(
      "searchInput"
    ) as HTMLInputElement;
    this.tagFilters = document.getElementById("tagFilters") as HTMLElement;
    this.addPromptBtn = document.getElementById(
      "addPromptBtn"
    ) as HTMLButtonElement;
    this.promptsList = document.getElementById("promptsList") as HTMLElement;
    this.loadingState = document.getElementById("loadingState") as HTMLElement;
    this.emptyState = document.getElementById("emptyState") as HTMLElement;
    this.modal = document.getElementById("addPromptModal") as HTMLElement;
    this.modalTitle = document.getElementById("modalTitle") as HTMLElement;
    this.promptForm = document.getElementById("promptForm") as HTMLFormElement;
    this.promptName = document.getElementById("promptName") as HTMLInputElement;
    this.promptTags = document.getElementById("promptTags") as HTMLInputElement;
    this.promptText = document.getElementById(
      "promptText"
    ) as HTMLTextAreaElement;
    this.saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
    this.cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;
    this.clearFiltersBtn = document.getElementById(
      "clearFiltersBtn"
    ) as HTMLButtonElement;
    this.tagContainer = document.getElementById("tagsContainer") as HTMLElement;
    this.errorMessage = document.getElementById("errorMessage") as HTMLElement;
    this.notification = document.getElementById("notification") as HTMLElement;
    this.notificationText = document.getElementById(
      "notificationText"
    ) as HTMLElement;
    this.closeModalBtn = document.getElementById(
      "closeModal"
    ) as HTMLButtonElement;
  }

  private attachEventListeners(): void {
    // Search
    this.searchInput.addEventListener("input", (e) => {
      this.currentFilters.query = (e.target as HTMLInputElement).value;
      const filteredPrompts = this.filterPrompts();
      this.renderPrompts(filteredPrompts);
      this.updateClearFiltersVisibility();
    });

    // Add prompt button
    this.addPromptBtn.addEventListener("click", () =>
      this.showAddPromptModal()
    );

    // Clear filters button
    this.clearFiltersBtn.addEventListener("click", () => {
      this.clearFilters();
    });

    // Modal events
    this.cancelBtn.addEventListener("click", () => this.hideModal());
    this.closeModalBtn.addEventListener("click", () => this.hideModal());
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.hideModal();
    });

    // Form submission
    this.promptForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit(e);
    });

    // Tags input
    this.promptTags.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.addTag();
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideModal();
      }
    });
  }

  private async loadPrompts(): Promise<void> {
    this.showLoading();

    try {
      const response = await this.storageService.getPrompts();

      if (response.success && response.data) {
        this.prompts = response.data;
        this.updateAllTags();
        const filteredPrompts = this.filterPrompts();
        this.renderPrompts(filteredPrompts);
        this.renderTagFilters();
      } else {
        this.showNotification(
          response.error || "Failed to load prompts",
          "error"
        );
        this.showEmptyState();
      }
    } catch (error) {
      this.showNotification("Failed to load prompts", "error");
      this.showEmptyState();
    }

    this.hideLoading();
  }

  private updateAllTags(): void {
    const tagSet = new Set<string>();
    this.prompts.forEach((prompt) => {
      if (prompt.tags) {
        prompt.tags.forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) tagSet.add(trimmed);
        });
      }
    });
    this.allTags = Array.from(tagSet).sort();
  }

  private renderTagFilters(): void {
    if (this.allTags.length === 0) {
      this.tagFilters.innerHTML =
        '<span style="color: #64748b; font-size: 12px;">No tags available</span>';
      return;
    }

    this.tagFilters.innerHTML = this.allTags
      .map(
        (tag) => `
                    <button class="tag-filter ${
                      this.currentFilters.selectedTags.includes(tag)
                        ? "active"
                        : ""
                    }" 
                    data-tag="${tag}">${tag}</button>
                `
      )
      .join("");

    // Add event listeners to tag filters
    this.tagFilters.querySelectorAll(".tag-filter").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tag = (e.target as HTMLElement).dataset.tag!;
        this.toggleTagFilter(tag);
      });
    });
  }

  private toggleTagFilter(tag: string): void {
    const index = this.currentFilters.selectedTags.indexOf(tag);
    if (index === -1) {
      this.currentFilters.selectedTags.push(tag);
    } else {
      this.currentFilters.selectedTags.splice(index, 1);
    }
    this.renderTagFilters();
    const filteredPrompts = this.filterPrompts();
    this.renderPrompts(filteredPrompts);
    this.updateClearFiltersVisibility();
  }

  private filterPrompts(): Prompt[] {
    let filtered = [...this.prompts];

    // Text search
    if (this.currentFilters.query) {
      const query = this.currentFilters.query.toLowerCase();
      filtered = filtered.filter(
        (prompt) =>
          prompt.name.toLowerCase().includes(query) ||
          prompt.prompt.toLowerCase().includes(query) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Tag filters
    if (this.currentFilters.selectedTags.length > 0) {
      filtered = filtered.filter((prompt) => {
        const promptTags = prompt.tags;
        return this.currentFilters.selectedTags.some((tag) =>
          promptTags.includes(tag)
        );
      });
    }

    return filtered;
  }

  private renderPrompts(prompts: Prompt[]): void {
    if (prompts.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();

    const displayData: PromptDisplayData[] = prompts.map((prompt) => ({
      id: prompt.id,
      name: prompt.name,
      prompt: prompt.prompt,
      tags: prompt.tags,
      preview:
        prompt.prompt.length > 100
          ? prompt.prompt.substring(0, 100) + "..."
          : prompt.prompt,
    }));

    this.promptsList.innerHTML = displayData
      .map(
        (prompt) => `
                    <div class="prompt-card" data-row-key="${prompt.id}">
                        <div class="prompt-header">
                            <div class="prompt-name">${this.escapeHtml(
                              prompt.name
                            )}</div>
                            <div class="prompt-actions">
                                <button class="action-btn copy-btn" data-action="copy" data-row-key="${
                                  prompt.id
                                }" title="Copy prompt">
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                    </svg>
                                </button>
                                <button class="action-btn edit-btn" data-action="edit" data-row-key="${
                                  prompt.id
                                }" title="Edit prompt">
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                </button>
                                <button class="action-btn delete-btn" data-action="delete" data-row-key="${
                                  prompt.id
                                }" title="Delete prompt">
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="prompt-tags">
                            ${prompt.tags
                              .map(
                                (tag) =>
                                  `<span class="tag">${this.escapeHtml(
                                    tag
                                  )}</span>`
                              )
                              .join("")}
                        </div>
                        <div class="prompt-preview">${this.escapeHtml(
                          prompt.preview
                        )}</div>
                    </div>
                `
      )
      .join("");

    // Add event listeners to prompt action buttons
    this.promptsList.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const button = target.closest("[data-action]") as HTMLElement;
        const action = button.dataset.action!;
        const id = button.dataset.rowKey!;
        this.handlePromptAction(action, id);
      });
    });
  }

  private handlePromptAction(action: string, id: string): void {
    const prompt = this.prompts.find((p) => p.id === id);
    if (!prompt) return;

    switch (action) {
      case "copy":
        this.copyPrompt(prompt.prompt);
        break;
      case "edit":
        this.openEditModal(prompt);
        break;
      case "delete":
        this.deletePrompt(id);
        break;
    }
  }

  private openEditModal(prompt: Prompt): void {
    this.isEditing = true;
    this.editingId = prompt.id;
    this.modalTitle.textContent = "Edit Prompt";
    this.promptName.value = prompt.name;
    this.promptText.value = prompt.prompt;
    this.currentTags = prompt.tags;
    this.renderCurrentTags();
    this.showModal();
  }

  private async deletePrompt(id: string): Promise<void> {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    try {
      const response = await this.storageService.deletePrompt(id);

      if (response.success) {
        this.showSuccessMessage("Prompt deleted successfully");
        await this.loadPrompts();
      } else {
        this.showErrorMessage(response.error || "Failed to delete prompt");
      }
    } catch (error) {
      console.error("Error deleting prompt:", error);
      this.showErrorMessage("An error occurred while deleting the prompt");
    }
  }

  private showAddPromptModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.modalTitle.textContent = "Add New Prompt";
    this.resetForm();
    this.showModal();
  }

  private showModal(): void {
    this.modal.classList.remove("hidden");
    this.promptName.focus();
  }

  private hideModal(): void {
    this.modal.classList.add("hidden");
    this.resetForm();
  }

  private resetForm(): void {
    this.promptForm.reset();
    this.currentTags = [];
    this.renderCurrentTags();
    this.isEditing = false;
    this.editingId = null;
    this.hideErrorMessage();
  }

  private addTag(): void {
    const tagValue = this.promptTags.value.trim();
    if (
      !tagValue ||
      this.currentTags.includes(tagValue) ||
      this.currentTags.length >= 5
    ) {
      this.promptTags.value = "";
      return;
    }

    this.currentTags.push(tagValue);
    this.promptTags.value = "";
    this.renderCurrentTags();
  }

  private removeTag(tag: string): void {
    const index = this.currentTags.indexOf(tag);
    if (index > -1) {
      this.currentTags.splice(index, 1);
      this.renderCurrentTags();
    }
  }

  private renderCurrentTags(): void {
    this.tagContainer.innerHTML = this.currentTags
      .map(
        (tag) => `
                    <div class="tag-chip">
                        ${this.escapeHtml(tag)}
                        <button type="button" class="remove-tag" data-tag="${tag}">×</button>
                    </div>
                `
      )
      .join("");

    // Add event listeners to remove buttons
    this.tagContainer.querySelectorAll(".remove-tag").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tag = (e.target as HTMLElement).dataset.tag!;
        this.removeTag(tag);
      });
    });
  }

  private async handleFormSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const name = this.promptName.value.trim();
    const prompt = this.promptText.value.trim();
    const tags = this.currentTags.filter((tag) => tag.trim() !== "");

    if (!name || !prompt || tags.length === 0) {
      this.showErrorMessage("Name, prompt, and at least one tag are required");
      return;
    }

    if (tags.length > 5) {
      this.showErrorMessage("Maximum 5 tags allowed");
      return;
    }

    this.setSaving(true);

    try {
      const promptInput: PromptInput = { name, prompt, tags };

      const response = this.isEditing
        ? await this.storageService.updatePrompt(this.editingId!, promptInput)
        : await this.storageService.savePrompt(promptInput);

      if (response.success) {
        this.showSuccessMessage(
          this.isEditing
            ? "Prompt updated successfully"
            : "Prompt saved successfully"
        );
        this.hideModal();
        this.resetForm();
        await this.loadPrompts();
      } else {
        this.showErrorMessage(response.error || "Failed to save prompt");
      }
    } catch (error) {
      console.error("Error saving prompt:", error);
      this.showErrorMessage("An error occurred while saving the prompt");
    } finally {
      this.setSaving(false);
    }
  }

  private showLoading(): void {
    this.loadingState.classList.remove("hidden");
    this.promptsList.classList.add("hidden");
    this.emptyState.classList.add("hidden");
  }

  private hideLoading(): void {
    this.loadingState.classList.add("hidden");
    this.promptsList.classList.remove("hidden");
  }

  private showEmptyState(): void {
    this.emptyState.classList.remove("hidden");
    this.promptsList.classList.add("hidden");
  }

  private hideEmptyState(): void {
    this.emptyState.classList.add("hidden");
    this.promptsList.classList.remove("hidden");
  }

  private showNotification(
    message: string,
    type: "success" | "error" = "success"
  ): void {
    this.notificationText.textContent = message;
    this.notification.className = `notification ${type}`;
    this.notification.classList.remove("hidden");

    setTimeout(() => {
      this.notification.classList.add("hidden");
    }, 3000);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private async copyPrompt(promptText: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(promptText);
      this.showNotification("Prompt copied to clipboard!");
    } catch (error) {
      this.showNotification("Failed to copy prompt", "error");
    }
  }

  private showSuccessMessage(message: string): void {
    this.showNotification(message, "success");
  }

  private showErrorMessage(message: string): void {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove("hidden");
    this.showNotification(message, "error");
  }

  private hideErrorMessage(): void {
    this.errorMessage.classList.add("hidden");
    this.errorMessage.textContent = "";
  }

  private setSaving(saving: boolean): void {
    this.saveBtn.disabled = saving;
    this.saveBtn.textContent = saving
      ? "Saving..."
      : this.isEditing
      ? "Update Prompt"
      : "Save Prompt";
  }

  private clearFilters(): void {
    this.currentFilters.query = "";
    this.currentFilters.selectedTags = [];
    this.searchInput.value = "";
    this.renderTagFilters();
    const filteredPrompts = this.filterPrompts();
    this.renderPrompts(filteredPrompts);
    this.clearFiltersBtn.classList.add("hidden");
  }

  private updateClearFiltersVisibility(): void {
    const hasFilters =
      this.currentFilters.query.length > 0 ||
      this.currentFilters.selectedTags.length > 0;
    if (hasFilters) {
      this.clearFiltersBtn.classList.remove("hidden");
    } else {
      this.clearFiltersBtn.classList.add("hidden");
    }
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
