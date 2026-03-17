// ═══════════════════════════════════════════════════════════════
//  EXTRAS: Emoji Picker · Room Menus · Raise Hand · Wallet Modals
//          Web Share · Sync XP with user profile
// ═══════════════════════════════════════════════════════════════

// Register is done at bottom of file after all functions are defined
// ───────────────────────────────────────────────────────────────
//  Sync APP_DATA.currentUser with XP system on load
// ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Merge XP from features.js into APP_DATA if loaded
  if (typeof userXP !== 'undefined' && APP_DATA?.currentUser) {
    // If features XP is higher, use it; else seed from user.xp
    if (userXP === 0 && APP_DATA.currentUser.xp) {
      window.userXP = APP_DATA.currentUser.xp;
      try { localStorage.setItem('vxp', userXP); } catch(e) {}
    }
    // Expose level getter dynamically
    Object.defineProperty(APP_DATA.currentUser, 'level', {
      get() {
        if (typeof getLevelInfo === 'function') return getLevelInfo(userXP).level;
        return Math.max(1, Math.floor(userXP / 100) + 1);
      },
      configurable: true
    });
  }
});

// ───────────────────────────────────────────────────────────────
//  1. REAL EMOJI PICKER (for chat inputs)
// ───────────────────────────────────────────────────────────────
const EMOJI_GROUPS = {
  '😊 تعابير': ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','😎','🤓','🧐'],
  '👋 أيدي':  ['👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤟','🤘','👌','🤌','🤏','👈','👉','👆','👇','☝️','👋','🤚','🖐','✋','🖖','👏','🙌','🤲','🤝','🙏'],
  '❤️ قلوب':  ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☯️','🕉️'],
  '🎵 موسيقى': ['🎵','🎶','🎼','🎤','🎧','🎷','🎸','🎹','🎺','🎻','🥁','🎙️','🎚️','🎛️','📻'],
  '🎁 هدايا':  ['🎁','🎀','🎊','🎉','🎈','🎆','🎇','✨','🌟','⭐','💫','🌠','🎯','🏆','🥇','🥈','🥉','🏅','🎖️'],
};

let emojiTarget = null;

function toggleEmoji(inputId) {
  emojiTarget = inputId || 'chatInput';
  const existing = document.getElementById('emojiPickerPanel');
  if (existing) { existing.remove(); return; }
  const panel = document.createElement('div');
  panel.id = 'emojiPickerPanel';
  panel.style.cssText = 'position:fixed;bottom:72px;right:16px;left:16px;max-width:360px;margin:0 auto;background:var(--bg-card);border:1px solid var(--border);border-radius:20px;z-index:500;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.5)';

  const groups = Object.keys(EMOJI_GROUPS);
  let activeGroup = groups[0];

  function render() {
    panel.innerHTML = `
      <div style="display:flex;gap:2px;padding:10px 10px 0;overflow-x:auto;scrollbar-width:none">
        ${groups.map(g => `
          <button onclick="emojiTab(this,'${g}')" style="padding:7px 10px;background:${g===activeGroup?'var(--gradient-1)':'var(--bg-dark)'};border:1px solid ${g===activeGroup?'transparent':'var(--border)'};border-radius:10px;color:${g===activeGroup?'white':'var(--text-secondary)'};font-family:Cairo,sans-serif;font-size:11px;cursor:pointer;white-space:nowrap;flex-shrink:0">${g}</button>`).join('')}
      </div>
      <div style="height:200px;overflow-y:auto;padding:10px;display:flex;flex-wrap:wrap;gap:4px">
        ${EMOJI_GROUPS[activeGroup].map(e => `<button onclick="insertEmoji('${e}')" style="width:38px;height:38px;background:none;border:none;font-size:22px;cursor:pointer;border-radius:8px;transition:background 0.1s" onmouseover="this.style.background='var(--bg-dark)'" onmouseout="this.style.background='none'">${e}</button>`).join('')}
      </div>`;
  }
  render();
  document.body.appendChild(panel);
  document.addEventListener('click', closeEmojiOnOutside);

  window.emojiTab = function(btn, group) {
    activeGroup = group;
    render();
  };
}

