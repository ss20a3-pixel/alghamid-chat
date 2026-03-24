// ═══════════════════════════════════════════════════════════════
//  FEATURES MODULE: XP/Levels · Animated Gifts · Live · Store · Voice FX
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
//  1. XP / LEVELS / BADGES SYSTEM
// ───────────────────────────────────────────────────────────────
const LEVELS = [
  { level:1,  min:0,     max:100,   title:'مبتدئ',      icon:'🌱', color:'#6B7280' },
  { level:2,  min:100,   max:300,   title:'متحمس',      icon:'⚡', color:'#3B82F6' },
  { level:3,  min:300,   max:600,   title:'نشيط',       icon:'🔥', color:'#F59E0B' },
  { level:4,  min:600,   max:1000,  title:'بارع',       icon:'💎', color:'#8B5CF6' },
  { level:5,  min:1000,  max:1500,  title:'خبير',       icon:'🏆', color:'#EC4899' },
  { level:6,  min:1500,  max:2500,  title:'محترف',      icon:'⭐', color:'#10B981' },
  { level:7,  min:2500,  max:4000,  title:'نجم',        icon:'🌟', color:'#F97316' },
  { level:8,  min:4000,  max:6000,  title:'أسطورة',     icon:'👑', color:'#EF4444' },
  { level:9,  min:6000,  max:9000,  title:'خارق',       icon:'🦋', color:'#7C3AED' },
  { level:10, min:9000,  max:15000, title:'إمبراطور',   icon:'🔮', color:'#EC4899' },
  { level:25, min:15000, max:50000, title:'ملك',        icon:'🦁', color:'#F59E0B' },
  { level:50, min:50000, max:150000,title:'أسطورة حية', icon:'⚡', color:'#EF4444' },
  { level:75, min:150000,max:500000,title:'إله الغامض', icon:'🌌', color:'#7C3AED' },
  { level:100,min:500000,max:9999999,title:'مستر غامض 🦅',icon:'🦅',color:'#F5C518' },
];

const BADGES = [
  { id:'app_owner',    icon:'🦅', name:'مدير التطبيق',    desc:'المؤسس والمالك الرسمي',       xp:0,    special:true, color:'#F5C518' },
  { id:'top_supporter',icon:'💰', name:'أقوى داعم',       desc:'الداعم رقم 1 في التطبيق',     xp:0,    special:true, color:'#F59E0B' },
  { id:'vip_diamond',  icon:'💎', name:'VIP Diamond',     desc:'عضوية Diamond مدى الحياة',    xp:0,    special:true, color:'#63B3ED' },
  { id:'excellence',   icon:'⭐', name:'شارة التميز',     desc:'متميز في كل شيء',             xp:0,    special:true, color:'#EC4899' },
  { id:'first_room',   icon:'🎙️', name:'مضيف أول',       desc:'أنشأ أول غرفة',               xp:50   },
  { id:'popular',      icon:'🔥', name:'شعبي',            desc:'100 متابع',                   xp:100  },
  { id:'gifter',       icon:'🎁', name:'كريم',            desc:'أرسل 10 هدايا',               xp:150  },
  { id:'speaker',      icon:'🎤', name:'خطيب',            desc:'تكلم 60 دقيقة',               xp:200  },
  { id:'daily',        icon:'📅', name:'منتظم',           desc:'دخل 7 أيام متتالية',         xp:250  },
  { id:'verified',     icon:'✅', name:'موثق',            desc:'حساب موثق',                   xp:0    },
  { id:'top_gifter',   icon:'💎', name:'أكبر مُهدي',      desc:'أرسل 50 هدية',                xp:500  },
  { id:'host100',      icon:'👑', name:'مئة غرفة',        desc:'أنشأ 100 غرفة',               xp:1000 },
];

let userXP = 0;
let earnedBadges = ['verified', 'first_room'];

try {
  userXP = parseInt(localStorage.getItem('vxp') || '0') || 0;
  earnedBadges = JSON.parse(localStorage.getItem('vbadges') || '["verified","first_room"]');
} catch(e) {}

if (typeof APP_DATA !== 'undefined' && APP_DATA.currentUser) {
  if (APP_DATA.currentUser.xp > userXP) userXP = APP_DATA.currentUser.xp;
  if (APP_DATA.currentUser.badges && APP_DATA.currentUser.badges.length > earnedBadges.length) earnedBadges = APP_DATA.currentUser.badges;
}

function getLevelInfo(xp) {
  return LEVELS.slice().reverse().find(l => xp >= l.min) || LEVELS[0];
}

function addXP(amount, reason) {
  userXP += amount;
  try { localStorage.setItem('vxp', userXP); } catch(e) {}
  const lvl = getLevelInfo(userXP);
  showToast(`+${amount} XP — ${reason}`, 'success');
  const prev = getLevelInfo(userXP - amount);
  if (prev.level < lvl.level) {
    setTimeout(() => showLevelUpModal(lvl), 400);
  }
}

