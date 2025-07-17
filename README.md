# ![Bulldog](./src/icons/icon48.png) BullPrompt

A modern Chrome extension for saving, tagging, searching, and managing text prompts with local storage.

## 🚀 Features

- **Save & Organize**: Create prompts with names, tags (1-5), and rich text content
- **Search & Filter**: Find prompts by name, content, or tags with real-time filtering
- **Local Storage**: Persist all data securely in Chrome's local storage
- **Modern UI**: Clean, minimal design with smooth animations
- **Quick Actions**: Edit, delete, and one-click copy functionality
- **Tag Management**: Dynamic tag filtering and organization
- **TypeScript**: Fully typed with modern ES modules

## 🛠️ Tech Stack

- **Frontend**: TypeScript, HTML5, CSS3 (modern styling)
- **Storage**: Chrome Storage API (local storage)
- **Build Tool**: tsx (TypeScript execution)
- **Chrome Extension**: Manifest v3
- **Dependencies**: @types/chrome

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Chrome browser (latest version)

## 🔧 Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bullprompt
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Extension

```bash
npm run build
```

### 4. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` folder
4. The extension should now appear in your Chrome toolbar

## 🎯 Usage

### Adding a Prompt

1. Click the BullPrompt extension icon in your Chrome toolbar
2. Click "Add Prompt" button
3. Fill in:
   - **Name**: Short descriptive name for your prompt
   - **Tags**: 1-5 tags separated by commas or spaces
   - **Prompt**: The actual prompt text content
4. Click "Save Prompt"

### Searching & Filtering

- **Search Bar**: Type to search across prompt names and content
- **Tag Filters**: Click tags to filter prompts by specific tags
- **Clear Filters**: Click "Clear" to reset all filters

### Managing Prompts

- **Edit**: Click the edit icon to modify a prompt
- **Delete**: Click the delete icon (with confirmation)
- **Copy**: Click the copy icon to copy prompt text to clipboard

## 🏗️ Development

### Build Commands

```bash
# Build for production
npm run build

# Development with watch mode
npm run dev

# Type checking
npm run type-check
```

### Project Structure

```
src/
├── chrome-storage-service.ts   # Chrome storage service
├── popup.ts                    # Main popup logic
├── background.ts               # Background service worker
├── types.ts                    # TypeScript type definitions
├── popup.html                  # Popup HTML structure
├── popup.css                   # Popup styling
├── manifest.json               # Extension manifest
└── icons/                      # Extension icons
```

### Key Components

- **ChromeStorageService**: Handles all data persistence using Chrome's storage API
- **PopupManager**: Manages UI interactions and state
- **Type Definitions**: Complete TypeScript interfaces for type safety

## 📊 Data Structure

Prompts are stored locally with the following structure:

```typescript
interface Prompt {
  rowKey: string; // Unique identifier
  partitionKey: string; // Always "prompts"
  name: string; // Prompt name
  prompt: string; // Prompt text content
  tags: string; // Comma-separated tags
  timestamp?: Date; // Creation/modification date
}
```

## 🔒 Privacy & Security

- **Local Storage**: All data is stored locally in Chrome's storage
- **No External Connections**: No data is sent to external servers
- **Input Sanitization**: All user inputs are sanitized for security
- **Secure Permissions**: Minimal Chrome permissions requested

## 🎨 UI/UX Design

- **Minimal Design**: Clean, modern interface following Chrome extension best practices
- **Responsive Layout**: Works well in various popup sizes
- **Smooth Animations**: Subtle transitions for better user experience
- **Accessibility**: Keyboard navigation and ARIA labels supported

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Include steps to reproduce the problem
4. Provide Chrome version and OS information
