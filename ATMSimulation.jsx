// ============================================================
//  NEXUS BANK ATM SIMULATION
//  Single-file JSX — Database + Backend + Animated Frontend
//  Usage: drop into any React 18+ project
//  Dependencies: React (useState, useEffect, useRef)
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
//  DATABASE LAYER  (in-memory, persists for session)
// ═══════════════════════════════════════════════════════════
const createDB = () => {
  const users = [
    { id: 1, name: "Alice Johnson", cardNum: "4111 2222 3333 0001", pin: "1234", checking: 4850.0,  savings: 12300.0 },
    { id: 2, name: "Bob Martinez",  cardNum: "4111 2222 3333 0002", pin: "5678", checking: 1200.5,  savings: 3400.0  },
    { id: 3, name: "Carol Smith",   cardNum: "4111 2222 3333 0003", pin: "9999", checking: 28000.0, savings: 55000.0 },
    { id: 4, name: "David Lee",     cardNum: "4111 2222 3333 0004", pin: "0000", checking: 670.25,  savings: 890.0   },
  ];

  const transactions = [];
  let nextTxId = 1000;

  const addTx = (userId, type, amount, balance) => {
    transactions.push({
      id: nextTxId++,
      userId,
      type,
      amount,
      balance,
      date: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "short", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
      }),
    });
  };

  // Seed initial transactions
  addTx(1, "Opening Balance", 4850,    4850);
  addTx(1, "Salary Credit",  +5000,    9850);
  addTx(1, "Withdrawal",     -200,     9650);
  addTx(1, "Deposit",        +500,     10150);
  addTx(2, "Opening Balance", 1200.5,  1200.5);
  addTx(3, "Opening Balance", 28000,   28000);
  addTx(4, "Opening Balance", 670.25,  670.25);

  return {
    getUser:   (id)      => users.find((u) => u.id === id),
    getAllUsers:()        => users,
    getOtherUsers:(id)   => users.filter((u) => u.id !== id),

    authenticate(userId, pin) {
      const u = this.getUser(userId);
      return u && u.pin === pin;
    },

    getBalance(userId) {
      const u = this.getUser(userId);
      return u ? { checking: u.checking, savings: u.savings } : null;
    },

    withdraw(userId, amount) {
      const u = this.getUser(userId);
      if (!u)           return { ok: false, msg: "USER NOT FOUND" };
      if (amount <= 0)  return { ok: false, msg: "INVALID AMOUNT" };
      if (amount > u.checking) return { ok: false, msg: "INSUFFICIENT FUNDS" };
      if (amount > 5000)       return { ok: false, msg: "EXCEEDS DAILY LIMIT ($5,000)" };
      u.checking = +(u.checking - amount).toFixed(2);
      addTx(userId, "Withdrawal", -amount, u.checking);
      return { ok: true, newBalance: u.checking };
    },

    deposit(userId, amount) {
      const u = this.getUser(userId);
      if (!u)           return { ok: false, msg: "USER NOT FOUND" };
      if (amount <= 0)  return { ok: false, msg: "INVALID AMOUNT" };
      if (amount > 10000) return { ok: false, msg: "EXCEEDS DEPOSIT LIMIT ($10,000)" };
      u.checking = +(u.checking + amount).toFixed(2);
      addTx(userId, "Deposit", +amount, u.checking);
      return { ok: true, newBalance: u.checking };
    },

    transfer(fromId, toId, amount) {
      const from = this.getUser(fromId);
      const to   = this.getUser(toId);
      if (!from || !to)      return { ok: false, msg: "ACCOUNT NOT FOUND" };
      if (amount <= 0)       return { ok: false, msg: "INVALID AMOUNT" };
      if (amount > from.checking) return { ok: false, msg: "INSUFFICIENT FUNDS" };
      if (amount > 2000)     return { ok: false, msg: "TRANSFER LIMIT EXCEEDED ($2,000)" };
      from.checking = +(from.checking - amount).toFixed(2);
      to.checking   = +(to.checking   + amount).toFixed(2);
      addTx(fromId, `Transfer → ${to.name.split(" ")[0]}`,   -amount, from.checking);
      addTx(toId,   `Transfer ← ${from.name.split(" ")[0]}`, +amount, to.checking);
      return { ok: true, newBalance: from.checking, toName: to.name };
    },

    changePin(userId, oldPin, newPin) {
      const u = this.getUser(userId);
      if (!u)              return { ok: false, msg: "USER NOT FOUND" };
      if (u.pin !== oldPin) return { ok: false, msg: "INCORRECT CURRENT PIN" };
      if (!/^\d{4}$/.test(newPin)) return { ok: false, msg: "PIN MUST BE 4 DIGITS" };
      u.pin = newPin;
      return { ok: true };
    },

    getHistory(userId) {
      return transactions.filter((t) => t.userId === userId).slice(-15).reverse();
    },
  };
};