function showLevelUpModal(lvl) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center';
  el.innerHTML = `
    <div style="text-align:center;animation:bounceIn 0.6s ease">
      <div style="font-size:80px;margin-bottom:16px;animation:float 2s infinite">${lvl.icon}</div>
      <div style="font-size:14px;color:var(--text-secondary);margin-bottom:8px;letter-spacing:3px">ترقية المستوى!</div>
      <div style="font-size:48px;font-weight:900;background:linear-gradient(135deg,${lvl.color},#fff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px">المستوى ${lvl.level}</div>
      <div style="font-size:24px;font-weight:700;color:white;margin-bottom:24px">${lvl.icon} ${lvl.title}</div>
      <button onclick="this.parentElement.parentElement.remove()" style="padding:14px 40px;background:linear-gradient(135deg,#7C3AED,#EC4899);border:none;border-radius:50px;color:white;font-size:16px;font-weight:700;cursor:pointer;font-family:Cairo,sans-serif">🎉 رائع!</button>
    </div>`;
  document.body.appendChild(el);
  if (typeof playGiftSound === 'function') playGiftSound();
  setTimeout(() => el.remove(), 6000);
}

function unlockBadge(id) {
  if (earnedBadges.includes(id)) return;
  earnedBadges.push(id);
  try { localStorage.setItem('vbadges', JSON.stringify(earnedBadges)); } catch(e) {}
  const badge = BADGES.find(b => b.id === id);
  if (!badge) return;
  showToast(`${badge.icon} شارة جديدة: ${badge.name}!`, 'gift');
  addXP(badge.xp, `شارة "${badge.name}"`);
}

