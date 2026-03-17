// ===== GLOBAL STATE =====
let currentPage = 'home';
let isMuted = true, isSpeaker = false;
let speakingInterval = null;
let autoMsgInterval = null;
let msgId = 100;

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', gift: '🎁' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function avatarHTML(initials, color, size = 40, extra = '') {
  const isOwner = (typeof APP_DATA !== 'undefined' && initials === APP_DATA.currentUser.initials && APP_DATA.currentUser.isAppOwner);
  const frameClass = isOwner ? 'owner-frame' : '';
  return `<div class="avatar-placeholder ${frameClass}" style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.floor(size*0.35)}px;color:white;flex-shrink:0;${extra}">${initials}</div>`;
}

function ownerNameHTML(name, id, fontSize) {
  fontSize = fontSize || 16;
  return `<span class="owner-gold-name" style="font-size:${fontSize}px">${name}</span> <span class="owner-gold-id" style="font-size:${Math.max(10,fontSize-4)}px">#${id}</span>`;
}

function userNameHTML(user, fontSize) {
  if (user.isAppOwner) return ownerNameHTML(user.name, user.id, fontSize);
  return user.name;
}

function showOwnerEntryEffect() {
  const u = APP_DATA.currentUser;
  if (!u.isAppOwner) return;
  const banner = document.createElement('div');
  banner.className = 'owner-entry-banner';
  banner.innerHTML = `
    <div style="font-size:28px;margin-bottom:4px">🦅</div>
    <div style="font-size:18px;font-weight:900;color:#F5C518;text-shadow:0 0 10px #F5C51880,0 2px 4px #000">انتبهوا! دخل مستر غامض</div>
    <div style="font-size:12px;color:#D4A017;margin-top:4px">مدير التطبيق الرسمي 👑 #1</div>
    <div style="display:flex;justify-content:center;gap:6px;margin-top:8px">
      <span class="owner-badge" style="background:rgba(245,197,24,0.2);border:1px solid #F5C518;color:#F5C518">🦅 مدير التطبيق</span>
      <span class="owner-badge" style="background:rgba(245,158,11,0.2);border:1px solid #F59E0B;color:#F59E0B">💰 أقوى داعم</span>
      <span class="owner-badge" style="background:rgba(99,179,237,0.2);border:1px solid #63B3ED;color:#63B3ED">💎 VIP Diamond</span>
      <span class="owner-badge" style="background:rgba(236,72,153,0.2);border:1px solid #EC4899;color:#EC4899">⭐ التميز</span>
    </div>`;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 4000);
}

function timeAgo() {
  const times = ['منذ لحظة', 'منذ دقيقة', 'منذ 2 دقيقة', 'منذ 5 دقائق'];
  return times[Math.floor(Math.random() * times.length)];
}

function formatNum(n) {
  if (n >= 1000) return (n/1000).toFixed(1) + 'ألف';
  return n;
}

function confetti(x, y) {
  const colors = ['#7C3AED','#EC4899','#F59E0B','#10B981','#3B82F6'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `left:${x + (Math.random()-0.5)*60}px;top:${y}px;background:${colors[Math.floor(Math.random()*colors.length)]};transform:rotate(${Math.random()*360}deg)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

// ===== NAVIGATION =====

function navigate(page, data = null) {
  // ── Stop room intervals when leaving the room ──
  if (currentPage === 'room' && page !== 'room') {
    clearInterval(autoMsgInterval);
    clearInterval(speakingInterval);
    autoMsgInterval = null;
    speakingInterval = null;
    stopMicrophone && stopMicrophone();
  }

  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  document.querySelectorAll('.mobile-nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.page === page);
  });

  closeSidebar();

  switch(page) {
    case 'home':          renderHome(); break;
    case 'explore':       renderExplore(); break;
    case 'notifications': renderNotifications(); break;
    case 'ranking':       renderRanking(); break;
    case 'wallet':        renderWallet(); break;
    case 'profile':       renderProfile(); break;
    case 'settings':      renderSettings(); break;
    case 'messages':      renderMessages(); break;
    case 'people':        renderPeople(); break;
    case 'soundSettings': renderSoundSettings(); break;
    case 'room':          renderRoom(data); break;
  }
  currentPage = page;
  const mc = document.getElementById('mainContent');
  if (mc) mc.scrollTop = 0;
}

function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('show');
  document.body.style.overflow = '';
}
function toggleMobileSearch() {
  document.querySelector('.search-bar')?.classList.toggle('show');
}

// ===== HOME PAGE =====
function renderHome() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <div class="topbar-title" style="display:flex;align-items:center;gap:8px">
        <img src="icons/icon.svg" alt="" style="width:28px;height:28px;border-radius:8px;box-shadow:0 0 10px rgba(124,58,237,0.5)">
        <span style="background:linear-gradient(135deg,#a78bfa,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:18px;font-weight:900;letter-spacing:1px">الغامض</span>
      </div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="ابحث عن غرف وأشخاص..." id="homeSearch" oninput="filterRoomsDebounced(this.value)">
      </div>
      <div class="topbar-actions">
        <button class="search-toggle-btn" onclick="toggleMobileSearch()" title="بحث">🔍</button>
        <button class="topbar-btn" onclick="navigate('notifications')" title="الإشعارات">
          🔔 <span class="notif-dot"></span>
        </button>
        <button class="topbar-btn" onclick="showCreateRoom()" title="إنشاء غرفة">➕</button>
      </div>
    </div>
    <div class="page-content">
      <div class="online-count" style="margin-bottom:20px">
        <span style="width:8px;height:8px;background:#10B981;border-radius:50%;display:inline-block;animation:pulse 1.5s infinite"></span>
        ${(Math.floor(Math.random()*5000)+10000).toLocaleString()} مستخدم متصل الآن
      </div>

      <!-- Stories -->
      <div class="section-header">
        <div class="section-title">⚡ المتصلون الآن</div>
      </div>
      <div class="stories-row" id="storiesRow"></div>

      <!-- Featured Rooms -->
      <div class="section-header">
        <div class="section-title"><span class="live-dot"></span> الغرف المباشرة</div>
        <button class="see-all" onclick="navigate('explore')">عرض الكل ←</button>
      </div>

      <!-- Categories -->
      <div class="categories" id="categoriesBar"></div>

      <!-- Rooms Grid -->
      <div class="rooms-grid" id="roomsGrid"></div>
    </div>
  `;

  renderStories();
  renderCategories();
  renderRoomsGrid(APP_DATA.rooms);
}

function renderStories() {
  const el = document.getElementById('storiesRow');
  if (!el) return;
  el.innerHTML = APP_DATA.activeUsers.map(u => `
    <div class="story-item" onclick="showToast('${u.name} ${u.isLive ? "يبث مباشرة الآن!" : "غير متاح حالياً"}', '${u.isLive ? "info" : "error"}')">
      <div class="story-avatar-wrap ${u.isLive ? '' : 'no-story'}">
        ${avatarHTML(u.initials, u.color, 56, 'border:2px solid var(--bg-dark)')}
        ${u.isLive ? '<div class="live-badge">LIVE</div>' : ''}
      </div>
      <div class="story-name">${u.name}</div>
    </div>
  `).join('');
}

function renderCategories() {
  const el = document.getElementById('categoriesBar');
  if (!el) return;
  el.innerHTML = APP_DATA.categories.map((c, i) => `
    <button class="category-chip ${i===0?'active':''}" onclick="selectCategory(this, '${c.id}')">${c.name}</button>
  `).join('');
}

function selectCategory(btn, id) {
  document.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = id === 'all' ? APP_DATA.rooms : APP_DATA.rooms.filter(r => r.category === id);
  renderRoomsGrid(filtered);
}

function filterRooms(q) {
  const filtered = APP_DATA.rooms.filter(r =>
    r.title.includes(q) || r.desc.includes(q) || r.host.includes(q)
  );
  renderRoomsGrid(filtered);
}

function renderRoomsGrid(rooms) {
  const el = document.getElementById('roomsGrid');
  if (!el) return;
  if (rooms.length === 0) {
    el.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:40px;grid-column:1/-1">لا توجد غرف في هذا القسم حالياً</div>';
    return;
  }
  el.innerHTML = rooms.map(r => `
    <div class="room-card" onclick="navigate('room', ${r.id})">
      <div class="room-card-header">
        <span class="room-badge ${r.badge}">${r.badge === 'live' ? '<span class="live-dot" style="width:6px;height:6px;display:inline-block"></span> مباشر' : r.badge === 'featured' ? '⭐ مميز' : '🆕 جديد'}</span>
        <span class="room-card-category">${APP_DATA.categories.find(c=>c.id===r.category)?.name || r.category}</span>
      </div>
      <div class="room-card-title">${r.title}</div>
      <div class="room-card-desc">${r.desc}</div>
      <div class="room-card-speakers">
        <div class="speakers-avatars">
          ${r.speakerColors.slice(0,3).map((c,i) => `<div style="width:32px;height:32px;border-radius:50%;background:${c};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;border:2px solid var(--bg-card);margin-left:-8px">${r.speakerInitials[i]||''}</div>`).join('')}
        </div>
        <span style="font-size:12px;color:var(--text-secondary)">${r.speakers} متحدث</span>
      </div>
      <div class="room-card-meta">
        <div class="room-listeners">👥 ${r.listeners.toLocaleString()} مستمع</div>
        <button class="room-join-btn" onclick="event.stopPropagation();navigate('room',${r.id})">انضم الآن</button>
      </div>
    </div>
  `).join('');
}

// ===== EXPLORE PAGE =====
function renderExplore() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <div class="topbar-title">استكشاف</div>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input type="text" placeholder="ابحث..." id="exploreSearch" oninput="filterExploreDebounced(this.value)">
      </div>
      <div class="topbar-actions">
        <button class="search-toggle-btn" onclick="toggleMobileSearch()" title="بحث">🔍</button>
      </div>
    </div>
    <div class="page-content">
      <div class="categories" id="exploreCats"></div>
      <div class="section-header">
        <div class="section-title">🔥 الأكثر نشاطاً</div>
        <span class="online-count"><span style="width:6px;height:6px;background:#10B981;border-radius:50%;display:inline-block"></span> مباشر</span>
      </div>
      <div class="rooms-grid" id="exploreGrid"></div>
    </div>
  `;
  const catEl = document.getElementById('exploreCats');
  catEl.innerHTML = APP_DATA.categories.map((c,i) => `
    <button class="category-chip ${i===0?'active':''}" onclick="filterExploreCategory(this,'${c.id}')">${c.name}</button>
  `).join('');
  renderExploreGrid(APP_DATA.rooms);
}

function filterExploreCategory(btn, id) {
  document.querySelectorAll('#exploreCats .category-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = id === 'all' ? APP_DATA.rooms : APP_DATA.rooms.filter(r => r.category === id);
  renderExploreGrid(filtered);
}

function filterExplore(q) {
  const filtered = APP_DATA.rooms.filter(r => r.title.includes(q) || r.host.includes(q));
  renderExploreGrid(filtered);
}

function renderExploreGrid(rooms) {
  const el = document.getElementById('exploreGrid');
  if (!el) return;
  el.innerHTML = rooms.map(r => `
    <div class="room-card" onclick="navigate('room',${r.id})">
      <div class="room-card-header">
        <span class="room-badge ${r.badge}">${r.badge === 'live' ? '<span class="live-dot" style="width:6px;height:6px;display:inline-block"></span> مباشر' : r.badge === 'featured' ? '⭐ مميز' : '🆕 جديد'}</span>
        <span class="room-card-category">${APP_DATA.categories.find(c=>c.id===r.category)?.name || r.category}</span>
      </div>
      <div class="room-card-title">${r.title}</div>
      <div class="room-card-desc">${r.desc}</div>
      <div class="room-card-meta">
        <div class="room-listeners">👥 ${r.listeners.toLocaleString()} مستمع</div>
        <button class="room-join-btn" onclick="event.stopPropagation();navigate('room',${r.id})">انضم</button>
      </div>
    </div>
  `).join('');
}

// ===== ROOM PAGE =====

function renderRoom(roomId) {
  const room = APP_DATA.rooms.find(r => r.id === roomId) || APP_DATA.rooms[0];
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="voice-room-page">
      <div class="room-header">
        <button class="btn-secondary" style="padding:8px 14px;font-size:18px" onclick="navigate('home')">←</button>
        <div class="room-header-info">
          <h2>${room.title}</h2>
          <div class="room-meta">
            <span><span class="live-dot" style="display:inline-block;width:7px;height:7px"></span> مباشر</span>
            <span>👥 ${room.listeners.toLocaleString()} مستمع</span>
            <span>🎙️ ${room.speakers} متحدث</span>
          </div>
        </div>
        <div class="room-header-actions">
          <button class="topbar-btn" onclick="shareRoom()" title="مشاركة">🔗</button>
          <button class="topbar-btn" onclick="showRoomMenu()" title="المزيد">⋮</button>
        </div>
      </div>

      <div class="room-body">
        <div class="room-stage">
          <!-- Speakers -->
          <div class="stage-section">
            <div class="stage-section-title">المتحدثون (${APP_DATA.speakers.length})</div>
            <div class="speakers-stage" id="speakersStage"></div>
          </div>

          <!-- Listeners -->
          <div class="stage-section">
            <div class="stage-section-title">المستمعون (${APP_DATA.listeners.length}+)</div>
            <div style="display:flex;flex-wrap:wrap;gap:10px" id="listenersArea"></div>
          </div>

          <!-- Gifts floating -->
          <div id="floatingGifts" style="position:fixed;bottom:148px;left:24px;display:flex;flex-direction:column;gap:8px;pointer-events:none;z-index:200"></div>
        </div>

        <div class="room-sidebar">
          <div class="chat-area">
            <div class="chat-tabs">
              <button class="chat-tab active" onclick="switchTab(this,'chat')">💬 دردشة</button>
              <button class="chat-tab" onclick="switchTab(this,'gifts')">🎁 هدايا</button>
              <button class="chat-tab" onclick="switchTab(this,'members')">👥 أعضاء</button>
              <button class="chat-tab" onclick="switchTab(this,'games')">🎮 ألعاب</button>
            </div>

            <div id="tabChat" class="tab-panel" style="display:flex;flex-direction:column;flex:1;overflow:hidden">
              <div class="chat-messages" id="chatMessages"></div>
              <div class="chat-input-area" style="position:relative">
                <div id="emojiPickerBox" class="emoji-picker hidden"></div>
                <button class="emoji-btn" onclick="toggleEmoji('chatInput')">😊</button>
                <input class="chat-input" id="chatInput" placeholder="اكتب رسالة..." onkeydown="if(event.key==='Enter')sendMsg()">
                <button class="gift-btn" onclick="if(typeof showGiftPanel==='function')showGiftPanel('الغرفة');else{switchTab(null,'gifts');}" title="هدية">🎁</button>
                <button class="chat-send-btn" onclick="sendMsg()">➤</button>
              </div>
            </div>

            <div id="tabGifts" class="tab-panel hidden" style="overflow-y:auto;flex:1;padding:14px">
              <div style="text-align:center;margin-bottom:16px">
                <div style="font-size:13px;color:var(--text-secondary)">رصيدك</div>
                <div style="font-size:24px;font-weight:800;color:var(--gold)">💰 ${APP_DATA.currentUser.coins.toLocaleString()} عملة</div>
              </div>
              <div class="gifts-title">اختر هدية للمضيف</div>
              <div class="gifts-grid" id="giftsGrid"></div>
            </div>

            <div id="tabMembers" class="tab-panel hidden" style="overflow-y:auto;flex:1;padding:14px">
              <div style="margin-bottom:12px;font-size:13px;color:var(--text-secondary)">الأعضاء في الغرفة</div>
              <div id="membersList"></div>
            </div>

            <div id="tabGames" class="tab-panel hidden" style="overflow-y:auto;flex:1;padding:14px">
              <div style="text-align:center;margin-bottom:14px">
                <div style="font-size:18px;font-weight:800">🎮 ألعاب الغرفة</div>
                <div style="font-size:12px;color:var(--text-secondary)">العب مع الأعضاء واربح عملات!</div>
              </div>
              <div id="gamesGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="room-controls">
        <button class="ctrl-btn ${isMuted?'':'active'}" id="micBtn" onclick="toggleMic()">
          <span>${isMuted?'🔇':'🎙️'}</span>
          <span class="ctrl-label">${isMuted?'كتم':'ميكروفون'}</span>
        </button>
        <button class="ctrl-btn" onclick="raiseHand()" id="handBtn">
          <span>✋</span>
          <span class="ctrl-label">رفع يد</span>
        </button>
        <button class="ctrl-btn" onclick="toggleSpeaker()" id="speakerBtn">
          <span>🔊</span>
          <span class="ctrl-label">مكبر صوت</span>
        </button>
        <button class="ctrl-btn" onclick="showGiftsQuick()">
          <span>🎁</span>
          <span class="ctrl-label">هدية</span>
        </button>
        <button class="ctrl-btn" onclick="shareRoom()">
          <span>📤</span>
          <span class="ctrl-label">مشاركة</span>
        </button>
        <button class="leave-btn" onclick="leaveRoom()">
          <span>📵</span> مغادرة
        </button>
      </div>
    </div>
  `;

  renderSpeakers();
  renderListeners();
  renderChatMessages();
  renderGiftsGrid();
  renderMembersList();
  renderGamesGrid();
  renderEmojiPicker();
  startSpeakingAnimation();
  startAutoMessages();
}

