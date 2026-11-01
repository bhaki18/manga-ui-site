/**
 * Manga Ecosystem Showcase - Client Engine
 * Dynamically queries https://bhaki18.github.io/manga-cli/ gh-pages manifests,
 * detects the visitor's operating system, and provides a customized experience
 * between Manga GUI (desktop/mobile) and Manga CLI (terminal).
 */

// Default Fallback Configs (used if network is offline or throttled)
const DEFAULTS = {
  desktop: {
    version: '1.1.4-1',
    pkgver: '1.1.4',
    releaseDate: '2026-11-01',
    debUrl: 'https://bhaki18.github.io/manga-cli/deb/manga-gui_1.1.4-1_amd64.deb',
    archUrl: 'https://bhaki18.github.io/manga-cli/x86_64/manga-gui-bin-1.1.4-1-x86_64.pkg.tar.zst',
    tarballUrl: 'https://raw.githubusercontent.com/bhaki18/manga-cli/gh-pages/manga-gui-linux-x64.tar.gz',
    notes: 'Supporto streaming MP4/HLS e correzione UI'
  },
  mobile: {
    version: '1.0.9',
    notes: 'Novità di questo aggiornamento: patch stabilità',
    apkUrl: 'https://bhaki18.github.io/manga-cli/android/app-release.apk'
  },
  cli: {
    version: '2.1.0-1',
    repoUrl: 'https://bhaki18.github.io/manga-cli/$arch'
  }
};

let currentData = {
  desktop: { ...DEFAULTS.desktop },
  mobile: { ...DEFAULTS.mobile },
  cli: { ...DEFAULTS.cli }
};

let activeExperience = 'gui'; // 'gui' | 'cli'
let userOS = null;

document.addEventListener('DOMContentLoaded', () => {
  userOS = detectUserOS();
  initExperienceSwitcher();
  initTabs();
  initCopyButtons();
  initQrModal();
  initMobileMenu();
  renderSmartOsRecommendation();
  initLiveVersions();

  // Auto-activate the detected OS tab in the install wizard
  if (userOS && userOS.defaultTab) {
    selectTab(userOS.defaultTab);
  }
});

/**
 * Intelligent OS Detection
 */
function detectUserOS() {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';

  // Android
  if (/android/i.test(ua)) {
    return {
      id: 'android',
      name: 'Android',
      icon: '📱',
      type: 'mobile',
      defaultTab: 'tab-android',
      description: 'Smartphone / Tablet Android'
    };
  }

  // iOS / iPadOS
  if (/iphone|ipad|ipod/i.test(ua)) {
    return {
      id: 'ios',
      name: 'iOS (Apple)',
      icon: '🍎',
      type: 'mobile',
      defaultTab: 'tab-android',
      description: 'Dispositivo Apple iOS'
    };
  }

  // Windows
  if (/win/i.test(platform) || /windows/i.test(ua)) {
    return {
      id: 'windows',
      name: 'Windows',
      icon: '🪟',
      type: 'desktop',
      defaultTab: 'tab-win',
      description: 'PC Windows (64-bit)'
    };
  }

  // macOS
  if (/mac/i.test(platform) || /macintosh/i.test(ua)) {
    return {
      id: 'macos',
      name: 'macOS',
      icon: '🍎',
      type: 'desktop',
      defaultTab: 'tab-cli',
      description: 'Apple Mac (macOS)'
    };
  }

  // Linux (and distros)
  if (/linux/i.test(platform) || /linux/i.test(ua)) {
    if (/arch/i.test(ua)) {
      return {
        id: 'arch',
        name: 'Arch Linux',
        icon: '🔵',
        type: 'desktop',
        defaultTab: 'tab-arch',
        description: 'Arch Linux / Manjaro / EndeavourOS'
      };
    }
    if (/ubuntu|debian|mint|pop/i.test(ua)) {
      return {
        id: 'debian',
        name: 'Debian / Ubuntu',
        icon: '🟠',
        type: 'desktop',
        defaultTab: 'tab-deb',
        description: 'Ubuntu, Debian, Linux Mint, Pop!_OS'
      };
    }
    return {
      id: 'linux',
      name: 'Linux',
      icon: '🐧',
      type: 'desktop',
      defaultTab: 'tab-deb',
      description: 'Sistema Operativo Linux (x64)'
    };
  }

  return {
    id: 'unknown',
    name: 'Computer',
    icon: '💻',
    type: 'desktop',
    defaultTab: 'tab-deb',
    description: 'Sistema Desktop Rilevato'
  };
}