function renderLevelsPage() {
  const content = document.getElementById('mainContent');
  const lvl = getLevelInfo(userXP);
  const nextLvl = LEVELS.find(l => l.level === lvl.level + 1) || lvl;
  const progress = lvl.level < 10 ? ((userXP - lvl.min) / (nextLvl.min - lvl.min) * 100).toFixed(1) : 100;
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()">☰</button>
      <div class="topbar-title">🏆 المستويات والشارات</div>
    </div>
    <div class="page-content">
      <!-- Current Level Card -->
      <div style="background:linear-gradient(135deg,#7C3AED22,#EC489922);border:1px solid #7C3AED44;border-radius:20px;padding:24px;margin-bottom:20px;text-align:center">
        <div style="font-size:64px;margin-bottom:8px">${lvl.icon}</div>
        <div style="font-size:28px;font-weight:900;color:white">المستوى ${lvl.level}</div>
        <div style="font-size:16px;color:${lvl.color};font-weight:700;margin-bottom:16px">${lvl.title}</div>
        <div style="background:var(--bg-dark);border-radius:50px;height:12px;margin-bottom:8px;overflow:hidden">
          <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#7C3AED,#EC4899);border-radius:50px;transition:width 1s ease"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary)">
          <span>${userXP.toLocaleString()} XP</span>
          <span>${lvl.level < 10 ? nextLvl.min.toLocaleString() + ' XP للمستوى التالي' : 'الحد الأقصى!'}</span>
        </div>
      </div>

      <!-- Badges -->
      <div class="section-header"><div class="section-title">🏅 شاراتي</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:24px">
        ${BADGES.map(b => {
          const earned = earnedBadges.includes(b.id);
          return `<div style="background:var(--bg-card);border:1px solid ${earned ? '#7C3AED66' : 'var(--border)'};border-radius:16px;padding:16px;text-align:center;opacity:${earned ? 1 : 0.4};transition:all 0.2s" ${earned ? `onmouseover="this.style.borderColor='#7C3AED'" onmouseout="this.style.borderColor='#7C3AED66'"` : ''}>
            <div style="font-size:32px;margin-bottom:6px">${b.icon}</div>
            <div style="font-size:13px;font-weight:700">${b.name}</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${b.desc}</div>
            ${earned ? '<div style="font-size:10px;color:#10B981;margin-top:6px;font-weight:700">✓ مكتسبة</div>' : `<div style="font-size:10px;color:var(--text-secondary);margin-top:6px">+${b.xp} XP</div>`}
          </div>`;
        }).join('')}
      </div>

      <!-- All Levels -->
      <div class="section-header"><div class="section-title">📊 جدول المستويات</div></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${LEVELS.map(l => `
          <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--bg-card);border:1px solid ${lvl.level === l.level ? '#7C3AED' : 'var(--border)'};border-radius:14px;${lvl.level === l.level ? 'box-shadow:0 0 12px #7C3AED44' : ''}">
            <div style="font-size:28px;width:40px;text-align:center">${l.icon}</div>
            <div style="flex:1">
              <div style="font-weight:700">المستوى ${l.level} — ${l.title}</div>
              <div style="font-size:12px;color:var(--text-secondary)">${l.min.toLocaleString()} – ${l.max === 99999 ? '∞' : l.max.toLocaleString()} XP</div>
            </div>
            ${userXP >= l.min ? '<div style="color:#10B981;font-size:18px">✓</div>' : ''}
          </div>`).join('')}
      </div>

      <!-- Test Buttons -->
      <div style="margin-top:20px;padding:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px">
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;color:var(--text-secondary)">اختبار النظام</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button onclick="addXP(50,'تجربة')" style="flex:1;padding:10px;background:var(--bg-dark);border:1px solid var(--border);border-radius:10px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">+50 XP</button>
          <button onclick="addXP(200,'تجربة')" style="flex:1;padding:10px;background:var(--bg-dark);border:1px solid var(--border);border-radius:10px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">+200 XP</button>
          <button onclick="unlockBadge('gifter')" style="flex:1;padding:10px;background:var(--bg-dark);border:1px solid var(--border);border-radius:10px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">🎁 فتح شارة</button>
        </div>
      </div>
    </div>`;
}


// ───────────────────────────────────────────────────────────────
//  2. ANIMATED GIFTS SYSTEM
// ───────────────────────────────────────────────────────────────
const GIFTS_CATALOG = [
  { id:'rose',     name:'وردة',       icon:'🌹', cost:10,   particles:'🌹',  color:'#EC4899', animClass:'gift-float'  },
  { id:'heart',    name:'قلب',        icon:'❤️', cost:20,   particles:'❤️',  color:'#EF4444', animClass:'gift-pulse'  },
  { id:'star',     name:'نجمة',       icon:'⭐', cost:50,   particles:'⭐',  color:'#F59E0B', animClass:'gift-spin'   },
  { id:'crown',    name:'تاج',        icon:'👑', cost:100,  particles:'👑',  color:'#F97316', animClass:'gift-bounce' },
  { id:'diamond',  name:'ماسة',       icon:'💎', cost:200,  particles:'💎',  color:'#3B82F6', animClass:'gift-float'  },
  { id:'rocket',   name:'صاروخ',      icon:'🚀', cost:300,  particles:'🚀',  color:'#7C3AED', animClass:'gift-rocket' },
  { id:'galaxy',   name:'مجرة',       icon:'🌌', cost:500,  particles:'✨',  color:'#8B5CF6', animClass:'gift-galaxy' },
  { id:'love',     name:'حب أبدي',    icon:'💝', cost:1000, particles:'💝',  color:'#EC4899', animClass:'gift-explode'},
];

function showGiftPanel(targetName) {
  const existing = document.getElementById('giftPanelOverlay');
  if (existing) existing.remove();
  const u = APP_DATA.currentUser;
  const panel = document.createElement('div');
  panel.id = 'giftPanelOverlay';
  panel.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:flex-end;justify-content:center';
  panel.innerHTML = `
    <div style="background:var(--bg-card);border-radius:24px 24px 0 0;width:100%;max-width:600px;padding:20px;max-height:80vh;overflow-y:auto;animation:slideUp 0.3s ease">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:16px;font-weight:800">🎁 أرسل هدية لـ ${targetName || 'الغرفة'}</div>
        <button onclick="document.getElementById('giftPanelOverlay').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:12px;background:var(--bg-dark);border-radius:12px">
        <span style="font-size:20px">💰</span>
        <span style="font-size:14px;font-weight:700">رصيدك: <span id="giftCoinsDisplay" style="color:#F59E0B">${u.coins.toLocaleString()}</span> عملة</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
        ${GIFTS_CATALOG.map(g => `
          <div onclick="sendGift('${g.id}','${targetName || ''}')" style="background:var(--bg-dark);border:2px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='${g.color}';this.style.background='${g.color}22'" onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--bg-dark)'">
            <div style="font-size:32px;margin-bottom:6px">${g.icon}</div>
            <div style="font-size:12px;font-weight:700">${g.name}</div>
            <div style="font-size:11px;color:#F59E0B;margin-top:4px">💰 ${g.cost}</div>
          </div>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(panel);
  panel.addEventListener('click', e => { if (e.target === panel) panel.remove(); });
}

function sendGift(giftId, targetName) {
  const u = APP_DATA.currentUser;
  const gift = GIFTS_CATALOG.find(g => g.id === giftId);
  if (!gift) return;
  if (u.coins < gift.cost) {
    showToast('رصيدك غير كافٍ! اشحن رصيدك', 'error');
    (_el('giftPanelOverlay')).remove();
    navigate('store');
    return;
  }
  u.coins -= gift.cost;
  const display = document.getElementById('giftCoinsDisplay');
  if (display) display.textContent = u.coins.toLocaleString();
  (_el('giftPanelOverlay')).remove();
  launchGiftAnimation(gift, targetName);
  addXP(20, `إرسال هدية ${gift.name}`);
  if (typeof playGiftSound === 'function') playGiftSound();
  showToast(`أرسلت ${gift.icon} ${gift.name} لـ ${targetName || 'الغرفة'}!`, 'gift');
}

function launchGiftAnimation(gift, targetName) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9990;overflow:hidden';
  const banner = document.createElement('div');
  banner.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,${gift.color}cc,${gift.color}66);backdrop-filter:blur(12px);border:2px solid ${gift.color};border-radius:24px;padding:24px 36px;text-align:center;animation:giftBannerIn 0.5s ease`;
  banner.innerHTML = `
    <div style="font-size:72px;animation:bounce 0.4s ease infinite alternate">${gift.icon}</div>
    <div style="font-size:18px;font-weight:900;color:white;margin-top:8px">${APP_DATA.currentUser.name}</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px">أرسل ${gift.name} ${targetName ? 'لـ '+targetName : ''}</div>`;
  overlay.appendChild(banner);
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.textContent = gift.particles;
    p.style.cssText = `position:absolute;font-size:${20+Math.random()*24}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:particleFall ${1.5+Math.random()*2}s ease forwards;animation-delay:${Math.random()*0.8}s`;
    overlay.appendChild(p);
  }
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 3500);
}