function renderSpeakers() {
  const el = document.getElementById('speakersStage');
  if (!el) return;
  el.innerHTML = APP_DATA.speakers.map(s => `
    <div class="speaker-item ${s.isSpeaking?'speaking':''} ${s.isMuted?'muted':''}" id="sp_${s.id}" onclick="showSpeakerMenu('${s.name.replace(/'/g,'')}','${s.id}')">
      ${s.isHost ? '<div class="host-crown">👑</div>' : ''}
      <div class="speaker-avatar-wrap">
        ${avatarHTML(s.initials, s.color, 64)}
        ${s.isSpeaking ? '<div class="speaking-ring"></div>' : ''}
        <div class="mic-icon ${s.isMuted?'off':'on'}">${s.isMuted?'🔇':'🎙️'}</div>
      </div>
      <div class="speaker-name">${s.name}</div>
      <div class="speaker-role">${s.role}</div>
    </div>
  `).join('');
}

function renderListeners() {
  const el = document.getElementById('listenersArea');
  if (!el) return;
  el.innerHTML = APP_DATA.listeners.map(l => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer" onclick="showToast('${l.name}','info')">
      ${avatarHTML(l.initials, l.color, 44)}
      <div style="font-size:10px;color:var(--text-secondary)">${l.name}</div>
    </div>
  `).join('');
}

function renderChatMessages() {
  const el = document.getElementById('chatMessages');
  if (!el) return;
  el.innerHTML = APP_DATA.chatMessages.map(m => {
    if (m.isSystem) return `<div class="system-msg"><span>${m.systemText}</span></div>`;
    if (m.isGift) return `<div class="gift-msg">🎁 ${m.giftText} • +${m.giftCoins} 💰</div>`;
    return `
      <div class="chat-message ${m.isOwn?'own':''}">
        ${avatarHTML(m.initials, m.color, 34)}
        <div class="msg-body">
          <div class="msg-header">
            <span class="msg-name ${m.isAppOwner?'owner-gold-name':''}">${m.name}</span>
            ${m.isAppOwner ? '<span class="owner-badge" style="background:rgba(245,197,24,0.2);border:1px solid #F5C51866;color:#F5C518;font-size:8px">🦅</span>' : ''}
            ${m.isHost ? '<span class="msg-host-tag">مضيف</span>' : ''}
            <span class="msg-time">${m.time}</span>
          </div>
          <div class="msg-text">${m.text}</div>
        </div>
      </div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

function renderGiftsGrid() {
  const el = document.getElementById('giftsGrid');
  if (!el) return;
  el.innerHTML = APP_DATA.gifts.map(g => `
    <div class="gift-item" onclick="sendGiftFromRoom(${g.id})">
      <div class="gift-emoji">${g.emoji}</div>
      <div class="gift-name">${g.name}</div>
      <div class="gift-price">💰 ${g.price}</div>
    </div>
  `).join('');
}

function renderMembersList() {
  const el = document.getElementById('membersList');
  if (!el) return;
  const all = [...APP_DATA.speakers, ...APP_DATA.listeners];
  el.innerHTML = all.map(m => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      ${avatarHTML(m.initials, m.color, 38)}
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700">${m.name}</div>
        <div style="font-size:11px;color:var(--text-secondary)">${m.role || 'مستمع'}</div>
      </div>
      ${m.isHost ? '<span style="font-size:16px">👑</span>' : ''}
    </div>
  `).join('');
}

function renderGamesGrid() {
  const el = document.getElementById('gamesGrid');
  if (!el) return;
  const games = APP_DATA.games || [];
  el.innerHTML = games.map(g => `
    <div onclick="playRoomGame('${g.type}','${g.name}')" style="background:var(--bg-card2);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center;cursor:pointer;transition:.2s" onmouseover="this.style.borderColor='var(--primary)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border)';this.style.transform='none'">
      <div style="font-size:32px;margin-bottom:6px">${g.emoji}</div>
      <div style="font-size:13px;font-weight:700">${g.name}</div>
      <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${g.desc}</div>
    </div>`).join('');
}

function playRoomGame(type, name) {
  if (type === 'luck') {
    const prizes = [10,20,50,100,200,500,0,0,0];
    const win = prizes[Math.floor(Math.random()*prizes.length)];
    if (win > 0) { APP_DATA.currentUser.coins += win; showToast(`🎰 ربحت ${win} عملة!`, 'success'); confetti(window.innerWidth/2,window.innerHeight/2); }
    else showToast('🎰 حظ أوفر المرة القادمة!', 'error');
  } else if (type === 'wheel') {
    const prizes = ['50 عملة','100 عملة','هدية مجانية','200 عملة','XP مضاعف','20 عملة'];
    const result = prizes[Math.floor(Math.random()*prizes.length)];
    showToast(`🎡 العجلة أعطتك: ${result}!`, 'gift');
    APP_DATA.currentUser.coins += 50;
  } else if (type === 'trivia' || type === 'quiz') {
    const questions = ['ما عاصمة السعودية؟ — الرياض ✅','كم عدد أحرف اللغة العربية؟ — 28 ✅','من مخترع الهاتف؟ — بيل ✅'];
    showToast(`❓ ${questions[Math.floor(Math.random()*questions.length)]} (+30 عملة)`, 'success');
    APP_DATA.currentUser.coins += 30;
  } else if (type === 'truefalse') {
    showToast('✅ صح! أحسنت (+20 عملة)', 'success');
    APP_DATA.currentUser.coins += 20;
  } else if (type === 'word') {
    showToast('🔑 الكلمة: الغامض! أحسنت (+40 عملة)', 'success');
    APP_DATA.currentUser.coins += 40;
  } else {
    showToast(`🎮 بدء لعبة: ${name}`, 'info');
  }
}

function renderEmojiPicker() {
  const emojis = ['😂','❤️','🔥','👏','🎵','💎','🌹','😍','🎉','💯','👑','✨','😊','🙏','💪','🎭'];
  const el = document.getElementById('emojiPickerBox');
  if (!el) return;
  el.innerHTML = emojis.map(e => `<span onclick="addEmoji('${e}')">${e}</span>`).join('');
}

function addEmoji(e) {
  const input = document.getElementById('chatInput');
  if (input) input.value += e;
  document.getElementById('emojiPickerBox')?.classList.add('hidden');
}

function toggleEmoji(inputId) {
  // Implemented in extras.js with full picker — this stub kept for load-order safety
  if (typeof window._extrasToggleEmoji === 'function') { window._extrasToggleEmoji(inputId); return; }
  document.getElementById('emojiPickerBox')?.classList.toggle('hidden');
}

function showRoomMenu() {
  // Implemented in extras.js
  if (typeof window._extrasShowRoomMenu === 'function') { window._extrasShowRoomMenu(); return; }
  showToast('خيارات الغرفة', 'info');
}

function raiseHand() {
  // Implemented in extras.js
  if (typeof window._extrasRaiseHand === 'function') { window._extrasRaiseHand(); return; }
  showToast('رفعت يدك ✋', 'info');
}

function switchTab(btn, tab) {
  document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    document.querySelectorAll('.chat-tab').forEach(t => {
      if (t.getAttribute('onclick')?.includes(tab)) t.classList.add('active');
    });
  }
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  const panel = document.getElementById(`tab${tab.charAt(0).toUpperCase()+tab.slice(1)}`);
  if (panel) { panel.classList.remove('hidden'); panel.style.display = tab === 'chat' ? 'flex' : 'block'; panel.style.flexDirection = 'column'; }
}

function sendMsg() {
  const input = document.getElementById('chatInput');
  const text = input?.value.trim();
  if (!text) return;
  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
  const u = APP_DATA.currentUser;
  APP_DATA.chatMessages.push({ id: ++msgId, userId: u.id, name: u.isAppOwner ? u.name : 'أنا', initials: u.initials, color: u.color, text, time, isHost: u.isAppOwner, isOwn: true, isAppOwner: u.isAppOwner });
  renderChatMessages();
  input.value = '';
  document.getElementById('emojiPickerBox')?.classList.add('hidden');
}

function sendGiftFromRoom(giftId) {
  const gift = APP_DATA.gifts.find(g => g.id === giftId);
  if (!gift) return;
  if (APP_DATA.currentUser.coins < gift.price) {
    showToast('رصيدك غير كافٍ، اشحن رصيدك!', 'error');
    navigate('wallet');
    return;
  }
  APP_DATA.currentUser.coins -= gift.price;
  showToast(`أرسلت ${gift.emoji} ${gift.name} للمضيف!`, 'gift');
  showFloatingGift(gift);
  const now = new Date();
  APP_DATA.chatMessages.push({ id: ++msgId, isGift: true, giftText: `أنت أهديت ${gift.emoji} ${gift.name} للمضيفة`, giftCoins: gift.price });
  renderChatMessages();
  const el = document.querySelector('#tabGifts div:first-child div:last-child');
  if (el) el.textContent = `💰 ${APP_DATA.currentUser.coins.toLocaleString()} عملة`;
  confetti(window.innerWidth/2, window.innerHeight/2);
}

function showFloatingGift(gift) {
  const el = document.getElementById('floatingGifts');
  if (!el) return;
  const div = document.createElement('div');
  div.style.cssText = 'background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);border-radius:30px;padding:8px 16px;font-size:13px;color:#F59E0B;font-weight:700;animation:slideUp 0.3s ease;white-space:nowrap';
  div.textContent = `${gift.emoji} أنت أرسلت ${gift.name}!`;
  el.appendChild(div);
  setTimeout(() => { div.style.opacity = '0'; setTimeout(() => div.remove(), 300); }, 2500);
}

function showGiftsQuick() {
  switchTab(null, 'gifts');
  document.querySelectorAll('.chat-tab').forEach(t => { if(t.getAttribute('onclick')?.includes('gifts')) t.classList.add('active'); else t.classList.remove('active'); });
}

async function toggleMic() {
  isMuted = !isMuted;
  const btn = document.getElementById('micBtn');
  if (!btn) return;
  btn.className = `ctrl-btn ${isMuted?'':'active'}`;
  btn.innerHTML = `<span>${isMuted?'🔇':'🎙️'}</span><span class="ctrl-label">${isMuted?'كتم':'ميكروفون'}</span>`;
  if (!isMuted) {
    const ok = await startMicrophone();
    showToast(ok ? 'الميكروفون نشط! 🎙️' : 'تم تفعيل الميكروفون (محاكاة)', 'success');
  } else {
    stopMicrophone();
    showToast('تم كتم الميكروفون', 'error');
  }
}

function toggleSpeaker() {
  const btn = document.getElementById('speakerBtn');
  if (!btn) return;
  isSpeaker = !isSpeaker;
  btn.className = `ctrl-btn ${isSpeaker ? 'active' : ''}`;
  showToast(isSpeaker ? 'مكبر الصوت مفعّل' : 'مكبر الصوت مكتوم', isSpeaker ? 'success' : 'info');
}

function leaveRoom() {
  clearInterval(speakingInterval);
  navigate('home');
  showToast('غادرت الغرفة', 'info');
}

function shareRoom() {
  showToast('تم نسخ رابط الغرفة! 🔗', 'success');
}

function showSpeakerMenu(name, uid) {
  if (typeof window._extrasShowSpeakerMenu === 'function') { window._extrasShowSpeakerMenu(name, uid); return; }
  showToast(name || 'متحدث', 'info');
}

function startAutoMessages() {
  const autoMsgs = [
    { initials: "نو", color: "linear-gradient(135deg,#EC4899,#F59E0B)", name: "نورة", text: "ما شاء الله صوت رائع! 🎵" },
    { initials: "خم", color: "linear-gradient(135deg,#7C3AED,#EC4899)", name: "خالد", text: "❤️❤️❤️" },
    { initials: "يس", color: "linear-gradient(135deg,#F59E0B,#EF4444)", name: "يوسف", text: "الله يعطيكم العافية" },
    { initials: "هن", color: "linear-gradient(135deg,#EC4899,#7C3AED)", name: "هنادي", text: "أحسنتم 👏👏" },
    { initials: "را", color: "linear-gradient(135deg,#EF4444,#F59E0B)", name: "رانيا", text: "ترددوا أغنية عربية 🎶" },
  ];
  let i = 0;
  autoMsgInterval = setInterval(() => {
    if (!document.getElementById('chatMessages')) { clearInterval(autoMsgInterval); return; }
    const m = autoMsgs[i % autoMsgs.length];
    const now = new Date();
    APP_DATA.chatMessages.push({ id: ++msgId, name: m.name, initials: m.initials, color: m.color, text: m.text, time: `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`, isOwn: false, isHost: false });
    renderChatMessages();
    i++;
  }, 4000);
}

function startSpeakingAnimation() {
  speakingInterval = setInterval(() => {
    APP_DATA.speakers.forEach(s => {
      if (!s.isMuted) s.isSpeaking = Math.random() > 0.5;
    });
    renderSpeakers();
  }, 2000);
}

// ===== NOTIFICATIONS PAGE =====
function renderNotifications() {
  const unreadCount = APP_DATA.notifications.filter(n => n.unread).length;
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <div class="topbar-title">🔔 الإشعارات ${unreadCount > 0 ? `<span style="background:var(--red);color:white;font-size:11px;padding:2px 8px;border-radius:12px;margin-right:6px">${unreadCount}</span>` : ''}</div>
      <button class="btn-ghost" onclick="markAllRead()">تحديد الكل كمقروء</button>
    </div>
    <div class="page-content">
      <div class="notif-list" id="notifList"></div>
    </div>
  `;
  renderNotifList();
}

function renderNotifList() {
  const el = document.getElementById('notifList');
  if (!el) return;
  el.innerHTML = APP_DATA.notifications.map(n => `
    <div class="notif-item ${n.unread?'unread':''}" onclick="markRead(${n.id})">
      <div class="notif-icon ${n.type}">${n.icon}</div>
      <div class="notif-body">
        <div class="notif-text">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
      ${n.unread ? '<div class="notif-unread-dot"></div>' : ''}
    </div>
  `).join('');
}

function markRead(id) {
  const n = APP_DATA.notifications.find(x => x.id === id);
  if (n) {
    n.unread = false;
    renderNotifList();
    updateNotifBadge();
  }
}

function markAllRead() {
  APP_DATA.notifications.forEach(n => n.unread = false);
  renderNotifList();
  updateNotifBadge();
  showToast('تم تحديد الكل كمقروء', 'success');
}

function updateNotifBadge() {
  const count = APP_DATA.notifications.filter(n => n.unread).length;
  // sidebar badge
  document.querySelectorAll('.nav-item[data-page="notifications"] .badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-block' : 'none';
  });
  // mobile nav badge
  document.querySelectorAll('.mobile-nav-item[data-page="notifications"] .nav-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-block' : 'none';
  });
  // topbar dot
  document.querySelectorAll('.notif-dot').forEach(el => {
    el.style.display = count > 0 ? 'block' : 'none';
  });
  // topbar title badge
  const titleBadge = document.querySelector('.topbar-title span[style*="var(--red)"]');
  if (titleBadge) titleBadge.textContent = count > 0 ? count : '';
}

// ===== RANKING PAGE =====
let rankTab = 'hosts';

function renderRanking() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <div class="topbar-title">🏆 الترتيب</div>
    </div>
    <div class="page-content">
      <div style="background:var(--gradient-1);border-radius:20px;padding:24px;text-align:center;margin-bottom:24px;position:relative;overflow:hidden">
        <div style="font-size:40px;margin-bottom:8px">🏆</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:4px">ترتيبك الحالي</div>
        <div style="font-size:36px;font-weight:900">#142</div>
        <div style="font-size:13px;opacity:0.8;margin-top:4px">استمر في البث للصعود!</div>
      </div>
      <div class="ranking-tabs">
        <button class="ranking-tab active" onclick="switchRankTab(this,'hosts')">🎙️ أفضل مضيفين</button>
        <button class="ranking-tab" onclick="switchRankTab(this,'gifters')">🎁 أكثر مانحين</button>
      </div>
      <div class="rank-list" id="rankList"></div>
    </div>
  `;
  renderRankList('hosts');
}

function switchRankTab(btn, tab) {
  document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  rankTab = tab;
  renderRankList(tab);
}

function renderRankList(tab) {
  const el = document.getElementById('rankList');
  if (!el) return;
  const data = APP_DATA.rankings[tab];
  el.innerHTML = data.map(r => `
    <div class="rank-item ${r.rank<=3?'top-'+r.rank:''}">
      <div class="rank-num ${r.rank===1?'gold':r.rank===2?'silver':r.rank===3?'bronze':''}">${r.emoji}</div>
      ${avatarHTML(r.initials, r.color, 46)}
      <div class="rank-info">
        <div class="rank-name">${r.name}</div>
        <div class="rank-sub">${r.sub}</div>
      </div>
      <div class="rank-score">${r.score}</div>
    </div>
  `).join('');
}

// ===== WALLET PAGE =====
function renderWallet() {
  const u = APP_DATA.currentUser;
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <div class="topbar-title">💰 المحفظة</div>
    </div>
    <div class="page-content">
      <div class="wallet-card">
        <div class="wallet-label">رصيدك الحالي</div>
        <div class="wallet-balance">${u.coins.toLocaleString()}</div>
        <div class="wallet-currency">عملة ذهبية</div>
        <div class="wallet-actions">
          <button class="wallet-btn" onclick="navigate('store')">💳 شحن رصيد</button>
          <button class="wallet-btn" onclick="showWithdrawModal()">💸 سحب</button>
          <button class="wallet-btn" onclick="showTransferModal()">🔄 تحويل</button>
        </div>
      </div>

      <div style="display:flex;gap:12px;margin-bottom:24px">
        <div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:16px;text-align:center">
          <div style="font-size:24px;margin-bottom:4px">💎</div>
          <div style="font-size:20px;font-weight:800;color:var(--primary-light)">${u.diamonds}</div>
          <div style="font-size:12px;color:var(--text-secondary)">الماسات</div>
        </div>
        <div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:16px;text-align:center">
          <div style="font-size:24px;margin-bottom:4px">🎁</div>
          <div style="font-size:20px;font-weight:800;color:var(--secondary)">38</div>
          <div style="font-size:12px;color:var(--text-secondary)">هدايا أُرسلت</div>
        </div>
        <div style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:16px;text-align:center">
          <div style="font-size:24px;margin-bottom:4px">🎀</div>
          <div style="font-size:20px;font-weight:800;color:var(--green)">24</div>
          <div style="font-size:12px;color:var(--text-secondary)">هدايا وُصلت</div>
        </div>
      </div>

      <div class="section-header" style="margin-bottom:12px">
        <div class="section-title">📦 باقات الشحن</div>
      </div>
      <div class="coin-packages">
        ${APP_DATA.coinPackages.map(p => `
          <div class="coin-package ${p.popular?'popular':''}" onclick="buyPackage(${p.id})">
            ${p.badge ? `<div class="pkg-badge">${p.badge}</div>` : '<div style="height:16px"></div>'}
            <div class="pkg-icon">${p.icon}</div>
            <div class="pkg-coins">${p.coins.toLocaleString()}</div>
            <div class="pkg-price">${p.price}</div>
          </div>
        `).join('')}
      </div>

      <div class="section-header" style="margin-bottom:12px;margin-top:8px">
        <div class="section-title">📋 سجل المعاملات</div>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;overflow:hidden">
        ${[
          {icon:'🎁',text:'هدية وردة لسارة أحمد',amount:'-10',color:'var(--red)',time:'اليوم 22:05'},
          {icon:'💰',text:'شحن رصيد',amount:'+500',color:'var(--green)',time:'أمس 14:30'},
          {icon:'🎁',text:'هدية ماسة لعمر خالد',amount:'-500',color:'var(--red)',time:'أمس 10:15'},
          {icon:'🎀',text:'هدية تاج من وليد',amount:'+1000',color:'var(--green)',time:'الجمعة 20:00'},
        ].map(t => `
          <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border)">
            <div style="width:40px;height:40px;background:var(--bg-card2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px">${t.icon}</div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600">${t.text}</div>
              <div style="font-size:11px;color:var(--text-secondary)">${t.time}</div>
            </div>
            <div style="font-size:15px;font-weight:800;color:${t.color}">${t.amount}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function buyPackage(id) {
  const pkg = APP_DATA.coinPackages.find(p => p.id === id);
  if (!pkg) return;
  APP_DATA.currentUser.coins += pkg.coins;
  showToast(`تم شراء ${pkg.coins.toLocaleString()} عملة بنجاح! 🎉`, 'success');
  confetti(window.innerWidth/2, window.innerHeight/3);
  renderWallet();
}

