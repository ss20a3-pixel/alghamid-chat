// ═══════════════════════════════════════════════════════════════
//  SOCIAL MODULE: Stories · Activity Feed · Challenges · Friends
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
//  SHARED DATA
// ───────────────────────────────────────────────────────────────
const SOCIAL_USERS = [
  { id:1,  name:'سارة أحمد',    init:'سا', color:'linear-gradient(135deg,#7C3AED,#EC4899)', handle:'@sara_a',   online:true,  level:8,  verified:true  },
  { id:2,  name:'عمر خالد',     init:'عم', color:'linear-gradient(135deg,#3B82F6,#7C3AED)',  handle:'@omar_k',   online:true,  level:6,  verified:true  },
  { id:3,  name:'نورة سالم',    init:'نو', color:'linear-gradient(135deg,#EC4899,#F59E0B)',  handle:'@noura_s',  online:false, level:5,  verified:false },
  { id:4,  name:'خالد محمد',    init:'خم', color:'linear-gradient(135deg,#EF4444,#F59E0B)',  handle:'@khalid_m', online:false, level:4,  verified:false },
  { id:5,  name:'فاطمة علي',    init:'فع', color:'linear-gradient(135deg,#10B981,#3B82F6)',  handle:'@fatima_a', online:true,  level:7,  verified:false },
  { id:6,  name:'يوسف كوميدي',  init:'يو', color:'linear-gradient(135deg,#F59E0B,#EF4444)', handle:'@yosef_c',  online:true,  level:9,  verified:true  },
];

// ───────────────────────────────────────────────────────────────
//  1. STORIES
// ───────────────────────────────────────────────────────────────
const STORIES_DATA = [
  { uid:0,  name:'قصتي',         init:'أح', color:'linear-gradient(135deg,#7C3AED,#EC4899)', isMe:true,  seen:false, content:null },
  { uid:1,  name:'سارة أحمد',   init:'سا', color:'linear-gradient(135deg,#7C3AED,#EC4899)', isMe:false, seen:false, content:'🎵 في غرفة موسيقية رائعة الآن!',    bg:'linear-gradient(135deg,#1a0533,#3d0a6e)', emoji:'🎵' },
  { uid:2,  name:'عمر خالد',    init:'عم', color:'linear-gradient(135deg,#3B82F6,#7C3AED)',  isMe:false, seen:true,  content:'💻 نقاش تقني حي — انضم الآن',       bg:'linear-gradient(135deg,#051a3d,#0a2875)', emoji:'💻' },
  { uid:3,  name:'نورة سالم',   init:'نو', color:'linear-gradient(135deg,#EC4899,#F59E0B)',  isMe:false, seen:false, content:'🌙 أمسية هادئة مع أصدقائي ❤️',      bg:'linear-gradient(135deg,#3d0a22,#6e0a3a)', emoji:'🌙' },
  { uid:5,  name:'فاطمة علي',   init:'فع', color:'linear-gradient(135deg,#10B981,#3B82F6)',  isMe:false, seen:false, content:'📚 مراجعة للكتاب الأسبوعي معنا',    bg:'linear-gradient(135deg,#032e1a,#064d2d)', emoji:'📚' },
  { uid:6,  name:'يوسف كوميدي', init:'يو', color:'linear-gradient(135deg,#F59E0B,#EF4444)', isMe:false, seen:true,  content:'😂 نكتة اليوم: لماذا لا يثق المبرمج بالطبيعة؟ لأن فيها bugs كثيرة! 🐛', bg:'linear-gradient(135deg,#3d2200,#6e3a00)', emoji:'😂' },
];

let storyViewIndex = -1;
let storyTimer = null;

function renderStoriesBar() {
  return `
    <div style="display:flex;gap:14px;overflow-x:auto;padding:4px 0 12px;scrollbar-width:none">
      ${STORIES_DATA.map((s,i) => `
        <div onclick="${s.isMe ? 'addMyStory()' : `openStory(${i})`}" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;flex-shrink:0">
          <div style="position:relative">
            <div style="width:62px;height:62px;border-radius:50%;padding:2.5px;background:${s.seen||s.isMe?'var(--border)':'linear-gradient(135deg,#7C3AED,#EC4899,#F59E0B)'};box-shadow:${s.seen?'none':'0 0 12px #7C3AED66'}">
              <div style="width:100%;height:100%;border-radius:50%;background:var(--bg-dark);display:flex;align-items:center;justify-content:center">
                <div style="width:54px;height:54px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:white">${s.isMe?'أح':s.init}</div>
              </div>
            </div>
            ${s.isMe?`<div style="position:absolute;bottom:0;right:0;width:20px;height:20px;background:var(--gradient-1);border-radius:50%;border:2px solid var(--bg-dark);display:flex;align-items:center;justify-content:center;font-size:13px;color:white;font-weight:900">+</div>`:''}
          </div>
          <div style="font-size:11px;color:var(--text-secondary);max-width:62px;text-align:center;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${s.isMe?'قصتي':s.name.split(' ')[0]}</div>
        </div>
      `).join('')}
    </div>`;
}