function addGiftCSS() {
  if (document.getElementById('giftStyle')) return;
  const s = document.createElement('style');
  s.id = 'giftStyle';
  s.textContent = `
    @keyframes giftBannerIn { from{opacity:0;transform:translate(-50%,-50%) scale(0.5)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
    @keyframes particleFall { from{opacity:1;transform:translateY(0) rotate(0deg)} to{opacity:0;transform:translateY(200px) rotate(360deg)} }
    @keyframes bounceIn { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
    @keyframes bounce { from{transform:translateY(0)} to{transform:translateY(-12px)} }
  `;
  document.head.appendChild(s);
}


// ───────────────────────────────────────────────────────────────
//  3. LIVE STREAMING
// ───────────────────────────────────────────────────────────────
let liveState = {
  active: false, viewers: 0, likes: 0, duration: 0,
  timer: null, viewerTimer: null
};

function renderLivePage() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()">☰</button>
      <div class="topbar-title">📡 البث المباشر</div>
    </div>
    <div class="page-content" style="max-width:700px">

      ${!liveState.active ? `
      <!-- Start Live -->
      <div style="background:linear-gradient(135deg,#7C3AED22,#EC489922);border:1px solid #7C3AED44;border-radius:24px;padding:32px;text-align:center;margin-bottom:20px">
        <div style="font-size:72px;margin-bottom:16px;animation:pulse 2s infinite">📡</div>
        <div style="font-size:22px;font-weight:900;margin-bottom:8px">ابدأ بثاً مباشراً</div>
        <div style="font-size:14px;color:var(--text-secondary);margin-bottom:24px">شارك صوتك مع الجميع في الوقت الفعلي</div>
        <div style="margin-bottom:20px">
          <input id="liveTitle" placeholder="عنوان البث..." style="width:100%;padding:12px 16px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:14px;outline:none;margin-bottom:10px">
          <select id="liveCat" style="width:100%;padding:12px 16px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:14px;outline:none">
            <option value="music">🎵 موسيقى</option>
            <option value="talk">🎙️ حديث</option>
            <option value="gaming">🎮 ألعاب</option>
            <option value="education">📚 تعليم</option>
          </select>
        </div>
        <button onclick="startLive()" style="padding:16px 48px;background:linear-gradient(135deg,#EF4444,#EC4899);border:none;border-radius:50px;color:white;font-size:18px;font-weight:900;cursor:pointer;font-family:Cairo,sans-serif;box-shadow:0 8px 24px rgba(239,68,68,0.4)">
          🔴 ابدأ البث الآن
        </button>
      </div>

      <!-- Live Rooms -->
      <div class="section-header"><div class="section-title">🔴 بثوث مباشرة الآن</div></div>
      <div style="display:flex;flex-direction:column;gap:10px" id="liveRoomsList">
        ${[
          {name:'سارة أحمد', viewers:1240, title:'مساء الموسيقى 🎵', icon:'🎵', color:'linear-gradient(135deg,#7C3AED,#EC4899)'},
          {name:'عمر خالد',  viewers:892,  title:'نقاش تقني حي 💻',  icon:'💻', color:'linear-gradient(135deg,#3B82F6,#7C3AED)'},
          {name:'يوسف كوميدي',viewers:3400, title:'ليلة الضحكات 😂',  icon:'😂', color:'linear-gradient(135deg,#F59E0B,#EF4444)'},
        ].map(r => `
          <div onclick="showToast('انضممت للبث 📡','success')" style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='#EF4444'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="width:56px;height:56px;border-radius:50%;background:${r.color};display:flex;align-items:center;justify-content:center;font-size:24px;position:relative;flex-shrink:0">
              ${r.icon}
              <span style="position:absolute;top:-4px;right:-4px;background:#EF4444;color:white;font-size:9px;font-weight:900;padding:2px 5px;border-radius:6px;border:2px solid var(--bg-card)">LIVE</span>
            </div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:700">${r.title}</div>
              <div style="font-size:12px;color:var(--text-secondary)">${r.name}</div>
              <div style="font-size:11px;color:#EF4444;margin-top:2px">👁️ ${r.viewers.toLocaleString()} مشاهد</div>
            </div>
            <div style="padding:8px 14px;background:#EF444422;border:1px solid #EF444444;border-radius:20px;color:#EF4444;font-size:12px;font-weight:700">انضم</div>
          </div>`).join('')}
      </div>` : `
      <!-- Active Live Dashboard -->
      <div id="liveDashboard">
        <div style="background:linear-gradient(135deg,#EF444422,#EC489922);border:2px solid #EF4444;border-radius:24px;padding:24px;text-align:center;margin-bottom:20px;position:relative">
          <div style="position:absolute;top:16px;right:16px;background:#EF4444;color:white;font-size:12px;font-weight:900;padding:4px 12px;border-radius:20px;animation:pulse 1.5s infinite">🔴 LIVE</div>
          <div style="font-size:56px;margin-bottom:8px">📡</div>
          <div style="font-size:20px;font-weight:900" id="liveCurrentTitle"></div>
          <div style="font-size:14px;color:var(--text-secondary);margin-top:4px" id="liveTimer">00:00</div>
          <div style="display:flex;justify-content:center;gap:32px;margin-top:20px">
            <div style="text-align:center"><div style="font-size:28px;font-weight:900;color:#EF4444" id="liveViewers">0</div><div style="font-size:12px;color:var(--text-secondary)">مشاهد</div></div>
            <div style="text-align:center"><div style="font-size:28px;font-weight:900;color:#EC4899" id="liveLikes">0</div><div style="font-size:12px;color:var(--text-secondary)">إعجاب</div></div>
            <div style="text-align:center"><div style="font-size:28px;font-weight:900;color:#F59E0B" id="liveXP">0</div><div style="font-size:12px;color:var(--text-secondary)">XP</div></div>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <button onclick="liveState.likes++;document.getElementById('liveLikes').textContent=liveState.likes" style="flex:1;padding:14px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:16px;cursor:pointer">❤️ إعجاب</button>
          <button onclick="showGiftPanel('البث المباشر')" style="flex:1;padding:14px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:16px;cursor:pointer">🎁 هدية</button>
          <button onclick="endLive()" style="flex:1;padding:14px;background:#EF444422;border:1px solid #EF4444;border-radius:14px;color:#EF4444;font-family:Cairo,sans-serif;font-size:13px;font-weight:700;cursor:pointer">⏹️ إنهاء</button>
        </div>
        <!-- Live Chat -->
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;overflow:hidden">
          <div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:14px;font-weight:700">💬 تعليقات مباشرة</div>
          <div id="liveChatBox" style="height:200px;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px"></div>
          <div style="padding:10px;border-top:1px solid var(--border);display:flex;gap:8px">
            <input id="liveChatInput" placeholder="أضف تعليقاً..." style="flex:1;padding:9px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:20px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;outline:none" onkeydown="if(event.key==='Enter')sendLiveComment()">
            <button onclick="sendLiveComment()" style="width:36px;height:36px;background:var(--gradient-1);border:none;border-radius:50%;color:white;font-size:16px;cursor:pointer">➤</button>
          </div>
        </div>
      </div>`}
    </div>`;
}

function startLive() {
  const title = (_el('liveTitle')).value.trim() || 'بثي المباشر';
  liveState = { active:true, viewers:1, likes:0, duration:0, xp:0, title, timer:null, viewerTimer:null };
  liveState.timer = setInterval(() => {
    liveState.duration++;
    const m = String(Math.floor(liveState.duration/60)).padStart(2,'0');
    const s = String(liveState.duration%60).padStart(2,'0');
    const el = document.getElementById('liveTimer');
    if (el) el.textContent = `${m}:${s}`;
    if (liveState.duration % 30 === 0) {
      addXP(10, 'بث مباشر');
      const xpEl = document.getElementById('liveXP');
      if (xpEl) xpEl.textContent = Math.floor(liveState.duration/30) * 10;
    }
  }, 1000);
  liveState.viewerTimer = setInterval(() => {
    liveState.viewers = Math.max(1, liveState.viewers + Math.floor(Math.random()*5 - 1));
    const el = document.getElementById('liveViewers');
    if (el) el.textContent = liveState.viewers;
    addLiveComment();
  }, 3000);
  renderLivePage();
  document.getElementById('liveCurrentTitle').textContent = title;
  showToast('🔴 بدأ البث المباشر!', 'success');
  if (typeof playJoinSound === 'function') playJoinSound();
}

function endLive() {
  clearInterval(liveState.timer);
  clearInterval(liveState.viewerTimer);
  const dur = liveState.duration;
  liveState.active = false;
  renderLivePage();
  const m = Math.floor(dur/60), s = dur%60;
  showToast(`انتهى البث — ${m}:${String(s).padStart(2,'0')} دقيقة`, 'info');
  addXP(50, 'إنهاء بث مباشر');
  if (dur >= 60) unlockBadge('speaker');
}

const LIVE_COMMENTS = ['رائع 🔥','أحبك 😍','واو!!','❤️❤️','الله يعطيك العافية','جميل جداً','👏👏','ما شاء الله'];
const LIVE_USERS = ['سارة','عمر','نورة','خالد','فاطمة','يوسف','ريم','محمد'];
function addLiveComment() {
  const box = document.getElementById('liveChatBox');
  if (!box) return;
  const user = LIVE_USERS[Math.floor(Math.random()*LIVE_USERS.length)];
  const msg = LIVE_COMMENTS[Math.floor(Math.random()*LIVE_COMMENTS.length)];
  const div = document.createElement('div');
  div.style.cssText = 'font-size:13px;display:flex;gap:8px;align-items:flex-start';
  div.innerHTML = `<span style="color:var(--primary-light);font-weight:700;white-space:nowrap">${user}:</span><span style="color:var(--text-primary)">${msg}</span>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  if (box.children.length > 50) box.removeChild(box.firstChild);
}
function sendLiveComment() {
  const input = document.getElementById('liveChatInput');
  if (!(input?input.value:"").trim()) return;
  const box = document.getElementById('liveChatBox');
  const div = document.createElement('div');
  div.style.cssText = 'font-size:13px;display:flex;gap:8px;align-items:flex-start';
  div.innerHTML = `<span style="color:#10B981;font-weight:700;white-space:nowrap">أنت:</span><span style="color:var(--text-primary)">${input.value.trim()}</span>`;
  if (box) box.appendChild(div);
  if (box) box.scrollTop = box.scrollHeight;
  input.value = '';
}