// ===== PROFILE PAGE =====
function renderProfile() {
  const u = APP_DATA.currentUser;
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <div class="topbar-title">ملفي الشخصي</div>
      <button class="topbar-btn" onclick="navigate('settings')" title="الإعدادات">⚙️</button>
    </div>
    <div class="page-content">
      <div class="profile-page">
        <div class="profile-cover" style="background:${u.isAppOwner ? 'linear-gradient(135deg,#1a0a00,#2d1800,#F5C518,#2d1800,#1a0a00)' : u.color}">
          <div class="profile-cover-overlay"></div>
          ${u.isAppOwner ? '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;opacity:0.3;animation:float 3s ease-in-out infinite">🦅</div>' : ''}
        </div>
        <div class="profile-info">
          <div class="profile-avatar-large-placeholder ${u.isAppOwner?'owner-frame':''}" style="background:${u.color}">${u.initials}</div>
          <div class="profile-name">${u.isAppOwner ? ownerNameHTML(u.name, u.id, 22) : u.name + (u.isVerified?' <span style="color:#60A5FA;font-size:18px">✓</span>':'')}</div>
          <div class="profile-handle" ${u.isAppOwner ? 'style="color:#D4A017;font-weight:700"' : ''}>${u.handle}</div>
          <div class="profile-bio">${u.bio}</div>
          <div class="profile-badges">
            ${u.isAppOwner ? `
              <div class="badge-item" style="background:linear-gradient(135deg,rgba(245,197,24,0.2),rgba(212,160,23,0.2));color:#F5C518;border:1px solid #F5C51866;font-weight:900">🦅 مدير التطبيق</div>
              <div class="badge-item" style="background:rgba(245,158,11,0.15);color:#F59E0B;border:1px solid #F59E0B44">💰 أقوى داعم</div>
              <div class="badge-item" style="background:rgba(99,179,237,0.15);color:#63B3ED;border:1px solid #63B3ED44">💎 VIP Diamond</div>
              <div class="badge-item" style="background:rgba(236,72,153,0.15);color:#EC4899;border:1px solid #EC489944">⭐ التميز</div>
              <div class="badge-item" style="background:rgba(16,185,129,0.15);color:#10B981;border:1px solid #10B98144">✅ موثّق</div>
              <div class="badge-item" style="background:rgba(124,58,237,0.15);color:#A78BFA;border:1px solid #7C3AED44">🏆 مستوى ${u.level}</div>
            ` : `
              ${u.isVerified?'<div class="badge-item verified">✓ موثّق</div>':''}
              ${u.isVip?'<div class="badge-item vip">👑 VIP</div>':''}
              <div class="badge-item host">🎙️ مضيف</div>
              <div class="badge-item" style="background:rgba(16,185,129,0.15);color:var(--green);border:1px solid rgba(16,185,129,0.3)">⭐ مستوى ${u.level}</div>
            `}
          </div>
          <div class="profile-stats">
            <div class="stat-item"><span class="stat-num">${u.followers.toLocaleString()}</span><span class="stat-label">متابع</span></div>
            <div class="stat-item"><span class="stat-num">${u.following.toLocaleString()}</span><span class="stat-label">يتابع</span></div>
            <div class="stat-item"><span class="stat-num">${u.rooms}</span><span class="stat-label">غرفة</span></div>
            <div class="stat-item"><span class="stat-num">💰${u.coins.toLocaleString()}</span><span class="stat-label">عملة</span></div>
          </div>
          <div class="profile-actions">
            <button class="btn-follow" onclick="editProfile()">✏️ تعديل الملف</button>
            <button class="btn-msg" onclick="showCreateRoom()">🎙️ إنشاء غرفة</button>
          </div>
        </div>

        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;margin-top:16px;overflow:hidden">
          <div style="padding:14px 18px;font-size:13px;font-weight:700;color:var(--text-secondary);border-bottom:1px solid var(--border);background:var(--bg-card2)">🎙️ غرفي السابقة</div>
          ${APP_DATA.rooms.slice(0,3).map(r => `
            <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);cursor:pointer" onclick="navigate('room',${r.id})">
              <div style="width:46px;height:46px;background:var(--bg-card3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px">🎙️</div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:700">${r.title}</div>
                <div style="font-size:11px;color:var(--text-secondary)">👥 ${r.listeners.toLocaleString()} مستمع</div>
              </div>
              <span style="font-size:20px">←</span>
            </div>
          `).join('')}
        </div>

        <!-- XP & Level Card -->
        ${typeof getLevelInfo === 'function' ? (() => {
          const lvl = getLevelInfo(userXP);
          const nextLvl = LEVELS ? LEVELS.find(l => l.level === lvl.level + 1) : null;
          const pct = nextLvl ? Math.min(100, ((userXP - lvl.min) / (nextLvl.min - lvl.min) * 100)).toFixed(0) : 100;
          return `
        <div style="background:linear-gradient(135deg,#7C3AED22,#EC489922);border:1px solid #7C3AED44;border-radius:16px;margin-top:16px;padding:18px 20px;cursor:pointer" onclick="navigate('levels')">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
            <div style="font-size:36px">${lvl.icon}</div>
            <div style="flex:1">
              <div style="font-size:15px;font-weight:800">المستوى ${lvl.level} — ${lvl.title}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${userXP.toLocaleString()} XP ${nextLvl ? '/ '+nextLvl.min.toLocaleString() : ''}</div>
            </div>
            <span style="font-size:18px;color:var(--text-secondary)">←</span>
          </div>
          <div style="background:var(--bg-dark);border-radius:50px;height:8px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#7C3AED,#EC4899);border-radius:50px;transition:width 1s ease"></div>
          </div>
        </div>`;
        })() : ''}

        <!-- Earned Badges -->
        ${typeof earnedBadges !== 'undefined' && earnedBadges.length ? `
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;margin-top:16px;padding:16px 18px">
          <div style="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
            🏅 شاراتي
            <button onclick="navigate('levels')" style="font-size:12px;color:var(--primary-light);background:none;border:none;cursor:pointer;font-family:Cairo,sans-serif">عرض الكل ←</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${(typeof BADGES!=='undefined'?BADGES:[]).filter(b=>earnedBadges.includes(b.id)).map(b=>`
              <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px">
                <span style="font-size:22px">${b.icon}</span>
                <span style="font-size:10px;color:var(--text-secondary)">${b.name}</span>
              </div>`).join('')}
          </div>
        </div>` : ''}

      </div>
    </div>
  `;
}

function editProfile() {
  const u = APP_DATA.currentUser;
  const modal = document.createElement('div');
  modal.id = 'editProfileModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border-radius:24px;padding:28px;width:100%;max-width:460px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div style="font-size:18px;font-weight:800">✏️ تعديل الملف الشخصي</div>
        <button onclick="document.getElementById('editProfileModal').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:24px;cursor:pointer;width:36px;height:36px">✕</button>
      </div>

      <!-- Avatar -->
      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px;gap:10px">
        <div style="width:80px;height:80px;border-radius:50%;background:${u.color};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:white;position:relative">
          ${u.initials}
          <div style="position:absolute;bottom:0;right:0;width:24px;height:24px;background:var(--gradient-1);border-radius:50%;border:2px solid var(--bg-card);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer" onclick="showToast('تغيير الصورة قريباً','info')">📷</div>
        </div>
        <button onclick="showToast('تغيير الصورة الرمزية قريباً','info')" style="font-size:12px;color:var(--primary-light);background:none;border:none;cursor:pointer;font-family:Cairo,sans-serif">تغيير الصورة</button>
      </div>

      <!-- Fields -->
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px">الاسم الكامل</label>
          <input id="ep_name" value="${u.name}" style="width:100%;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:15px;outline:none">
        </div>
        <div>
          <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px">المعرّف</label>
          <div style="position:relative">
            <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-secondary);font-size:14px">@</span>
            <input id="ep_handle" value="${u.handle.replace('@','')}" style="width:100%;padding:11px 14px 11px 14px;padding-right:30px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:15px;outline:none">
          </div>
        </div>
        <div>
          <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px">النبذة الشخصية</label>
          <textarea id="ep_bio" style="width:100%;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:14px;outline:none;resize:none;height:80px">${u.bio}</textarea>
        </div>
        <div>
          <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:8px">لون الملف الشخصي</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${[
              'linear-gradient(135deg,#7C3AED,#EC4899)',
              'linear-gradient(135deg,#3B82F6,#7C3AED)',
              'linear-gradient(135deg,#EC4899,#F59E0B)',
              'linear-gradient(135deg,#10B981,#3B82F6)',
              'linear-gradient(135deg,#EF4444,#F59E0B)',
              'linear-gradient(135deg,#F59E0B,#EF4444)',
            ].map((g,i) => `<div onclick="selectProfileColor(this,'${g}')" style="width:36px;height:36px;border-radius:50%;background:${g};cursor:pointer;border:3px solid ${u.color===g?'white':'transparent'};transition:border 0.2s" title="لون ${i+1}"></div>`).join('')}
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:20px">
        <button onclick="document.getElementById('editProfileModal').remove()" style="flex:1;padding:13px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-secondary);font-family:Cairo,sans-serif;cursor:pointer">إلغاء</button>
        <button onclick="saveProfile()" style="flex:2;padding:13px;background:var(--gradient-1);border:none;border-radius:12px;color:white;font-family:Cairo,sans-serif;font-size:15px;font-weight:700;cursor:pointer">💾 حفظ التغييرات</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

function selectProfileColor(el, grad) {
  document.querySelectorAll('#editProfileModal [onclick*="selectProfileColor"]').forEach(d => d.style.borderColor = 'transparent');
  el.style.borderColor = 'white';
  el.dataset.selected = grad;
}

function saveProfile() {
  const name   = document.getElementById('ep_name')?.value.trim();
  const handle = document.getElementById('ep_handle')?.value.trim();
  const bio    = document.getElementById('ep_bio')?.value.trim();
  const colorEl = document.querySelector('#editProfileModal [data-selected]');
  if (!name) { showToast('الاسم مطلوب!', 'error'); return; }
  APP_DATA.currentUser.name    = name;
  APP_DATA.currentUser.handle  = '@' + handle.replace('@','');
  APP_DATA.currentUser.bio     = bio;
  if (colorEl) {
    APP_DATA.currentUser.color  = colorEl.dataset.selected;
    APP_DATA.currentUser.initials = name.split(' ').map(w=>w[0]).join('').slice(0,2);
  }
  document.getElementById('editProfileModal')?.remove();
  showToast('تم حفظ الملف الشخصي ✓', 'success');
  if (typeof addXP === 'function') addXP(10, 'تعديل الملف الشخصي');
  navigate('profile');
}

// ===== SETTINGS PAGE =====
function renderSettings() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <button class="btn-ghost" style="font-size:20px" onclick="navigate('profile')">←</button>
      <div class="topbar-title">الإعدادات</div>
    </div>
    <div class="page-content">
      <div style="display:flex;align-items:center;gap:14px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px">
        ${avatarHTML(APP_DATA.currentUser.initials, APP_DATA.currentUser.color, 56)}
        <div>
          <div style="font-size:16px;font-weight:800">${APP_DATA.currentUser.name}</div>
          <div style="font-size:13px;color:var(--text-secondary)">${APP_DATA.currentUser.handle}</div>
        </div>
        <button class="btn-secondary" style="margin-right:auto" onclick="editProfile()">تعديل</button>
      </div>

      ${[
        { title: "الحساب", items: [
          { icon: "🔒", bg: "rgba(239,68,68,0.1)",   name: "كلمة المرور",    desc: "تغيير كلمة المرور",          fn: "showChangePassword()" },
          { icon: "📱", bg: "rgba(59,130,246,0.1)",  name: "رقم الهاتف",     desc: "+966 5** *** **34",           fn: "showToast('تعديل رقم الهاتف قريباً','info')" },
          { icon: "📧", bg: "rgba(16,185,129,0.1)",  name: "البريد الإلكتروني", desc: "ahmed@email.com",          fn: "showToast('تعديل البريد قريباً','info')" },
          { icon: "🔊", bg: "rgba(124,58,237,0.1)",  name: "إعدادات الصوت",  desc: "مستوى الصوت والميكروفون",    fn: "navigate('soundSettings')" },
        ]},
        { title: "الخصوصية", items: [
          { icon: "🌐", bg: "rgba(124,58,237,0.1)", name: "حساب خاص",      desc: "إخفاء ملفك عن غير المتابعين", toggle: true },
          { icon: "📵", bg: "rgba(239,68,68,0.1)",  name: "قائمة الحظر",   desc: "إدارة المحظورين",              fn: "showBlockList()" },
          { icon: "👀", bg: "rgba(59,130,246,0.1)", name: "حالة النشاط",   desc: "إظهار آخر ظهور",              toggle: true, checked: true },
        ]},
        { title: "الإشعارات", items: [
          { icon: "🔔", bg: "rgba(245,158,11,0.1)", name: "الإشعارات",       desc: "تفعيل جميع الإشعارات",       toggle: true, checked: true },
          { icon: "🎁", bg: "rgba(245,158,11,0.1)", name: "إشعارات الهدايا", desc: "عند استقبال هدية جديدة",     toggle: true, checked: true },
          { icon: "🎙️", bg: "rgba(124,58,237,0.1)", name: "دعوات الغرف",    desc: "إشعار عند الدعوة لغرفة",     toggle: true, checked: true },
        ]},
        { title: "المظهر", items: [
          { icon: "🌙", bg: "rgba(124,58,237,0.1)", name: "الوضع الداكن",  desc: "الوضع الحالي",                 toggle: true, checked: true },
          { icon: "🎭", bg: "rgba(236,72,153,0.1)", name: "فلاتر الصوت",   desc: "تخصيص صوتك",                  fn: "navigate('vfx')" },
          { icon: "🌐", bg: "rgba(59,130,246,0.1)", name: "اللغة",          desc: "العربية",                     fn: "showToast('دعم لغات إضافية قريباً','info')" },
        ]},
        { title: "الدعم", items: [
          { icon: "❓", bg: "rgba(16,185,129,0.1)", name: "مركز المساعدة", desc: "",                             fn: "showHelpCenter()" },
          { icon: "📨", bg: "rgba(59,130,246,0.1)", name: "تواصل معنا",    desc: "",                             fn: "showContactUs()" },
          { icon: "⭐", bg: "rgba(245,158,11,0.1)", name: "قيّم التطبيق",  desc: "",                             fn: "showToast('شكراً على تقييمك! ⭐⭐⭐⭐⭐','success')" },
        ]},
        { title: "معلومات الحساب", items: [
          { icon: "🆔", bg: "rgba(124,58,237,0.1)", name: "رقم المعرّف (ID)", desc: "#" + APP_DATA.currentUser.id,   fn: "showToast('ID: "+APP_DATA.currentUser.id+"','info')" },
          { icon: "📊", bg: "rgba(245,196,24,0.1)", name: "مستوى الحساب", desc: "المستوى " + (APP_DATA.currentUser.level || 1), fn: "navigate('levels')" },
          { icon: "🎮", bg: "rgba(16,185,129,0.1)", name: "ألعاب الغرف",  desc: "6 ألعاب تفاعلية",               fn: "showToast('الألعاب متاحة داخل الغرف الصوتية','info')" },
          { icon: "💾", bg: "rgba(59,130,246,0.1)", name: "تصدير البيانات",desc: "تنزيل بياناتك",                 fn: "showToast('تم تجهيز ملف البيانات للتنزيل','success')" },
          { icon: "🗑️", bg: "rgba(239,68,68,0.1)", name: "حذف الحساب",   desc: "حذف نهائي",                     fn: "showToast('يرجى التواصل مع الدعم لحذف الحساب','error')" },
        ]},
      ].map(sec => `
        <div class="settings-section">
          <div class="settings-section-title">${sec.title}</div>
          ${sec.items.map(item => `
            <div class="settings-item" style="cursor:${item.toggle?'default':'pointer'}" onclick="${item.toggle ? '' : (item.fn || '')}">
              <div class="setting-icon" style="background:${item.bg}">${item.icon}</div>
              <div class="setting-info">
                <div class="setting-name">${item.name}</div>
                ${item.desc ? `<div class="setting-desc">${item.desc}</div>` : ''}
              </div>
              <div class="setting-action">
                ${item.toggle
                  ? `<label class="toggle-switch"><input type="checkbox" ${item.checked?'checked':''} onchange="showToast('تم تحديث الإعداد ✓','success')"><span class="toggle-slider"></span></label>`
                  : `<span style="color:var(--text-secondary);font-size:18px">←</span>`}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}

      <button onclick="logout()" style="width:100%;padding:14px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:14px;color:var(--red);font-family:'Cairo',sans-serif;font-size:15px;font-weight:700;cursor:pointer;margin-top:8px">
        🚪 تسجيل الخروج
      </button>
    </div>
  `;
}

// ===== CREATE ROOM MODAL =====
function showCreateRoom() {
  document.getElementById('createRoomModal').classList.remove('hidden');
}

function hideCreateRoom() {
  document.getElementById('createRoomModal').classList.add('hidden');
  // Reset form to defaults
  const nameEl = document.getElementById('roomName');
  const descEl = document.getElementById('roomDesc');
  if (nameEl) nameEl.value = '';
  if (descEl) descEl.value = '';
  document.querySelectorAll('.room-type-item').forEach((el, i) => {
    el.classList.toggle('selected', i === 0);
  });
  const publicRadio = document.querySelector('input[name="roomPrivacy"][value="public"]');
  if (publicRadio) publicRadio.checked = true;
}

function createRoom() {
  const name = document.getElementById('roomName')?.value.trim();
  if (!name) { showToast('ادخل اسم الغرفة', 'error'); return; }

  const selectedType = document.querySelector('.room-type-item.selected .type-name')?.textContent || 'موسيقى';
  const catMap = { 'موسيقى':'music','تقنية':'tech','كوميديا':'comedy','رياضة':'sports','ألعاب':'gaming','قرآن':'quran' };
  const privacy = document.querySelector('input[name="roomPrivacy"]:checked')?.value || 'public';

  const newRoom = {
    id: APP_DATA.rooms.length + 100,
    title: name,
    desc: document.getElementById('roomDesc')?.value.trim() || 'غرفة جديدة مباشرة',
    category: catMap[selectedType] || 'music',
    badge: 'live',
    listeners: 1,
    speakers: 1,
    speakerColors: [APP_DATA.currentUser.color],
    speakerInitials: [APP_DATA.currentUser.initials],
    host: APP_DATA.currentUser.name,
    hostColor: APP_DATA.currentUser.color,
    hostInitials: APP_DATA.currentUser.initials,
    isLocked: privacy === 'private',
    isFeatured: false
  };
  APP_DATA.rooms.unshift(newRoom);

  // Reset form
  document.getElementById('roomName').value = '';
  document.getElementById('roomDesc').value = '';

  hideCreateRoom();
  showToast(`تم إنشاء غرفة "${name}" 🎉`, 'success');
  confetti(window.innerWidth / 2, window.innerHeight / 3);
  navigate('room', newRoom.id);
}

// ===== AUTH =====
function handleLogin() {
  const phone = document.getElementById('loginPhone')?.value.trim();
  const pass  = document.getElementById('loginPass')?.value.trim();
  if (!phone || !pass) { showToast('يرجى تعبئة جميع الحقول', 'error'); return; }
  localStorage.setItem('voicechat_logged', '1');
  localStorage.setItem('voicechat_uid', APP_DATA.currentUser.id);
  document.getElementById('authPage').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderSidebar();
  updateNotifBadge();
  navigate('home');
  showToast(`مرحباً ${APP_DATA.currentUser.name}! (ID: ${APP_DATA.currentUser.id}) 👋`, 'success');
  if (APP_DATA.currentUser.isAppOwner) setTimeout(showOwnerEntryEffect, 500);
}

function handleRegister() {
  const name  = document.getElementById('regName')?.value.trim();
  const phone = document.getElementById('regPhone')?.value.trim();
  const pass  = document.getElementById('regPass')?.value.trim();
  if (!name || !phone || !pass) { showToast('يرجى تعبئة جميع الحقول', 'error'); return; }
  const uid = generateUserId();
  APP_DATA.currentUser.id = uid;
  APP_DATA.currentUser.name = name;
  APP_DATA.currentUser.initials = name.split(' ').map(w=>w[0]).join('').slice(0,2);
  APP_DATA.currentUser.handle = '@user_' + uid;
  APP_DATA.currentUser.isAdmin = false;
  APP_DATA.currentUser.isSuperAdmin = false;
  localStorage.setItem('voicechat_logged', '1');
  localStorage.setItem('voicechat_uid', uid);
  document.getElementById('authPage').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderSidebar();
  updateNotifBadge();
  navigate('home');
  showToast(`أهلاً ${name}! (ID: ${uid}) مرحباً بك في الغامض 🦅`, 'success');
  confetti(window.innerWidth / 2, window.innerHeight / 3);
}

function handleGoogleLogin() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:32px;width:100%;max-width:400px;text-align:center">
      <div style="margin-bottom:20px">
        <svg width="48" height="48" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59L2.56 13.22A23.94 23.94 0 000 24c0 3.77.87 7.35 2.56 10.78l7.97-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      </div>
      <div style="font-size:18px;font-weight:700;color:#202124;margin-bottom:6px">تسجيل الدخول بحساب Google</div>
      <div style="font-size:13px;color:#5f6368;margin-bottom:24px">اختر حساباً للمتابعة إلى الغامض</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${[
          {name:'أحمد محمد',email:'ahmed.m@gmail.com',init:'أ',color:'#4285F4'},
          {name:'نوف الربيع',email:'nouf.r@gmail.com',init:'ن',color:'#EA4335'},
        ].map(a=>`
          <div onclick="completeGoogleLogin('${a.name}','${a.email}')" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid #dadce0;border-radius:12px;cursor:pointer;transition:.2s" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
            <div style="width:40px;height:40px;border-radius:50%;background:${a.color};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff">${a.init}</div>
            <div style="text-align:right;flex:1">
              <div style="font-size:14px;font-weight:600;color:#202124">${a.name}</div>
              <div style="font-size:12px;color:#5f6368">${a.email}</div>
            </div>
          </div>`).join('')}
        <div onclick="completeGoogleLogin('مستخدم جديد','new@gmail.com')" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:1px solid #dadce0;border-radius:12px;cursor:pointer;transition:.2s" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'">
          <div style="width:40px;height:40px;border-radius:50%;background:#34A853;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff">+</div>
          <div style="font-size:14px;font-weight:600;color:#1a73e8">استخدام حساب آخر</div>
        </div>
      </div>
      <button onclick="this.closest('[style]').remove()" style="margin-top:16px;padding:10px 24px;background:none;border:1px solid #dadce0;border-radius:20px;color:#5f6368;font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">إلغاء</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if(e.target===overlay) overlay.remove(); });
}

