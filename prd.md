# 📄 Product Requirements Document (PRD)

## 1. Overview

**Title:**  
Prompt Library Chrome Extension

**Summary:**  
A Chrome extension that allows the user to save, tag, search, and display text prompts.  
The extension uses **Chrome's local storage** for persistent local storage and is implemented in **TypeScript**.  
It features a minimal, modern, and clean design.

---

## 2. Objectives

- Allow the user to **add new prompts** consisting of:
  - **Name** (short label)
  - **Tags** (1–5 tags per prompt)
  - **Prompt text** (the main content)
- Enable **search and filtering** by:
  - Name
  - Tags
  - Prompt text
- Allow **editing and deleting** prompts.
- Display prompts in an organized list/grid.
- Persist all data in Chrome's local storage.
- Provide clear feedback when operations succeed or fail.
- Ensure design is **sleek but minimal**, with no clutter.

---

## 3. Features

### 3.1 Add Prompt

- Input fields:
  - **Name** (text input, required)
  - **Tags** (multi-select input or chips input, **minimum 1 tag, maximum 5 tags**)
  - **Prompt text** (multi-line textarea, required)
- Button: **Save Prompt**
- Validation rules:
  - Name: required
  - Tags: at least 1 tag, no more than 5
  - Prompt: required
- Upon save:
  - Generate unique `id` (e.g., slugified `name` + timestamp to ensure uniqueness).
  - Store tags as an array of strings.
  - Store in Chrome's local storage with:
    - `id` = generated unique identifier
    - Properties: `name`, `prompt`, `tags` (array), `timestamp`
  - Show success or error message.

---

### 3.2 List Prompts

- Display prompts in a vertical list or grid.
- Each prompt card shows:
  - Name
  - Tags (as individual chips)
  - Preview of prompt text (first 100 chars)
- Buttons per prompt:
  - **Edit**
  - **Delete**
  - **Copy Text**

---

### 3.3 Search & Filter

- Search bar:
  - Free text search across:
    - Name
    - Prompt text
    - Tags
- Tag filter:
  - Display all unique tags extracted dynamically from stored prompts.
  - User can select one or multiple tags.
  - Filtering returns prompts that include any of the selected tags (logical OR).

---

### 3.4 Edit Prompt

- When clicking **Edit**, show same input fields pre-filled.
- Allow updating any field.
- On save:
  - Revalidate tag count.
  - Update prompt in Chrome's local storage.

---

### 3.5 Delete Prompt

- Confirmation dialog before deletion.
- Remove prompt from Chrome's local storage.

---

### 3.6 Copy Prompt

- One-click copy of the prompt text to clipboard.

---

## 4. Technical Requirements

### 4.1 Platform

- **Chrome Extension Manifest v3**
- **TypeScript**

---

### 4.2 Chrome Local Storage

- Each prompt stored as an object:
  - `id`: unique identifier (string)
  - `name`: string
  - `prompt`: string
  - `tags`: array of strings
  - `timestamp`: Date object for creation/modification time
- Storage key: `"prompts"` containing an array of prompt objects
- No external dependencies or network calls required

---

### 4.3 Code Structure

- **Popup UI**: Main interface to view/add/search prompts.
- **Chrome Storage Service**: Handles all local storage operations.
- **Background Service Worker**: Minimal setup for Chrome extension.
- **Content Scripts**: None required.

---

### 4.4 Dependencies

- UI: Minimal, modern CSS (plain CSS preferred).
- Storage: Chrome Storage API (chrome.storage.local).
- State: Vanilla TypeScript state management.

---

## 5. UX & Design

### 5.1 Design Style

- **Minimal and modern**:
  - Soft neutral colors.
  - Clear typography.
  - Subtle hover states.
- No heavy branding.

### 5.2 Layout

- **Popup**:
  - Header with app name.
  - Search bar at the top.
  - Add prompt button.
  - List/grid below.
- **Prompt Card**:
  - Name in bold.
  - Tags displayed as chips or inline labels.
  - Prompt preview text.
  - Action buttons (Edit, Delete, Copy).

---

## 6. Non-Functional Requirements

- **Performance**:
  - Fast load (<1s) for popup.
  - Instant storage operations with Chrome's local storage.
- **Accessibility**:
  - Keyboard navigation support.
  - ARIA labels where appropriate.
- **Browser Support**:
  - Latest Chrome version (Manifest v3 compliant).
- **Privacy**:
  - All data stays local on the user's device.
  - No external network calls.
  - No data collection or analytics.
- **Security**:
  - Input sanitization for XSS prevention.
  - Minimal permissions (only storage).

---

## 7. Acceptance Criteria

✅ User can add, edit, delete, and list prompts stored in Chrome's local storage.

✅ User can search and filter prompts by name, prompt text, and tags.

✅ User must enter at least 1 tag and no more than 5 tags per prompt.

✅ Prompt text can be copied with one click.

✅ The UI is minimal, responsive, and clear.

✅ All data persists locally across browser sessions.

✅ The extension is built using TypeScript.

✅ No runtime errors during normal operation.

✅ No external dependencies or network calls.

---

## 8. Data Structure

```typescript
interface Prompt {
  id: string; // Unique identifier
  name: string; // Prompt name
  prompt: string; // Prompt text content
  tags: string[]; // Array of tag strings
  timestamp?: Date; // Creation/modification time
}
```

Storage structure:

```json
{
  "prompts": [
    {
      "id": "myPrompt_1703123456789",
      "name": "My Prompt",
      "prompt": "This is my prompt text...",
      "tags": ["work", "email", "template"],
      "timestamp": "2023-12-21T10:30:00Z"
    }
  ]
}
```

---

## 9. Deliverables

- Chrome Extension package (ZIP)
- Source code repository
- Build and deployment instructions
- Documentation on loading the extension in Chrome

---