// ───────────────────────────────────────────────────────────────
//  4. COINS STORE
// ───────────────────────────────────────────────────────────────
const COIN_PACKS = [
  { id:'p1', coins:100,   bonus:0,   price:'0.99',  badge:'',       popular:false },
  { id:'p2', coins:500,   bonus:50,  price:'3.99',  badge:'',       popular:false },
  { id:'p3', coins:1000,  bonus:150, price:'6.99',  badge:'الأكثر شراءً', popular:true  },
  { id:'p4', coins:3000,  bonus:600, price:'17.99', badge:'',       popular:false },
  { id:'p5', coins:7000,  bonus:2000,price:'34.99', badge:'قيمة رائعة', popular:false },
  { id:'p6', coins:15000, bonus:5000,price:'59.99', badge:'VIP',    popular:false },
];
const VIP_PLANS = [
  { id:'v1', name:'VIP شهري',   icon:'⭐', price:'4.99',  period:'شهر',    perks:['شارة VIP','5X XP','بدون إعلانات','غرفة مميزة'] },
  { id:'v2', name:'VIP سنوي',   icon:'💎', price:'39.99', period:'سنة',    perks:['كل مزايا الشهري','فلاتر حصرية','دعم أولوية','هدايا مجانية كل شهر'] },
  { id:'v3', name:'VIP مدى الحياة',icon:'👑',price:'149.99',period:'مرة واحدة',perks:['كل المزايا إلى الأبد','شارة ذهبية حصرية','اسم مميز','أولوية الغرف'] },
];