function completeGoogleLogin(name, email) {
  document.querySelector('[style*="rgba(0,0,0,0.8)"]')?.remove();
  const uid = generateUserId();
  APP_DATA.currentUser.id = uid;
  APP_DATA.currentUser.name = name;
  APP_DATA.currentUser.initials = name.split(' ').map(w=>w[0]).join('').slice(0,2);
  APP_DATA.currentUser.handle = '@' + email.split('@')[0];
  APP_DATA.currentUser.isAdmin = false;
  APP_DATA.currentUser.isSuperAdmin = false;
  localStorage.setItem('voicechat_logged', '1');
  localStorage.setItem('voicechat_uid', uid);
  document.getElementById('authPage').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderSidebar();
  updateNotifBadge();
  navigate('home');
  showToast(`مرحباً ${name}! تم التسجيل عبر Google (ID: ${uid}) 🎉`, 'success');
  confetti(window.innerWidth / 2, window.innerHeight / 3);
}

function generateUserId() {
  let id = APP_DATA.nextUserId || 200000;
  if (id > 222222) id = 200000;
  APP_DATA.nextUserId = id + 1;
  try { localStorage.setItem('voicechat_nextUid', APP_DATA.nextUserId); } catch(e) {}
  return id;
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
  document.getElementById(`${tab}Tab`).classList.add('active');
  document.getElementById(`${tab}Form`).classList.remove('hidden');
}