function openStory(idx) {
  storyViewIndex = idx;
  const s = STORIES_DATA[idx];
  if (s) s.seen = true;
  const overlay = document.createElement('div');
  overlay.id = 'storyOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center';

  const total = STORIES_DATA.filter(x=>!x.isMe).length;
  const realIdx = STORIES_DATA.filter(x=>!x.isMe).indexOf(s);

  overlay.innerHTML = `
    <div style="position:absolute;top:0;left:0;right:0;display:flex;gap:4px;padding:12px">
      ${STORIES_DATA.filter(x=>!x.isMe).map((_,i) => `
        <div style="flex:1;height:3px;border-radius:2px;background:${i<=realIdx?'white':'rgba(255,255,255,0.3)'}"></div>`).join('')}
    </div>
    <div style="position:absolute;top:24px;right:16px;display:flex;align-items:center;gap:10px">
      <div style="width:38px;height:38px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:white">${s.init}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:white">${s.name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.6)">منذ 2 ساعة</div>
      </div>
    </div>
    <button onclick="document.getElementById('storyOverlay').remove();clearTimeout(storyTimer)" style="position:absolute;top:28px;left:16px;background:none;border:none;color:white;font-size:26px;cursor:pointer">✕</button>

    <div style="width:100%;max-width:420px;height:70vh;border-radius:20px;overflow:hidden;background:${s.bg||'var(--bg-dark)'};display:flex;flex-direction:column;align-items:center;justify-content:center;margin-top:40px;padding:24px;text-align:center">
      <div style="font-size:72px;margin-bottom:20px">${s.emoji||'✨'}</div>
      <div style="font-size:18px;color:white;font-weight:600;line-height:1.7">${s.content}</div>
    </div>

    <div style="display:flex;gap:12px;margin-top:16px;width:100%;max-width:420px;padding:0 16px">
      <input placeholder="ردّ على القصة..." style="flex:1;padding:12px 16px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:24px;color:white;font-family:Cairo,sans-serif;font-size:13px;outline:none">
      <button onclick="showToast('تم إرسال الرد ✓','success')" style="width:44px;height:44px;background:var(--gradient-1);border:none;border-radius:50%;color:white;font-size:18px;cursor:pointer">➤</button>
      <button onclick="showGiftPanel && showGiftPanel('${s.name}')" style="width:44px;height:44px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:50%;color:white;font-size:18px;cursor:pointer">🎁</button>
    </div>

    <div style="display:flex;gap:16px;margin-top:12px">
      <button onclick="prevStory()" style="padding:8px 20px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:20px;color:white;font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">◀ السابق</button>
      <button onclick="nextStory()" style="padding:8px 20px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:20px;color:white;font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">التالي ▶</button>
    </div>`;

  document.body.appendChild(overlay);
  storyTimer = setTimeout(() => nextStory(), 6000);
}

function nextStory() {
  clearTimeout(storyTimer);
  const nonMe = STORIES_DATA.map((s,i)=>({s,i})).filter(x=>!x.s.isMe);
  const cur = nonMe.findIndex(x=>x.i===storyViewIndex);
  if (cur < nonMe.length-1) { openStory(nonMe[cur+1].i); }
  else { (_el('storyOverlay')).remove(); }
}
function prevStory() {
  clearTimeout(storyTimer);
  const nonMe = STORIES_DATA.map((s,i)=>({s,i})).filter(x=>!x.s.isMe);
  const cur = nonMe.findIndex(x=>x.i===storyViewIndex);
  if (cur > 0) openStory(nonMe[cur-1].i);
}

function addMyStory() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border-radius:24px;padding:28px;width:100%;max-width:400px">
      <div style="font-size:18px;font-weight:800;margin-bottom:20px;text-align:center">✨ أضف قصة جديدة</div>
      <textarea id="storyText" placeholder="اكتب ما يدور في ذهنك..." style="width:100%;height:100px;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:14px;outline:none;resize:none;margin-bottom:12px"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        ${['🎵','💻','🌙','📚','😂','🔥','❤️','✨'].map(e=>`<button onclick="document.getElementById('storyText').value+=this.textContent" style="width:38px;height:38px;background:var(--bg-dark);border:1px solid var(--border);border-radius:8px;font-size:18px;cursor:pointer">${e}</button>`).join('')}
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('[style]').remove()" style="flex:1;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-secondary);font-family:Cairo,sans-serif;cursor:pointer">إلغاء</button>
        <button onclick="publishStory()" style="flex:2;padding:12px;background:var(--gradient-1);border:none;border-radius:12px;color:white;font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer">🚀 نشر القصة</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function publishStory() {
  const text = (_el('storyText')).value.trim();
  if (!text) { showToast('اكتب شيئاً أولاً!','error'); return; }
  (function(){var _e=document.querySelector('[style*="rgba(0,0,0,0.8)"]');return _e||{remove:function(){},classList:{add:function(){},remove:function(){},toggle:function(){}}};})().remove();
  showToast('تم نشر قصتك! ✨','success');
  if (typeof addXP==='function') addXP(15,'نشر قصة');
}