function insertEmoji(e) {
  const input = document.getElementById(emojiTarget) || document.getElementById('chatInput') || document.getElementById('dmInput');
  if (input) {
    const s = input.selectionStart || input.value.length;
    input.value = input.value.slice(0, s) + e + input.value.slice(s);
    input.focus();
    input.selectionStart = input.selectionEnd = s + e.length;
  }
  document.getElementById('emojiPickerPanel')?.remove();
  document.removeEventListener('click', closeEmojiOnOutside);
}

function closeEmojiOnOutside(e) {
  const panel = document.getElementById('emojiPickerPanel');
  if (panel && !panel.contains(e.target) && !e.target.closest('.emoji-btn')) {
    panel.remove();
    document.removeEventListener('click', closeEmojiOnOutside);
  }
}


// ───────────────────────────────────────────────────────────────
//  2. ROOM MENUS — Speaker tap + Room options
// ───────────────────────────────────────────────────────────────
function showSpeakerMenu(name, uid) {
  const isMod = true; // current user is host
  const isMe = !uid || uid === 'me';
  const menu = document.createElement('div');
  menu.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:flex-end;justify-content:center';
  const items = isMe ? [
    {icon:'🎤', label: isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت',   fn:`toggleMute()`},
    {icon:'🔊', label: isSpeaker ? 'نزول للاستماع' : 'الصعود للتحدث', fn:`toggleSpeaker()`},
    {icon:'🚪', label:'مغادرة الغرفة',   fn:`leaveRoom()`},
  ] : [
    {icon:'👤', label:'عرض الملف الشخصي', fn:`showToast('ملف ${name}','info')`},
    {icon:'💬', label:'مراسلة',            fn:`navigate('messages')`},
    {icon:'🎁', label:'إرسال هدية',        fn:`showGiftPanel('${name}')`},
    {icon:'🔇', label:'كتم المتحدث',       fn:`showToast('تم كتم ${name}','success')`},
    {icon:'⬇️', label:'إنزاله للاستماع',  fn:`showToast('تم إنزال ${name}','success')`},
    {icon:'🚫', label:'طرد من الغرفة',     fn:`showToast('تم طرد ${name}','success')`},
  ];
  menu.innerHTML = `
    <div style="background:var(--bg-card);border-radius:24px 24px 0 0;width:100%;max-width:500px;padding:8px 0 24px">
      <div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:10px auto 16px"></div>
      <div style="padding:0 20px 12px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border);margin-bottom:8px">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:white">${name.charAt(0)}</div>
        <div>
          <div style="font-size:15px;font-weight:800">${isMe ? 'أنت' : name}</div>
          <div style="font-size:12px;color:var(--green)">● متحدث نشط</div>
        </div>
      </div>
      ${items.map(i => `
        <button onclick="${i.fn};this.closest('[style*=fixed]').remove()" style="width:100%;padding:14px 24px;background:none;border:none;text-align:right;font-family:Cairo,sans-serif;font-size:15px;color:var(--text-primary);cursor:pointer;display:flex;align-items:center;gap:14px;transition:background 0.15s" onmouseover="this.style.background='var(--bg-dark)'" onmouseout="this.style.background='none'">
          <span style="font-size:20px;width:28px">${i.icon}</span>${i.label}
        </button>`).join('')}
      <button onclick="this.closest('[style*=fixed]').remove()" style="width:calc(100% - 32px);margin:10px 16px 0;padding:13px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:14px;cursor:pointer">إلغاء</button>
    </div>`;
  document.body.appendChild(menu);
  menu.addEventListener('click', e => { if(e.target===menu) menu.remove(); });
}

function showRoomMenu() {
  const menu = document.createElement('div');
  menu.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:flex-end;justify-content:center';
  const items = [
    {icon:'🔗', label:'مشاركة رابط الغرفة',     fn:`shareRoom()`},
    {icon:'👥', label:'دعوة أصدقاء',              fn:`inviteFriends()`},
    {icon:'📋', label:'قواعد الغرفة',             fn:`showRoomRules()`},
    {icon:'🔇', label:'كتم جميع المتحدثين',      fn:`showToast('تم كتم الجميع','success')`},
    {icon:'🔒', label:'قفل الغرفة',               fn:`showToast('تم قفل الغرفة','success')`},
    {icon:'🚪', label:'مغادرة الغرفة',            fn:`leaveRoom()`},
  ];
  menu.innerHTML = `
    <div style="background:var(--bg-card);border-radius:24px 24px 0 0;width:100%;max-width:500px;padding:8px 0 24px">
      <div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:10px auto 16px"></div>
      <div style="padding:4px 20px 14px;font-size:16px;font-weight:800;border-bottom:1px solid var(--border);margin-bottom:8px">⚙️ خيارات الغرفة</div>
      ${items.map(i => `
        <button onclick="${i.fn};this.closest('[style*=fixed]').remove()" style="width:100%;padding:14px 24px;background:none;border:none;text-align:right;font-family:Cairo,sans-serif;font-size:15px;color:${i.label==='مغادرة الغرفة'?'#EF4444':'var(--text-primary)'};cursor:pointer;display:flex;align-items:center;gap:14px;transition:background 0.15s" onmouseover="this.style.background='var(--bg-dark)'" onmouseout="this.style.background='none'">
          <span style="font-size:20px;width:28px">${i.icon}</span>${i.label}
        </button>`).join('')}
      <button onclick="this.closest('[style*=fixed]').remove()" style="width:calc(100% - 32px);margin:10px 16px 0;padding:13px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-secondary);font-family:Cairo,sans-serif;font-size:14px;cursor:pointer">إلغاء</button>
    </div>`;
  document.body.appendChild(menu);
  menu.addEventListener('click', e => { if(e.target===menu) menu.remove(); });
}

function shareRoom() {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({ title:'انضم لغرفتي في صوتي!', text:'تعال استمع معنا 🎙️', url }).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(url).then(() => showToast('تم نسخ الرابط 🔗','success')).catch(()=>showToast('رابط الغرفة: '+url,'info'));
  }
}

