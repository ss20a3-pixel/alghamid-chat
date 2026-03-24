const APP_DATA = {
  currentUser: {
    id: 1,
    name: "مستر غامض",
    handle: "@MR_GHOST",
    bio: "مدير التطبيق الرسمي 🦅👑 | نسر الغامض | الداعم الأول",
    avatar: null,
    color: "linear-gradient(135deg,#F5C518,#D4A017,#1a1a1a)",
    initials: "مغ",
    followers: 999999,
    following: 0,
    rooms: 500,
    coins: 9999999,
    diamonds: 99999,
    isVerified: true,
    isVip: true,
    isAdmin: true,
    isSuperAdmin: true,
    isAppOwner: true,
    xp: 999999,
    level: 100,
    online: true,
    frame: "owner",
    entryEffect: "owner_eagle",
    badges: ["app_owner","top_supporter","vip_diamond","excellence","verified","first_room","popular","gifter","speaker","daily","top_gifter","host100"],
    nameStyle: "owner-gold",
    vipTier: "diamond"
  },

  nextUserId: 200000,

  admins: [
    { id: 1011, name: "سارة المشرف", handle: "@sara_admin", role: "مشرف عام" },
    { id: 1012, name: "خالد المشرف", handle: "@khalid_admin", role: "مشرف غرف" },
    { id: 1013, name: "نورة المشرف", handle: "@noura_admin", role: "مشرف محتوى" },
    { id: 1014, name: "فيصل المشرف", handle: "@faisal_admin", role: "مشرف مالي" },
    { id: 1015, name: "ريم المشرف", handle: "@reem_admin", role: "مشرف دعم" },
  ],

  categories: [
    { id: "all", name: "الكل" },
    { id: "music", name: "🎵 موسيقى" },
    { id: "tech", name: "💻 تقنية" },
    { id: "gaming", name: "🎮 ألعاب" },
    { id: "comedy", name: "😂 كوميديا" },
    { id: "sports", name: "⚽ رياضة" },
    { id: "news", name: "📰 أخبار" },
    { id: "culture", name: "🎭 ثقافة" },
    { id: "business", name: "💼 أعمال" },
    { id: "quran", name: "📖 قرآن" }
  ],

  rooms: [
    {
      id: 1, title: "حفلة موسيقية ليلية 🎶",
      desc: "استمتع بأجمل الأغاني العربية والموسيقى الهادئة مع أفضل الأصوات",
      category: "music", badge: "live",
      listeners: 1247, speakers: 5,
      speakerColors: ["linear-gradient(135deg,#7C3AED,#EC4899)", "linear-gradient(135deg,#3B82F6,#7C3AED)", "linear-gradient(135deg,#10B981,#3B82F6)", "linear-gradient(135deg,#F59E0B,#EF4444)"],
      speakerInitials: ["سا", "نو", "مح", "ري"],
      host: "سارة أحمد", hostColor: "linear-gradient(135deg,#7C3AED,#EC4899)", hostInitials: "سا",
      isLocked: false, isFeatured: true
    },
    {
      id: 2, title: "نقاش تقني: الذكاء الاصطناعي 2025 🤖",
      desc: "أحدث التطورات في عالم الذكاء الاصطناعي وتأثيره على مستقبل البشرية",
      category: "tech", badge: "featured",
      listeners: 892, speakers: 4,
      speakerColors: ["linear-gradient(135deg,#3B82F6,#7C3AED)", "linear-gradient(135deg,#10B981,#3B82F6)", "linear-gradient(135deg,#F59E0B,#EF4444)"],
      speakerInitials: ["عم", "خا", "فا"],
      host: "عمر خالد", hostColor: "linear-gradient(135deg,#3B82F6,#7C3AED)", hostInitials: "عم",
      isLocked: false, isFeatured: true
    },
    {
      id: 3, title: "ليلة الكوميديا 😂😂",
      desc: "تعال ضحك معنا! أفضل النكات والقصص المضحكة كل ليلة",
      category: "comedy", badge: "live",
      listeners: 2134, speakers: 6,
      speakerColors: ["linear-gradient(135deg,#F59E0B,#EF4444)", "linear-gradient(135deg,#10B981,#3B82F6)", "linear-gradient(135deg,#EC4899,#F59E0B)"],
      speakerInitials: ["يو", "هن", "را"],
      host: "يوسف كوميدي", hostColor: "linear-gradient(135deg,#F59E0B,#EF4444)", hostInitials: "يو",
      isLocked: false, isFeatured: false
    },
    {
      id: 4, title: "تلاوة قرآن كريم 📖",
      desc: "تلاوة خاشعة لآيات الذكر الحكيم - تفضلوا بالانضمام",
      category: "quran", badge: "live",
      listeners: 3560, speakers: 2,
      speakerColors: ["linear-gradient(135deg,#10B981,#3B82F6)", "linear-gradient(135deg,#7C3AED,#EC4899)"],
      speakerInitials: ["عب", "مص"],
      host: "عبدالله القارئ", hostColor: "linear-gradient(135deg,#10B981,#3B82F6)", hostInitials: "عب",
      isLocked: false, isFeatured: true
    },
    {
      id: 5, title: "كرة القدم وأخبار الدوريات ⚽",
      desc: "تحليل مباريات اليوم وأخبار الانتقالات الصيفية",
      category: "sports", badge: "new",
      listeners: 678, speakers: 3,
      speakerColors: ["linear-gradient(135deg,#EF4444,#F59E0B)", "linear-gradient(135deg,#3B82F6,#7C3AED)"],
      speakerInitials: ["كر", "فه"],
      host: "كريم الرياضي", hostColor: "linear-gradient(135deg,#EF4444,#F59E0B)", hostInitials: "كر",
      isLocked: false, isFeatured: false
    },
    {
      id: 6, title: "غرفة الألعاب 🎮 تحديات",
      desc: "تعال العب معنا! تحديات يومية وجوائز للفائزين",
      category: "gaming", badge: "live",
      listeners: 1890, speakers: 7,
      speakerColors: ["linear-gradient(135deg,#7C3AED,#3B82F6)", "linear-gradient(135deg,#10B981,#F59E0B)", "linear-gradient(135deg,#EC4899,#7C3AED)"],
      speakerInitials: ["غا", "لا", "با"],
      host: "غيمر برو", hostColor: "linear-gradient(135deg,#7C3AED,#3B82F6)", hostInitials: "غا",
      isLocked: false, isFeatured: false
    }
  ],

  activeUsers: [
    { id: 1, name: "سارة", initials: "سا", color: "linear-gradient(135deg,#7C3AED,#EC4899)", isLive: true },
    { id: 2, name: "محمد", initials: "مح", color: "linear-gradient(135deg,#3B82F6,#7C3AED)", isLive: false },
    { id: 3, name: "نورة", initials: "نو", color: "linear-gradient(135deg,#EC4899,#F59E0B)", isLive: true },
    { id: 4, name: "عمر", initials: "عم", color: "linear-gradient(135deg,#10B981,#3B82F6)", isLive: false },
    { id: 5, name: "ريم", initials: "ري", color: "linear-gradient(135deg,#F59E0B,#EF4444)", isLive: true },
    { id: 6, name: "خالد", initials: "خا", color: "linear-gradient(135deg,#EF4444,#7C3AED)", isLive: false },
    { id: 7, name: "فاطمة", initials: "فا", color: "linear-gradient(135deg,#7C3AED,#10B981)", isLive: true },
    { id: 8, name: "يوسف", initials: "يو", color: "linear-gradient(135deg,#F59E0B,#EC4899)", isLive: false },
  ],

  speakers: [
    { id: 1, name: "سارة أحمد", role: "مضيفة", initials: "سا", color: "linear-gradient(135deg,#7C3AED,#EC4899)", isSpeaking: true, isMuted: false, isHost: true },
    { id: 2, name: "محمد علي", role: "متحدث", initials: "مح", color: "linear-gradient(135deg,#3B82F6,#7C3AED)", isSpeaking: false, isMuted: false, isHost: false },
    { id: 3, name: "نورة سالم", role: "متحدثة", initials: "نو", color: "linear-gradient(135deg,#EC4899,#F59E0B)", isSpeaking: true, isMuted: false, isHost: false },
    { id: 4, name: "عمر خالد", role: "متحدث", initials: "عم", color: "linear-gradient(135deg,#10B981,#3B82F6)", isSpeaking: false, isMuted: true, isHost: false },
    { id: 5, name: "ريم أحمد", role: "متحدثة", initials: "ري", color: "linear-gradient(135deg,#F59E0B,#EF4444)", isSpeaking: false, isMuted: false, isHost: false },
  ],

  listeners: [
    { id: 6, name: "خالد م", initials: "خم", color: "linear-gradient(135deg,#7C3AED,#EC4899)" },
    { id: 7, name: "فاطمة ع", initials: "فع", color: "linear-gradient(135deg,#10B981,#3B82F6)" },
    { id: 8, name: "يوسف س", initials: "يس", color: "linear-gradient(135deg,#F59E0B,#EF4444)" },
    { id: 9, name: "هنادي", initials: "هن", color: "linear-gradient(135deg,#EC4899,#7C3AED)" },
    { id: 10, name: "باسم", initials: "با", color: "linear-gradient(135deg,#3B82F6,#10B981)" },
    { id: 11, name: "رانيا", initials: "را", color: "linear-gradient(135deg,#EF4444,#F59E0B)" },
    { id: 12, name: "وليد", initials: "ول", color: "linear-gradient(135deg,#7C3AED,#3B82F6)" },
    { id: 13, name: "منى", initials: "من", color: "linear-gradient(135deg,#EC4899,#EF4444)" },
  ],

  chatMessages: [
    { id: 1, userId: 1, name: "سارة أحمد", initials: "سا", color: "linear-gradient(135deg,#7C3AED,#EC4899)", text: "مرحباً بالجميع في غرفتنا الليلية! 🎵", time: "22:00", isHost: true, isOwn: false },
    { id: 2, userId: 6, name: "خالد م", initials: "خم", color: "linear-gradient(135deg,#7C3AED,#EC4899)", text: "أهلاً سارة، صوتك رائع الليلة!", time: "22:01", isHost: false, isOwn: false },
    { id: 3, userId: 3, name: "نورة سالم", initials: "نو", color: "linear-gradient(135deg,#EC4899,#F59E0B)", text: "ترددوا لأغنية فيروز؟", time: "22:02", isHost: false, isOwn: false },
    { id: 4, userId: null, name: "", initials: "", color: "", text: "", time: "22:03", isHost: false, isOwn: false, isSystem: true, systemText: "انضم يوسف سالم إلى الغرفة 👋" },
    { id: 5, userId: 1, name: "أنا", initials: "أح", color: "linear-gradient(135deg,#7C3AED,#EC4899)", text: "أغنية من أجمل ما غنّت فيروز 🎶", time: "22:04", isHost: false, isOwn: true },
    { id: 6, userId: null, name: "", initials: "", color: "", text: "", time: "22:05", isHost: false, isOwn: false, isGift: true, giftText: "🌹 هنادي أهدت وردة لسارة أحمد", giftCoins: 50 },
  ],

  notifications: [
    { id: 1, type: "follow", icon: "👤", text: "<strong>نورة سالم</strong> بدأت بمتابعتك", time: "منذ 2 دقيقة", unread: true },
    { id: 2, type: "gift", icon: "🎁", text: "<strong>خالد محمد</strong> أرسل لك هدية 🌹 بقيمة 50 عملة", time: "منذ 10 دقائق", unread: true },
    { id: 3, type: "invite", icon: "🎙️", text: "<strong>سارة أحمد</strong> دعتك للتحدث في غرفتها", time: "منذ 15 دقيقة", unread: true },
    { id: 4, type: "like", icon: "❤️", text: "<strong>عمر خالد</strong> أعجب بملفك الشخصي", time: "منذ 30 دقيقة", unread: false },
    { id: 5, type: "follow", icon: "👤", text: "<strong>فاطمة علي</strong> بدأت بمتابعتك", time: "منذ ساعة", unread: false },
    { id: 6, type: "gift", icon: "🎁", text: "<strong>يوسف سالم</strong> أرسل لك هدية 👑 بقيمة 500 عملة", time: "منذ 2 ساعة", unread: false },
    { id: 7, type: "invite", icon: "🎙️", text: "<strong>محمد علي</strong> دعاك للانضمام لغرفة تقنية", time: "منذ 3 ساعات", unread: false },
  ],

  rankings: {
    hosts: [
      { rank: 1, name: "سارة أحمد", initials: "سا", color: "linear-gradient(135deg,#7C3AED,#EC4899)", sub: "مضيفة محترفة", score: "98,500", emoji: "🥇" },
      { rank: 2, name: "عمر خالد", initials: "عم", color: "linear-gradient(135deg,#3B82F6,#7C3AED)", sub: "نقاشات تقنية", score: "87,200", emoji: "🥈" },
      { rank: 3, name: "يوسف كوميدي", initials: "يو", color: "linear-gradient(135deg,#F59E0B,#EF4444)", sub: "كوميديان", score: "76,400", emoji: "🥉" },
      { rank: 4, name: "نورة سالم", initials: "نو", color: "linear-gradient(135deg,#EC4899,#F59E0B)", sub: "موسيقى وغناء", score: "65,100", emoji: "4️⃣" },
      { rank: 5, name: "خالد الرياضي", initials: "خر", color: "linear-gradient(135deg,#EF4444,#F59E0B)", sub: "كرة القدم", score: "54,300", emoji: "5️⃣" },
    ],
    gifters: [
      { rank: 1, name: "وليد الكريم", initials: "وك", color: "linear-gradient(135deg,#F59E0B,#EF4444)", sub: "أكبر مانح", score: "250,000 💎", emoji: "🥇" },
      { rank: 2, name: "هنادي م", initials: "هم", color: "linear-gradient(135deg,#EC4899,#7C3AED)", sub: "مانح ذهبي", score: "180,000 💎", emoji: "🥈" },
      { rank: 3, name: "باسم الجود", initials: "بج", color: "linear-gradient(135deg,#3B82F6,#10B981)", sub: "مانح فضي", score: "120,000 💎", emoji: "🥉" },
      { rank: 4, name: "رانيا ع", initials: "را", color: "linear-gradient(135deg,#7C3AED,#EC4899)", sub: "مانح برونزي", score: "90,000 💎", emoji: "4️⃣" },
      { rank: 5, name: "منى سالم", initials: "مس", color: "linear-gradient(135deg,#10B981,#3B82F6)", sub: "مانح", score: "75,000 💎", emoji: "5️⃣" },
    ]
  },

  gifts: [
    { id: 1, emoji: "🌹", name: "وردة", price: 10, category: "basic" },
    { id: 2, emoji: "❤️", name: "قلب", price: 15, category: "basic" },
    { id: 3, emoji: "🍫", name: "شوكولاتة", price: 20, category: "basic" },
    { id: 4, emoji: "🍎", name: "تفاحة", price: 25, category: "basic" },
    { id: 5, emoji: "☕", name: "قهوة", price: 30, category: "basic" },
    { id: 6, emoji: "🎵", name: "موسيقى", price: 20, category: "basic" },
    { id: 7, emoji: "🐰", name: "أرنب", price: 35, category: "basic" },
    { id: 8, emoji: "💐", name: "باقة ورد", price: 50, category: "animated" },
    { id: 9, emoji: "🎂", name: "كيكة", price: 60, category: "animated" },
    { id: 10, emoji: "🎁", name: "هدية", price: 80, category: "animated" },
    { id: 11, emoji: "⭐", name: "نجمة", price: 100, category: "animated" },
    { id: 12, emoji: "🎹", name: "بيانو", price: 120, category: "animated" },
    { id: 13, emoji: "🦋", name: "فراشة", price: 150, category: "animated" },
    { id: 14, emoji: "🏆", name: "كأس ذهبي", price: 200, category: "special" },
    { id: 15, emoji: "👑", name: "تاج الأمير", price: 300, category: "special" },
    { id: 16, emoji: "🛋️", name: "كنبة مميزة", price: 250, category: "special" },
    { id: 17, emoji: "🎹", name: "بيانو فاخر", price: 400, category: "special" },
    { id: 18, emoji: "💎", name: "ماسة", price: 500, category: "special" },
    { id: 19, emoji: "🚢", name: "سفينة", price: 600, category: "special" },
    { id: 20, emoji: "🚗", name: "سيارة فارهة", price: 800, category: "luxury" },
    { id: 21, emoji: "🏎️", name: "سيارة سباق", price: 1000, category: "luxury" },
    { id: 22, emoji: "✈️", name: "طيارة خاصة", price: 2000, category: "luxury" },
    { id: 23, emoji: "🚀", name: "صاروخ", price: 3000, category: "luxury" },
    { id: 24, emoji: "🏰", name: "قصر", price: 5000, category: "luxury" },
    { id: 25, emoji: "🏝️", name: "جزيرة خاصة", price: 8000, category: "luxury" },
    { id: 26, emoji: "🌍", name: "كوكب", price: 10000, category: "luxury" },
    { id: 27, emoji: "🦅", name: "نسر الغامض", price: 15000, category: "vip" },
    { id: 28, emoji: "🐺", name: "ذئب الغامض", price: 20000, category: "vip" },
    { id: 29, emoji: "🌌", name: "مجرة", price: 25000, category: "vip" },
    { id: 30, emoji: "🔮", name: "كريستال سحري", price: 30000, category: "vip" },
    { id: 31, emoji: "🌙", name: "هلال رمضان", price: 150, category: "seasonal" },
    { id: 32, emoji: "🏮", name: "فانوس", price: 200, category: "seasonal" },
    { id: 33, emoji: "🎆", name: "ألعاب نارية", price: 300, category: "seasonal" },
    { id: 34, emoji: "🎄", name: "شجرة احتفال", price: 250, category: "seasonal" },
    { id: 35, emoji: "💝", name: "حب أبدي", price: 1500, category: "special" },
    { id: 36, emoji: "🎤", name: "ميكروفون ذهبي", price: 700, category: "special" },
  ],

  games: [
    { id: 1, name: "حظك اليوم", emoji: "🎰", desc: "جرب حظك واربح عملات", type: "luck" },
    { id: 2, name: "سؤال وجواب", emoji: "❓", desc: "أجب على السؤال قبل الجميع", type: "trivia" },
    { id: 3, name: "من يعرف أكثر", emoji: "🧠", desc: "مسابقة معلومات عامة", type: "quiz" },
    { id: 4, name: "صح أم خطأ", emoji: "✅", desc: "اختبر معلوماتك", type: "truefalse" },
    { id: 5, name: "كلمة السر", emoji: "🔑", desc: "خمّن الكلمة المخفية", type: "word" },
    { id: 6, name: "عجلة الحظ", emoji: "🎡", desc: "دوّر واربح", type: "wheel" },
  ],

  coinPackages: [
    { id: 1, icon: "💰", coins: 100, price: "0.99$", popular: false },
    { id: 2, icon: "💰", coins: 500, price: "4.99$", popular: false },
    { id: 3, icon: "💎", coins: 1200, price: "9.99$", popular: true, badge: "الأكثر شعبية" },
    { id: 4, icon: "💎", coins: 2500, price: "19.99$", popular: false },
    { id: 5, icon: "👑", coins: 6500, price: "49.99$", popular: false, badge: "توفير 20%" },
    { id: 6, icon: "🏆", coins: 14000, price: "99.99$", popular: false, badge: "توفير 30%" },
  ]
};