// ───────────────────────────────────────────────────────────────
//  2. ACTIVITY FEED
// ───────────────────────────────────────────────────────────────
const FEED_POSTS = [
  { id:1,  uid:1, type:'room',    text:'أنشأت غرفة جديدة: "مساء الموسيقى الهادئة" 🎵', time:'منذ 5 دقائق',  likes:24, comments:8,  shares:3,  liked:false },
  { id:2,  uid:6, type:'achieve', text:'وصل لـ المستوى 9 👑 مبروك يوسف!',             time:'منذ 12 دقيقة', likes:67, comments:14, shares:0,  liked:true  },
  { id:3,  uid:2, type:'post',    text:'نصيحة اليوم: الاستماع أهم من الكلام 🎙️ خاصة في الغرف الصوتية — شاركونا رأيكم!', time:'منذ 30 دقيقة', likes:43, comments:22, shares:7, liked:false },
  { id:4,  uid:5, type:'gift',    text:'أرسلت هدية 💎 ماسة لسارة أحمد في غرفة الموسيقى', time:'منذ 45 دقيقة', likes:18, comments:4, shares:0, liked:false },
  { id:5,  uid:3, type:'post',    text:'شكراً لجميع من كانوا معي الليلة ❤️ 500 مستمع في غرفة واحدة — رقم قياسي شخصي!', time:'منذ ساعة',    likes:112, comments:38, shares:15, liked:true },
  { id:6,  uid:1, type:'live',    text:'بدأت بثاً مباشراً 🔴 "أغاني الزمن الجميل"',   time:'منذ ساعتين',  likes:89, comments:29, shares:6,  liked:false },
  { id:7,  uid:2, type:'achieve', text:'حصل على شارة 🏆 "مئة غرفة" — عمر خالد يستحق التهنئة!', time:'منذ 3 ساعات', likes:55, comments:12, shares:0, liked:false },
];

const TYPE_CONFIG = {
  room:    { icon:'🎙️', label:'غرفة جديدة',  color:'#7C3AED' },
  achieve: { icon:'🏆', label:'إنجاز',        color:'#F59E0B' },
  post:    { icon:'📝', label:'منشور',         color:'#3B82F6' },
  gift:    { icon:'🎁', label:'هدية',          color:'#EC4899' },
  live:    { icon:'🔴', label:'بث مباشر',      color:'#EF4444' },
};

let feedPosts = [...FEED_POSTS];