function renderStore() {
  const u = APP_DATA.currentUser;
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()">☰</button>
      <div class="topbar-title">🛒 المتجر</div>
    </div>
    <div class="page-content">

      <!-- Balance -->
      <div style="background:linear-gradient(135deg,#F59E0B22,#EF444422);border:1px solid #F59E0B44;border-radius:20px;padding:20px;margin-bottom:20px;display:flex;align-items:center;gap:16px">
        <div style="font-size:48px">💰</div>
        <div>
          <div style="font-size:28px;font-weight:900;color:#F59E0B" id="storeCoinsDisplay">${u.coins.toLocaleString()}</div>
          <div style="font-size:13px;color:var(--text-secondary)">عملاتك الحالية</div>
        </div>
        <div style="margin-right:auto;text-align:center">
          <div style="font-size:24px;font-weight:900;color:#3B82F6">${u.diamonds}</div>
          <div style="font-size:12px;color:var(--text-secondary)">💎 ماسات</div>
        </div>
      </div>

      <!-- Coin Packs -->
      <div class="section-header"><div class="section-title">💰 باقات العملات</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:24px">
        ${COIN_PACKS.map(p => `
          <div onclick="buyCoinPack('${p.id}')" style="background:var(--bg-card);border:2px solid ${p.popular?'#F59E0B':'var(--border)'};border-radius:16px;padding:16px;text-align:center;cursor:pointer;transition:all 0.2s;position:relative" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
            ${p.popular ? `<div style="position:absolute;top:-10px;right:50%;transform:translateX(50%);background:#F59E0B;color:black;font-size:10px;font-weight:900;padding:3px 10px;border-radius:10px">${p.badge}</div>` : p.badge ? `<div style="position:absolute;top:-10px;right:50%;transform:translateX(50%);background:#7C3AED;color:white;font-size:10px;font-weight:900;padding:3px 10px;border-radius:10px">${p.badge}</div>` : ''}
            <div style="font-size:32px;margin-bottom:6px">💰</div>
            <div style="font-size:20px;font-weight:900;color:#F59E0B">${p.coins.toLocaleString()}</div>
            ${p.bonus ? `<div style="font-size:11px;color:#10B981;margin-top:2px">+${p.bonus} مجاناً!</div>` : '<div style="font-size:11px;color:transparent">.</div>'}
            <div style="margin-top:8px;padding:8px;background:var(--gradient-1);border-radius:10px;color:white;font-weight:700;font-size:14px">$${p.price}</div>
          </div>`).join('')}
      </div>

      <!-- VIP -->
      <div class="section-header"><div class="section-title">👑 اشتراك VIP</div></div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">
        ${VIP_PLANS.map(v => `
          <div onclick="buyVIP('${v.id}')" style="background:var(--bg-card);border:2px solid ${v.id==='v2'?'#F59E0B':'var(--border)'};border-radius:18px;padding:18px 20px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:16px" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
            <div style="font-size:40px">${v.icon}</div>
            <div style="flex:1">
              <div style="font-size:16px;font-weight:800">${v.name}</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
                ${v.perks.map(p => `<span style="font-size:11px;background:var(--bg-dark);padding:3px 8px;border-radius:6px;color:var(--text-secondary)">${p}</span>`).join('')}
              </div>
            </div>
            <div style="text-align:center;flex-shrink:0">
              <div style="font-size:22px;font-weight:900;color:#F59E0B">$${v.price}</div>
              <div style="font-size:11px;color:var(--text-secondary)">${v.period}</div>
            </div>
          </div>`).join('')}
      </div>

      <!-- Free Coins -->
      <div class="section-header"><div class="section-title">🎁 عملات مجانية</div></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {icon:'📅',title:'المكافأة اليومية',   desc:'ادخل كل يوم واحصل على عملات', btn:'استلم 50 عملة',  coins:50,  id:'daily'},
          {icon:'👥',title:'دعوة صديق',          desc:'ادعُ صديقاً واحصل على مكافأة',btn:'دعوة',           coins:200, id:'invite'},
          {icon:'🎬',title:'شاهد إعلاناً',       desc:'إعلان واحد = 20 عملة',        btn:'شاهد الآن',      coins:20,  id:'ad'},
        ].map(t => `
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px">
            <div style="font-size:32px">${t.icon}</div>
            <div style="flex:1">
              <div style="font-size:14px;font-weight:700">${t.title}</div>
              <div style="font-size:12px;color:var(--text-secondary)">${t.desc}</div>
            </div>
            <button onclick="freeCoins(${t.coins},'${t.title}')" style="padding:9px 16px;background:var(--gradient-1);border:none;border-radius:10px;color:white;font-family:Cairo,sans-serif;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">${t.btn}</button>
          </div>`).join('')}
      </div>
    </div>`;
}

function buyCoinPack(id) {
  const pack = COIN_PACKS.find(p => p.id === id);
  if (!pack) return;
  APP_DATA.currentUser.coins += pack.coins + pack.bonus;
  const el = document.getElementById('storeCoinsDisplay');
  if (el) el.textContent = APP_DATA.currentUser.coins.toLocaleString();
  showToast(`+${(pack.coins+pack.bonus).toLocaleString()} عملة أُضيفت لحسابك! 💰`, 'success');
  addXP(30, 'شراء عملات');
  if (typeof playGiftSound === 'function') playGiftSound();
}

function buyVIP(id) {
  const plan = VIP_PLANS.find(v => v.id === id);
  if (!plan) return;
  APP_DATA.currentUser.isVip = true;
  showToast(`مرحباً بك في ${plan.name} ${plan.icon}`, 'success');
  addXP(500, 'اشتراك VIP');
  unlockBadge('verified');
}

function freeCoins(amount, title) {
  APP_DATA.currentUser.coins += amount;
  const el = document.getElementById('storeCoinsDisplay');
  if (el) el.textContent = APP_DATA.currentUser.coins.toLocaleString();
  showToast(`+${amount} عملة مجانية من "${title}"! 🎁`, 'success');
  addXP(5, title);
}


// ───────────────────────────────────────────────────────────────
//  5. VOICE EFFECTS
// ───────────────────────────────────────────────────────────────
const VOICE_EFFECTS = [
  { id:'normal',  name:'طبيعي',      icon:'🎤', desc:'بدون تأثير' },
  { id:'deep',    name:'صوت عميق',   icon:'🦁', desc:'تردد أخفض' },
  { id:'robot',   name:'روبوت',      icon:'🤖', desc:'صوت إلكتروني' },
  { id:'helium',  name:'هيليوم',     icon:'🎈', desc:'صوت مرتفع' },
  { id:'echo',    name:'صدى',        icon:'🏔️', desc:'مع تردد' },
  { id:'alien',   name:'فضائي',      icon:'👽', desc:'تأثير غريب' },
  { id:'whisper', name:'همس',        icon:'🤫', desc:'صوت خافت' },
  { id:'giant',   name:'عملاق',      icon:'🦣', desc:'صوت ضخم' },
];

let activeEffect = 'normal';
let audioNodes = {};

function renderVoiceEffects() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()">☰</button>
      <button class="btn-ghost" style="font-size:20px" onclick="navigate('soundSettings')">←</button>
      <div class="topbar-title">🎭 فلاتر الصوت</div>
    </div>
    <div class="page-content" style="max-width:600px">

      <!-- Active Effect Banner -->
      <div style="background:linear-gradient(135deg,#7C3AED22,#EC489922);border:1px solid #7C3AED44;border-radius:20px;padding:20px;text-align:center;margin-bottom:20px">
        <div style="font-size:48px;margin-bottom:8px" id="activeEffectIcon">${(VOICE_EFFECTS.find(e=>e.id===activeEffect)||{}).icon}</div>
        <div style="font-size:18px;font-weight:800" id="activeEffectName">${(VOICE_EFFECTS.find(e=>e.id===activeEffect)||{}).name}</div>
        <div style="font-size:13px;color:var(--text-secondary);margin-top:4px" id="activeEffectDesc">${(VOICE_EFFECTS.find(e=>e.id===activeEffect)||{}).desc}</div>
        <div style="margin-top:16px;display:flex;justify-content:center;gap:12px">
          <button onclick="testVoiceEffect()" style="padding:10px 24px;background:var(--gradient-1);border:none;border-radius:20px;color:white;font-family:Cairo,sans-serif;font-size:13px;font-weight:700;cursor:pointer">🔊 اختبر</button>
          <button onclick="resetEffect()" style="padding:10px 24px;background:var(--bg-dark);border:1px solid var(--border);border-radius:20px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">↺ إعادة ضبط</button>
        </div>
      </div>

      <!-- Effects Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-bottom:24px" id="effectsGrid">
        ${VOICE_EFFECTS.map(e => `
          <div onclick="selectEffect('${e.id}')" id="fx_${e.id}" style="background:var(--bg-card);border:2px solid ${activeEffect===e.id?'#7C3AED':'var(--border)'};border-radius:16px;padding:18px 12px;text-align:center;cursor:pointer;transition:all 0.2s;${activeEffect===e.id?'box-shadow:0 0 16px #7C3AED44':''}" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
            <div style="font-size:36px;margin-bottom:8px">${e.icon}</div>
            <div style="font-size:13px;font-weight:700">${e.name}</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${e.desc}</div>
            ${activeEffect===e.id?'<div style="font-size:10px;color:#7C3AED;margin-top:6px;font-weight:700">✓ نشط</div>':''}
          </div>`).join('')}
      </div>

      <!-- Pitch/Speed Sliders -->
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:18px">
        <div style="font-size:14px;font-weight:700;margin-bottom:16px;color:var(--text-secondary)">ضبط يدوي</div>
        <div style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
            <span>طبقة الصوت (Pitch)</span>
            <span id="pitchVal" style="color:var(--primary-light);font-weight:700">1.0x</span>
          </div>
          <input type="range" min="0.5" max="2.0" step="0.1" value="1.0" oninput="document.getElementById('pitchVal').textContent=parseFloat(this.value).toFixed(1)+'x'" style="width:100%;accent-color:var(--primary);cursor:pointer">
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px">
            <span>سرعة الكلام (Rate)</span>
            <span id="rateVal" style="color:var(--green);font-weight:700">1.0x</span>
          </div>
          <input type="range" min="0.5" max="2.0" step="0.1" value="1.0" oninput="document.getElementById('rateVal').textContent=parseFloat(this.value).toFixed(1)+'x'" style="width:100%;accent-color:var(--green);cursor:pointer">
        </div>
      </div>
    </div>`;
}

