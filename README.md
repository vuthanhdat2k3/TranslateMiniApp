# Mini Floating Translator

A lightweight always-on-top draggable translator desktop app built with Tauri v2, React 18, and Gemini 2.0 Flash API.

![Mini Translator](./preview.png)

## Features

- 🎯 **Always on Top** - Floating window that stays visible
- 🖱️ **Draggable** - Move the window anywhere on screen
- 📐 **Collapse/Expand** - Minimize to a small button or expand to full panel
- 🌍 **Fast Translation** - Powered by Gemini 2.0 Flash API
- 📋 **One-Click Copy** - Copy translated text instantly
- ⌨️ **Keyboard Shortcuts** - Quick access with keyboard

## Tech Stack

- **Tauri v2** - Desktop app framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Gemini 2.0 Flash** - Translation API

## Setup

### Prerequisites

- Node.js 18+
- Rust (for Tauri)
- Gemini API Key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MiniFloatingTranlatorApp
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Add your Gemini API key to `.env`:
```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key
```

5. Run the app:
```bash
npm run tauri dev
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Translate text |
| `Shift+Enter` | New line in input |
| `Ctrl+Enter` | Translate text |
| `Ctrl+C` | Copy output (when not selecting text) |
| `Esc` | Collapse window |

## Window Behavior

- **Expanded**: 360x420 pixels - Full translation panel
- **Collapsed**: 56x56 pixels - Floating button

## Project Structure

```
src/
├── components/
│   ├── FloatingButton.tsx    # Collapsed circular button
│   ├── Header.tsx            # Language swap, collapse, close
│   └── TranslatorPanel.tsx   # Main translation UI
├── hooks/
│   └── useDrag.ts            # Window dragging functionality
├── services/
│   └── translate.ts          # Gemini API integration
├── App.tsx                   # Main app component
├── App.css                   # Base styles
└── main.tsx                  # Entry point
```

## Building for Production

```bash
npm run tauri build
```

The built application will be in `src-tauri/target/release/`.

## License

MIT