function logout() {
  if (!confirm('هل تريد تسجيل الخروج؟')) return;
  // Stop any running room
  clearInterval(autoMsgInterval);
  clearInterval(speakingInterval);
  autoMsgInterval = null;
  speakingInterval = null;
  stopMicrophone && stopMicrophone();
  isMuted = true;
  isSpeaker = false;
  currentPage = 'home';
  localStorage.removeItem('voicechat_logged');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('authPage').classList.remove('hidden');
  // Reset auth form
  document.getElementById('loginPhone').value = '';
  document.getElementById('loginPass').value = '';
  showToast('تم تسجيل الخروج بنجاح', 'info');
}

// ===== SIDEBAR =====
function renderSidebar() {
  const u = APP_DATA.currentUser;
  const nameEl = u.isAppOwner
    ? `<div class="name">${ownerNameHTML(u.name, u.id, 14)}</div>`
    : `<div class="name">${u.name}${u.isSuperAdmin ? ' <span style="font-size:10px;background:rgba(239,68,68,0.2);color:#ef4444;padding:1px 5px;border-radius:6px;font-weight:800">SUPER ADMIN</span>' : u.isAdmin ? ' <span style="font-size:10px;background:rgba(239,68,68,0.2);color:#ef4444;padding:1px 5px;border-radius:6px;font-weight:800">ADMIN</span>' : ''}</div>`;
  const handleEl = u.isAppOwner
    ? `<div class="handle" style="color:#D4A017">${u.handle}</div>`
    : `<div class="handle">${u.handle} <span style="font-size:10px;color:var(--text-secondary)">#${u.id}</span></div>`;
  const badgesEl = u.isAppOwner
    ? `<div class="owner-badge-row" style="margin-top:6px">
        <span class="owner-badge" style="background:rgba(245,197,24,0.15);border:1px solid #F5C51866;color:#F5C518">🦅 مدير</span>
        <span class="owner-badge" style="background:rgba(99,179,237,0.15);border:1px solid #63B3ED66;color:#63B3ED">💎 Diamond</span>
        <span class="owner-badge" style="background:rgba(236,72,153,0.15);border:1px solid #EC489966;color:#EC4899">⭐ Lv.100</span>
       </div>`
    : '';
  document.getElementById('sidebarUser').innerHTML = `
    <div class="avatar">
      ${avatarHTML(u.initials, u.color, 40)}
      <span class="status-dot online"></span>
    </div>
    <div class="sidebar-user-info">
      ${nameEl}
      ${handleEl}
      ${badgesEl}
    </div>
  `;
  const adminLink = document.getElementById('sidebarAdminLink');
  if (adminLink) adminLink.style.display = u.isAdmin ? 'flex' : 'none';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  if (APP_DATA.currentUser.badges) earnedBadges = APP_DATA.currentUser.badges;
  if (APP_DATA.currentUser.xp) userXP = APP_DATA.currentUser.xp;
  try { const nid = parseInt(localStorage.getItem('voicechat_nextUid')); if (nid) APP_DATA.nextUserId = nid; } catch(e) {}
  const savedUser = localStorage.getItem('voicechat_logged');
  if (savedUser) {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    renderSidebar();
    updateNotifBadge();
    navigate('home');
    if (APP_DATA.currentUser.isAppOwner) setTimeout(showOwnerEntryEffect, 800);
  }
});