function inviteFriends() {
  navigate('friends');
  setTimeout(() => showToast('اضغط على أي صديق لدعوته للغرفة!','info'), 300);
}

function showRoomRules() {
  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `
    <div style="background:var(--bg-card);border-radius:20px;padding:24px;width:100%;max-width:400px">
      <div style="font-size:17px;font-weight:800;margin-bottom:16px;display:flex;justify-content:space-between">
        📋 قواعد الغرفة
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      ${['احترام جميع المتحدثين 🤝','لا للكلام الجارح أو العدائي 🚫','انتظر دورك للحديث ⏳','لا تقاطع المتحدثين الآخرين 🙏','يُمنع الإعلان أو الترويج 📵'].map((r,i)=>`
        <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;flex-shrink:0">${i+1}</div>
          <div style="font-size:14px">${r}</div>
        </div>`).join('')}
    </div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { if(e.target===m) m.remove(); });
}


// ───────────────────────────────────────────────────────────────
//  3. RAISE HAND — visual feedback inside room
// ───────────────────────────────────────────────────────────────
let handRaised = false;

function raiseHand() {
  handRaised = !handRaised;
  const btn = document.getElementById('raiseHandBtn') || document.getElementById('handBtn');
  if (btn) {
    btn.style.background = handRaised ? 'rgba(245,158,11,0.2)' : 'var(--bg-dark)';
    btn.style.borderColor = handRaised ? '#F59E0B' : 'var(--border)';
    btn.style.color = handRaised ? '#F59E0B' : 'var(--text-secondary)';
    btn.title = handRaised ? 'إنزال اليد' : 'رفع اليد';
  }
  if (handRaised) {
    showToast('✋ رفعت يدك — انتظر إذن المضيف', 'info');
    // Show floating hand animation in room
    const room = document.getElementById('mainContent');
    if (room) {
      const hand = document.createElement('div');
      hand.id = 'floatingHand';
      hand.style.cssText = 'position:fixed;bottom:140px;left:50%;transform:translateX(-50%);background:rgba(245,158,11,0.9);color:white;padding:10px 20px;border-radius:24px;font-size:14px;font-weight:700;font-family:Cairo,sans-serif;z-index:300;animation:slideUp 0.4s ease,pulse 1.5s 0.4s infinite';
      hand.textContent = '✋ طلبت الكلام';
      room.appendChild(hand);
    }
    // Auto-approve after 4s (simulate host action)
    setTimeout(() => {
      document.getElementById('floatingHand')?.remove();
      if (handRaised) {
        showToast('🎤 تم قبول طلبك! تفضل بالكلام', 'success');
        if (typeof playJoinSound === 'function') playJoinSound();
      }
    }, 4000);
  } else {
    document.getElementById('floatingHand')?.remove();
    showToast('أنزلت يدك', 'info');
  }
}


// ───────────────────────────────────────────────────────────────
//  4. WALLET — Withdraw & Transfer Modals
// ───────────────────────────────────────────────────────────────
function showWithdrawModal() {
  const u = APP_DATA.currentUser;
  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `
    <div style="background:var(--bg-card);border-radius:20px;padding:24px;width:100%;max-width:420px">
      <div style="font-size:17px;font-weight:800;margin-bottom:4px;display:flex;justify-content:space-between">
        💸 سحب الرصيد
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:18px">الحد الأدنى للسحب: 1000 عملة = 1$</div>

      <div style="background:var(--bg-dark);border-radius:12px;padding:14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
        <span style="color:var(--text-secondary);font-size:13px">رصيدك الحالي</span>
        <span style="font-size:20px;font-weight:900;color:#F59E0B">💰 ${u.coins.toLocaleString()}</span>
      </div>

      <div style="margin-bottom:12px">
        <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px">عدد العملات للسحب</label>
        <input id="withdrawAmt" type="number" min="1000" max="${u.coins}" value="1000" style="width:100%;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:16px;outline:none" oninput="document.getElementById('withdrawUSD').textContent='≈ $'+(this.value/1000).toFixed(2)">
        <div id="withdrawUSD" style="font-size:12px;color:var(--green);margin-top:6px;text-align:left">≈ $1.00</div>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px">طريقة الاستلام</label>
        <select style="width:100%;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:16px;outline:none">
          <option>PayPal</option><option>Payoneer</option><option>تحويل بنكي</option>
        </select>
      </div>
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:10px 14px;font-size:12px;color:var(--text-secondary);margin-bottom:16px">
        ⚠️ تتم معالجة طلبات السحب خلال 3-5 أيام عمل
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('[style]').remove()" style="flex:1;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-secondary);font-family:Cairo,sans-serif;cursor:pointer">إلغاء</button>
        <button onclick="processWithdraw()" style="flex:2;padding:12px;background:linear-gradient(135deg,#F59E0B,#EF4444);border:none;border-radius:12px;color:white;font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer">💸 تأكيد السحب</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { if(e.target===m) m.remove(); });
}