// Singleton DB instance
const DB = createDB();

// ═══════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════
const fmt = (n) =>
  "$" + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const genRef = (prefix) =>
  prefix + Math.floor(Math.random() * 900000 + 100000);

// ═══════════════════════════════════════════════════════════
//  STYLES  (injected once as a <style> tag via useEffect)
// ═══════════════════════════════════════════════════════════
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

/* ── ATM Body ── */
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

/* ── Header ── */
.atm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.bank-name {
  font-weight: 700;
  font-size: 18px;
  color: #4a90e2;
  letter-spacing: 4px;
  text-transform: uppercase;
}
.status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #00e676;
  box-shadow: 0 0 10px #00e676;
  animation: pulseDot 2s infinite;
}
@keyframes pulseDot {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.5; transform:scale(.75); }
}

/* ── Screen ── */
.atm-screen {
  background: #070b18;
  border: 1px solid #1e2a4a;
  border-radius: 14px;
  min-height: 340px;
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
.screen-inner {
  flex: 1;
  padding: 22px 22px 18px;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}
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
.screen-bar::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #2a3a5a, transparent);
}

/* ── View animations ── */
.view-enter { animation: fadeUp .3s ease forwards; }
@keyframes fadeUp {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0);   }
}

/* ── Demo list ── */
.demo-box {
  background: #0d1225;
  border: 1px solid #1a2540;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}
.demo-box-title {
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  color: #2a4060;
  letter-spacing: 2px;
  margin-bottom: 8px;
}
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
.demo-row:hover  { background: #141e35; }
.demo-row.active { color: #4a90e2; background: rgba(74,144,226,.07); }

/* ── Welcome ── */
.welcome-icon {
  width: 68px; height: 68px;
  border: 1.5px solid #2a4080;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  animation: rotateGlow 4s linear infinite;
}
@keyframes rotateGlow {
  0%   { box-shadow: 2px 0 14px rgba(74,144,226,.2); }
  50%  { box-shadow: -2px 0 24px rgba(74,144,226,.5); }
  100% { box-shadow: 2px 0 14px rgba(74,144,226,.2); }
}
.welcome-title { font-size: 22px; font-weight:700; color:#c8d8f0; letter-spacing:1px; margin-bottom:6px; text-align:center; }
.welcome-sub   { font-family:'Share Tech Mono',monospace; font-size:10px; color:#3a5080; letter-spacing:1px; text-align:center; margin-bottom:20px; }

/* ── PIN ── */
.pin-dots { display:flex; justify-content:center; gap:14px; margin:16px 0; }
.pin-dot {
  width: 14px; height:14px;
  border-radius: 50%;
  border: 1.5px solid #2a4080;
  background: transparent;
  transition: all .2s;
}
.pin-dot.filled {
  background: #4a90e2;
  border-color: #4a90e2;
  box-shadow: 0 0 10px rgba(74,144,226,.7);
}
.keypad {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 8px;
  margin-top: 12px;
}
.key {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 8px;
  padding: 12px 8px;
  color: #a0c0e8;
  font-family: 'Share Tech Mono', monospace;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  user-select: none;
  transition: all .1s;
}
.key:hover  { background:#131a35; border-color:#2a4080; color:#c8d8f0; }
.key:active { transform:scale(.93); background:#1a2545; }
.key-del    { color:#e24a4a; font-size:11px; }
.key-ok     { color:#00c853; font-size:11px; grid-column: 2 / 4; }
.key-zero   { grid-column: 1 / 3; }

/* ── Menu ── */
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
.menu-icon  { font-size:20px; display:block; margin-bottom:6px; }
.menu-label { font-family:'Share Tech Mono',monospace; font-size:9px; color:#6a90c0; letter-spacing:1px; text-transform:uppercase; }

/* ── Balance ── */
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
.balance-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4a90e2, transparent);
  animation: scan 2.4s ease-in-out infinite;
}
@keyframes scan {
  0%   { transform:translateX(-100%); }
  100% { transform:translateX(100%);  }
}
.bal-label  { font-family:'Share Tech Mono',monospace; font-size:9px; color:#3a5080; letter-spacing:3px; margin-bottom:10px; }
.bal-amount { font-family:'Share Tech Mono',monospace; font-size:32px; color:#00e676; letter-spacing:2px; text-shadow:0 0 20px rgba(0,230,118,.4); animation:countUp .4s ease; }
@keyframes countUp { from { opacity:0; transform:scale(.88); } to { opacity:1; transform:scale(1); } }
.bal-sub    { font-family:'Share Tech Mono',monospace; font-size:10px; color:#2a4060; margin-top:6px; }
.bal-savings { color:#4a90e2; font-size:22px; text-shadow:0 0 14px rgba(74,144,226,.4); }

/* ── Amount chips ── */
.chips { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin:10px 0; }
.chip {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 7px;
  padding: 9px 6px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: #6a90c0;
  cursor: pointer;
  text-align: center;
  user-select: none;
  transition: all .15s;
}
.chip:hover   { border-color:#4a90e2; color:#a0d0ff; background:#111830; }
.chip.active  { border-color:#4a90e2; background:rgba(74,144,226,.1); color:#7ab8ff; box-shadow:0 0 10px rgba(74,144,226,.15); }

/* ── Inputs ── */
.lbl {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  color: #3a6090;
  letter-spacing: 2px;
  margin-bottom: 5px;
}
.inp {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 8px;
  padding: 11px 14px;
  color: #c8d8f0;
  font-family: 'Share Tech Mono', monospace;
  font-size: 14px;
  width: 100%;
  margin-bottom: 10px;
  outline: none;
  letter-spacing: 2px;
  transition: border-color .2s;
}
.inp:focus { border-color:#4a90e2; box-shadow:0 0 0 2px rgba(74,144,226,.1); }
.inp.shake { animation:shake .3s; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

/* ── Alerts ── */
.alert {
  padding: 9px 13px;
  border-radius: 7px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  letter-spacing: 1px;
  margin-bottom: 10px;
  animation: fadeUp .2s ease;
}
.alert-err  { background:rgba(226,74,74,.1);  border:1px solid rgba(226,74,74,.3);  color:#e24a4a; }
.alert-ok   { background:rgba(0,200,83,.1);   border:1px solid rgba(0,200,83,.3);   color:#00c853; }

/* ── Buttons ── */
.btn {
  background: transparent;
  border: 1px solid #2a4080;
  border-radius: 8px;
  padding: 11px 18px;
  color: #7ab8ff;
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
.btn:hover  { background:rgba(74,144,226,.1); border-color:#4a90e2; }
.btn:active { transform:scale(.97); }
.btn-primary { background:#4a90e2; border-color:#4a90e2; color:#fff; box-shadow:0 0 18px rgba(74,144,226,.3); }
.btn-primary:hover { background:#5aaaf2; box-shadow:0 0 26px rgba(74,144,226,.5); }
.btn-success { background:#00c853; border-color:#00c853; color:#fff; box-shadow:0 0 18px rgba(0,200,83,.25); }
.btn-success:hover { background:#00e060; }
.btn-danger  { border-color:#e24a4a; color:#e24a4a; }
.btn-danger:hover  { background:rgba(226,74,74,.1); }
.btn-row { display:flex; gap:8px; margin-top:10px; }

/* ── Transaction history ── */
.tx-list { display:flex; flex-direction:column; gap:6px; max-height:210px; overflow-y:auto; flex:1; }
.tx-list::-webkit-scrollbar { width:3px; }
.tx-list::-webkit-scrollbar-track { background:transparent; }
.tx-list::-webkit-scrollbar-thumb { background:#2a4060; border-radius:2px; }
.tx-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0d1225;
  border: 1px solid #141e35;
  border-radius: 7px;
  padding: 9px 12px;
  animation: fadeUp .2s ease;
}
.tx-type { font-size:12px; color:#a0b8d8; font-weight:600; }
.tx-date { font-family:'Share Tech Mono',monospace; font-size:9px; color:#2a4060; margin-top:2px; }
.tx-amt  { font-family:'Share Tech Mono',monospace; font-size:12px; font-weight:600; }
.tx-debit  { color:#e24a4a; }
.tx-credit { color:#00e676; }

/* ── Transfer account selector ── */
.acc-opt {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 8px;
  padding: 11px 14px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all .15s;
  margin-bottom: 7px;
  user-select: none;
}
.acc-opt:hover    { border-color:#4a90e2; }
.acc-opt.selected { border-color:#4a90e2; background:rgba(74,144,226,.08); }
.acc-name { font-size:13px; color:#a0b8d8; font-weight:600; }
.acc-num  { font-family:'Share Tech Mono',monospace; font-size:9px; color:#3a5080; }
.acc-bal  { font-family:'Share Tech Mono',monospace; font-size:11px; color:#00e676; }

/* ── Receipt ── */
.receipt {
  background: #f8f5f0;
  border-radius: 8px;
  padding: 16px;
  color: #222;
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  line-height: 1.9;
  animation: openReceipt .4s ease forwards;
}
@keyframes openReceipt {
  from { max-height:0; opacity:0; overflow:hidden; }
  to   { max-height:400px; opacity:1; }
}
.receipt-row { display:flex; justify-content:space-between; }
.receipt-sep { border:none; border-top:1px dashed #bbb; margin:5px 0; }

/* ── Loading ── */
.spinner {
  width:28px; height:28px;
  border: 2px solid #1e3060;
  border-top-color: #4a90e2;
  border-radius: 50%;
  animation: spin .7s linear infinite;
  margin: 0 auto;
}
@keyframes spin { to { transform:rotate(360deg); } }
.loading-txt {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  color: #3a5080;
  letter-spacing: 2px;
  text-align: center;
  margin-top: 12px;
  animation: blink 1s step-end infinite;
}
@keyframes blink { 50% { opacity:0; } }

/* ── Card / Cash slots ── */
.slots-row { display:flex; justify-content:center; gap:14px; margin-top:20px; }
.slot {
  background: #0d1225;
  border: 1px solid #1e3060;
  border-radius: 6px;
  padding: 7px 16px;
  display: flex; align-items: center; gap: 8px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 9px;
  color: #2a4060;
  letter-spacing: 2px;
}
.card-slot-icon {
  width:22px; height:15px;
  background: linear-gradient(135deg,#ffcc44,#ff9900);
  border-radius:3px;
  animation: cardBlink 3s ease-in-out infinite;
}
@keyframes cardBlink {
  0%,80%,100% { opacity:.4; }
  40% { opacity:1; box-shadow:0 0 8px rgba(255,200,50,.5); }
}
.cash-bar { color:#00e676; opacity:.4; font-size:14px; }

/* ── Logout strip ── */
.logout-strip { display:flex; justify-content:center; margin-top:14px; }
`;

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function ATMSimulation() {
  // Inject CSS once
  useEffect(() => {
    const id = "atm-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    return () => {};
  }, []);

  // ── State ──
  const [view, setView]             = useState("welcome");
  const [userId, setUserId]         = useState(null);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [pinBuffer, setPinBuffer]   = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [transferToId, setTransferToId] = useState(null);
  const [selectedChip, setSelectedChip] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState("PROCESSING...");
  const [alert, setAlert]           = useState(null); // { type, msg }
  const [receipt, setReceipt]       = useState(null);
  const [balances, setBalances]     = useState(null);
  const [history, setHistory]       = useState([]);
  const [viewKey, setViewKey]       = useState(0); // forces re-mount animation

  // Input refs
  const withdrawRef  = useRef(null);
  const depositRef   = useRef(null);
  const transferRef  = useRef(null);
  const oldPinRef    = useRef(null);
  const newPinRef    = useRef(null);
  const confirmPinRef= useRef(null);

  // ── Helpers ──
  const go = useCallback((v, msg) => {
    if (msg) setLoadingMsg(msg);
    setAlert(null);
    setViewKey((k) => k + 1);
    setView(v);
  }, []);

  const loadingThen = useCallback((msg, fn, delay = 1300) => {
    go("loading", msg);
    setTimeout(fn, delay);
  }, [go]);

  const showErr = (msg) => setAlert({ type: "err", msg });
  const showOk  = (msg) => setAlert({ type: "ok",  msg });

  const logout = () => {
    setUserId(null);
    setSelectedDemo(null);
    setPinBuffer("");
    setPinAttempts(0);
    setTransferToId(null);
    setReceipt(null);
    setAlert(null);
    go("welcome");
  };

  // ── PIN logic ──
  const handlePinKey = (k) => {
    if (pinBuffer.length >= 4) return;
    const next = pinBuffer + k;
    setPinBuffer(next);
    if (next.length === 4) setTimeout(() => submitPin(next), 180);
  };

  const handlePinDel = () => setPinBuffer((p) => p.slice(0, -1));

  const submitPin = (buf) => {
    const pin = buf || pinBuffer;
    if (pin.length !== 4) return;
    if (DB.authenticate(userId, pin)) {
      setPinAttempts(0);
      loadingThen("VERIFYING IDENTITY...", () => {
        setPinBuffer("");
        go("menu");
      }, 1000);
    } else {
      const attempts = pinAttempts + 1;
      setPinAttempts(attempts);
      showErr(`INCORRECT PIN. ATTEMPTS: ${attempts}/3`);
      setPinBuffer("");
      if (attempts >= 3) {
        showErr("CARD BLOCKED. CONTACT BANK.");
        setTimeout(logout, 2500);
      }
    }
  };

  // ── Operations ──
  const doWithdraw = () => {
    const amt = parseFloat(withdrawRef.current?.value || 0);
    if (!amt || amt <= 0) return showErr("PLEASE ENTER A VALID AMOUNT");
    loadingThen("DISPENSING CASH...", () => {
      const res = DB.withdraw(userId, amt);
      if (res.ok) {
        buildReceipt("WITHDRAWAL", [
          ["ACCOUNT",  DB.getUser(userId).cardNum.slice(-4)],
          ["AMOUNT",   "-" + fmt(amt)],
          ["BALANCE",  fmt(res.newBalance)],
          ["REF",      genRef("WD")],
        ]);
        go("receipt");
      } else {
        go("withdraw");
        setTimeout(() => showErr(res.msg), 50);
      }
    });
  };

  const doDeposit = () => {
    const amt = parseFloat(depositRef.current?.value || 0);
    if (!amt || amt <= 0) return showErr("PLEASE ENTER A VALID AMOUNT");
    loadingThen("COUNTING NOTES...", () => {
      const res = DB.deposit(userId, amt);
      if (res.ok) {
        buildReceipt("DEPOSIT", [
          ["ACCOUNT",  DB.getUser(userId).cardNum.slice(-4)],
          ["AMOUNT",   "+" + fmt(amt)],
          ["BALANCE",  fmt(res.newBalance)],
          ["REF",      genRef("DP")],
        ]);
        go("receipt");
      } else {
        go("deposit");
        setTimeout(() => showErr(res.msg), 50);
      }
    });
  };

  const doTransfer = () => {
    const amt = parseFloat(transferRef.current?.value || 0);
    if (!transferToId) return showErr("PLEASE SELECT A RECIPIENT");
    if (!amt || amt <= 0) return showErr("PLEASE ENTER A VALID AMOUNT");
    loadingThen("PROCESSING TRANSFER...", () => {
      const res = DB.transfer(userId, transferToId, amt);
      if (res.ok) {
        buildReceipt("FUND TRANSFER", [
          ["FROM",     DB.getUser(userId).name],
          ["TO",       res.toName],
          ["AMOUNT",   "-" + fmt(amt)],
          ["BALANCE",  fmt(res.newBalance)],
          ["REF",      genRef("TXF")],
        ]);
        setTransferToId(null);
        go("receipt");
      } else {
        go("transfer");
        setTimeout(() => showErr(res.msg), 50);
      }
    }, 1500);
  };

  const doChangePin = () => {
    const old  = oldPinRef.current?.value || "";
    const newp = newPinRef.current?.value || "";
    const conf = confirmPinRef.current?.value || "";
    if (newp !== conf) return showErr("NEW PINS DO NOT MATCH");
    const res = DB.changePin(userId, old, newp);
    if (res.ok) {
      showOk("PIN CHANGED SUCCESSFULLY");
      setTimeout(() => go("menu"), 1800);
    } else {
      showErr(res.msg);
    }
  };

  const buildReceipt = (type, rows) => {
    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
    setReceipt({ type, rows, now });
  };

  const showBalance = () => {
    const b = DB.getBalance(userId);
    setBalances(b);
    go("balance");
  };

  const showHistory = () => {
    setHistory(DB.getHistory(userId));
    go("history");
  };

  const showWithdraw = () => { setSelectedChip(null); go("withdraw"); };
  const showDeposit  = () => { setSelectedChip(null); go("deposit");  };
  const showTransfer = () => { setTransferToId(null); go("transfer"); };

  const chipSet = (amounts, ref) => {
    return amounts.map((a) => (
      <div key={a}
        className={`chip${selectedChip === a ? " active" : ""}`}
        onClick={() => { setSelectedChip(a); if (ref.current) ref.current.value = a; }}>
        {fmt(a)}
      </div>
    ));
  };

  // ── Screen title map ──
  const titles = {
    welcome:    "ATM TERMINAL v2.4",
    selectAcc:  "SELECT ACCOUNT",
    pin:        "PIN VERIFICATION",
    loading:    "PROCESSING",
    menu:       "MAIN MENU",
    balance:    "ACCOUNT BALANCE",
    withdraw:   "CASH WITHDRAWAL",
    deposit:    "CASH DEPOSIT",
    transfer:   "FUND TRANSFER",
    history:    "TRANSACTION HISTORY",
    changePin:  "CHANGE PIN",
    receipt:    "TRANSACTION RECEIPT",
  };

  const user = userId ? DB.getUser(userId) : null;

  // ── Render ──
  return (
    <div className="atm-root">
      <div className="atm-body">
        {/* Header */}
        <div className="atm-header">
          <div className="bank-name">NEXUS BANK</div>
          <div className="status-dot" />
        </div>

        {/* Screen */}
        <div className="atm-screen">
          <div className="scanline" />
          <div className="screen-inner">
            <div className="screen-bar">{titles[view] || "ATM TERMINAL"}</div>

            {/* ── WELCOME ── */}
            {view === "welcome" && (
              <div key={viewKey} className="view-enter" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ textAlign: "center" }}>
                  <div className="welcome-icon">
                    <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
                      <rect x="2" y="7" width="28" height="18" rx="3" stroke="#4a90e2" strokeWidth="1.5"/>
                      <rect x="2" y="12" width="28" height="5" fill="#4a90e2" opacity="0.3"/>
                      <rect x="6" y="18" width="8" height="2" rx="1" fill="#4a90e2" opacity="0.7"/>
                      <circle cx="24" cy="19" r="2" fill="#4a90e2" opacity="0.5"/>
                      <circle cx="20" cy="19" r="2" fill="#4a90e2" opacity="0.8"/>
                    </svg>
                  </div>
                  <div className="welcome-title">Insert Card</div>
                  <div className="welcome-sub">SELECT A DEMO ACCOUNT BELOW</div>
                </div>
                <div className="demo-box">
                  <div className="demo-box-title">DEMO ACCOUNTS — CLICK TO SELECT</div>
                  {DB.getAllUsers().map((u) => (
                    <div key={u.id}
                      className={`demo-row${selectedDemo === u.id ? " active" : ""}`}
                      onClick={() => setSelectedDemo(u.id)}>
                      <span>{u.name}</span>
                      <span>••{u.cardNum.slice(-4)}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary"
                  onClick={() => {
                    if (!selectedDemo) return;
                    setUserId(selectedDemo);
                    setPinBuffer("");
                    go("pin");
                  }}>
                  INSERT CARD →
                </button>
              </div>
            )}

            {/* ── PIN ── */}
            {view === "pin" && (
              <div key={viewKey} className="view-enter" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ textAlign: "center", marginBottom: 4 }}>
                  <div className="lbl" style={{ textAlign: "center" }}>ENTER YOUR 4-DIGIT PIN</div>
                  <div className="pin-dots">
                    {[0,1,2,3].map((i) => (
                      <div key={i} className={`pin-dot${i < pinBuffer.length ? " filled" : ""}`} />
                    ))}
                  </div>
                  {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                </div>
                <div className="keypad">
                  {[1,2,3,4,5,6,7,8,9].map((n) => (
                    <div key={n} className="key" onClick={() => handlePinKey(String(n))}>{n}</div>
                  ))}
                  <div className="key key-del" onClick={handlePinDel}>⌫ DEL</div>
                  <div className="key key-zero" onClick={() => handlePinKey("0")}>0</div>
                  <div className="key key-ok"  onClick={() => submitPin(pinBuffer)}>✓ ENTER</div>
                </div>
              </div>
            )}

            {/* ── LOADING ── */}
            {view === "loading" && (
              <div key={viewKey} className="view-enter"
                style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                <div className="spinner" />
                <div className="loading-txt">{loadingMsg}</div>
              </div>
            )}

            {/* ── MENU ── */}
            {view === "menu" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#4a90e2", letterSpacing:2, marginBottom:14 }}>
                  WELCOME, {user?.name.toUpperCase()}
                </div>
                <div className="menu-grid">
                  {[
                    { icon:"💰", label:"BALANCE",  fn: showBalance  },
                    { icon:"📤", label:"WITHDRAW", fn: showWithdraw },
                    { icon:"📥", label:"DEPOSIT",  fn: showDeposit  },
                    { icon:"🔄", label:"TRANSFER", fn: showTransfer },
                    { icon:"📋", label:"HISTORY",  fn: showHistory  },
                    { icon:"🔐", label:"CHANGE PIN", fn:() => { setAlert(null); go("changePin"); } },
                  ].map(({ icon, label, fn }) => (
                    <div key={label} className="menu-btn" onClick={fn}>
                      <span className="menu-icon">{icon}</span>
                      <div className="menu-label">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="logout-strip">
                  <button className="btn btn-danger" style={{ maxWidth:160, flex:"none" }} onClick={logout}>
                    ⏻ LOGOUT
                  </button>
                </div>
              </div>
            )}

            {/* ── BALANCE ── */}
            {view === "balance" && balances && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="balance-card">
                  <div className="bal-label">CHECKING BALANCE</div>
                  <div className="bal-amount">{fmt(balances.checking)}</div>
                  <div className="bal-sub">{user?.cardNum}</div>
                </div>
                <div className="balance-card">
                  <div className="bal-label">SAVINGS BALANCE</div>
                  <div className={`bal-amount bal-savings`}>{fmt(balances.savings)}</div>
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← MENU</button>
                </div>
              </div>
            )}

            {/* ── WITHDRAW ── */}
            {view === "withdraw" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="lbl">SELECT AMOUNT</div>
                <div className="chips">{chipSet([100,200,500,1000,2000,5000], withdrawRef)}</div>
                <div className="lbl">OR ENTER AMOUNT</div>
                <input className="inp" type="number" ref={withdrawRef} placeholder="0.00" min="1"
                  onChange={() => setSelectedChip(null)} />
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← BACK</button>
                  <button className="btn btn-primary" onClick={doWithdraw}>WITHDRAW →</button>
                </div>
              </div>
            )}

            {/* ── DEPOSIT ── */}
            {view === "deposit" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="lbl">SELECT AMOUNT</div>
                <div className="chips">{chipSet([100,500,1000,2000,5000,10000], depositRef)}</div>
                <div className="lbl">OR ENTER AMOUNT</div>
                <input className="inp" type="number" ref={depositRef} placeholder="0.00" min="1"
                  onChange={() => setSelectedChip(null)} />
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← BACK</button>
                  <button className="btn btn-success" onClick={doDeposit}>DEPOSIT →</button>
                </div>
              </div>
            )}

            {/* ── TRANSFER ── */}
            {view === "transfer" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="lbl">SELECT RECIPIENT</div>
                <div style={{ marginBottom:8 }}>
                  {DB.getOtherUsers(userId).map((u) => (
                    <div key={u.id} className={`acc-opt${transferToId === u.id ? " selected" : ""}`}
                      onClick={() => setTransferToId(u.id)}>
                      <div>
                        <div className="acc-name">{u.name}</div>
                        <div className="acc-num">••{u.cardNum.slice(-4)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lbl">AMOUNT</div>
                <input className="inp" type="number" ref={transferRef} placeholder="0.00" min="1" />
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← BACK</button>
                  <button className="btn btn-primary" onClick={doTransfer}>TRANSFER →</button>
                </div>
              </div>
            )}

            {/* ── HISTORY ── */}
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
                  <button className="btn" onClick={() => go("menu")}>← MENU</button>
                </div>
              </div>
            )}

            {/* ── CHANGE PIN ── */}
            {view === "changePin" && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="lbl">CURRENT PIN</div>
                <input className="inp" type="password" ref={oldPinRef}     maxLength={4} placeholder="••••" />
                <div className="lbl">NEW PIN</div>
                <input className="inp" type="password" ref={newPinRef}     maxLength={4} placeholder="••••" />
                <div className="lbl">CONFIRM NEW PIN</div>
                <input className="inp" type="password" ref={confirmPinRef} maxLength={4} placeholder="••••" />
                {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← BACK</button>
                  <button className="btn btn-primary" onClick={doChangePin}>CONFIRM</button>
                </div>
              </div>
            )}

            {/* ── RECEIPT ── */}
            {view === "receipt" && receipt && (
              <div key={viewKey} className="view-enter" style={{ display:"flex", flexDirection:"column", flex:1 }}>
                <div className="receipt">
                  <div style={{ textAlign:"center", fontWeight:700, fontSize:12, letterSpacing:2, marginBottom:6 }}>
                    NEXUS BANK ATM
                  </div>
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
                  <div style={{ textAlign:"center", fontSize:9, color:"#888", marginTop:4 }}>
                    THANK YOU FOR BANKING WITH US
                  </div>
                </div>
                <div className="btn-row">
                  <button className="btn" onClick={() => go("menu")}>← MENU</button>
                  <button className="btn btn-danger" onClick={logout}>⏻ LOGOUT</button>
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