// ═══════════════════════════════════════════════════════════════
//  EXTRA PAGES: Messages · User Search · Sound Settings
// ═══════════════════════════════════════════════════════════════

// ─── Settings Sub-Modals ────────────────────────────────────────
function showChangePassword() {
  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `
    <div style="background:var(--bg-card);border-radius:20px;padding:24px;width:100%;max-width:400px">
      <div style="font-size:17px;font-weight:800;margin-bottom:18px;display:flex;justify-content:space-between">
        🔒 تغيير كلمة المرور
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      ${['كلمة المرور الحالية','كلمة المرور الجديدة','تأكيد كلمة المرور الجديدة'].map(l=>`
        <div style="margin-bottom:12px">
          <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:5px">${l}</label>
          <input type="password" placeholder="••••••••" style="width:100%;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:16px;outline:none">
        </div>`).join('')}
      <div style="display:flex;gap:10px;margin-top:16px">
        <button onclick="this.closest('[style]').remove()" style="flex:1;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-secondary);font-family:Cairo,sans-serif;cursor:pointer">إلغاء</button>
        <button onclick="showToast('تم تغيير كلمة المرور ✓','success');this.closest('[style]').remove()" style="flex:2;padding:12px;background:var(--gradient-1);border:none;border-radius:12px;color:white;font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer">حفظ</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { if(e.target===m) m.remove(); });
}

function showBlockList() {
  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `
    <div style="background:var(--bg-card);border-radius:20px;padding:24px;width:100%;max-width:420px">
      <div style="font-size:17px;font-weight:800;margin-bottom:16px;display:flex;justify-content:space-between">
        📵 قائمة الحظر
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div style="text-align:center;padding:32px 0;color:var(--text-secondary)">
        <div style="font-size:48px;margin-bottom:12px">🎉</div>
        <div style="font-size:15px;font-weight:700">قائمة الحظر فارغة</div>
        <div style="font-size:13px;margin-top:6px">لا يوجد أي مستخدم محظور</div>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { if(e.target===m) m.remove(); });
}