function processWithdraw() {
  const amt = parseInt(document.getElementById('withdrawAmt')?.value || 0);
  if (amt < 1000) { showToast('الحد الأدنى 1000 عملة!','error'); return; }
  if (amt > APP_DATA.currentUser.coins) { showToast('رصيدك غير كافٍ!','error'); return; }
  APP_DATA.currentUser.coins -= amt;
  document.querySelector('[style*="rgba(0,0,0,0.75)"]')?.remove();
  showToast(`تم تقديم طلب سحب ${amt.toLocaleString()} عملة ✓`,'success');
}

function showTransferModal() {
  const u = APP_DATA.currentUser;
  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  m.innerHTML = `
    <div style="background:var(--bg-card);border-radius:20px;padding:24px;width:100%;max-width:420px">
      <div style="font-size:17px;font-weight:800;margin-bottom:18px;display:flex;justify-content:space-between">
        🔄 تحويل للأصدقاء
        <button onclick="this.closest('[style]').remove()" style="background:none;border:none;color:var(--text-secondary);font-size:22px;cursor:pointer">✕</button>
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px">المعرّف أو اسم المستخدم</label>
        <input id="transferTo" placeholder="@username" list="friendsSuggest" style="width:100%;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:16px;outline:none">
        <datalist id="friendsSuggest">
          <option value="@sara_a">سارة أحمد</option>
          <option value="@omar_k">عمر خالد</option>
          <option value="@noura_s">نورة سالم</option>
          <option value="@fatima_a">فاطمة علي</option>
        </datalist>
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px">عدد العملات (رصيدك: ${u.coins.toLocaleString()})</label>
        <input id="transferAmt" type="number" min="10" max="${u.coins}" value="100" style="width:100%;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:16px;outline:none">
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:6px">رسالة (اختياري)</label>
        <input id="transferNote" placeholder="هدية منّي لك 🎁" style="width:100%;padding:11px 14px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-primary);font-family:Cairo,sans-serif;font-size:16px;outline:none">
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('[style]').remove()" style="flex:1;padding:12px;background:var(--bg-dark);border:1px solid var(--border);border-radius:12px;color:var(--text-secondary);font-family:Cairo,sans-serif;cursor:pointer">إلغاء</button>
        <button onclick="processTransfer()" style="flex:2;padding:12px;background:var(--gradient-1);border:none;border-radius:12px;color:white;font-family:Cairo,sans-serif;font-size:14px;font-weight:700;cursor:pointer">🔄 تحويل الآن</button>
      </div>
    </div>`;
  document.body.appendChild(m);
  m.addEventListener('click', e => { if(e.target===m) m.remove(); });
}