function selectEffect(id) {
  activeEffect = id;
  const fx = VOICE_EFFECTS.find(e => e.id === id);
  if (!fx) return;
  document.querySelectorAll('[id^="fx_"]').forEach(el => {
    const eid = el.id.replace('fx_', '');
    const isActive = eid === id;
    el.style.borderColor = isActive ? '#7C3AED' : 'var(--border)';
    el.style.boxShadow = isActive ? '0 0 16px #7C3AED44' : 'none';
    const badge = el.querySelector('.fx-badge');
    if (isActive && !badge) {
      const d = document.createElement('div');
      d.className = 'fx-badge';
      d.style.cssText = 'font-size:10px;color:#7C3AED;margin-top:6px;font-weight:700';
      d.textContent = '✓ نشط';
      el.appendChild(d);
    } else if (!isActive && badge) badge.remove();
  });
  const iconEl = document.getElementById('activeEffectIcon');
  const nameEl = document.getElementById('activeEffectName');
  const descEl = document.getElementById('activeEffectDesc');
  if (iconEl) iconEl.textContent = fx.icon;
  if (nameEl) nameEl.textContent = fx.name;
  if (descEl) descEl.textContent = fx.desc;
  showToast(`تم تفعيل: ${fx.icon} ${fx.name}`, 'success');
}

