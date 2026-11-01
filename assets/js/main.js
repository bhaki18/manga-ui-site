/**
 * Manga Ecosystem Showcase - Client Engine
 * Dynamically queries https://bhaki18.github.io/manga-cli/ gh-pages manifests,
 * detects visitor OS for seamless 1-click downloads (TLauncher-style),
 * and provides experience switching between GUI and CLI.
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
  initPlatformModal();
  initQrModal();
  initMobileMenu();
  applyHeroDownloadTarget();
  initLiveVersions();

  // Auto-activate the detected OS tab in the install wizard silently
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
      label: 'Android (APK)'
    };
  }

  // iOS / iPadOS
  if (/iphone|ipad|ipod/i.test(ua)) {
    return {
      id: 'ios',
      name: 'iOS',
      icon: '🍎',
      type: 'mobile',
      defaultTab: 'tab-android',
      label: 'Apple iOS'
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
      label: 'Windows (x64)'
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
      label: 'macOS'
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
        label: 'Arch Linux (.pkg)'
      };
    }
    if (/ubuntu|debian|mint|pop/i.test(ua)) {
      return {
        id: 'debian',
        name: 'Debian / Ubuntu',
        icon: '🐧',
        type: 'desktop',
        defaultTab: 'tab-deb',
        label: 'Linux (.deb)'
      };
    }
    return {
      id: 'linux',
      name: 'Linux',
      icon: '🐧',
      type: 'desktop',
      defaultTab: 'tab-deb',
      label: 'Linux (.deb)'
    };
  }

  return {
    id: 'unknown',
    name: 'Computer',
    icon: '⬇',
    type: 'desktop',
    defaultTab: 'tab-deb',
    label: 'Desktop'
  };
}

/**
 * Configure the main TLauncher-style button for the visitor's OS
 */
function applyHeroDownloadTarget() {
  const btn = document.getElementById('btnHeroDownload');
  const iconEl = document.getElementById('heroTlIcon');
  const subEl = document.getElementById('heroTlSub');
  if (!btn || !userOS) return;

  const deskVer = currentData.desktop.version;
  const mobVer = currentData.mobile.version;
  const debUrl = currentData.desktop.debUrl;
  const archUrl = currentData.desktop.archUrl;
  const apkUrl = currentData.mobile.apkUrl;

  if (iconEl) iconEl.textContent = userOS.icon;

  if (userOS.id === 'android') {
    btn.href = apkUrl;
    btn.setAttribute('download', `manga-gui-${mobVer}.apk`);
    btn.onclick = null;
    if (subEl) subEl.textContent = `Per Android (APK) • v${mobVer}`;
  } else if (userOS.id === 'arch') {
    btn.href = archUrl;
    btn.setAttribute('download', `manga-gui-bin-${deskVer}-x86_64.pkg.tar.zst`);
    btn.onclick = null;
    if (subEl) subEl.textContent = `Per Arch Linux (.pkg) • v${deskVer}`;
  } else if (userOS.id === 'windows') {
    btn.href = '#tab-win';
    btn.removeAttribute('download');
    btn.onclick = (e) => {
      e.preventDefault();
      selectTabAndScroll('tab-win');
    };
    if (subEl) subEl.textContent = `Per Windows (x64) • v${deskVer}`;
  } else {
    // Default Linux (.deb)
    btn.href = debUrl;
    btn.setAttribute('download', `manga-gui_${deskVer}_amd64.deb`);
    btn.onclick = null;
    if (subEl) subEl.textContent = `Per Linux (Ubuntu / Debian .deb) • v${deskVer}`;
  }

  // Pre-highlight recommended card in platform modal
  document.querySelectorAll('.platform-card').forEach(c => c.classList.remove('recommended'));
  if (userOS.id === 'windows') {
    const cardWin = document.getElementById('cardPlatformWin');
    if (cardWin) cardWin.classList.add('recommended');
  } else if (userOS.id === 'android') {
    const cardAnd = document.getElementById('cardPlatformAndroid');
    if (cardAnd) cardAnd.classList.add('recommended');
  } else {
    const cardLin = document.getElementById('cardPlatformLinux');
    if (cardLin) cardLin.classList.add('recommended');
  }
}

/**
 * Handle experience switching between GUI and CLI
 */
function initExperienceSwitcher() {
  const buttons = document.querySelectorAll('.switcher-btn');
  const guiHub = document.getElementById('heroGuiHub');
  const cliHub = document.getElementById('heroCliHub');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const exp = btn.getAttribute('data-exp');
      if (exp === activeExperience) return;

      activeExperience = exp;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (exp === 'cli') {
        if (guiHub) guiHub.style.display = 'none';
        if (cliHub) cliHub.classList.add('active');
        highlightAppCard('cli');
      } else {
        if (guiHub) guiHub.style.display = 'flex';
        if (cliHub) cliHub.classList.remove('active');
        highlightAppCard('gui');
      }
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

  // Re-apply Hero CTA with live version tags
  applyHeroDownloadTarget();
}

function applyDesktopData(data) {
  const version = data.version || DEFAULTS.desktop.version;
  const debUrl = data.debPackageUrl || DEFAULTS.desktop.debUrl;
  const archUrl = data.archPackageUrl || DEFAULTS.desktop.archUrl;

  document.querySelectorAll('.val-desktop-version').forEach(el => el.textContent = `v${version}`);
  
  const debBtn = document.getElementById('btn-download-deb');
  const modalDeb = document.getElementById('modalDebLink');
  const finalDebUrl = debUrl.startsWith('http') 
    ? debUrl 
    : `https://bhaki18.github.io/manga-cli/${debUrl}`;

  if (debBtn) {
    debBtn.href = finalDebUrl;
    debBtn.setAttribute('download', `manga-gui_${version}_amd64.deb`);
  }
  if (modalDeb) {
    modalDeb.href = finalDebUrl;
    modalDeb.setAttribute('download', `manga-gui_${version}_amd64.deb`);
  }

  const archBtn = document.getElementById('btn-download-arch');
  const modalArch = document.getElementById('modalArchLink');
  if (archBtn) archBtn.href = archUrl;
  if (modalArch) modalArch.href = archUrl;

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

function selectTabAndCloseModal(tabId) {
  const platformModal = document.getElementById('platformModal');
  if (platformModal) platformModal.classList.remove('active');
  selectTabAndScroll(tabId);
}

/**
 * TLauncher-Style Platform Modal Handlers
 */
function initPlatformModal() {
  const openBtns = document.querySelectorAll('.open-platform-modal');
  const modal = document.getElementById('platformModal');
  const closeBtn = document.getElementById('platformModalCloseBtn');

  if (!modal) return;

  openBtns.forEach(btn => {
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

function openQrFromPlatformModal() {
  const platformModal = document.getElementById('platformModal');
  if (platformModal) platformModal.classList.remove('active');

  const qrModal = document.getElementById('qrModal');
  if (qrModal) qrModal.classList.add('active');
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