function processTransfer() {
  const to  = document.getElementById('transferTo')?.value.trim();
  const amt = parseInt(document.getElementById('transferAmt')?.value || 0);
  if (!to)  { showToast('أدخل معرّف المستخدم!','error'); return; }
  if (amt < 10) { showToast('الحد الأدنى 10 عملات!','error'); return; }
  if (amt > APP_DATA.currentUser.coins) { showToast('رصيدك غير كافٍ!','error'); return; }
  APP_DATA.currentUser.coins -= amt;
  document.querySelector('[style*="rgba(0,0,0,0.75)"]')?.remove();
  showToast(`✅ تم تحويل ${amt} عملة إلى ${to}`,'success');
  if (typeof addXP === 'function') addXP(5, 'تحويل عملات');
}


// ───────────────────────────────────────────────────────────────
//  5. WEB SHARE API for Feed posts
// ───────────────────────────────────────────────────────────────
function sharePost(postId) {
  const p = typeof feedPosts !== 'undefined' ? feedPosts.find(x=>x.id===postId) : null;
  const text = p ? p.text : 'تحقق من هذا المنشور في تطبيق صوتي!';
  if (navigator.share) {
    navigator.share({ title:'صوتي — تطبيق الدردشة الصوتية', text, url: window.location.href })
      .then(()=>{ if(p){ p.shares++; showToast('تم المشاركة! 🔗','success'); } })
      .catch(()=>{});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text + '\n' + window.location.href)
      .then(()=>showToast('تم نسخ المنشور للحافظة 📋','success'));
  } else {
    showToast('تم المشاركة! 🔗','success');
    if (p) p.shares++;
  }
}


// ───────────────────────────────────────────────────────────────
//  6. PATCH wallet buttons + room btn
// ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Patch sharePost into renderFeedList share buttons
  const _renderFeedList = window.renderFeedList;
  if (typeof _renderFeedList === 'function') {
    window.renderFeedList = function(posts) {
      _renderFeedList(posts);
      // Replace share buttons with real sharePost calls
      document.querySelectorAll('[onclick*="showToast(\'تم المشاركة"]').forEach(btn => {
        const match = btn.closest('[id^="post_"]');
        if (match) {
          const pid = parseInt(match.id.replace('post_',''));
          btn.setAttribute('onclick', `sharePost(${pid})`);
        }
      });
    };
  }

  // Patch raiseHand btn in room page
  const _renderRoom = window.renderRoom;
  if (typeof _renderRoom === 'function') {
    window.renderRoom = function(data) {
      _renderRoom(data);
      // Ensure raise-hand btn has proper id
      setTimeout(() => {
        document.querySelectorAll('[onclick*="raiseHand"]').forEach(btn => {
          btn.id = 'raiseHandBtn';
        });
      }, 50);
    };
  }

  // Patch wallet page "سحب" and "تحويل"
  const _renderWallet = window.renderWallet;
  if (typeof _renderWallet === 'function') {
    window.renderWallet = function() {
      _renderWallet();
      setTimeout(() => {
        document.querySelectorAll('.wallet-btn').forEach(btn => {
          if (btn.textContent.includes('سحب') && !btn.onclick) {
            btn.onclick = () => showWithdrawModal();
          } else if (btn.textContent.includes('تحويل') && !btn.onclick) {
            btn.onclick = () => showTransferModal();
          }
        });
      }, 50);
    };
  }

  // Patch speaker cards in room to open real menu
  document.addEventListener('click', e => {
    const card = e.target.closest('.speaker-card');
    if (card && document.getElementById('mainContent')?.contains(card)) {
      const nameEl = card.querySelector('.speaker-name');
      const name = nameEl?.textContent?.trim() || 'متحدث';
      if (!e.target.closest('button')) showSpeakerMenu(name);
    }
  });
});

// Register real implementations so app.js stubs delegate here
window._extrasToggleEmoji    = toggleEmoji;
window._extrasShowRoomMenu   = showRoomMenu;
window._extrasRaiseHand      = raiseHand;
window._extrasShowSpeakerMenu = showSpeakerMenu;
