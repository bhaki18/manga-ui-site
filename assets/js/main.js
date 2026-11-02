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
    notes: 'MP4/HLS streaming support and UI stability patch'
  },
  mobile: {
    version: '1.0.9',
    notes: 'Latest update: stability patch',
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
    if (subEl) subEl.textContent = `For Android (APK) • v${mobVer}`;
  } else if (userOS.id === 'arch') {
    btn.href = '#tab-arch';
    btn.removeAttribute('download');
    btn.onclick = (e) => {
      e.preventDefault();
      selectTabAndScroll('tab-arch');
    };
    if (subEl) subEl.textContent = `For Arch Linux (Pacman Repo) • v${deskVer}`;
  } else if (userOS.id === 'windows') {
    btn.href = '#tab-win';
    btn.removeAttribute('download');
    btn.onclick = (e) => {
      e.preventDefault();
      selectTabAndScroll('tab-win');
    };
    if (subEl) subEl.textContent = `For Windows (x64) • v${deskVer}`;
  } else {
    // Default Linux (.deb)
    btn.href = debUrl;
    btn.setAttribute('download', `manga-gui_${deskVer}_amd64.deb`);
    btn.onclick = null;
    if (subEl) subEl.textContent = `For Linux (Ubuntu / Debian .deb) • v${deskVer}`;
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
 * Fetch remote version manifests with cache-busting from GitHub
 */
async function initLiveVersions() {
  const timestamp = Date.now();

  // 1. Fetch Manga GUI (Desktop) - Checks manga-gui repo first, falls back to gh-pages
  const guiEndpoints = [
    `https://raw.githubusercontent.com/bhaki18/manga-gui/main/version.json?_t=${timestamp}`,
    `https://bhaki18.github.io/manga-cli/version.json?_t=${timestamp}`
  ];

  for (const url of guiEndpoints) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.version) {
          currentData.desktop = { ...DEFAULTS.desktop, ...data };
          applyDesktopData(currentData.desktop);
          break;
        }
      }
    } catch (e) {
      console.warn(`Could not fetch desktop version from ${url}:`, e);
    }
  }

  // 2. Fetch Manga GUI Mobile - Checks manga-gui-mobile repo first, falls back to gh-pages
  const mobileEndpoints = [
    `https://raw.githubusercontent.com/bhaki18/manga-gui-mobile/main/version_mobile.json?_t=${timestamp}`,
    `https://bhaki18.github.io/manga-cli/version_mobile.json?_t=${timestamp}`
  ];

  for (const url of mobileEndpoints) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.version) {
          currentData.mobile = { ...DEFAULTS.mobile, ...data };
          applyMobileData(currentData.mobile);
          break;
        }
      }
    } catch (e) {
      console.warn(`Could not fetch mobile version from ${url}:`, e);
    }
  }

  // 3. Fetch Manga CLI - Checks manga-cli package.json first
  const cliEndpoints = [
    `https://raw.githubusercontent.com/bhaki18/manga-cli/main/package.json?_t=${timestamp}`,
    `https://bhaki18.github.io/manga-cli/x86_64/version.json?_t=${timestamp}`
  ];

  for (const url of cliEndpoints) {
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.version) {
          currentData.cli.version = data.version;
          applyCliData(currentData.cli);
          break;
        }
      }
    } catch (e) {
      console.warn(`Could not fetch CLI version from ${url}:`, e);
    }
  }

  // Re-apply Hero CTA with live version tags
  applyHeroDownloadTarget();
}

function applyDesktopData(data) {
  const version = data.version || DEFAULTS.desktop.version;
  let debUrl = data.debPackageUrl || DEFAULTS.desktop.debUrl;
  let archUrl = data.archPackageUrl || DEFAULTS.desktop.archUrl;

  if (!debUrl.startsWith('http')) {
    debUrl = `https://bhaki18.github.io/manga-cli/${debUrl}`;
  }
  if (!archUrl.startsWith('http')) {
    archUrl = `https://bhaki18.github.io/manga-cli/${archUrl}`;
  }

  currentData.desktop.debUrl = debUrl;
  currentData.desktop.archUrl = archUrl;

  // 1. Update all desktop version labels
  document.querySelectorAll('.val-desktop-version').forEach(el => {
    el.textContent = `v${version}`;
  });

  // 2. Update all .deb links across the entire page
  document.querySelectorAll('.link-deb, #btn-download-deb, #modalDebLink').forEach(el => {
    el.href = debUrl;
    el.setAttribute('download', `manga-gui_${version}_amd64.deb`);
  });

  // 3. Update all Arch package links across the entire page
  document.querySelectorAll('.link-arch, #btn-download-arch, #modalArchLink').forEach(el => {
    el.href = archUrl;
    el.setAttribute('download', `manga-gui-bin-${version}-x86_64.pkg.tar.zst`);
  });

  // 4. Update the terminal snippet with the live version and URL
  const debSnippet = document.getElementById('snippet-deb');
  if (debSnippet) {
    debSnippet.innerHTML = 
`<span class="comment"># 1. Download and install the .deb package:</span>
<span class="cmd">curl</span> <span class="flag">-LO</span> ${debUrl}
<span class="cmd">sudo apt</span> install ./manga-gui_${version}_amd64.deb

<span class="comment"># 2. Launch the app:</span>
<span class="cmd">manga-gui</span>`;
  }

  // 5. Update Arch direct download snippet if present
  const archSnippet = document.getElementById('snippet-arch-gui');
  if (archSnippet) {
    archSnippet.innerHTML = `<span class="comment"># Direct package install without adding repository:</span>
<span class="cmd">sudo pacman</span> <span class="flag">-U</span> ${archUrl}`;
  }
}

function applyMobileData(data) {
  const version = data.version || DEFAULTS.mobile.version;
  const apkUrl = data.apkUrl || DEFAULTS.mobile.apkUrl;
  currentData.mobile.apkUrl = apkUrl;

  // 1. Update all mobile version labels
  document.querySelectorAll('.val-mobile-version').forEach(el => {
    el.textContent = `v${version}`;
  });

  // 2. Update all APK links across the entire page
  document.querySelectorAll('.link-apk, .btn-download-apk').forEach(btn => {
    btn.href = apkUrl;
    btn.setAttribute('download', `manga-gui-${version}.apk`);
  });

  // 3. Update all dynamic QR code images
  const qrSource = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(apkUrl)}&bgcolor=11141a&color=f47521&margin=8`;
  document.querySelectorAll('.dynamic-qr-img').forEach(img => {
    img.src = qrSource;
  });
}

function applyCliData(data) {
  const version = data.version || DEFAULTS.cli.version;
  document.querySelectorAll('.val-cli-version').forEach(el => {
    el.textContent = `v${version}`;
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
        btn.innerHTML = `✓ Copied!`;
        btn.classList.add('copied');

        showToast('Command copied to clipboard!');

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