function renderFeed() {
  const content = document.getElementById('mainContent');
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()">☰</button>
      <div class="topbar-title">📰 النشاط الاجتماعي</div>
      <button class="topbar-btn" onclick="showAddPost()" title="منشور جديد">✏️</button>
    </div>
    <div class="page-content" style="max-width:680px">

      <!-- Stories Bar -->
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:14px 16px;margin-bottom:16px">
        <div style="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:10px">✨ القصص</div>
        ${renderStoriesBar()}
      </div>

      <!-- Add Post Box -->
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:14px 16px;margin-bottom:16px;display:flex;gap:12px;align-items:center;cursor:pointer" onclick="showAddPost()">
        <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#EC4899);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:white;flex-shrink:0">أح</div>
        <div style="flex:1;padding:11px 16px;background:var(--bg-dark);border:1px solid var(--border);border-radius:24px;color:var(--text-secondary);font-size:14px">ماذا يدور في ذهنك؟ ✍️</div>
      </div>

      <!-- Filter Tabs -->
      <div style="display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;scrollbar-width:none">
        ${[['الكل','all'],['منشورات','post'],['غرف','room'],['إنجازات','achieve'],['بث','live']].map(([l,v]) => `
          <button onclick="filterFeed('${v}',this)" data-filter="${v}" style="padding:8px 16px;background:${v==='all'?'var(--gradient-1)':'var(--bg-card)'};border:1px solid ${v==='all'?'transparent':'var(--border)'};border-radius:20px;color:${v==='all'?'white':'var(--text-secondary)'};font-family:Cairo,sans-serif;font-size:13px;cursor:pointer;white-space:nowrap;flex-shrink:0">${l}</button>`).join('')}
      </div>

      <!-- Posts -->
      <div id="feedList" style="display:flex;flex-direction:column;gap:12px"></div>
    </div>`;
  renderFeedList(feedPosts);
}

function renderFeedList(posts) {
  const el = document.getElementById('feedList');
  if (!el) return;
  if (!posts.length) { el.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:40px">لا توجد منشورات</div>'; return; }
  el.innerHTML = posts.map(p => {
    const u = SOCIAL_USERS.find(x=>x.id===p.uid) || SOCIAL_USERS[0];
    const tc = TYPE_CONFIG[p.type] || TYPE_CONFIG.post;
    return `
      <div id="post_${p.id}" style="background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:16px;transition:all 0.2s">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="position:relative">
            <div style="width:46px;height:46px;border-radius:50%;background:${u.color};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:white">${u.init}</div>
            ${u.online?'<span style="position:absolute;bottom:1px;left:1px;width:11px;height:11px;background:var(--green);border-radius:50%;border:2px solid var(--bg-card)"></span>':''}
          </div>
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:700">
              ${u.name}${u.verified?'<span style="color:#60A5FA;font-size:13px">✓</span>':''}
              <span style="font-size:11px;background:${tc.color}22;color:${tc.color};padding:2px 8px;border-radius:8px;border:1px solid ${tc.color}44">${tc.icon} ${tc.label}</span>
            </div>
            <div style="font-size:12px;color:var(--text-secondary)">${u.handle} · ${p.time}</div>
          </div>
          <button onclick="showToast('تم حفظ المنشور','success')" style="background:none;border:none;color:var(--text-secondary);font-size:18px;cursor:pointer">⋯</button>
        </div>
        <div style="font-size:14px;line-height:1.8;margin-bottom:14px;color:var(--text-primary)">${p.text}</div>
        <div style="display:flex;align-items:center;gap:4px;padding-top:10px;border-top:1px solid var(--border)">
          <button onclick="toggleLike(${p.id},this)" style="display:flex;align-items:center;gap:5px;padding:7px 14px;background:${p.liked?'rgba(239,68,68,0.12)':'var(--bg-dark)'};border:1px solid ${p.liked?'#EF4444':'var(--border)'};border-radius:20px;color:${p.liked?'#EF4444':'var(--text-secondary)'};font-family:Cairo,sans-serif;font-size:13px;cursor:pointer;transition:all 0.2s">
            ${p.liked?'❤️':'🤍'} <span id="likes_${p.id}">${p.likes}</span>
          </button>
          <button onclick="showComments(${p.id})" style="display:flex;align-items:center;gap:5px;padding:7px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:20px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">
            💬 ${p.comments}
          </button>
          <button onclick="showToast('تم المشاركة!','success')" style="display:flex;align-items:center;gap:5px;padding:7px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:20px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">
            🔗 ${p.shares}
          </button>
          <button onclick="showGiftPanel && showGiftPanel('${u.name}')" style="margin-right:auto;padding:7px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:20px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:13px;cursor:pointer">
            🎁
          </button>
        </div>
      </div>`;
  }).join('');
}

function toggleLike(id, btn) {
  const p = feedPosts.find(x=>x.id===id);
  if (!p) return;
  p.liked = !p.liked;
  p.likes += p.liked ? 1 : -1;
  btn.style.background = p.liked ? 'rgba(239,68,68,0.12)' : 'var(--bg-dark)';
  btn.style.borderColor = p.liked ? '#EF4444' : 'var(--border)';
  btn.style.color = p.liked ? '#EF4444' : 'var(--text-secondary)';
  btn.innerHTML = `${p.liked?'❤️':'🤍'} <span id="likes_${id}">${p.likes}</span>`;
  if (p.liked && typeof addXP==='function') addXP(2,'إعجاب بمنشور');
}

function filterFeed(type, btn) {
  document.querySelectorAll('[data-filter]').forEach(b => {
    b.style.background = 'var(--bg-card)';
    b.style.borderColor = 'var(--border)';
    b.style.color = 'var(--text-secondary)';
  });
  btn.style.background = 'var(--gradient-1)';
  btn.style.borderColor = 'transparent';
  btn.style.color = 'white';
  const filtered = type==='all' ? feedPosts : feedPosts.filter(p=>p.type===type);
  renderFeedList(filtered);
}

function showComments(postId) {
  const p = feedPosts.find(x=>x.id===postId);
  if (!p) return;
  const u = SOCIAL_USERS.find(x=>x.id===p.uid) || SOCIAL_USERS[0];
  const sampleComments = [
    { name:'سارة أحمد', init:'سا', text:'رائع جداً! 😍', time:'منذ دقيقة' },
    { name:'عمر خالد',  init:'عم', text:'موافق 100% 👍',  time:'منذ 5 دقائق' },
    { name:'نورة سالم', init:'نو', text:'❤️❤️❤️',          time:'منذ 12 دقيقة' },
  ].slice(0, Math.min(p.comments, 3));
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;display:flex;align-items:flex-end;justify-content:center';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border-radius:24px 24px 0 0;width:100%;max-width:600px;max-height:70vh;display:flex;flex-direction:column">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:16px;font-weight:700">💬 التعليقات (${p.comments})</div>
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div style="overflow-y:auto;flex:1;padding:14px;display:flex;flex-direction:column;gap:12px">
        ${sampleComments.map(c=>`
          <div style="display:flex;gap:10px;align-items:flex-start">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;flex-shrink:0">${c.init}</div>
            <div style="flex:1;background:var(--bg-dark);border-radius:12px;padding:10px 14px">
              <div style="font-size:13px;font-weight:700">${c.name} <span style="font-size:11px;color:var(--text-secondary);font-weight:400">${c.time}</span></div>
              <div style="font-size:13px;margin-top:4px">${c.text}</div>
            </div>
          </div>`).join('')}
        ${p.comments > 3 ? `<div style="text-align:center;color:var(--text-secondary);font-size:13px">و ${p.comments-3} تعليقات أخرى...</div>` : ''}
      </div>
      <div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px">
        <input id="commentInput_${p.id}" placeholder="اكتب تعليقاً..." style="flex:1;padding:10px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:20px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:13px;outline:none">
        <button onclick="submitComment(${p.id})" style="width:40px;height:40px;background:var(--gradient-1);border:none;border-radius:50%;color:white;font-size:16px;cursor:pointer">➤</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

function submitComment(id) {
  const input = document.getElementById(`commentInput_${id}`);
  if (!(input?input.value:"").trim()) return;
  const p = feedPosts.find(x=>x.id===id);
  if (p) p.comments++;
  input.value = '';
  showToast('تم إضافة تعليقك ✓','success');
  if (typeof addXP==='function') addXP(3,'تعليق');
}

function showAddPost() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--bg-card);border-radius:24px;padding:24px;width:100%;max-width:480px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-size:17px;font-weight:800">✍️ منشور جديد</div>
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:14px">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;flex-shrink:0">أح</div>
        <textarea id="postContent" placeholder="ما الذي يدور في ذهنك؟" style="flex:1;min-height:100px;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:14px;outline:none;resize:none"></textarea>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${['🎵','🔥','❤️','😂','🎙️','💡','👏','✨'].map(e=>`<button onclick="document.getElementById('postContent').value+=this.textContent" style="width:36px;height:36px;background:var(--bg-dark);border:1px solid var(--border);border-radius:8px;font-size:16px;cursor:pointer">${e}</button>`).join('')}
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('[style]').remove()" style="flex:1;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-secondary);font-family:Cairo,sans-serif;cursor:pointer">إلغاء</button>
        <button onclick="publishPost()" style="flex:2;padding:12px;background:var(--gradient-1);border:none;border-radius:12px;color:white;font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer">🚀 نشر</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function publishPost() {
  const text = (_el('postContent')).value.trim();
  if (!text) { showToast('اكتب شيئاً أولاً!','error'); return; }
  (function(){var _e=document.querySelector('[style*="rgba(0,0,0,0.8)"]');return _e||{remove:function(){},classList:{add:function(){},remove:function(){},toggle:function(){}}};})().remove();
  const newPost = { id: Date.now(), uid:0, type:'post', text, time:'الآن', likes:0, comments:0, shares:0, liked:false };
  feedPosts.unshift(newPost);
  showToast('تم نشر منشورك! 🚀','success');
  if (typeof addXP==='function') addXP(10,'نشر منشور');
  if (document.getElementById('feedList')) renderFeedList(feedPosts);
}


// ───────────────────────────────────────────────────────────────
//  3. CHALLENGES
// ───────────────────────────────────────────────────────────────
const CHALLENGES = {
  daily: [
    { id:'d1', icon:'🎙️', title:'ابدأ غرفة صوتية',          desc:'أنشئ غرفة واحدة اليوم',          reward:50,  xp:30,  progress:0, goal:1,  done:false },
    { id:'d2', icon:'💬', title:'أرسل 10 رسائل',             desc:'تفاعل مع المجتمع',                reward:30,  xp:20,  progress:3, goal:10, done:false },
    { id:'d3', icon:'🎁', title:'أرسل هدية',                 desc:'فاجئ صديقاً بهدية',               reward:40,  xp:25,  progress:0, goal:1,  done:false },
    { id:'d4', icon:'👥', title:'تابع 3 أشخاص جدد',          desc:'وسّع دائرة معارفك',                reward:25,  xp:15,  progress:1, goal:3,  done:false },
    { id:'d5', icon:'⏱️', title:'15 دقيقة في غرفة صوتية',   desc:'استمع أو تكلم لـ 15 دقيقة',       reward:60,  xp:40,  progress:7, goal:15, done:false },
  ],
  weekly: [
    { id:'w1', icon:'🏆', title:'أنشئ 5 غرف هذا الأسبوع',   desc:'كن مضيفاً نشيطاً',                reward:200, xp:150, progress:2, goal:5,  done:false },
    { id:'w2', icon:'🌟', title:'احصل على 100 إعجاب',        desc:'على منشوراتك أو قصصك',            reward:300, xp:200, progress:34,goal:100,done:false },
    { id:'w3', icon:'🎁', title:'أرسل 10 هدايا',             desc:'كن الأكثر كرماً هذا الأسبوع',     reward:500, xp:300, progress:3, goal:10, done:false },
    { id:'w4', icon:'📡', title:'ابدأ بثاً مباشراً',         desc:'بث لأكثر من 30 دقيقة',            reward:400, xp:250, progress:0, goal:1,  done:false },
  ],
  special: [
    { id:'s1', icon:'🔥', title:'تحدي الصوت الذهبي',        desc:'تكلم 60 دقيقة هذا الأسبوع',       reward:1000,xp:500, progress:22,goal:60, done:false, expires:'48 ساعة' },
    { id:'s2', icon:'💝', title:'أسبوع الكرم',              desc:'أرسل 20 هدية خلال أسبوع',          reward:800, xp:400, progress:3, goal:20, done:false, expires:'5 أيام' },
  ]
};

let challengeClaimCooldown = {};

function renderChallenges() {
  const content = document.getElementById('mainContent');
  const doneDaily = CHALLENGES.daily.filter(c=>c.done).length;
  const doneWeekly = CHALLENGES.weekly.filter(c=>c.done).length;
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()">☰</button>
      <div class="topbar-title">🎯 التحديات</div>
    </div>
    <div class="page-content">

      <!-- Stats Row -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
        ${[
          {icon:'📅',label:'اليومية',  val:`${doneDaily}/${CHALLENGES.daily.length}`,   color:'#3B82F6'},
          {icon:'📆',label:'الأسبوعية',val:`${doneWeekly}/${CHALLENGES.weekly.length}`,  color:'#7C3AED'},
          {icon:'🔥',label:'مميزة',    val:CHALLENGES.special.length,                    color:'#EF4444'},
        ].map(s=>`
          <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center">
            <div style="font-size:28px;margin-bottom:4px">${s.icon}</div>
            <div style="font-size:20px;font-weight:900;color:${s.color}">${s.val}</div>
            <div style="font-size:11px;color:var(--text-secondary)">${s.label}</div>
          </div>`).join('')}
      </div>

      <!-- Daily -->
      <div style="margin-bottom:24px">
        <div class="section-header" style="margin-bottom:12px">
          <div class="section-title">📅 التحديات اليومية</div>
          <div style="font-size:12px;color:var(--text-secondary)">تتجدد كل 24 ساعة</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${CHALLENGES.daily.map(c => challengeCard(c,'daily')).join('')}
        </div>
      </div>

      <!-- Weekly -->
      <div style="margin-bottom:24px">
        <div class="section-header" style="margin-bottom:12px">
          <div class="section-title">📆 التحديات الأسبوعية</div>
          <div style="font-size:12px;color:var(--text-secondary)">تتجدد كل أسبوع</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${CHALLENGES.weekly.map(c => challengeCard(c,'weekly')).join('')}
        </div>
      </div>

      <!-- Special -->
      <div style="margin-bottom:24px">
        <div class="section-header" style="margin-bottom:12px">
          <div class="section-title">🔥 تحديات مميزة</div>
          <div style="font-size:12px;color:#EF4444">محدودة الوقت!</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${CHALLENGES.special.map(c => challengeCard(c,'special')).join('')}
        </div>
      </div>

    </div>`;
}

