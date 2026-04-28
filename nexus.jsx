// ============================================================
//  NEXUS BANK ATM SIMULATION — Full Featured with Persistent Storage
//  Features: Account Creation, Multilingual, INR Currency, OTP, etc.
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "nexus_bank_db_v2";

const DEFAULT_DB = {
  users: [
    { id: 1, name: "ARYAN RAWAT",   cardNum: "4111 2222 3333 0001", pin: "1111", checking: 4850.00,  savings: 120.00,   phone: "9876543210", aadhaar: "1234 5678 9012", age: 25, gender: "Male" },
    { id: 2, name: "TAHA SHAIKH",   cardNum: "4111 2222 3333 0002", pin: "1111", checking: 1200.50,  savings: 340.00,   phone: "9876543211", aadhaar: "2345 6789 0123", age: 30, gender: "Male" },
    { id: 3, name: "KARAN MEHTA",   cardNum: "4111 2222 3333 0003", pin: "1111", checking: 2800.00,  savings: 550.00,   phone: "9876543212", aadhaar: "3456 7890 1234", age: 28, gender: "Male" },
    { id: 4, name: "LAXMINARAYAN",  cardNum: "4111 2222 3333 0004", pin: "1111", checking: 670.25,   savings: 890.00,   phone: "9876543213", aadhaar: "4567 8901 2345", age: 45, gender: "Male" },
  ],
  transactions: [
    { id: 1000, userId: 1, type: "Opening Balance", amount: 4850,   balance: 4850,   date: "Jan 01, 09:00 AM" },
    { id: 1001, userId: 1, type: "Salary Credit",   amount: 5000,   balance: 9850,   date: "Jan 05, 10:00 AM" },
    { id: 1002, userId: 1, type: "Withdrawal",      amount: -200,   balance: 9650,   date: "Jan 06, 02:00 PM" },
    { id: 1003, userId: 1, type: "Deposit",         amount: 500,    balance: 10150,  date: "Jan 07, 11:30 AM" },
    { id: 1004, userId: 2, type: "Opening Balance", amount: 1200.5, balance: 1200.5, date: "Jan 01, 09:00 AM" },
    { id: 1005, userId: 3, type: "Opening Balance", amount: 2800,   balance: 2800,   date: "Jan 01, 09:00 AM" },
    { id: 1006, userId: 4, type: "Opening Balance", amount: 670.25, balance: 670.25, date: "Jan 01, 09:00 AM" },
  ],
  nextTxId: 1007,
  nextUserId: 5,
};

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ru", label: "Russian", native: "Русский" },
];

const TRANSLATIONS = {
  en: { welcome: "Insert Card", selectDemo: "SELECT A DEMO ACCOUNT BELOW", insertCard: "INSERT CARD →", createAcc: "CREATE ACCOUNT", menu: "MAIN MENU", balance: "ACCOUNT BALANCE", withdraw: "CASH WITHDRAWAL", deposit: "CASH DEPOSIT", transfer: "FUND TRANSFER", history: "TRANSACTION HISTORY", changePin: "CHANGE PIN", logout: "LOGOUT", back: "← BACK", confirm: "CONFIRM", checking: "CHECKING BALANCE", savings: "SAVINGS BALANCE", enterPin: "ENTER YOUR 4-DIGIT PIN", welcome2: "WELCOME", amount: "AMOUNT", selectRecipient: "SELECT RECIPIENT", currentPin: "CURRENT PIN", newPin: "NEW PIN", confirmPin: "CONFIRM NEW PIN", language: "LANGUAGE", },
  hi: { welcome: "कार्ड डालें", selectDemo: "नीचे एक डेमो खाता चुनें", insertCard: "कार्ड डालें →", createAcc: "खाता बनाएं", menu: "मुख्य मेनू", balance: "खाता शेष", withdraw: "नकद निकासी", deposit: "नकद जमा", transfer: "फंड ट्रांसफर", history: "लेनदेन इतिहास", changePin: "पिन बदलें", logout: "लॉगआउट", back: "← वापस", confirm: "पुष्टि करें", checking: "चेकिंग शेष", savings: "बचत शेष", enterPin: "अपना 4-अंकीय पिन दर्ज करें", welcome2: "स्वागत है", amount: "राशि", selectRecipient: "प्राप्तकर्ता चुनें", currentPin: "वर्तमान पिन", newPin: "नया पिन", confirmPin: "नया पिन पुष्टि करें", language: "भाषा", },
  bn: { welcome: "কার্ড প্রবেশ করান", selectDemo: "নীচে একটি ডেমো অ্যাকাউন্ট নির্বাচন করুন", insertCard: "কার্ড প্রবেশ করান →", createAcc: "অ্যাকাউন্ট তৈরি করুন", menu: "প্রধান মেনু", balance: "অ্যাকাউন্ট ব্যালেন্স", withdraw: "নগদ উত্তোলন", deposit: "নগদ জমা", transfer: "তহবিল স্থানান্তর", history: "লেনদেনের ইতিহাস", changePin: "পিন পরিবর্তন করুন", logout: "লগআউট", back: "← ফিরে", confirm: "নিশ্চিত করুন", checking: "চেকিং ব্যালেন্স", savings: "সঞ্চয় ব্যালেন্স", enterPin: "আপনার ৪-সংখ্যার পিন লিখুন", welcome2: "স্বাগতম", amount: "পরিমাণ", selectRecipient: "প্রাপক নির্বাচন করুন", currentPin: "বর্তমান পিন", newPin: "নতুন পিন", confirmPin: "নতুন পিন নিশ্চিত করুন", language: "ভাষা", },
  te: { welcome: "కార్డ్ చొప్పించండి", selectDemo: "దిగువ డెమో ఖాతాను ఎంచుకోండి", insertCard: "కార్డ్ చొప్పించండి →", createAcc: "ఖాతా సృష్టించండి", menu: "ప్రధాన మెనూ", balance: "ఖాతా నిల్వ", withdraw: "నగదు ఉపసంహరణ", deposit: "నగదు జమ", transfer: "నిధి బదిలీ", history: "లావాదేవీ చరిత్ర", changePin: "పిన్ మార్చండి", logout: "లాగ్అవుట్", back: "← వెనుకకు", confirm: "నిర్ధారించండి", checking: "చెకింగ్ నిల్వ", savings: "పొదుపు నిల్వ", enterPin: "మీ 4-అంకెల పిన్ నమోదు చేయండి", welcome2: "స్వాగతం", amount: "మొత్తం", selectRecipient: "స్వీకర్తను ఎంచుకోండి", currentPin: "ప్రస్తుత పిన్", newPin: "కొత్త పిన్", confirmPin: "కొత్త పిన్ నిర్ధారించండి", language: "భాష", },
  ta: { welcome: "அட்டையை செருகவும்", selectDemo: "கீழே ஒரு டெமோ கணக்கை தேர்ந்தெடுக்கவும்", insertCard: "அட்டையை செருகவும் →", createAcc: "கணக்கை உருவாக்கவும்", menu: "முதன்மை மெனு", balance: "கணக்கு இருப்பு", withdraw: "பணம் எடுக்க", deposit: "பணம் டெபாசிட்", transfer: "நிதி பரிமாற்றம்", history: "பரிவர்த்தனை வரலாறு", changePin: "பின் மாற்று", logout: "வெளியேறு", back: "← பின்", confirm: "உறுதிப்படுத்து", checking: "சரிபார்ப்பு இருப்பு", savings: "சேமிப்பு இருப்பு", enterPin: "உங்கள் 4-இலக்க பின்னை உள்ளிடவும்", welcome2: "வரவேற்கிறோம்", amount: "தொகை", selectRecipient: "பெறுநரை தேர்ந்தெடுக்கவும்", currentPin: "தற்போதைய பின்", newPin: "புதிய பின்", confirmPin: "புதிய பின்னை உறுதிப்படுத்து", language: "மொழி", },
};
// Fallback to English for other langs
LANGUAGES.forEach(l => { if (!TRANSLATIONS[l.code]) TRANSLATIONS[l.code] = TRANSLATIONS.en; });

