# 🌐 Manga Ecosystem Web Showcase (`manga-ui-site`)

The official showcase website for the open-source **Manga & Anime Suite**:
- 📱 [**manga-gui-mobile**](https://github.com/bhaki18/manga-gui-mobile) (Native Android App)
- 🖥️ [**manga-gui**](https://github.com/bhaki18/manga-gui) (Desktop App for Linux & Windows)
- ⚡ [**manga-cli**](https://github.com/bhaki18/manga-cli) (Blazing-Fast Command-Line CLI)

---

## ✨ Features

- **100% Free, Ad-Free & Serverless**: Completely static landing page hosted on **GitHub Pages** with zero tracking.
- **TLauncher-Inspired Download Hub**: One-click direct downloads with automatic OS detection, quick platform selector modal, and simple copy-paste terminal snippets.
- **Dynamic Live Versions**: Automatically queries `version.json` and `version_mobile.json` on `https://bhaki18.github.io/manga-cli/` to display the latest release tags and direct download URLs.
- **User-Friendly Installation**: Straightforward, jargon-free instructions for Android (with QR code scanner), Ubuntu/Debian (`.deb`), Arch Linux (`pacman.conf`), Fedora/openSUSE (universal installer), Windows, and Terminal CLI.
- **Modern Anime Dark Theme**: Inspired by modern streaming hubs (dark obsidian `#0A0B0E` with vibrant `#F47521` orange accents), atmospheric glow effects, and responsive design across mobile, tablet, and desktop screens.

---

## 🚀 Local Preview

Test the website locally with any static web server:

```bash
# Using Python 3
python3 -m http.server 8080

# Or with Node.js
npx serve .
```

Open `http://localhost:8080` in your web browser.

---

## 📦 Deploy to GitHub Pages

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Update website"
   git push origin main
   ```
2. In your repository on GitHub (`bhaki18/manga-ui-site`), navigate to **Settings** > **Pages**.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / `/(root)`
   - Click **Save**.
4. The site will be live at:
   `https://bhaki18.github.io/manga-ui-site/`