function challengeCard(c, type) {
  const pct = Math.min(100, (c.progress / c.goal * 100)).toFixed(0);
  const canClaim = c.progress >= c.goal && !c.done;
  return `
    <div style="background:var(--bg-card);border:1px solid ${c.done?'#10B981':canClaim?'#F59E0B':'var(--border)'};border-radius:16px;padding:16px;transition:all 0.2s;${c.done?'opacity:0.7':''}">
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="width:46px;height:46px;border-radius:14px;background:${c.done?'rgba(16,185,129,0.15)':canClaim?'rgba(245,158,11,0.15)':'var(--bg-dark)'};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${c.done?'✅':c.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">
            <div style="font-size:14px;font-weight:700">${c.title}</div>
            ${type==='special'?`<span style="font-size:10px;background:#EF444422;color:#EF4444;padding:2px 8px;border-radius:8px;border:1px solid #EF444444">⏳ ${c.expires}</span>`:''}
          </div>
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px">${c.desc}</div>
          <div style="background:var(--bg-dark);border-radius:50px;height:8px;margin-bottom:6px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${c.done?'#10B981':canClaim?'linear-gradient(90deg,#F59E0B,#EF4444)':'linear-gradient(90deg,#7C3AED,#EC4899)'};border-radius:50px;transition:width 0.6s ease"></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;color:var(--text-secondary)">${c.progress}/${c.goal} ${c.done?'✓ مكتمل':''}</span>
            <div style="display:flex;gap:8px;align-items:center">
              <span style="font-size:11px;color:#F59E0B">💰 ${c.reward}</span>
              <span style="font-size:11px;color:#7C3AED">⭐ ${c.xp} XP</span>
              ${canClaim ? `<button onclick="claimChallenge('${c.id}','${type}')" style="padding:6px 14px;background:linear-gradient(135deg,#F59E0B,#EF4444);border:none;border-radius:12px;color:white;font-family:Cairo,sans-serif;font-size:12px;font-weight:700;cursor:pointer;animation:pulse 1.5s infinite">🎁 استلم</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function claimChallenge(id, type) {
  const list = CHALLENGES[type];
  const c = (list||[]).find(x=>x.id===id);
  if (!c || c.done) return;
  c.done = true;
  APP_DATA.currentUser.coins += c.reward;
  if (typeof addXP==='function') addXP(c.xp, `تحدي: ${c.title}`);
  if (typeof playGiftSound==='function') playGiftSound();
  showToast(`🎉 أكملت "${c.title}"! +${c.reward} عملة`, 'success');
  renderChallenges();
}

function progressChallenge(id, amount=1) {
  for (const type of ['daily','weekly','special']) {
    const c = (CHALLENGES[type]||[]).find(x=>x.id===id);
    if (c && !c.done) {
      c.progress = Math.min(c.goal, c.progress + amount);
      if (c.progress >= c.goal) showToast(`🎯 تحدي جاهز للاستلام: ${c.title}!`, 'gift');
      return;
    }
  }
}


// ───────────────────────────────────────────────────────────────
//  4. FRIENDS & ONLINE STATUS
// ───────────────────────────────────────────────────────────────
let friendsList = [
  { ...SOCIAL_USERS[0], status:'في غرفة موسيقية 🎵',  friend:true },
  { ...SOCIAL_USERS[1], status:'متصل',                 friend:true },
  { ...SOCIAL_USERS[4], status:'في غرفة ثقافة 📚',    friend:true },
  { ...SOCIAL_USERS[5], status:'يبث مباشر 🔴',         friend:true },
];
let friendRequests = [
  { ...SOCIAL_USERS[2], mutuals:3 },
  { ...SOCIAL_USERS[3], mutuals:1 },
];

function renderFriendsPage() {
  const content = document.getElementById('mainContent');
  const online = friendsList.filter(f=>f.online).length;
  content.innerHTML = `
    <div class="topbar">
      <button class="hamburger-btn" onclick="openSidebar()">☰</button>
      <div class="topbar-title">👫 الأصدقاء</div>
      <button class="topbar-btn" onclick="navigate('people')" title="إضافة صديق">➕</button>
    </div>
    <div class="page-content">

      <!-- Online Now Banner -->
      <div style="background:linear-gradient(135deg,#10B98122,#3B82F622);border:1px solid #10B98144;border-radius:16px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <div style="width:46px;height:46px;background:rgba(16,185,129,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px">🟢</div>
        <div>
          <div style="font-size:16px;font-weight:800">${online} أصدقاء متصلون الآن</div>
          <div style="font-size:13px;color:var(--text-secondary)">من أصل ${friendsList.length} صديق</div>
        </div>
      </div>

      <!-- Requests -->
      ${friendRequests.length ? `
        <div class="section-header" style="margin-bottom:12px">
          <div class="section-title">🔔 طلبات الصداقة <span style="background:#EF4444;color:white;font-size:11px;padding:1px 8px;border-radius:10px;margin-right:6px">${friendRequests.length}</span></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
          ${friendRequests.map(r=>`
            <div style="background:var(--bg-card);border:1px solid #7C3AED44;border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px">
              <div style="width:46px;height:46px;border-radius:50%;background:${r.color};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:white;flex-shrink:0">${r.init}</div>
              <div style="flex:1">
                <div style="font-size:14px;font-weight:700">${r.name}</div>
                <div style="font-size:12px;color:var(--text-secondary)">${r.handle} · ${r.mutuals} أصدقاء مشتركون</div>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0">
                <button onclick="acceptFriend(${r.id})" style="padding:8px 14px;background:var(--gradient-1);border:none;border-radius:10px;color:white;font-family:Cairo,sans-serif;font-size:12px;font-weight:700;cursor:pointer">قبول</button>
                <button onclick="rejectFriend(${r.id})" style="padding:8px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:10px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:12px;cursor:pointer">رفض</button>
              </div>
            </div>`).join('')}
        </div>` : ''}

      <!-- Friends List -->
      <div class="section-header" style="margin-bottom:12px">
        <div class="section-title">👫 قائمة الأصدقاء</div>
      </div>
      <div style="position:relative;margin-bottom:14px">
        <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--text-secondary)">🔍</span>
        <input placeholder="ابحث في أصدقائك..." style="width:100%;padding:11px 44px 11px 14px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:14px;outline:none" oninput="filterFriends(this.value)">
      </div>
      <div id="friendsListEl" style="display:flex;flex-direction:column;gap:8px">
        ${renderFriendsList(friendsList)}
      </div>
    </div>`;
}

function renderFriendsList(list) {
  return list.map(f=>`
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;transition:all 0.2s" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="position:relative;flex-shrink:0">
        <div style="width:48px;height:48px;border-radius:50%;background:${f.color};display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:white">${f.init}</div>
        <span style="position:absolute;bottom:1px;left:1px;width:12px;height:12px;background:${f.online?'#10B981':'#6B7280'};border-radius:50%;border:2px solid var(--bg-card)"></span>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:700">${f.name} ${f.verified?'<span style="color:#60A5FA;font-size:12px">✓</span>':''}</div>
        <div style="font-size:12px;color:${f.online?'var(--green)':'var(--text-secondary)'}">${f.status || (f.online?'متصل':'غير متصل')}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">المستوى ${f.level}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
        <button onclick="navigate('messages');setTimeout(()=>openDM(1),200)" style="padding:7px 12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:10px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:12px;cursor:pointer">💬 رسالة</button>
        <button onclick="showGiftPanel&&showGiftPanel('${f.name}')" style="padding:7px 12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:10px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:12px;cursor:pointer">🎁 هدية</button>
      </div>
    </div>`).join('');
}

function filterFriends(q) {
  const el = document.getElementById('friendsListEl');
  if (!el) return;
  const filtered = q ? friendsList.filter(f=>f.name.includes(q)||f.handle.includes(q)) : friendsList;
  el.innerHTML = renderFriendsList(filtered);
}

function acceptFriend(id) {
  const req = friendRequests.find(r=>r.id===id);
  if (!req) return;
  friendRequests = friendRequests.filter(r=>r.id!==id);
  friendsList.push({...req, friend:true, status:'انضم حديثاً 🎉'});
  showToast(`أصبحت وصديقاً مع ${req.name}! 🎉`, 'success');
  if (typeof addXP==='function') addXP(10,'قبول صديق');
  renderFriendsPage();
}

function rejectFriend(id) {
  friendRequests = friendRequests.filter(r=>r.id!==id);
  renderFriendsPage();
}


// ───────────────────────────────────────────────────────────────
//  INJECT NEW PAGES INTO navigate()
// ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const _prev = window.navigate;
  window.navigate = function(page, data) {
    if (typeof currentPage !== 'undefined' && currentPage === 'room' && page !== 'room') {
      clearInterval(autoMsgInterval); clearInterval(speakingInterval);
      autoMsgInterval = null; speakingInterval = null;
      if (typeof stopMicrophone === 'function') stopMicrophone();
    }
    switch(page) {
      case 'feed':       renderFeed();        break;
      case 'challenges': renderChallenges();  break;
      case 'friends':    renderFriendsPage(); break;
      default:
        if (_prev) _prev(page, data);
        return;
    }
    if (typeof currentPage !== 'undefined') window.currentPage = page;
    const mc = document.getElementById('mainContent');
    if (mc) mc.scrollTop = 0;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
    document.querySelectorAll('.mobile-nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  };

  // Patch renderHome to inject stories bar ONCE
  const _home = window.renderHome;
  if (typeof _home === 'function') {
    window.renderHome = function() {
      _home();
      if (document.getElementById('storiesInjected')) return;
      const first = document.querySelector('#mainContent .page-content');
      if (first) {
        const sb = document.createElement('div');
        sb.id = 'storiesInjected';
        sb.style.cssText = 'background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:14px 16px;margin-bottom:16px';
        sb.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:10px">✨ القصص</div>' + renderStoriesBar();
        first.insertBefore(sb, first.firstChild);
      }
    };
  }
});