/**
 * Handle experience switching between GUI and CLI
 */
function initExperienceSwitcher() {
  const buttons = document.querySelectorAll('.switcher-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const exp = btn.getAttribute('data-exp');
      if (exp === activeExperience) return;

      activeExperience = exp;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      renderSmartOsRecommendation();

      // Highlight corresponding app card
      highlightAppCard(exp);
    });
  });
}

function highlightAppCard(exp) {
  const cards = document.querySelectorAll('.app-card');
  cards.forEach(card => card.style.borderColor = '');

  if (exp === 'cli') {
    const cliCard = document.querySelector('.app-card:nth-child(3)');
    if (cliCard) {
      cliCard.style.borderColor = 'rgba(157, 78, 221, 0.7)';
      cliCard.style.boxShadow = '0 0 25px rgba(157, 78, 221, 0.3)';
      setTimeout(() => {
        cliCard.style.borderColor = '';
        cliCard.style.boxShadow = '';
      }, 2000);
    }
  } else {
    const guiCards = [document.querySelector('.app-card:nth-child(1)'), document.querySelector('.app-card:nth-child(2)')];
    guiCards.forEach(card => {
      if (card) {
        card.style.borderColor = 'rgba(244, 117, 33, 0.7)';
        card.style.boxShadow = '0 0 25px rgba(244, 117, 33, 0.25)';
        setTimeout(() => {
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }, 2000);
      }
    });
  }
}

/**
 * Render the customized Smart Recommendation box in the Hero
 */
