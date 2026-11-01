# 🌐 Manga Ecosystem Web Showcase (`manga-ui-site`)

Il sito web vetrina ufficiale per l'ecosistema open source di **Manga & Anime**:
- 📱 [**manga-gui-mobile**](https://github.com/bhaki18/manga-gui-mobile) (Android Nativo - Kotlin & Jetpack Compose)
- 🖥️ [**manga-gui**](https://github.com/bhaki18/manga-gui) (Desktop Linux & Windows - C# Avalonia UI)
- ⚡ [**manga-cli**](https://github.com/bhaki18/manga-cli) (Terminale Linux - Node.js, Shell, RAM Caching)

---

## ✨ Caratteristiche del Sito

- **100% Serverless & Statico**: Nessun backend o database richiesto, ospitato gratuitamente su **GitHub Pages**.
- **Aggiornamento Dinamico delle Versioni**: Il client JavaScript interroga automaticamente i manifest `version.json` e `version_mobile.json` ospitati su `https://bhaki18.github.io/manga-cli/` per mostrare sempre l'ultimo numero di versione e i link di download aggiornati in tempo reale (con fallback istantaneo offline).
- **Installazione Guidata per Tutti**: Schede interattive dedicate ad Android (con QR code per download diretto via fotocamera), Ubuntu/Debian (`.deb`), Arch Linux (`.pkg.tar.zst` e makepkg), Fedora/openSUSE/Void (installer universale), Windows e Terminale CLI.
- **Pulsanti "Copia Comando" con Feedback**: Permette a chiunque di copiare i comandi di installazione con un solo click.
- **Design Moderno Anime/Manga**: Tema scuro (Crunchyroll-inspired dark obsidian `#0A0B0E` con accenti `#F47521`), glassmorphism, effetti di glow atmosferici e completa reattività su smartphone, tablet e desktop.

---

## 🚀 Anteprima Locale

Puoi testare il sito localmente con qualsiasi server statico:

```bash
# Con Python 3
python3 -m http.server 8080

# Oppure con Node (npx)
npx serve .
```

Apri `http://localhost:8080` nel tuo browser.

---

## 📦 Pubblicazione su GitHub Pages

1. Fai il push su GitHub:
   ```bash
   git add .
   git commit -m "Aggiornato sito vetrina manga-ui-site"
   git push origin main
   ```
2. Nel tuo repository GitHub (`bhaki18/manga-ui-site`), vai su **Settings** > **Pages**.
3. Sotto **Build and deployment** seleziona:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / cartella `/(root)`
   - Clicca **Save**.
4. Il sito sarà visibile pubblicamente all'indirizzo:
   `https://bhaki18.github.io/manga-ui-site/`
