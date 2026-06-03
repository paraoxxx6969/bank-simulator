# 🏦 Nexus Bank ATM Simulation

A fully-featured, interactive ATM simulation built with React — complete with persistent storage, multilingual support, INR currency, OTP verification, and a sleek dark terminal UI.

---

## 📸 Screenshots

| Welcome Screen | Main Menu |
|:-:|:-:|
| ![Welcome Screen](Screenshot_2026-06-03_203242.png) | ![Main Menu](Screenshot_2026-06-03_203307.png) |

| Account Balance | Transaction Receipt |
|:-:|:-:|
| ![Account Balance](Screenshot_2026-06-03_203325.png) | ![Transaction Receipt](Screenshot_2026-06-03_203351.png) |

---

## ✨ Features

### 🔐 Authentication
- 4-digit PIN-based login with keypad UI
- 3-attempt lockout with card block simulation
- OTP verification (demo OTP: `1111`) for new account creation
- PIN change functionality with current PIN verification

### 💳 Account Management
- Select from pre-loaded demo accounts or create a new one
- Account creation with Aadhaar, phone, age, and gender validation
- Auto-generated card numbers for new accounts
- Separate checking and savings balance display

### 💰 Transactions
- **Cash Withdrawal** — quick-select chips (₹500 – ₹20,000) or custom amount; daily limit ₹50,000
- **Cash Deposit** — quick-select chips (₹500 – ₹50,000) or custom amount; deposit limit ₹2,00,000
- **Fund Transfer** — transfer to any other account; limit ₹1,00,000 per transaction
- **Transaction History** — last 15 transactions with type, date, and amount

### 🧾 Receipts
- Auto-generated receipts after every withdrawal, deposit, and transfer
- Displays account, amount, updated balance, and reference number
- Timestamp in IST (Asia/Kolkata)

### 💾 Persistent Storage
- All balances, transactions, and new accounts persist across sessions via `window.storage` (artifact storage) with `localStorage` fallback
- Storage badge shows live status: `LOADING → INITIALIZED → SAVING → SAVED`
- One-click database reset to restore default state

### 🌐 Multilingual Support
20 languages supported, including:

| Indian Languages | International |
|---|---|
| Hindi, Bengali, Telugu, Marathi | French, German, Spanish |
| Tamil, Gujarati, Kannada | Arabic, Chinese, Japanese |
| Malayalam, Punjabi, Urdu, Odia | Russian |

---

## 🚀 Getting Started

### Demo Accounts

All demo accounts use PIN `1111`.

| Name | Card | Checking | Savings |
|---|---|---|---|
| Aryan Rawat | ••0001 | ₹4,850.00 | ₹120.00 |
| Taha Shaikh | ••0002 | ₹1,200.50 | ₹340.00 |
| Karan Mehta | ••0003 | ₹2,800.00 | ₹550.00 |
| Laxminarayan | ••0004 | ₹670.25 | ₹890.00 |

### Create a New Account
1. Click **+ CREATE ACCOUNT** on the welcome screen
2. Fill in your name, age, gender, phone number, and Aadhaar
3. Enter OTP `1111` to verify your phone
4. Set a 4-digit PIN
5. Your account is activated and ready to use

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React (Hooks) |
| Styling | Custom CSS (Share Tech Mono + Rajdhani fonts) |
| Storage | `window.storage` API / `localStorage` fallback |
| Currency | Indian Rupee (₹) with INR formatting |
| Timezone | Asia/Kolkata (IST) |

---

## 📋 Transaction Limits

| Operation | Limit |
|---|---|
| Cash Withdrawal | ₹50,000 per day |
| Cash Deposit | ₹2,00,000 per transaction |
| Fund Transfer | ₹1,00,000 per transaction |
| PIN Attempts | 3 (card blocked after 3 failures) |

---

## 🗂️ Project Structure

```
ATMSimulation/
├── index.jsx          # Main component (single-file React app)
│
├── Constants
│   ├── DEFAULT_DB     # Seed data for users & transactions
│   ├── LANGUAGES      # 20 supported language definitions
│   └── TRANSLATIONS   # UI string translations per language
│
├── Storage            # Async load/save with storage API + localStorage fallback
├── DB                 # In-memory database with all business logic
│
└── Views
    ├── welcome        # Card selection + demo account list
    ├── createAccount  # New account registration form
    ├── otp            # OTP keypad verification
    ├── setPin         # Post-OTP PIN setup
    ├── pin            # Login PIN entry
    ├── menu           # Main menu (6 options)
    ├── balance        # Checking + savings display
    ├── withdraw       # Withdrawal with chip selector
    ├── deposit        # Deposit with chip selector
    ├── transfer       # Recipient selector + amount
    ├── history        # Last 15 transactions
    ├── changePin      # PIN update form
    ├── receipt        # Printable transaction receipt
    └── reset          # Database reset confirmation
```

---

## ⚙️ Configuration

To reset all data to factory defaults, click the **⚙ RESET** button on the welcome screen and confirm. This restores all account balances and clears all transactions added during the session.

---

## 📄 License

This project is for educational and demonstration purposes.

---

*Built with ❤️ — Nexus Bank ATM Simulation v2.5*