function renderSmartOsRecommendation() {
  const osLabel = document.getElementById('osDetectedBadge');
  const contentBox = document.getElementById('smartOsContent');
  if (!contentBox || !userOS) return;

  if (osLabel) {
    osLabel.innerHTML = `<span class="os-icon">${userOS.icon}</span> <span>${userOS.description}</span>`;
  }

  const deskVer = currentData.desktop.version;
  const mobVer = currentData.mobile.version;
  const debUrl = currentData.desktop.debUrl;
  const archUrl = currentData.desktop.archUrl;
  const apkUrl = currentData.mobile.apkUrl;

  let html = '';

  if (activeExperience === 'gui') {
    // GUI recommendations
    if (userOS.id === 'android') {
      html = `
        <h3 class="smart-os-title">
          <span>📱</span> Manga GUI Mobile per Android
        </h3>
        <p class="smart-os-desc">
          App nativa Android con player video ExoPlayer, gesture touch, lettore manga continuo verticale e auto-aggiornamenti in-app.
        </p>
        <div class="smart-os-actions">
          <a href="${apkUrl}" class="btn btn-primary" download>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Scarica APK Diretto (v${mobVer})
          </a>
          <button class="btn btn-secondary open-qr-modal" type="button">
            Mostra QR Code
          </button>
        </div>
      `;
    } else if (userOS.id === 'arch') {
      html = `
        <h3 class="smart-os-title">
          <span>🔵</span> Manga GUI per Arch Linux
        </h3>
        <p class="smart-os-desc">
          Pacchetto binario precompilato <code>.pkg.tar.zst</code> ottimizzato per Arch, Manjaro ed EndeavourOS.
        </p>
        <div class="smart-os-actions">
          <a href="${archUrl}" class="btn btn-primary" download>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Scarica Pacchetto Arch (v${deskVer})
          </a>
          <button class="btn btn-secondary" onclick="selectTabAndScroll('tab-arch')" type="button">
            Mostra Comando Pacman
          </button>
        </div>
      `;
    } else if (userOS.id === 'windows') {
      html = `
        <h3 class="smart-os-title">
          <span>🪟</span> Manga GUI per Windows (x64)
        </h3>
        <p class="smart-os-desc">
          Eseguibile autonomo standalone C# Avalonia per Windows a 64-bit senza dipendenze esterne.
        </p>
        <div class="smart-os-actions">
          <button class="btn btn-primary" onclick="selectTabAndScroll('tab-win')" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Istruzioni Build & Eseguibile Windows
          </button>
          <a href="https://github.com/bhaki18/manga-gui" target="_blank" rel="noopener" class="btn btn-secondary">
            Repo GitHub
          </a>
        </div>
      `;
    } else {
      // Default Linux / Debian / Ubuntu
      html = `
        <h3 class="smart-os-title">
          <span>🐧</span> Manga GUI Desktop per Linux (Ubuntu / Debian / Mint)
        </h3>
        <p class="smart-os-desc">
          Pacchetto binario nativo <code>.deb</code> con Fluent Dark Theme, lettore manga e player MPV a 1080p.
        </p>
        <div class="smart-os-actions">
          <a href="${debUrl}" class="btn btn-primary" id="btn-smart-deb" download>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Scarica Pacchetto .deb (v${deskVer})
          </a>
          <button class="btn btn-secondary" onclick="selectTabAndScroll('tab-deb')" type="button">
            Comando Terminale Rapido
          </button>
          <button class="btn btn-outline btn-sm" onclick="selectTabAndScroll('tab-universal')" type="button">
            Installer Universale (Fedora/SUSE)
          </button>
        </div>
      `;
    }
  } else {
    // CLI recommendations
    if (userOS.id === 'arch') {
      html = `
        <h3 class="smart-os-title">
          <span>⚡</span> Manga CLI su Arch Linux (Pacman Repo)
        </h3>
        <p class="smart-os-desc">
          Disponibile direttamente tramite il repository Pacman ufficiale mantenuto su GitHub Pages.
        </p>
        <div class="smart-os-actions">
          <button class="btn btn-primary" onclick="selectTabAndScroll('tab-cli')" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
            Aggiungi Repository Pacman
          </button>
          <a href="https://github.com/bhaki18/manga-cli" target="_blank" rel="noopener" class="btn btn-secondary">
            Guida Comandi CLI
          </a>
        </div>
      `;
    } else if (userOS.id === 'windows') {
      html = `
        <h3 class="smart-os-title">
          <span>⚡</span> Manga CLI su Windows (WSL o Node.js)
        </h3>
        <p class="smart-os-desc">
          Manga CLI è progettata per ambienti Unix/Linux. Su Windows è eseguibile al massimo delle prestazioni tramite WSL2 o Node.js.
        </p>
        <div class="smart-os-actions">
          <button class="btn btn-primary" onclick="selectTabAndScroll('tab-cli')" type="button">
            Installa via Node.js / WSL
          </button>
          <button class="btn btn-secondary" onclick="switchExperience('gui')" type="button">
            Preferisci l'app grafica? Passa a Manga GUI
          </button>
        </div>
      `;
    } else {
      // Generic Linux / Mac CLI
      html = `
        <h3 class="smart-os-title">
          <span>⚡</span> Manga & Anime CLI per Linux (Zero Usura Disco)
        </h3>
        <p class="smart-os-desc">
          Scarica le pagine manga direttamente in RAM (<code>/dev/shm</code>) e trasmetti anime in streaming istantaneo su MPV / VLC.
        </p>
        <div class="smart-os-actions">
          <button class="btn btn-primary" onclick="selectTabAndScroll('tab-cli')" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
            Comandi di Installazione Rapida
          </button>
          <a href="https://github.com/bhaki18/manga-cli" target="_blank" rel="noopener" class="btn btn-secondary">
            Documentazione Comandi
          </a>
        </div>
      `;
    }
  }

  contentBox.innerHTML = html;
  initQrModal(); // Re-bind QR modal listeners for new elements if any
}

function switchExperience(exp) {
  const btn = document.querySelector(`.switcher-btn[data-exp="${exp}"]`);
  if (btn) btn.click();
}

/**
 * Fetch remote version manifests from bhaki18.github.io/manga-cli
 */