function showHelpCenter() {
  const topics = [
    {icon:'🎙️',q:'كيف أنشئ غرفة صوتية؟',  a:'اضغط على زر ➕ في شريط التنقل واختر نوع الغرفة واملأ التفاصيل ثم اضغط إنشاء.'},
    {icon:'🎁', q:'كيف أرسل هدية؟',          a:'داخل الغرفة اضغط زر 🎁 في الأسفل واختر الهدية المناسبة من الكتالوج.'},
    {icon:'💰', q:'كيف أشحن رصيدي؟',         a:'اذهب إلى المتجر 🛒 واختر باقة العملات التي تناسبك.'},
    {icon:'📡', q:'كيف أبدأ بثاً مباشراً؟', a:'من القائمة الجانبية اختر 🔴 البث المباشر ثم اضغط ابدأ البث الآن.'},
    {icon:'🎯', q:'ما هي التحديات؟',           a:'التحديات مهام يومية وأسبوعية تكسب منها عملات وXP عند إكمالها.'},
  ];
  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `
    <div style="background:var(--bg-card);border-radius:20px;padding:24px;width:100%;max-width:480px;max-height:80vh;overflow-y:auto">
      <div style="font-size:17px;font-weight:800;margin-bottom:18px;display:flex;justify-content:space-between">
        ❓ مركز المساعدة
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${topics.map(t=>`
          <details style="background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;overflow:hidden">
            <summary style="padding:14px 16px;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;gap:10px;list-style:none">
              <span style="font-size:20px">${t.icon}</span>${t.q}
            </summary>
            <div style="padding:12px 16px 14px;font-size:13px;color:var(--text-secondary);line-height:1.7;border-top:1px solid var(--border)">${t.a}</div>
          </details>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { if(e.target===m) m.remove(); });
}

function showContactUs() {
  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `
    <div style="background:var(--bg-card);border-radius:20px;padding:24px;width:100%;max-width:420px">
      <div style="font-size:17px;font-weight:800;margin-bottom:18px;display:flex;justify-content:space-between">
        📨 تواصل معنا
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:5px">الموضوع</label>
        <select style="width:100%;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:16px;outline:none">
          <option>مشكلة تقنية</option><option>اقتراح</option><option>إبلاغ عن مستخدم</option><option>أخرى</option>
        </select>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:5px">الرسالة</label>
        <textarea placeholder="اكتب رسالتك هنا..." style="width:100%;height:100px;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:14px;outline:none;resize:none"></textarea>
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('[style]').remove()" style="flex:1;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-secondary);font-family:Cairo,sans-serif;cursor:pointer">إلغاء</button>
        <button onclick="showToast('تم إرسال رسالتك! سنرد خلال 24 ساعة ✓','success');this.closest('[style]').remove()" style="flex:2;padding:12px;background:var(--gradient-1);border:none;border-radius:12px;color:white;font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer">إرسال 📨</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { if(e.target===m) m.remove(); });
}

// ─── Direct Messages ────────────────────────────────────────────
const DM_THREADS = [
  { id:1, name:'سارة أحمد',   initials:'سا', color:'linear-gradient(135deg,#7C3AED,#EC4899)', last:'شكراً على الهدية! 🌹',         time:'الآن',        unread:2, online:true  },
  { id:2, name:'عمر خالد',    initials:'عم', color:'linear-gradient(135deg,#3B82F6,#7C3AED)',  last:'متى الغرفة القادمة؟',           time:'منذ 5د',      unread:0, online:true  },
  { id:3, name:'نورة سالم',   initials:'نو', color:'linear-gradient(135deg,#EC4899,#F59E0B)',  last:'استمتعت بالغرفة 🎵',            time:'منذ 20د',     unread:1, online:false },
  { id:4, name:'خالد محمد',   initials:'خم', color:'linear-gradient(135deg,#EF4444,#F59E0B)',  last:'أهلاً! كيف حالك؟',             time:'أمس',         unread:0, online:false },
  { id:5, name:'فاطمة علي',   initials:'فع', color:'linear-gradient(135deg,#10B981,#3B82F6)',  last:'تم إرسال الهدية 🎁',            time:'أمس',         unread:0, online:true  },
  { id:6, name:'يوسف سالم',   initials:'يس', color:'linear-gradient(135deg,#F59E0B,#EF4444)',  last:'أشوفك في الغرفة الليلة!',       time:'الاثنين',     unread:0, online:false },
];

let activeDMId = null;
const DM_MESSAGES = {
  1: [
    { from:'them', text:'مرحباً! كيف حالك؟ 😊',               time:'09:30' },
    { from:'me',   text:'بخير الحمد لله، وأنتِ؟',              time:'09:31' },
    { from:'them', text:'تمام 🌹 استمتعت بغرفتك أمس كثيراً!', time:'09:32' },
    { from:'me',   text:'يسعدني ذلك، نراكم الليلة 🎙️',        time:'09:33' },
    { from:'them', text:'شكراً على الهدية! 🌹',                time:'09:45' },
  ]
};

function renderMessages() {
  const totalUnread = DM_THREADS.reduce((s,t) => s + t.unread, 0);
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <div class="topbar-title">💬 الرسائل ${totalUnread>0?`<span style="background:var(--red);color:white;font-size:11px;padding:2px 8px;border-radius:12px;margin-right:6px">${totalUnread}</span>`:''}</div>
      <button class="topbar-btn" onclick="showNewDMSearch()" title="رسالة جديدة">✏️</button>
    </div>
    <div style="display:flex;height:calc(100vh - 64px)">
      <!-- Thread List -->
      <div style="width:320px;border-left:1px solid var(--border);overflow-y:auto;flex-shrink:0" id="dmThreadList"></div>
      <!-- Chat Window -->
      <div style="flex:1;display:flex;flex-direction:column" id="dmChatWin">
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);gap:12px">
          <div style="font-size:60px">💬</div>
          <div style="font-size:16px;font-weight:700">اختر محادثة للبدء</div>
          <div style="font-size:13px">أو ابدأ محادثة جديدة</div>
          <button onclick="showNewDMSearch()" style="padding:10px 24px;background:var(--gradient-1);border:none;border-radius:12px;color:white;font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px">✏️ رسالة جديدة</button>
        </div>
      </div>
    </div>
  `;
  renderDMThreads();
}

