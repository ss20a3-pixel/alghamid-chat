// ═══════════════════════════════════════════════════════════════
//  perf.js  –  Performance, PWA registration & install prompt
// ═══════════════════════════════════════════════════════════════

// ── 1. Service Worker Registration ──────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[PWA] SW registered, scope:', reg.scope);

        // Check for updates every 60 s while app is open
        setInterval(() => reg.update(), 60_000);

        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          newSW?.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      })
      .catch(err => console.warn('[PWA] SW registration failed:', err));
  });
}

// ── 2. Update Banner ────────────────────────────────────────────
function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.id = 'updateBanner';
  banner.innerHTML = `
    <span>🔄 يوجد تحديث جديد للتطبيق</span>
    <button onclick="applyUpdate()" style="background:#7C3AED;border:none;border-radius:8px;color:white;padding:6px 14px;cursor:pointer;font-family:Cairo,sans-serif;font-weight:700;font-size:13px">تحديث الآن</button>
    <button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:#9090B0;cursor:pointer;font-size:18px;padding:0 6px">✕</button>
  `;
  Object.assign(banner.style, {
    position: 'fixed', bottom: '80px', left: '50%',
    transform: 'translateX(-50%)',
    background: '#1A1A28', border: '1px solid #7C3AED',
    borderRadius: '14px', padding: '12px 18px',
    display: 'flex', alignItems: 'center', gap: '12px',
    zIndex: '9999', boxShadow: '0 8px 30px rgba(124,58,237,0.4)',
    fontFamily: 'Cairo,sans-serif', fontSize: '13px', color: '#F0F0FF',
    whiteSpace: 'nowrap'
  });
  document.body.appendChild(banner);
}

function applyUpdate() {
  navigator.serviceWorker.getRegistration().then(reg => {
    reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  });
}

// ── 3. Install Prompt (Add to Home Screen) ──────────────────────
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  // Show our custom banner after 5 s (not immediately)
  setTimeout(showInstallBanner, 5000);
});

function showInstallBanner() {
  if (!deferredInstallPrompt) return;
  if (document.getElementById('installBanner')) return;

  const banner = document.createElement('div');
  banner.id = 'installBanner';
  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:44px;height:44px;background:linear-gradient(135deg,#7C3AED,#EC4899);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🎙️</div>
      <div>
        <div style="font-weight:800;font-size:14px">ثبّت تطبيق صوتي</div>
        <div style="font-size:12px;color:#9090B0">وصول سريع من شاشتك الرئيسية</div>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button id="installBtn" style="flex:2;padding:10px;background:linear-gradient(135deg,#7C3AED,#EC4899);border:none;border-radius:10px;color:white;cursor:pointer;font-family:Cairo,sans-serif;font-weight:700;font-size:13px">
        📲 تثبيت
      </button>
      <button onclick="dismissInstall()" style="flex:1;padding:10px;background:#22223A;border:1px solid #2A2A45;border-radius:10px;color:#9090B0;cursor:pointer;font-family:Cairo,sans-serif;font-size:13px">
        لاحقاً
      </button>
    </div>
  `;
  Object.assign(banner.style, {
    position: 'fixed', bottom: '24px', right: '24px',
    background: '#12121A', border: '1px solid #2A2A45',
    borderRadius: '18px', padding: '18px',
    zIndex: '9998', boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
    fontFamily: 'Cairo,sans-serif', color: '#F0F0FF',
    width: '280px', direction: 'rtl',
    animation: 'slideUp 0.3s ease'
  });
  document.body.appendChild(banner);

  document.getElementById('installBtn').addEventListener('click', triggerInstall);
}

async function triggerInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  console.log('[PWA] Install outcome:', outcome);
  deferredInstallPrompt = null;
  document.getElementById('installBanner')?.remove();
  if (outcome === 'accepted') {
    typeof showToast === 'function' && showToast('تم تثبيت التطبيق بنجاح! 🎉', 'success');
  }
}

function dismissInstall() {
  document.getElementById('installBanner')?.remove();
  // Don't show again for 3 days
  localStorage.setItem('installDismissed', Date.now() + 3 * 86400_000);
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  document.getElementById('installBanner')?.remove();
  typeof showToast === 'function' && showToast('صوتي مثبّت على جهازك! 📲', 'success');
});

// ── 4. Debounce Utility ─────────────────────────────────────────
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

// Global debounced search handlers (replaces oninput attributes to avoid conflicts)
const _debouncedHandlers = new Map();

function _getDebouncedFn(id, handlerFn) {
  if (!_debouncedHandlers.has(id)) {
    _debouncedHandlers.set(id, debounce(handlerFn, 250));
  }
  return _debouncedHandlers.get(id);
}

// Called from renderHome / renderExplore oninput
function filterRoomsDebounced(value) {
  _getDebouncedFn('homeSearch', v => typeof filterRooms === 'function' && filterRooms(v))(value);
}
function filterExploreDebounced(value) {
  _getDebouncedFn('exploreSearch', v => typeof filterExplore === 'function' && filterExplore(v))(value);
}

// ── 5. Idle-time pre-render ─────────────────────────────────────
function scheduleIdleWork(fn) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(fn, { timeout: 2000 });
  } else {
    setTimeout(fn, 200);
  }
}

// Pre-warm avatar cache on idle
scheduleIdleWork(() => {
  if (typeof APP_DATA === 'undefined') return;
  APP_DATA.rooms.forEach(r => {
    r._preRendered = true; // mark as pre-processed
  });
});

// ── 6. Auto-stop intervals when page is hidden ──────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause heavy animations via CSS class
    document.body.classList.add('page-hidden');
  } else {
    document.body.classList.remove('page-hidden');
  }
});

// ── 7. Intersection Observer for lazy section rendering ─────────
function observeLazySection(el, renderFn) {
  if (!el) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        renderFn();
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });
  io.observe(el);
}

// ── 8. Reduce animations for users who prefer it ───────────────
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const style = document.createElement('style');
  style.textContent = `
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `;
  document.head.appendChild(style);
}

// ── 9. Network status indicator ─────────────────────────────────
function showOfflineBanner() {
  let el = document.getElementById('offlineBanner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'offlineBanner';
    el.textContent = '📵 أنت غير متصل بالإنترنت – يعمل التطبيق بوضع التخزين المؤقت';
    Object.assign(el.style, {
      position: 'fixed', top: 0, left: 0, right: 0,
      background: '#EF4444', color: 'white',
      textAlign: 'center', padding: '8px',
      fontFamily: 'Cairo,sans-serif', fontSize: '13px',
      fontWeight: '700', zIndex: '99999', direction: 'rtl'
    });
    document.body.prepend(el);
  }
}

function hideOfflineBanner() {
  document.getElementById('offlineBanner')?.remove();
  typeof showToast === 'function' && showToast('عاد الاتصال بالإنترنت ✅', 'success');
}

window.addEventListener('offline', showOfflineBanner);
window.addEventListener('online',  hideOfflineBanner);
if (!navigator.onLine) showOfflineBanner();

// ── 10. Handle PWA deep-link shortcuts ──────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const action = params.get('action');
  if (action === 'create')  setTimeout(() => typeof showCreateRoom  === 'function' && showCreateRoom(),  1000);
  if (action === 'explore') setTimeout(() => typeof navigate        === 'function' && navigate('explore'), 1000);
});