async function initLiveVersions() {
  const versionDesktopUrl = 'https://bhaki18.github.io/manga-cli/version.json';
  const versionMobileUrl = 'https://bhaki18.github.io/manga-cli/version_mobile.json';

  // 1. Fetch Desktop Manifest
  try {
    const res = await fetch(versionDesktopUrl, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      currentData.desktop = { ...DEFAULTS.desktop, ...data };
      applyDesktopData(currentData.desktop);
    } else {
      applyDesktopData(DEFAULTS.desktop);
    }
  } catch (err) {
    console.warn('Could not fetch desktop version, using default.', err);
    applyDesktopData(DEFAULTS.desktop);
  }

  // 2. Fetch Mobile Manifest
  try {
    const res = await fetch(versionMobileUrl, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      currentData.mobile = { ...DEFAULTS.mobile, ...data };
      applyMobileData(currentData.mobile);
    } else {
      applyMobileData(DEFAULTS.mobile);
    }
  } catch (err) {
    console.warn('Could not fetch mobile version, using default.', err);
    applyMobileData(DEFAULTS.mobile);
  }

  // Refresh recommendation box with live data
  renderSmartOsRecommendation();
}

function applyDesktopData(data) {
  const version = data.version || DEFAULTS.desktop.version;
  const debUrl = data.debPackageUrl || DEFAULTS.desktop.debUrl;
  const archUrl = data.archPackageUrl || DEFAULTS.desktop.archUrl;

  document.querySelectorAll('.val-desktop-version').forEach(el => el.textContent = `v${version}`);
  
  const debBtn = document.getElementById('btn-download-deb');
  if (debBtn) {
    const finalDebUrl = debUrl.startsWith('http') 
      ? debUrl 
      : `https://bhaki18.github.io/manga-cli/${debUrl}`;
    debBtn.href = finalDebUrl;
    debBtn.setAttribute('download', `manga-gui_${version}_amd64.deb`);
  }

  const archBtn = document.getElementById('btn-download-arch');
  if (archBtn) {
    archBtn.href = archUrl;
  }

  const debSnippet = document.getElementById('snippet-deb');
  if (debSnippet) {
    debSnippet.innerHTML = 
`<span class="comment"># 1. Scarica e installa il pacchetto .deb</span>
<span class="cmd">curl</span> <span class="flag">-LO</span> https://bhaki18.github.io/manga-cli/deb/manga-gui_${version}_amd64.deb
<span class="cmd">sudo apt</span> install ./manga-gui_${version}_amd64.deb

<span class="comment"># 2. Avvia l'applicazione</span>
<span class="cmd">manga-gui</span>`;
  }
}

function applyMobileData(data) {
  const version = data.version || DEFAULTS.mobile.version;
  const apkUrl = data.apkUrl || DEFAULTS.mobile.apkUrl;

  document.querySelectorAll('.val-mobile-version').forEach(el => el.textContent = `v${version}`);
  
  const apkBtns = document.querySelectorAll('.btn-download-apk');
  apkBtns.forEach(btn => {
    btn.href = apkUrl;
    btn.setAttribute('download', `manga-gui-${version}.apk`);
  });

  const qrImages = document.querySelectorAll('.dynamic-qr-img');
  const qrSource = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(apkUrl)}&bgcolor=11141a&color=f47521&margin=8`;
  qrImages.forEach(img => {
    img.src = qrSource;
  });
}

/**
 * Tab Navigation (OS selector)
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

function selectTab(tabId) {
  const btn = document.querySelector(`.tab-btn[data-target="${tabId}"]`);
  if (btn) btn.click();
}

function selectTabAndScroll(tabId) {
  selectTab(tabId);
  const installSection = document.getElementById('install');
  if (installSection) {
    installSection.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Copy to Clipboard functionality
 */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);

      if (!targetEl) return;

      const textToCopy = targetEl.innerText.trim();

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `✓ Copiato!`;
        btn.classList.add('copied');

        showToast('Comando copiato negli appunti!');

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('copied');
        }, 2200);
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
      });
    });
  });
}

/**
 * Toast Notification Helper
 */
function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2500);
}

/**
 * QR Code Modal for Mobile App
 */
function initQrModal() {
  const openModalBtns = document.querySelectorAll('.open-qr-modal');
  const modal = document.getElementById('qrModal');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!modal) return;

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

/**
 * Mobile Navigation Menu Toggler
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });
}