function renderDMThreads(filter='') {
  const el = document.getElementById('dmThreadList');
  if (!el) return;
  const threads = filter ? DM_THREADS.filter(t => t.name.includes(filter)) : DM_THREADS;
  el.innerHTML = `
    <div style="padding:12px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg-card);z-index:10">
      <div style="position:relative">
        <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-secondary)">🔍</span>
        <input style="width:100%;padding:9px 36px 9px 12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:10px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;outline:none" placeholder="بحث في الرسائل..." oninput="renderDMThreads(this.value)">
      </div>
    </div>
    ${threads.map(t => `
      <div onclick="openDM(${t.id})" style="display:flex;align-items:center;gap:12px;padding:14px 16px;cursor:pointer;border-bottom:1px solid var(--border);background:${activeDMId===t.id?'var(--bg-card2)':'transparent'};transition:background 0.2s" onmouseover="this.style.background='var(--bg-card2)'" onmouseout="this.style.background='${activeDMId===t.id?'var(--bg-card2)':'transparent'}'">
        <div style="position:relative;flex-shrink:0">
          ${avatarHTML(t.initials, t.color, 46)}
          ${t.online?`<span style="position:absolute;bottom:1px;left:1px;width:11px;height:11px;background:var(--green);border-radius:50%;border:2px solid var(--bg-card)"></span>`:''}
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
            <span style="font-size:14px;font-weight:700;color:${t.unread?'var(--text-primary)':'var(--text-primary)'}">${t.name}</span>
            <span style="font-size:10px;color:var(--text-secondary)">${t.time}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${t.last}</span>
            ${t.unread?`<span style="background:var(--primary);color:white;font-size:10px;font-weight:800;padding:1px 7px;border-radius:10px;flex-shrink:0">${t.unread}</span>`:''}
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

function openDM(id) {
  activeDMId = id;
  const thread = DM_THREADS.find(t => t.id === id);
  if (!thread) return;
  thread.unread = 0;
  renderDMThreads();
  const win = document.getElementById('dmChatWin');
  if (!win) return;
  const msgs = DM_MESSAGES[id] || [];
  win.innerHTML = `
    <div style="padding:14px 18px;background:var(--bg-card);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px">
      ${avatarHTML(thread.initials, thread.color, 40)}
      <div style="flex:1">
        <div style="font-size:15px;font-weight:800">${thread.name}</div>
        <div style="font-size:12px;color:${thread.online?'var(--green)':'var(--text-secondary)'}">${thread.online?'● متصل الآن':'غير متصل'}</div>
      </div>
      <button onclick="showToast('مكالمة صوتية قريباً!','info')" style="width:38px;height:38px;background:var(--bg-card2);border:1px solid var(--border);border-radius:50%;font-size:18px;cursor:pointer;color:var(--text-secondary)">📞</button>
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px" id="dmMsgList">
      ${msgs.map(m => `
        <div style="display:flex;justify-content:${m.from==='me'?'flex-end':'flex-start'}">
          <div style="max-width:70%;padding:10px 14px;border-radius:${m.from==='me'?'16px 4px 16px 16px':'4px 16px 16px 16px'};background:${m.from==='me'?'rgba(124,58,237,0.25)':'var(--bg-card2)'};font-size:13px;line-height:1.6">
            ${m.text}
            <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;text-align:${m.from==='me'?'left':'right'}">${m.time}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="padding:12px 14px;border-top:1px solid var(--border);display:flex;gap:8px;align-items:center">
      <button onclick="showToast('😊','info')" style="width:38px;height:38px;background:var(--bg-card2);border:1px solid var(--border);border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">😊</button>
      <input id="dmInput" style="flex:1;padding:10px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:24px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;outline:none" placeholder="اكتب رسالة..." onkeydown="if(event.key==='Enter')sendDM(${id})">
      <button onclick="sendDM(${id})" style="width:38px;height:38px;background:var(--gradient-1);border:none;border-radius:50%;color:white;font-size:16px;cursor:pointer;flex-shrink:0">➤</button>
    </div>
  `;
  const list = document.getElementById('dmMsgList');
  if (list) list.scrollTop = list.scrollHeight;
}

function sendDM(threadId) {
  const input = document.getElementById('dmInput');
  const text = input?.value.trim();
  if (!text) return;
  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
  if (!DM_MESSAGES[threadId]) DM_MESSAGES[threadId] = [];
  DM_MESSAGES[threadId].push({ from:'me', text, time });
  const thread = DM_THREADS.find(t => t.id === threadId);
  if (thread) thread.last = text;
  input.value = '';
  openDM(threadId);
  // Simulate reply after 1.5s
  setTimeout(() => {
    const replies = ['😊','شكراً!','حسناً 👍','إن شاء الله','تمام!','مرحباً 👋'];
    DM_MESSAGES[threadId].push({ from:'them', text: replies[Math.floor(Math.random()*replies.length)], time });
    if (activeDMId === threadId) openDM(threadId);
    else { const t = DM_THREADS.find(x=>x.id===threadId); if(t) { t.unread++; renderDMThreads(); } }
  }, 1500);
}

function showNewDMSearch() {
  showToast('بحث عن مستخدم لمراسلته...','info');
  navigate('people');
}

// ─── People / User Search ────────────────────────────────────────
const PEOPLE = [
  { id:10, name:'سارة أحمد',   initials:'سا', color:'linear-gradient(135deg,#7C3AED,#EC4899)', handle:'@sara_a',   bio:'مضيفة محترفة 🎙️', followers:12400, isFollowing:true,  isVerified:true  },
  { id:11, name:'عمر خالد',    initials:'عم', color:'linear-gradient(135deg,#3B82F6,#7C3AED)',  handle:'@omar_k',   bio:'نقاشات تقنية 💻',  followers:8900,  isFollowing:false, isVerified:true  },
  { id:12, name:'نورة سالم',   initials:'نو', color:'linear-gradient(135deg,#EC4899,#F59E0B)',  handle:'@noura_s',  bio:'موسيقى وغناء 🎵',  followers:6700,  isFollowing:true,  isVerified:false },
  { id:13, name:'خالد الرياضي',initials:'خر', color:'linear-gradient(135deg,#EF4444,#F59E0B)', handle:'@khalid_s', bio:'كرة القدم ⚽',       followers:15200, isFollowing:false, isVerified:true  },
  { id:14, name:'فاطمة علي',   initials:'فع', color:'linear-gradient(135deg,#10B981,#3B82F6)',  handle:'@fatima_a', bio:'ثقافة وأدب 📚',     followers:4300,  isFollowing:false, isVerified:false },
  { id:15, name:'يوسف كوميدي', initials:'يو', color:'linear-gradient(135deg,#F59E0B,#EF4444)', handle:'@yosef_c',  bio:'الضحكة دواء 😂',    followers:22000, isFollowing:true,  isVerified:true  },
];

function renderPeople() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <div class="topbar-title">👥 اكتشف أشخاصاً</div>
    </div>
    <div class="page-content">
      <div style="position:relative;margin-bottom:20px">
        <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--text-secondary);font-size:18px">🔍</span>
        <input id="peopleSearch" style="width:100%;padding:12px 44px 12px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:14px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:14px;outline:none" placeholder="ابحث عن أشخاص..." oninput="filterPeople(this.value)">
      </div>
      <div class="section-header" style="margin-bottom:14px">
        <div class="section-title">🔥 مقترح عليك</div>
      </div>
      <div id="peopleList"></div>
    </div>
  `;
  renderPeopleList(PEOPLE);
}

function filterPeople(q) {
  const filtered = q ? PEOPLE.filter(p => p.name.includes(q) || p.handle.includes(q) || p.bio.includes(q)) : PEOPLE;
  renderPeopleList(filtered);
}

function renderPeopleList(list) {
  const el = document.getElementById('peopleList');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:40px">لا توجد نتائج</div>'; return; }
  el.innerHTML = list.map(p => `
    <div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:16px;margin-bottom:10px;transition:all 0.2s" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
      ${avatarHTML(p.initials, p.color, 52)}
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:800;display:flex;align-items:center;gap:6px">
          ${p.name} ${p.isVerified?'<span style="color:#60A5FA;font-size:14px">✓</span>':''}
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:3px">${p.handle}</div>
        <div style="font-size:12px;color:var(--text-secondary)">${p.bio}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">👥 ${(p.followers).toLocaleString()} متابع</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
        <button onclick="toggleFollow(${p.id},this)" style="padding:8px 16px;background:${p.isFollowing?'var(--bg-card3)':'var(--gradient-1)'};border:1px solid ${p.isFollowing?'var(--border)':'transparent'};border-radius:20px;color:${p.isFollowing?'var(--text-secondary)':'white'};font-family:Cairo,sans-serif;font-size:12px;font-weight:700;cursor:pointer;min-width:80px">
          ${p.isFollowing?'✓ متابَع':'+ تابع'}
        </button>
        <button onclick="navigate('messages');setTimeout(()=>openDM(1),200)" style="padding:8px 16px;background:var(--bg-card2);border:1px solid var(--border);border-radius:20px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:12px;cursor:pointer">
          💬 رسالة
        </button>
      </div>
    </div>
  `).join('');
}

function toggleFollow(id, btn) {
  const p = PEOPLE.find(x => x.id === id);
  if (!p) return;
  p.isFollowing = !p.isFollowing;
  btn.style.background = p.isFollowing ? 'var(--bg-card3)' : 'var(--gradient-1)';
  btn.style.color = p.isFollowing ? 'var(--text-secondary)' : 'white';
  btn.style.borderColor = p.isFollowing ? 'var(--border)' : 'transparent';
  btn.textContent = p.isFollowing ? '✓ متابَع' : '+ تابع';
  showToast(p.isFollowing ? `بدأت بمتابعة ${p.name}` : `ألغيت متابعة ${p.name}`, p.isFollowing ? 'success' : 'info');
  if (p.isFollowing) playNotifSound && playNotifSound();
}

// ─── Sound Settings page ────────────────────────────────────────
let soundSettings = {
  masterVol: 80, micSens: 70, noiseSuppression: true,
  echoCancel: true, notifSound: true, giftSound: true,
  joinSound: true, bgMusic: false
};

function renderSoundSettings() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()" title="القائمة">☰</button>
      <button class="btn-ghost" style="font-size:20px" onclick="navigate('settings')">←</button>
      <div class="topbar-title">🔊 إعدادات الصوت</div>
    </div>
    <div class="page-content" style="max-width:600px">

      <div class="settings-section">
        <div class="settings-section-title">مستوى الصوت</div>
        <div class="settings-item" style="flex-direction:column;align-items:stretch;gap:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="setting-icon" style="background:rgba(124,58,237,0.1)">🔊</div>
              <span style="font-size:14px;font-weight:600">مستوى الصوت الكلي</span>
            </div>
            <span id="masterVolLabel" style="font-size:14px;font-weight:800;color:var(--primary-light)">${soundSettings.masterVol}%</span>
          </div>
          <input type="range" min="0" max="100" value="${soundSettings.masterVol}" oninput="soundSettings.masterVol=+this.value;document.getElementById('masterVolLabel').textContent=this.value+'%'" style="width:100%;accent-color:var(--primary);cursor:pointer">
        </div>
        <div class="settings-item" style="flex-direction:column;align-items:stretch;gap:12px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="setting-icon" style="background:rgba(16,185,129,0.1)">🎙️</div>
              <span style="font-size:14px;font-weight:600">حساسية الميكروفون</span>
            </div>
            <span id="micSensLabel" style="font-size:14px;font-weight:800;color:var(--green)">${soundSettings.micSens}%</span>
          </div>
          <input type="range" min="0" max="100" value="${soundSettings.micSens}" oninput="soundSettings.micSens=+this.value;document.getElementById('micSensLabel').textContent=this.value+'%'" style="width:100%;accent-color:var(--green);cursor:pointer">
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">جودة الصوت</div>
        ${[
          {icon:'🔇',bg:'rgba(239,68,68,0.1)',   name:'قمع الضوضاء',    key:'noiseSuppression'},
          {icon:'🎚️',bg:'rgba(124,58,237,0.1)', name:'إلغاء الصدى',     key:'echoCancel'},
        ].map(s => `
          <div class="settings-item">
            <div class="setting-icon" style="background:${s.bg}">${s.icon}</div>
            <div class="setting-info"><div class="setting-name">${s.name}</div></div>
            <label class="toggle-switch">
              <input type="checkbox" ${soundSettings[s.key]?'checked':''} onchange="soundSettings['${s.key}']=this.checked;showToast('تم حفظ الإعداد','success')">
              <span class="toggle-slider"></span>
            </label>
          </div>
        `).join('')}
      </div>

      <div class="settings-section">
        <div class="settings-section-title">أصوات الإشعارات</div>
        ${[
          {icon:'🔔',bg:'rgba(245,158,11,0.1)', name:'صوت الإشعارات',  key:'notifSound'},
          {icon:'🎁',bg:'rgba(245,158,11,0.1)', name:'صوت الهدايا',    key:'giftSound'},
          {icon:'🚪',bg:'rgba(16,185,129,0.1)', name:'صوت الانضمام',   key:'joinSound'},
          {icon:'🎵',bg:'rgba(124,58,237,0.1)', name:'موسيقى الخلفية', key:'bgMusic'},
        ].map(s => `
          <div class="settings-item">
            <div class="setting-icon" style="background:${s.bg}">${s.icon}</div>
            <div class="setting-info"><div class="setting-name">${s.name}</div></div>
            <label class="toggle-switch">
              <input type="checkbox" ${soundSettings[s.key]?'checked':''} onchange="soundSettings['${s.key}']=this.checked;showToast('تم حفظ الإعداد','success')">
              <span class="toggle-slider"></span>
            </label>
          </div>
        `).join('')}
      </div>

      <div class="settings-section">
        <div class="settings-section-title">اختبار الصوت</div>
        <div class="settings-item" style="gap:12px;flex-wrap:wrap">
          <button onclick="if(typeof playNotifSound==='function')playNotifSound();showToast('اختبار صوت الإشعار','info')" style="flex:1;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer;min-width:120px">
            🔔 إشعار
          </button>
          <button onclick="if(typeof playGiftSound==='function')playGiftSound();showToast('اختبار صوت الهدية','info')" style="flex:1;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer;min-width:120px">
            🎁 هدية
          </button>
          <button onclick="if(typeof playJoinSound==='function')playJoinSound();showToast('اختبار صوت الانضمام','info')" style="flex:1;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer;min-width:120px">
            🚪 انضمام
          </button>
        </div>
      </div>

    </div>
  `;
}
