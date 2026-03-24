// perf.js - Performance, PWA registration & install prompt (compatible)

// 1. Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(function(reg) {
        console.log('[PWA] SW registered, scope:', reg.scope);
        setInterval(function(){ reg.update(); }, 60000);
        reg.addEventListener('updatefound', function() {
          var newSW = reg.installing;
          if (newSW) {
            newSW.addEventListener('statechange', function() {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateBanner();
              }
            });
          }
        });
      })
      .catch(function(err) { console.warn('[PWA] SW failed:', err); });
  });
}

// 2. Update Banner
function showUpdateBanner() {
  var banner = document.createElement('div');
  banner.id = 'updateBanner';
  banner.setAttribute('role', 'alert');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = '<span>تحديث جديد متاح</span>' +
    '<button onclick="applyUpdate()" style="background:#7C3AED;border:none;border-radius:8px;color:white;padding:6px 14px;cursor:pointer;font-family:Cairo,sans-serif;font-weight:700;font-size:13px">تحديث الآن</button>' +
    '<button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:#9090B0;cursor:pointer;font-size:18px;padding:0 6px" aria-label="إغلاق">✕</button>';
  banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1A1A28;border:1px solid #7C3AED;border-radius:14px;padding:12px 18px;display:flex;align-items:center;gap:12px;z-index:9999;box-shadow:0 8px 30px rgba(124,58,237,0.4);font-family:Cairo,sans-serif;font-size:13px;color:#F0F0FF;white-space:nowrap';
  document.body.appendChild(banner);
}

function applyUpdate() {
  navigator.serviceWorker.getRegistration().then(function(reg) {
    if (reg && reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  });
}

// 3. Install Prompt
var deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredInstallPrompt = e;
  var dismissed = localStorage.getItem('installDismissed');
  if (dismissed && Number(dismissed) > Date.now()) return;
  setTimeout(showInstallBanner, 5000);
});

function showInstallBanner() {
  if (!deferredInstallPrompt) return;
  if (document.getElementById('installBanner')) return;

  var banner = document.createElement('div');
  banner.id = 'installBanner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'تثبيت التطبيق');
  banner.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px">' +
      '<div style="width:44px;height:44px;background:linear-gradient(135deg,#7C3AED,#EC4899);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🦅</div>' +
      '<div>' +
        '<div style="font-weight:800;font-size:14px">ثبّت تطبيق الغامض</div>' +
        '<div style="font-size:12px;color:#9090B0">وصول سريع من شاشتك الرئيسية</div>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-top:12px">' +
      '<button id="installBtn" style="flex:2;padding:10px;background:linear-gradient(135deg,#7C3AED,#EC4899);border:none;border-radius:10px;color:white;cursor:pointer;font-family:Cairo,sans-serif;font-weight:700;font-size:13px" aria-label="تثبيت التطبيق">📲 تثبيت</button>' +
      '<button id="installDismiss" style="flex:1;padding:10px;background:#22223A;border:1px solid #2A2A45;border-radius:10px;color:#9090B0;cursor:pointer;font-family:Cairo,sans-serif;font-size:13px" aria-label="لاحقاً">لاحقاً</button>' +
    '</div>';
  banner.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#12121A;border:1px solid #2A2A45;border-radius:18px;padding:18px;z-index:9998;box-shadow:0 16px 60px rgba(0,0,0,0.6);font-family:Cairo,sans-serif;color:#F0F0FF;width:280px;direction:rtl';
  document.body.appendChild(banner);

  document.getElementById('installBtn').addEventListener('click', triggerInstall);
  document.getElementById('installDismiss').addEventListener('click', dismissInstall);
}

function triggerInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.then(function(result) {
    deferredInstallPrompt = null;
    var b = document.getElementById('installBanner');
    if (b) b.remove();
    if (result.outcome === 'accepted' && typeof showToast === 'function') {
      showToast('تم تثبيت الغامض بنجاح! 🎉', 'success');
    }
  });
}

function dismissInstall() {
  var b = document.getElementById('installBanner');
  if (b) b.remove();
  localStorage.setItem('installDismissed', String(Date.now() + 259200000));
}

window.addEventListener('appinstalled', function() {
  deferredInstallPrompt = null;
  var b = document.getElementById('installBanner');
  if (b) b.remove();
  if (typeof showToast === 'function') showToast('الغامض مثبّت على جهازك! 📲', 'success');
});

// 4. Debounce
function debounce(fn, delay) {
  var timer;
  delay = delay || 300;
  return function() {
    var ctx = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
  };
}

if (typeof filterRooms === 'function') {
  window.filterRoomsDebounced = debounce(filterRooms, 250);
}
if (typeof filterExplore === 'function') {
  window.filterExploreDebounced = debounce(filterExplore, 250);
}

// 5. Lazy Image Loading
document.addEventListener('DOMContentLoaded', function() {
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          obs.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach(function(img) { obs.observe(img); });
  }
});

// 6. Local Notifications (no backend needed)
function requestNotifPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendLocalNotification(title, body, icon) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(function(p) {
      if (p === 'granted') new Notification(title, { body: body, icon: icon || './icons/icon-192.png', dir: 'rtl', lang: 'ar' });
    });
    return;
  }
  new Notification(title, { body: body, icon: icon || './icons/icon-192.png', dir: 'rtl', lang: 'ar' });
}

setTimeout(requestNotifPermission, 10000);