function testVoiceEffect() {
  const fx = VOICE_EFFECTS.find(e => e.id === activeEffect);
  if (!fx) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('مرحباً، هذا اختبار صوتي');
    u.lang = 'ar-SA';
    u.pitch = activeEffect === 'helium' ? 2.0 : (activeEffect === 'deep' || activeEffect === 'giant') ? 0.3 : activeEffect === 'robot' ? 0.5 : 1.0;
    u.rate  = activeEffect === 'whisper' ? 0.7 : activeEffect === 'robot' ? 0.8 : 1.0;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }
  showToast(`${fx.icon} تشغيل تأثير "${fx.name}"`, 'info');
}

function resetEffect() {
  selectEffect('normal');
  showToast('تم إعادة الضبط للصوت الطبيعي', 'info');
}


// ───────────────────────────────────────────────────────────────
//  INIT: wire new pages into navigate() + inject CSS
// ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  addGiftCSS();

  const _origNavigate = window.navigate;
  window.navigate = function(page, data) {
    // clean up room intervals when navigating away
    if (typeof currentPage !== 'undefined' && currentPage === 'room' && page !== 'room') {
      clearInterval(autoMsgInterval); clearInterval(speakingInterval);
      autoMsgInterval = null; speakingInterval = null;
      if (typeof stopMicrophone === 'function') stopMicrophone();
    }
    switch(page) {
      case 'levels':   renderLevelsPage();   break;
      case 'live':     renderLivePage();     break;
      case 'store':    renderStore();        break;
      case 'vfx':      renderVoiceEffects(); break;
      default:
        if (_origNavigate) _origNavigate(page, data);
        return;
    }
    if (typeof currentPage !== 'undefined') window.currentPage = page;
    const mc = document.getElementById('mainContent');
    if (mc) mc.scrollTop = 0;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
    document.querySelectorAll('.mobile-nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  };
});
