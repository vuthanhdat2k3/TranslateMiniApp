# 🌐 Mini Floating Translator

A lightweight, floating translation app built with Tauri + React. Supports multiple translation engines.

![Mini Translator](https://img.shields.io/badge/Tauri-2.0-blue) ![React](https://img.shields.io/badge/React-19-61dafb) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🎯 **Floating Window** - Always on top, doesn't block your workflow
- 🔄 **Multiple Engines** - Gemini AI or Argos Translate (offline)
- 🎤 **Voice Input** - Speak to translate
- ⌨️ **Global Shortcuts** - Quick access from anywhere
- 🌍 **11 Languages** - English, Vietnamese, Chinese, Japanese, Korean, Thai, Filipino, French, Spanish, German, Russian

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/)
- [Python 3.10+](https://python.org/) (for Argos engine)

### Installation

```bash
# Clone the repository
git clone https://github.com/vuthanhdat2k3/TranslateMiniApp.git
cd TranslateMiniApp

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
# Edit .env and add your Gemini API key
```

### Development

```bash
# Run Tauri app in development
npm run tauri dev
```

### Using Argos Translate (Offline)

```bash
# Setup Python environment
cd argos-server
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run server
python server.py
```

## 🔨 Build for Production

### Windows

```bash
npm run tauri build
```

Output files:
- `src-tauri/target/release/bundle/msi/` - MSI installer
- `src-tauri/target/release/bundle/nsis/` - EXE installer

### macOS

```bash
npm run tauri build
```

Output: `src-tauri/target/release/bundle/dmg/`

### Linux

```bash
npm run tauri build
```

Output: `src-tauri/target/release/bundle/deb/` or `appimage/`

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+T` | Toggle app visibility |
| `Ctrl+Shift+C` | Copy translation |
| `Ctrl+Shift+V` | Voice input |
| `Enter` | Translate |

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Gemini API Key (get it from https://aistudio.google.com/apikey)
VITE_GEMINI_API_KEY=your_api_key_here

# Optional: Argos server URL (default: http://127.0.0.1:5100/translate)
VITE_ARGOS_SERVER_URL=http://127.0.0.1:5100/translate
```

## 📦 Translation Engines

### 1. Gemini AI (Online)
- Requires API key
- High quality translations
- Fast response

### 2. Argos Translate (Offline)
- No API key needed
- Works offline after first model download
- Pivot translation through English for unsupported pairs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Credits

- [Tauri](https://tauri.app/) - Desktop app framework
- [React](https://react.dev/) - UI library
- [Argos Translate](https://github.com/argosopentech/argos-translate) - Offline translation
- [Google Gemini](https://ai.google.dev/) - AI translation
