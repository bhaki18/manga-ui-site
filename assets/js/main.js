/**
 * Manga Ecosystem Showcase - Client Engine
 * Dynamically queries https://bhaki18.github.io/manga-cli/ gh-pages manifests
 * and provides interactive installers, copy tools and modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLiveVersions();
  initTabs();
  initCopyButtons();
  initQrModal();
  initMobileMenu();
});

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
      applyDesktopData(data);
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
      applyMobileData(data);
    } else {
      applyMobileData(DEFAULTS.mobile);
    }
  } catch (err) {
    console.warn('Could not fetch mobile version, using default.', err);
    applyMobileData(DEFAULTS.mobile);
  }
}

function applyDesktopData(data) {
  const version = data.version || DEFAULTS.desktop.version;
  const debUrl = data.debPackageUrl || DEFAULTS.desktop.debUrl;
  const archUrl = data.archPackageUrl || DEFAULTS.desktop.archUrl;

  // Update DOM badges & links
  document.querySelectorAll('.val-desktop-version').forEach(el => el.textContent = `v${version}`);
  
  const debBtn = document.getElementById('btn-download-deb');
  if (debBtn) {
    // If debPackageUrl is a relative or raw URL, ensure it points to bhaki18.github.io
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

  // Update dynamic deb command in tab snippet
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

  // Update QR code URL in DOM if needed
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

      // Extract plain text (remove HTML formatting)
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

  // Trigger CSS animation
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

  // Close when clicking nav-link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });
}