const Storage = {
  async load() {
    try {
      if (window.storage) { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : null; }
      else { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
    } catch { return null; }
  },
  async save(data) {
    try {
      const json = JSON.stringify(data);
      if (window.storage) await window.storage.set(STORAGE_KEY, json);
      else localStorage.setItem(STORAGE_KEY, json);
      return true;
    } catch { return false; }
  },
};

let dbData = null;

const DB = {
  getUser: (id) => dbData.users.find(u => u.id === id),
  getAllUsers: () => dbData.users,
  getOtherUsers: (id) => dbData.users.filter(u => u.id !== id),
  authenticate(userId, pin) { const u = this.getUser(userId); return u && u.pin === pin; },
  getBalance(userId) { const u = this.getUser(userId); return u ? { checking: u.checking, savings: u.savings } : null; },
  _addTx(userId, type, amount, balance) {
    const date = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    dbData.transactions.push({ id: dbData.nextTxId++, userId, type, amount, balance, date });
  },
  withdraw(userId, amount) {
    const u = this.getUser(userId);
    if (!u) return { ok: false, msg: "USER NOT FOUND" };
    if (amount <= 0) return { ok: false, msg: "INVALID AMOUNT" };
    if (amount > u.checking) return { ok: false, msg: "INSUFFICIENT FUNDS" };
    if (amount > 50000) return { ok: false, msg: "EXCEEDS DAILY LIMIT (₹50,000)" };
    u.checking = +(u.checking - amount).toFixed(2);
    this._addTx(userId, "Withdrawal", -amount, u.checking);
    Storage.save(dbData);
    return { ok: true, newBalance: u.checking };
  },
  deposit(userId, amount) {
    const u = this.getUser(userId);
    if (!u) return { ok: false, msg: "USER NOT FOUND" };
    if (amount <= 0) return { ok: false, msg: "INVALID AMOUNT" };
    if (amount > 200000) return { ok: false, msg: "EXCEEDS DEPOSIT LIMIT (₹2,00,000)" };
    u.checking = +(u.checking + amount).toFixed(2);
    this._addTx(userId, "Deposit", +amount, u.checking);
    Storage.save(dbData);
    return { ok: true, newBalance: u.checking };
  },
  transfer(fromId, toId, amount) {
    const from = this.getUser(fromId), to = this.getUser(toId);
    if (!from || !to) return { ok: false, msg: "ACCOUNT NOT FOUND" };
    if (amount <= 0) return { ok: false, msg: "INVALID AMOUNT" };
    if (amount > from.checking) return { ok: false, msg: "INSUFFICIENT FUNDS" };
    if (amount > 100000) return { ok: false, msg: "TRANSFER LIMIT EXCEEDED (₹1,00,000)" };
    from.checking = +(from.checking - amount).toFixed(2);
    to.checking = +(to.checking + amount).toFixed(2);
    this._addTx(fromId, `Transfer → ${to.name.split(" ")[0]}`, -amount, from.checking);
    this._addTx(toId, `Transfer ← ${from.name.split(" ")[0]}`, +amount, to.checking);
    Storage.save(dbData);
    return { ok: true, newBalance: from.checking, toName: to.name };
  },
  changePin(userId, oldPin, newPin) {
    const u = this.getUser(userId);
    if (!u) return { ok: false, msg: "USER NOT FOUND" };
    if (u.pin !== oldPin) return { ok: false, msg: "INCORRECT CURRENT PIN" };
    if (!/^\d{4}$/.test(newPin)) return { ok: false, msg: "PIN MUST BE 4 DIGITS" };
    u.pin = newPin; Storage.save(dbData);
    return { ok: true };
  },
  getHistory(userId) { return dbData.transactions.filter(t => t.userId === userId).slice(-15).reverse(); },
  createAccount(data) {
    const { name, phone, aadhaar, age, gender } = data;
    if (parseInt(age) < 18) return { ok: false, msg: "AGE MUST BE 18 OR ABOVE" };
    if (!/^\d{10}$/.test(phone)) return { ok: false, msg: "INVALID PHONE NUMBER (10 DIGITS)" };
    if (!/^\d{4}\s\d{4}\s\d{4}$/.test(aadhaar)) return { ok: false, msg: "INVALID AADHAAR (XXXX XXXX XXXX)" };
    if (!name.trim()) return { ok: false, msg: "NAME IS REQUIRED" };
    if (!gender) return { ok: false, msg: "PLEASE SELECT GENDER" };
    const id = dbData.nextUserId++;
    const cardNum = `4111 ${String(id).padStart(4,"0")} ${Math.floor(1000+Math.random()*9000)} ${String(id+1000).slice(-4)}`;
    const tempPin = "5678"; // Will be set by user after OTP
    const newUser = { id, name: name.toUpperCase(), cardNum, pin: tempPin, checking: 0, savings: 0, phone, aadhaar, age: parseInt(age), gender };
    dbData.users.push(newUser);
    this._addTx(id, "Account Opened", 0, 0);
    Storage.save(dbData);
    return { ok: true, userId: id, cardNum, tempPin };
  },
  resetToDefaults() { dbData = JSON.parse(JSON.stringify(DEFAULT_DB)); Storage.save(dbData); },
};

const fmt = (n) => "₹" + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const genRef = (p) => p + Math.floor(Math.random() * 900000 + 100000);

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');

.atm-root * { box-sizing: border-box; margin: 0; padding: 0; }
.atm-root {
  min-height: 100vh;
  background: #060a14;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Rajdhani', sans-serif;
  padding: 24px 12px;
}
.atm-body {
  width: 440px;
  background: linear-gradient(160deg, #1a1f35 0%, #0d1120 60%, #0a0e1a 100%);
  border: 1.5px solid #2a3560;
  border-radius: 20px;
  padding: 28px 28px 32px;
  box-shadow: 0 0 0 1px #0a0e1a, 0 0 60px rgba(40,80,200,.18), 0 40px 100px rgba(0,0,0,.85);
  position: relative;
  overflow: hidden;
}
.atm-body::before {
  content: '';
  position: absolute;
  top: -80px; right: -80px;
  width: 240px; height: 240px;
  background: radial-gradient(circle, rgba(60,100,255,.07) 0%, transparent 70%);
  pointer-events: none;
}
.atm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.bank-name { font-weight: 700; font-size: 18px; color: #4a90e2; letter-spacing: 4px; text-transform: uppercase; }
.header-right { display: flex; align-items: center; gap: 8px; }
.storage-badge {
  font-family: 'Share Tech Mono', monospace;
  font-size: 8px;
  color: #1a6040;
  background: rgba(0,200,83,.08);
  border: 1px solid rgba(0,200,83,.2);
  border-radius: 4px;
  padding: 2px 7px;
  letter-spacing: 1px;
}
.storage-badge.saving { color: #4a90e2; background: rgba(74,144,226,.08); border-color: rgba(74,144,226,.2); animation: blink 0.5s step-end infinite; }
.lang-btn {
  background: rgba(74,144,226,.1);
  border: 1px solid #2a4080;
  border-radius: 5px;
  color: #7ab8ff;
  font-family: 'Share Tech Mono', monospace;
  font-size: 8px;
  padding: 3px 7px;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all .2s;
}
.lang-btn:hover { background: rgba(74,144,226,.2); border-color: #4a90e2; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: #00e676; box-shadow: 0 0 10px #00e676; animation: pulseDot 2s infinite; }
@keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(.75); } }
.atm-screen {
  background: #070b18;
  border: 1px solid #1e2a4a;
  border-radius: 14px;
  min-height: 360px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.scanline {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.09) 2px, rgba(0,0,0,.09) 4px);
  pointer-events: none;
  z-index: 10;
  border-radius: 14px;
}
.screen-inner { flex: 1; padding: 22px 22px 18px; display: flex; flex-direction: column; position: relative; z-index: 1; }
.screen-bar {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  color: #3a5080;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.screen-bar::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, #2a3a5a, transparent); }
.view-enter { animation: fadeUp .3s ease forwards; }
@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

/* Language Modal */
.lang-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeUp .2s ease;
}
.lang-modal {
  background: #0d1225;
  border: 1px solid #2a4080;
  border-radius: 14px;
  padding: 20px;
  width: 360px;
  max-height: 80vh;
  overflow-y: auto;
}
.lang-modal::-webkit-scrollbar { width: 3px; }
.lang-modal::-webkit-scrollbar-thumb { background: #2a4060; border-radius: 2px; }
.lang-modal-title {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: #4a90e2;
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 14px;
  text-transform: uppercase;
}
.lang-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
.lang-opt {
  background: #111828;
  border: 1px solid #1e3060;
  border-radius: 7px;
  padding: 9px 12px;
  cursor: pointer;
  transition: all .15s;
}
.lang-opt:hover { border-color: #4a90e2; background: #141e35; }
.lang-opt.active { border-color: #4a90e2; background: rgba(74,144,226,.1); }
.lang-opt-label { font-size: 13px; color: #ffffff; font-weight: 600; }
.lang-opt-native { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #4a70a0; margin-top: 2px; }

/* Demo/Welcome */
.demo-box { background: #0d1225; border: 1px solid #1a2540; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
.demo-box-title { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #2a4060; letter-spacing: 2px; margin-bottom: 8px; }
.demo-row {
  display: flex;
  justify-content: space-between;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  color: #4a6090;
  padding: 5px 4px;
  border-bottom: 1px solid #111828;
  cursor: pointer;
  border-radius: 4px;
  transition: background .15s;
}
.demo-row:last-child { border-bottom: none; }
.demo-row:hover { background: #141e35; }
.demo-row.active { color: #4a90e2; background: rgba(74,144,226,.07); }

/* Welcome */
.welcome-icon {
  width: 68px; height: 68px;
  border: 1.5px solid #2a4080;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  animation: rotateGlow 4s linear infinite;
}
@keyframes rotateGlow { 0% { box-shadow: 2px 0 14px rgba(74,144,226,.2); } 50% { box-shadow: -2px 0 24px rgba(74,144,226,.5); } 100% { box-shadow: 2px 0 14px rgba(74,144,226,.2); } }
.welcome-title { font-size: 22px; font-weight:700; color:#c8d8f0; letter-spacing:1px; margin-bottom:6px; text-align:center; }
.welcome-sub { font-family:'Share Tech Mono',monospace; font-size:10px; color:#3a5080; letter-spacing:1px; text-align:center; margin-bottom:20px; }

/* PIN */
.pin-dots { display:flex; justify-content:center; gap:14px; margin:16px 0; }
.pin-dot { width:14px; height:14px; border-radius:50%; border:1.5px solid #2a4080; background:transparent; transition:all .2s; }
.pin-dot.filled { background:#4a90e2; border-color:#4a90e2; box-shadow:0 0 10px rgba(74,144,226,.7); }
.keypad { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px; }
.key {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 8px;
  padding: 12px 8px;
  color: #ffffff;
  font-family: 'Share Tech Mono', monospace;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  user-select: none;
  transition: all .1s;
}
.key:hover { background:#131a35; border-color:#2a4080; color:#ffffff; }
.key:active { transform:scale(.93); background:#1a2545; }
.key-del { color:#e24a4a; font-size:11px; }
.key-ok { color:#00c853; font-size:11px; grid-column: 2 / 4; }
.key-zero { grid-column: 1 / 3; }

/* Menu */
.menu-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; flex:1; }
.menu-btn {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 10px;
  padding: 16px 12px;
  cursor: pointer;
  text-align: center;
  user-select: none;
  transition: all .2s;
}
.menu-btn:hover { background:#131a35; border-color:#4a90e2; box-shadow:0 0 14px rgba(74,144,226,.12); transform:translateY(-2px); }
.menu-btn:active { transform:translateY(0) scale(.97); }
.menu-icon { font-size:20px; display:block; margin-bottom:6px; }
.menu-label { font-family:'Share Tech Mono',monospace; font-size:9px; color:#ffffff; letter-spacing:1px; text-transform:uppercase; }

/* Balance */
.balance-card {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  margin-bottom: 10px;
  position: relative;
  overflow: hidden;
}
.balance-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#4a90e2,transparent); animation:scan 2.4s ease-in-out infinite; }
@keyframes scan { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
.bal-label { font-family:'Share Tech Mono',monospace; font-size:9px; color:#3a5080; letter-spacing:3px; margin-bottom:10px; }
.bal-amount { font-family:'Share Tech Mono',monospace; font-size:28px; color:#00e676; letter-spacing:2px; text-shadow:0 0 20px rgba(0,230,118,.4); animation:countUp .4s ease; }
@keyframes countUp { from { opacity:0; transform:scale(.88); } to { opacity:1; transform:scale(1); } }
.bal-sub { font-family:'Share Tech Mono',monospace; font-size:10px; color:#2a4060; margin-top:6px; }
.bal-savings { color:#4a90e2; font-size:22px; text-shadow:0 0 14px rgba(74,144,226,.4); }

/* Chips */
.chips { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin:10px 0; }
.chip {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 7px;
  padding: 9px 6px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: #ffffff;
  cursor: pointer;
  text-align: center;
  user-select: none;
  transition: all .15s;
}
.chip:hover { border-color:#4a90e2; color:#ffffff; background:#111830; }
.chip.active { border-color:#4a90e2; background:rgba(74,144,226,.1); color:#7ab8ff; box-shadow:0 0 10px rgba(74,144,226,.15); }

/* Inputs */
.lbl { font-family:'Share Tech Mono',monospace; font-size:10px; color:#3a6090; letter-spacing:2px; margin-bottom:5px; }
.inp {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 8px;
  padding: 10px 14px;
  color: #ffffff;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  width: 100%;
  margin-bottom: 8px;
  outline: none;
  letter-spacing: 1px;
  transition: border-color .2s;
}
.inp:focus { border-color:#4a90e2; box-shadow:0 0 0 2px rgba(74,144,226,.1); }
.inp::placeholder { color: #2a4060; }
.inp-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
select.inp { cursor:pointer; }

/* Alerts */
.alert { padding:9px 13px; border-radius:7px; font-family:'Share Tech Mono',monospace; font-size:10px; letter-spacing:1px; margin-bottom:10px; animation:fadeUp .2s ease; }
.alert-err { background:rgba(226,74,74,.1); border:1px solid rgba(226,74,74,.3); color:#e24a4a; }
.alert-ok { background:rgba(0,200,83,.1); border:1px solid rgba(0,200,83,.3); color:#00c853; }

/* Buttons */
.btn {
  background: #1a2545;
  border: 1px solid #2a4080;
  border-radius: 8px;
  padding: 11px 18px;
  color: #ffffff;
  font-family: 'Rajdhani', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all .2s;
  text-transform: uppercase;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  user-select: none;
  flex: 1;
}
.btn:hover { background:rgba(74,144,226,.2); border-color:#4a90e2; color:#ffffff; }
.btn:active { transform:scale(.97); }
.btn-primary { background:#2a5ab0; border-color:#4a90e2; color:#ffffff; box-shadow:0 0 18px rgba(74,144,226,.2); }
.btn-primary:hover { background:#3a70d0; box-shadow:0 0 26px rgba(74,144,226,.4); }
.btn-success { background:#0a6030; border-color:#00c853; color:#ffffff; box-shadow:0 0 18px rgba(0,200,83,.15); }
.btn-success:hover { background:#0d8040; }
.btn-danger { background:#4a1515; border-color:#e24a4a; color:#ffffff; }
.btn-danger:hover { background:#6a2020; border-color:#f05050; }
.btn-row { display:flex; gap:8px; margin-top:10px; }

/* Transaction history */
.tx-list { display:flex; flex-direction:column; gap:6px; max-height:240px; overflow-y:auto; flex:1; }
.tx-list::-webkit-scrollbar { width:3px; }
.tx-list::-webkit-scrollbar-thumb { background:#2a4060; border-radius:2px; }
.tx-row { display:flex; justify-content:space-between; align-items:center; background:#0d1225; border:1px solid #141e35; border-radius:7px; padding:9px 12px; animation:fadeUp .2s ease; }
.tx-type { font-size:12px; color:#ffffff; font-weight:600; }
.tx-date { font-family:'Share Tech Mono',monospace; font-size:9px; color:#2a4060; margin-top:2px; }
.tx-amt { font-family:'Share Tech Mono',monospace; font-size:12px; font-weight:600; }
.tx-debit { color:#e24a4a; }
.tx-credit { color:#00e676; }

/* Transfer */
.acc-opt { background:#0d1225; border:1px solid #1e3060; border-radius:8px; padding:11px 14px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:all .15s; margin-bottom:7px; user-select:none; }
.acc-opt:hover { border-color:#4a90e2; }
.acc-opt.selected { border-color:#4a90e2; background:rgba(74,144,226,.08); }
.acc-name { font-size:13px; color:#ffffff; font-weight:600; }
.acc-num { font-family:'Share Tech Mono',monospace; font-size:9px; color:#3a5080; }

/* Receipt */
.receipt { background:#f8f5f0; border-radius:8px; padding:16px; color:#222; font-family:'Share Tech Mono',monospace; font-size:10px; line-height:1.9; animation:openReceipt .4s ease forwards; }
@keyframes openReceipt { from { max-height:0; opacity:0; overflow:hidden; } to { max-height:500px; opacity:1; } }
.receipt-row { display:flex; justify-content:space-between; }
.receipt-sep { border:none; border-top:1px dashed #bbb; margin:5px 0; }

/* Loading */
.spinner { width:28px; height:28px; border:2px solid #1e3060; border-top-color:#4a90e2; border-radius:50%; animation:spin .7s linear infinite; margin:0 auto; }
@keyframes spin { to { transform:rotate(360deg); } }
.loading-txt { font-family:'Share Tech Mono',monospace; font-size:10px; color:#3a5080; letter-spacing:2px; text-align:center; margin-top:12px; animation:blink 1s step-end infinite; }
@keyframes blink { 50% { opacity:0; } }

/* Card/Cash slots */
.slots-row { display:flex; justify-content:center; gap:14px; margin-top:20px; }
.slot { background:#0d1225; border:1px solid #1e3060; border-radius:6px; padding:7px 16px; display:flex; align-items:center; gap:8px; font-family:'Share Tech Mono',monospace; font-size:9px; color:#4a6090; letter-spacing:2px; }
.card-slot-icon { width:22px; height:15px; background:linear-gradient(135deg,#ffcc44,#ff9900); border-radius:3px; animation:cardBlink 3s ease-in-out infinite; }
@keyframes cardBlink { 0%,80%,100% { opacity:.4; } 40% { opacity:1; box-shadow:0 0 8px rgba(255,200,50,.5); } }
.cash-bar { color:#00e676; opacity:.4; font-size:14px; }
.logout-strip { display:flex; justify-content:center; margin-top:14px; }

/* Reset */
.reset-box { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
.reset-msg { font-family:'Share Tech Mono',monospace; font-size:11px; color:#e24a4a; letter-spacing:1px; text-align:center; line-height:1.8; }

/* OTP view */
.otp-box { background:#0d1225; border:1px solid #1e3060; border-radius:10px; padding:16px; text-align:center; margin-bottom:12px; }
.otp-phone { font-family:'Share Tech Mono',monospace; font-size:10px; color:#4a90e2; letter-spacing:2px; margin-bottom:8px; }
.otp-hint { font-family:'Share Tech Mono',monospace; font-size:9px; color:#2a4060; margin-top:6px; }

/* Scrollable form */
.form-scroll { flex:1; overflow-y:auto; padding-right:4px; }
.form-scroll::-webkit-scrollbar { width:3px; }
.form-scroll::-webkit-scrollbar-thumb { background:#2a4060; border-radius:2px; }

/* Success card */
.success-card { background:rgba(0,200,83,.06); border:1px solid rgba(0,200,83,.2); border-radius:10px; padding:16px; margin-bottom:10px; }
.success-card-title { font-family:'Share Tech Mono',monospace; font-size:10px; color:#00c853; letter-spacing:2px; text-align:center; margin-bottom:10px; }
.success-row { display:flex; justify-content:space-between; font-family:'Share Tech Mono',monospace; font-size:10px; color:#4a8060; padding:4px 0; border-bottom:1px solid rgba(0,200,83,.08); }
.success-row:last-child { border-bottom:none; }
.success-val { color:#00e676; font-weight:600; }
`;

export default function ATMSimulation() {
  useEffect(() => {
    const id = "atm-styles-v2";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const [view, setView]                   = useState("loading_init");
  const [userId, setUserId]               = useState(null);
  const [selectedDemo, setSelectedDemo]   = useState(null);
  const [pinBuffer, setPinBuffer]         = useState("");
  const [pinAttempts, setPinAttempts]     = useState(0);
  const [transferToId, setTransferToId]   = useState(null);
  const [selectedChip, setSelectedChip]   = useState(null);
  const [loadingMsg, setLoadingMsg]       = useState("LOADING PERSISTENT DATA...");
  const [alert, setAlert]                 = useState(null);
  const [receipt, setReceipt]             = useState(null);
  const [balances, setBalances]           = useState(null);
  const [history, setHistory]             = useState([]);
  const [viewKey, setViewKey]             = useState(0);
  const [storageBadge, setStorageBadge]   = useState({ text: "💾 LOADING", saving: false });
  const [showLangModal, setShowLangModal] = useState(false);
  const [lang, setLang]                   = useState("en");
  const [newAccData, setNewAccData]       = useState({ name: "", phone: "", aadhaar: "", age: "", gender: "" });
  const [otpBuffer, setOtpBuffer]         = useState("");
  const [createdAccInfo, setCreatedAccInfo] = useState(null);
  const [newSetPin, setNewSetPin]         = useState("");
  const [newSetPinConfirm, setNewSetPinConfirm] = useState("");

  const withdrawRef   = useRef(null);
  const depositRef    = useRef(null);
  const transferRef   = useRef(null);
  const oldPinRef     = useRef(null);
  const newPinRef     = useRef(null);
  const confirmPinRef = useRef(null);

  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    (async () => {
      const saved = await Storage.load();
      if (saved) { dbData = saved; setStorageBadge({ text: "💾 LOADED", saving: false }); }
      else { dbData = JSON.parse(JSON.stringify(DEFAULT_DB)); await Storage.save(dbData); setStorageBadge({ text: "💾 INITIALIZED", saving: false }); }
      go("welcome");
    })();
  }, []);

  const go = useCallback((v, msg) => {
    if (msg) setLoadingMsg(msg);
    setAlert(null);
    setViewKey(k => k + 1);
    setView(v);
  }, []);

  const loadingThen = useCallback((msg, fn, delay = 1300) => {
    go("loading", msg);
    setTimeout(fn, delay);
  }, [go]);

  const triggerSave = useCallback(async () => {
    setStorageBadge({ text: "💾 SAVING...", saving: true });
    await Storage.save(dbData);
    setStorageBadge({ text: "💾 SAVED", saving: false });
  }, []);

  const showErr = (msg) => setAlert({ type: "err", msg });
  const showOk  = (msg) => setAlert({ type: "ok",  msg });

  const logout = useCallback(() => {
    setUserId(null); setSelectedDemo(null); setPinBuffer("");
    setPinAttempts(0); setTransferToId(null); setReceipt(null); setAlert(null);
    setCreatedAccInfo(null); setOtpBuffer(""); setNewSetPin(""); setNewSetPinConfirm("");
    go("welcome");
  }, [go]);

  const handlePinKey = (k) => {
    if (pinBuffer.length >= 4) return;
    const next = pinBuffer + k;
    setPinBuffer(next);
    if (next.length === 4) setTimeout(() => submitPin(next), 180);
  };
  const handlePinDel = () => setPinBuffer(p => p.slice(0, -1));

  const submitPin = useCallback((buf) => {
    const pin = buf || pinBuffer;
    if (pin.length !== 4) return;
    if (DB.authenticate(userId, pin)) {
      setPinAttempts(0);
      loadingThen("VERIFYING IDENTITY...", () => { setPinBuffer(""); go("menu"); }, 1000);
    } else {
      const attempts = pinAttempts + 1;
      setPinAttempts(attempts);
      setAlert({ type: "err", msg: `INCORRECT PIN. ATTEMPTS: ${attempts}/3` });
      setPinBuffer("");
      if (attempts >= 3) { setAlert({ type: "err", msg: "CARD BLOCKED. CONTACT BANK." }); setTimeout(logout, 2500); }
    }
  }, [pinBuffer, userId, pinAttempts, loadingThen, go, logout]);

  // OTP keypad for account creation
  const handleOtpKey = (k) => {
    if (otpBuffer.length >= 4) return;
    const next = otpBuffer + k;
    setOtpBuffer(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === "1111") { setOtpBuffer(""); go("setPin"); }
        else { setAlert({ type: "err", msg: "INVALID OTP. TRY AGAIN." }); setOtpBuffer(""); }
      }, 180);
    }
  };
  const handleOtpDel = () => setOtpBuffer(p => p.slice(0, -1));

  const doWithdraw = () => {
    const amt = parseFloat(withdrawRef.current?.value || 0);
    if (!amt || amt <= 0) return showErr("PLEASE ENTER A VALID AMOUNT");
    loadingThen("DISPENSING CASH...", () => {
      const res = DB.withdraw(userId, amt);
      triggerSave();
      if (res.ok) { buildReceipt("WITHDRAWAL", [["ACCOUNT", DB.getUser(userId).cardNum.slice(-4)], ["AMOUNT", "-" + fmt(amt)], ["BALANCE", fmt(res.newBalance)], ["REF", genRef("WD")]]); go("receipt"); }
      else { go("withdraw"); setTimeout(() => showErr(res.msg), 50); }
    });
  };

  const doDeposit = () => {
    const amt = parseFloat(depositRef.current?.value || 0);
    if (!amt || amt <= 0) return showErr("PLEASE ENTER A VALID AMOUNT");
    loadingThen("COUNTING NOTES...", () => {
      const res = DB.deposit(userId, amt);
      triggerSave();
      if (res.ok) { buildReceipt("DEPOSIT", [["ACCOUNT", DB.getUser(userId).cardNum.slice(-4)], ["AMOUNT", "+" + fmt(amt)], ["BALANCE", fmt(res.newBalance)], ["REF", genRef("DP")]]); go("receipt"); }
      else { go("deposit"); setTimeout(() => showErr(res.msg), 50); }
    });
  };

  const doTransfer = () => {
    const amt = parseFloat(transferRef.current?.value || 0);
    if (!transferToId) return showErr("PLEASE SELECT A RECIPIENT");
    if (!amt || amt <= 0) return showErr("PLEASE ENTER A VALID AMOUNT");
    loadingThen("PROCESSING TRANSFER...", () => {
      const res = DB.transfer(userId, transferToId, amt);
      triggerSave();
      if (res.ok) { buildReceipt("FUND TRANSFER", [["FROM", DB.getUser(userId).name], ["TO", res.toName], ["AMOUNT", "-" + fmt(amt)], ["BALANCE", fmt(res.newBalance)], ["REF", genRef("TXF")]]); setTransferToId(null); go("receipt"); }
      else { go("transfer"); setTimeout(() => showErr(res.msg), 50); }
    }, 1500);
  };

  const doChangePin = () => {
    const old = oldPinRef.current?.value || "", newp = newPinRef.current?.value || "", conf = confirmPinRef.current?.value || "";
    if (newp !== conf) return showErr("NEW PINS DO NOT MATCH");
    const res = DB.changePin(userId, old, newp);
    if (res.ok) { triggerSave(); showOk("PIN CHANGED SUCCESSFULLY"); setTimeout(() => go("menu"), 1800); }
    else showErr(res.msg);
  };

  const doCreateAccount = () => {
    const res = DB.createAccount(newAccData);
    if (!res.ok) return showErr(res.msg);
    setCreatedAccInfo(res);
    loadingThen("SENDING OTP...", () => go("otp"), 1200);
  };

  const doSetPin = () => {
    if (!/^\d{4}$/.test(newSetPin)) return showErr("PIN MUST BE 4 DIGITS");
    if (newSetPin !== newSetPinConfirm) return showErr("PINS DO NOT MATCH");
    const u = DB.getUser(createdAccInfo.userId);
    if (u) { u.pin = newSetPin; Storage.save(dbData); }
    loadingThen("ACTIVATING ACCOUNT...", () => go("accCreated"), 1200);
  };

  const doReset = () => { DB.resetToDefaults(); setStorageBadge({ text: "💾 RESET", saving: false }); showOk("DATABASE RESET SUCCESSFULLY"); setTimeout(() => go("welcome"), 1500); };

  const buildReceipt = (type, rows) => {
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    setReceipt({ type, rows, now });
  };

  const showBalance  = () => { setBalances(DB.getBalance(userId)); go("balance"); };
  const showHistory  = () => { setHistory(DB.getHistory(userId)); go("history"); };
  const showWithdraw = () => { setSelectedChip(null); go("withdraw"); };
  const showDeposit  = () => { setSelectedChip(null); go("deposit"); };
  const showTransfer = () => { setTransferToId(null); go("transfer"); };

  const chipSet = (amounts, ref) =>
    amounts.map(a => (
      <div key={a} className={`chip${selectedChip === a ? " active" : ""}`}
        onClick={() => { setSelectedChip(a); if (ref.current) ref.current.value = a; }}>
        {fmt(a)}
      </div>
    ));

  const titles = {
    loading_init:"INITIALIZING", welcome:`ATM TERMINAL v2.5`, pin:"PIN VERIFICATION",
    loading:"PROCESSING", menu:"MAIN MENU", balance:"ACCOUNT BALANCE",
    withdraw:"CASH WITHDRAWAL", deposit:"CASH DEPOSIT", transfer:"FUND TRANSFER",
    history:"TRANSACTION HISTORY", changePin:"CHANGE PIN", receipt:"TRANSACTION RECEIPT",
    reset:"RESET DATABASE", createAccount:"OPEN NEW ACCOUNT", otp:"OTP VERIFICATION",
    setPin:"SET YOUR PIN", accCreated:"ACCOUNT CREATED",
  };

  const user = userId ? DB.getUser(userId) : null;

  return (
    <div className="atm-root">
      {/* Language Modal */}
      {showLangModal && (
        <div className="lang-overlay" onClick={() => setShowLangModal(false)}>
          <div className="lang-modal" onClick={e => e.stopPropagation()}>
            <div className="lang-modal-title">🌐 SELECT LANGUAGE / भाषा चुनें</div>
            <div className="lang-grid">
              {LANGUAGES.map(l => (
                <div key={l.code} className={`lang-opt${lang === l.code ? " active" : ""}`}
                  onClick={() => { setLang(l.code); setShowLangModal(false); }}>
                  <div className="lang-opt-label">{l.native}</div>
                  <div className="lang-opt-native">{l.label}</div>
                </div>
              ))}
            </div>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn" onClick={() => setShowLangModal(false)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      <div className="atm-body">
        {/* Header */}
        <div className="atm-header">
          <div className="bank-name">NEXUS BANK</div>
          <div className="header-right">
            <button className="lang-btn" onClick={() => setShowLangModal(true)}>🌐 {LANGUAGES.find(l=>l.code===lang)?.native || "EN"}</button>
            <span className={`storage-badge${storageBadge.saving ? " saving" : ""}`}>{storageBadge.text}</span>
            <div className="status-dot" />
          </div>
        </div>

        {/* Screen */}
        <div className="atm-screen">
          <div className="scanline" />
          <div className="screen-inner">
            <div className="screen-bar">{titles[view] || "ATM TERMINAL"}</div>

            {/* LOADING */}
            {(view === "loading_init" || view === "loading") && (
              <div key={viewKey} className="view-enter" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div className="spinner" />
                <div className="loading-txt">{loadingMsg}</div>
              </div>
            )}

            {/* WELCOME */}
            {view === "welcome" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div style={{ textAlign:"center" }}>
                  <div className="welcome-icon">
                    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
                      <rect x="2" y="7" width="28" height="18" rx="3" stroke="#4a90e2" strokeWidth="1.5"/>
                      <rect x="2" y="12" width="28" height="5" fill="#4a90e2" opacity="0.3"/>
                      <rect x="6" y="18" width="8" height="2" rx="1" fill="#4a90e2" opacity="0.7"/>
                      <circle cx="24" cy="19" r="2" fill="#4a90e2" opacity="0.5"/>
                      <circle cx="20" cy="19" r="2" fill="#4a90e2" opacity="0.8"/>
                    </svg>
                  </div>
                  <div className="welcome-title">{T.welcome}</div>
                  <div className="welcome-sub">{T.selectDemo}</div>
                </div>
                <div className="demo-box">
                  <div className="demo-box-title">DEMO ACCOUNTS — CLICK TO SELECT</div>
                  {DB.getAllUsers().map(u => (
                    <div key={u.id} className={`demo-row${selectedDemo === u.id ? " active" : ""}`}
                      onClick={() => setSelectedDemo(u.id)}>
                      <span>{u.name}</span>
                      <span>••{u.cardNum.slice(-4)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <button className="btn btn-primary" style={{ flex:3 }}
                    onClick={() => { if (!selectedDemo) return; setUserId(selectedDemo); setPinBuffer(""); go("pin"); }}>
                    {T.insertCard}
                  </button>
                  <button className="btn btn-danger" style={{ flex:1, fontSize:10 }}
                    onClick={() => { setAlert(null); go("reset"); }}>
                    ⚙ RESET
                  </button>
                </div>
                <button className="btn btn-success" style={{ width:"100%" }}
                  onClick={() => { setNewAccData({ name:"", phone:"", aadhaar:"", age:"", gender:"" }); setAlert(null); go("createAccount"); }}>
                  + {T.createAcc}
                </button>
              </div>
            )}

            {/* CREATE ACCOUNT */}
            {view === "createAccount" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="form-scroll">
                  <div className="lbl">FULL NAME</div>
                  <input className="inp" type="text" placeholder="As per Aadhaar"
                    value={newAccData.name}
                    onChange={e => setNewAccData(d => ({ ...d, name: e.target.value }))} />

                  <div className="inp-row">
                    <div>
                      <div className="lbl">AGE</div>
                      <input className="inp" type="number" placeholder="18+" min="0" max="120"
                        value={newAccData.age}
                        onChange={e => setNewAccData(d => ({ ...d, age: e.target.value }))} />
                    </div>
                    <div>
                      <div className="lbl">GENDER</div>
                      <select className="inp" value={newAccData.gender}
                        onChange={e => setNewAccData(d => ({ ...d, gender: e.target.value }))}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="lbl">PHONE NUMBER (10 DIGITS)</div>
                  <input className="inp" type="tel" placeholder="9876543210" maxLength={10}
                    value={newAccData.phone}
                    onChange={e => setNewAccData(d => ({ ...d, phone: e.target.value.replace(/\D/g,"") }))} />

                  <div className="lbl">AADHAAR NUMBER (XXXX XXXX XXXX)</div>
                  <input className="inp" type="text" placeholder="1234 5678 9012" maxLength={14}
                    value={newAccData.aadhaar}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g,"");
                      if (v.length > 4) v = v.slice(0,4) + " " + v.slice(4);
                      if (v.length > 9) v = v.slice(0,9) + " " + v.slice(9);
                      setNewAccData(d => ({ ...d, aadhaar: v.slice(0,14) }));
                    }} />

                  {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={() => go("welcome")}>← BACK</button>
                  <button className="btn btn-primary" onClick={doCreateAccount}>SUBMIT →</button>
                </div>
              </div>
            )}

            {/* OTP */}
            {view === "otp" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="otp-box">
                  <div className="otp-phone">📱 OTP SENT TO +91-{newAccData.phone?.slice(-4).padStart(10,"•")}</div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#2a5080", letterSpacing:1 }}>
                    Enter the 4-digit OTP to verify your number
                  </div>
                  <div className="otp-hint">Demo OTP: 1111</div>
                </div>
                <div style={{ textAlign:"center", marginBottom:4 }}>
                  <div className="lbl" style={{ textAlign:"center" }}>ENTER OTP</div>
                  <div className="pin-dots">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`pin-dot${i < otpBuffer.length ? " filled" : ""}`} />
                    ))}
                  </div>
                  {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                </div>
                <div className="keypad">
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <div key={n} className="key" onClick={() => handleOtpKey(String(n))}>{n}</div>
                  ))}
                  <div className="key key-del" onClick={handleOtpDel}>⌫ DEL</div>
                  <div className="key key-zero" onClick={() => handleOtpKey("0")}>0</div>
                  <div className="key key-ok" onClick={() => {
                    if (otpBuffer === "1111") { setOtpBuffer(""); go("setPin"); }
                    else { showErr("INVALID OTP. TRY AGAIN."); setOtpBuffer(""); }
                  }}>✓ VERIFY</div>
                </div>
              </div>
            )}

            {/* SET PIN */}
            {view === "setPin" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#4a90e2", letterSpacing:1, marginBottom:12, textAlign:"center" }}>
                  OTP VERIFIED ✓<br/>
                  <span style={{ color:"#3a5080", fontSize:9 }}>Set your new account PIN below</span>
                </div>
                <div className="lbl">SET NEW PIN (4 DIGITS)</div>
                <input className="inp" type="password" maxLength={4} placeholder="••••"
                  value={newSetPin} onChange={e => setNewSetPin(e.target.value.replace(/\D/g,"").slice(0,4))} />
                <div className="lbl">CONFIRM PIN</div>
                <input className="inp" type="password" maxLength={4} placeholder="••••"
                  value={newSetPinConfirm} onChange={e => setNewSetPinConfirm(e.target.value.replace(/\D/g,"").slice(0,4))} />
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={doSetPin}>SET PIN & ACTIVATE →</button>
                </div>
              </div>
            )}

            {/* ACCOUNT CREATED SUCCESS */}
            {view === "accCreated" && createdAccInfo && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="success-card">
                  <div className="success-card-title">🎉 ACCOUNT CREATED SUCCESSFULLY</div>
                  <div className="success-row"><span>NAME</span><span className="success-val">{DB.getUser(createdAccInfo.userId)?.name}</span></div>
                  <div className="success-row"><span>CARD NO.</span><span className="success-val">{createdAccInfo.cardNum}</span></div>
                  <div className="success-row"><span>A/C TYPE</span><span className="success-val">SAVINGS</span></div>
                  <div className="success-row"><span>STATUS</span><span className="success-val">ACTIVE</span></div>
                  <div className="success-row"><span>PIN SET</span><span className="success-val">YES ✓</span></div>
                </div>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#2a4060", textAlign:"center", marginBottom:10 }}>
                  Your account is now active. You can login with your new card number and PIN.
                </div>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={() => {
                    setUserId(createdAccInfo.userId);
                    setPinBuffer("");
                    go("pin");
                  }}>LOGIN NOW →</button>
                  <button className="btn" onClick={logout}>← HOME</button>
                </div>
              </div>
            )}

            {/* RESET */}
            {view === "reset" && (
              <div key={viewKey} className="view-enter reset-box">
                <div className="reset-msg">
                  ⚠ RESET DATABASE<br/><br/>
                  <span style={{ color:"#3a5080", fontSize:9 }}>This will restore all balances and<br/>clear all transactions to defaults.</span>
                </div>
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row" style={{ width:"100%" }}>
                  <button className="btn" onClick={() => go("welcome")}>← CANCEL</button>
                  <button className="btn btn-danger" onClick={doReset}>CONFIRM RESET</button>
                </div>
              </div>
            )}

            {/* PIN */}
            {view === "pin" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div style={{ textAlign:"center", marginBottom:4 }}>
                  <div className="lbl" style={{ textAlign:"center" }}>{T.enterPin}</div>
                  <div className="pin-dots">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`pin-dot${i < pinBuffer.length ? " filled" : ""}`} />
                    ))}
                  </div>
                  {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                </div>
                <div className="keypad">
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <div key={n} className="key" onClick={() => handlePinKey(String(n))}>{n}</div>
                  ))}
                  <div className="key key-del" onClick={handlePinDel}>⌫ DEL</div>
                  <div className="key key-zero" onClick={() => handlePinKey("0")}>0</div>
                  <div className="key key-ok" onClick={() => submitPin(pinBuffer)}>✓ ENTER</div>
                </div>
              </div>
            )}

            {/* MENU */}
            {view === "menu" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#4a90e2", letterSpacing:2, marginBottom:14 }}>
                  {T.welcome2}, {user?.name}
                </div>
                <div className="menu-grid">
                  {[
                    { icon:"💰", label:T.balance,   fn: showBalance  },
                    { icon:"📤", label:T.withdraw,  fn: showWithdraw },
                    { icon:"📥", label:T.deposit,   fn: showDeposit  },
                    { icon:"🔄", label:T.transfer,  fn: showTransfer },
                    { icon:"📋", label:T.history,   fn: showHistory  },
                    { icon:"🔐", label:T.changePin, fn: () => { setAlert(null); go("changePin"); } },
                  ].map(({ icon, label, fn }) => (
                    <div key={label} className="menu-btn" onClick={fn}>
                      <span className="menu-icon">{icon}</span>
                      <div className="menu-label">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="logout-strip">
                  <button className="btn btn-danger" style={{ maxWidth:160, flex:"none" }} onClick={logout}>
                    ⏻ {T.logout}
                  </button>
                </div>
              </div>
            )}

            {/* BALANCE */}
            {view === "balance" && balances && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="balance-card">
                  <div className="bal-label">{T.checking}</div>
                  <div className="bal-amount">{fmt(balances.checking)}</div>
                  <div className="bal-sub">{user?.cardNum}</div>
                </div>
                <div className="balance-card">
                  <div className="bal-label">{T.savings}</div>
                  <div className="bal-amount bal-savings">{fmt(balances.savings)}</div>
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← {T.menu}</button>
                </div>
              </div>
            )}

            {/* WITHDRAW */}
            {view === "withdraw" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="lbl">SELECT AMOUNT</div>
                <div className="chips">{chipSet([500,1000,2000,5000,10000,20000], withdrawRef)}</div>
                <div className="lbl">OR ENTER AMOUNT</div>
                <input className="inp" type="number" ref={withdrawRef} placeholder="0.00" min="1"
                  onChange={() => setSelectedChip(null)} />
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← {T.back}</button>
                  <button className="btn btn-primary" onClick={doWithdraw}>{T.withdraw} →</button>
                </div>
              </div>
            )}

            {/* DEPOSIT */}
            {view === "deposit" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="lbl">SELECT AMOUNT</div>
                <div className="chips">{chipSet([500,1000,2000,5000,10000,50000], depositRef)}</div>
                <div className="lbl">OR ENTER AMOUNT</div>
                <input className="inp" type="number" ref={depositRef} placeholder="0.00" min="1"
                  onChange={() => setSelectedChip(null)} />
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← {T.back}</button>
                  <button className="btn btn-success" onClick={doDeposit}>{T.deposit} →</button>
                </div>
              </div>
            )}

            {/* TRANSFER */}
            {view === "transfer" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="lbl">{T.selectRecipient}</div>
                <div style={{ marginBottom:8, maxHeight:160, overflowY:"auto" }}>
                  {DB.getOtherUsers(userId).map(u => (
                    <div key={u.id} className={`acc-opt${transferToId === u.id ? " selected" : ""}`}
                      onClick={() => setTransferToId(u.id)}>
                      <div>
                        <div className="acc-name">{u.name}</div>
                        <div className="acc-num">••{u.cardNum.slice(-4)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lbl">{T.amount}</div>
                <input className="inp" type="number" ref={transferRef} placeholder="0.00" min="1" />
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← {T.back}</button>
                  <button className="btn btn-primary" onClick={doTransfer}>{T.transfer} →</button>
                </div>
              </div>
            )}

            {/* HISTORY */}
            {view === "history" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="tx-list">
                  {history.length === 0 && (
                    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#2a4060", textAlign:"center", padding:"30px 0" }}>
                      NO TRANSACTIONS FOUND
                    </div>
                  )}
                  {history.map((t, i) => (
                    <div key={t.id} className="tx-row" style={{ animationDelay: i * 0.04 + "s" }}>
                      <div>
                        <div className="tx-type">{t.type}</div>
                        <div className="tx-date">{t.date}</div>
                      </div>
                      <div className={`tx-amt ${t.amount < 0 ? "tx-debit" : "tx-credit"}`}>
                        {t.amount > 0 ? "+" : ""}{fmt(t.amount)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="btn-row" style={{ marginTop:10 }}>
                  <button className="btn" onClick={() => go("menu")}>← {T.menu}</button>
                </div>
              </div>
            )}

            {/* CHANGE PIN */}
            {view === "changePin" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="lbl">{T.currentPin}</div>
                <input className="inp" type="password" ref={oldPinRef} maxLength={4} placeholder="••••" />
                <div className="lbl">{T.newPin}</div>
                <input className="inp" type="password" ref={newPinRef} maxLength={4} placeholder="••••" />
                <div className="lbl">{T.confirmPin}</div>
                <input className="inp" type="password" ref={confirmPinRef} maxLength={4} placeholder="••••" />
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← {T.back}</button>
                  <button className="btn btn-primary" onClick={doChangePin}>{T.confirm}</button>
                </div>
              </div>
            )}

            {/* RECEIPT */}
            {view === "receipt" && receipt && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="receipt">
                  <div style={{ textAlign:"center", fontWeight:700, fontSize:12, letterSpacing:2, marginBottom:6 }}>NEXUS BANK ATM</div>
                  <div style={{ textAlign:"center", fontSize:9, color:"#888", marginBottom:6 }}>{receipt.now}</div>
                  <hr className="receipt-sep"/>
                  <div style={{ textAlign:"center", fontWeight:700, letterSpacing:1, marginBottom:6 }}>{receipt.type}</div>
                  <hr className="receipt-sep"/>
                  {receipt.rows.map(([k, v]) => (
                    <div key={k} className="receipt-row">
                      <span style={{ color:"#666" }}>{k}</span>
                      <span style={{ fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                  <hr className="receipt-sep"/>
                  <div style={{ textAlign:"center", fontSize:9, color:"#888", marginTop:4 }}>THANK YOU FOR BANKING WITH NEXUS BANK</div>
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← {T.menu}</button>
                  <button className="btn btn-danger" onClick={logout}>⏻ {T.logout}</button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Card & Cash Slots */}
        <div className="slots-row">
          <div className="slot">
            <div className="card-slot-icon" />
            <span>CARD SLOT</span>
          </div>
          <div className="slot">
            <span className="cash-bar">▬▬</span>
            <span>CASH DISPENSER</span>
          </div>
        </div>
      </div>
    </div>
  );
}