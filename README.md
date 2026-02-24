# 🐧 Linux Workshop Challenge

A real-time, interactive Linux command quiz platform designed for live workshops and classrooms. Participants join a challenge, answer Linux questions round by round, and compete on a live leaderboard — all controlled by an admin dashboard.

Built with **React**, **Tailwind CSS**, and **Firebase**.

---

## ✨ Features

### Participant Side
- Join with name and register number
- Real-time lobby with auto-transition when rounds start
- Answer Linux command questions with a countdown timer
- Instant feedback on correct/incorrect answers
- Live leaderboard with real-time score updates
- Activity feed showing recent submissions

### Admin Dashboard
- Secure login with Firebase Authentication
- Dashboard overview with participant count, round status, and stats
- Full question management — add, edit, delete, assign to rounds
- Round control panel — start, stop, next round, set timer duration
- Real-time leaderboard view with scores and rankings
- Game state control — waiting, round active, round ended, challenge ended

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS |
| Backend | Firebase (BaaS) |
| Database | Cloud Firestore |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project

### 1. Clone the repo

```bash
git clone https://github.com/your-username/linux-workshop.git
cd linux-workshop
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Register a web app and copy the config values
3. Enable **Firestore Database** (start in test mode)
4. Enable **Authentication** → Email/Password provider
5. Create an admin user in the Authentication → Users tab

### 4. Configure environment

```bash
cp .env.example .env
```

Fill in your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Run locally

```bash
npm run dev
```

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components (Card, Button, Input, Timer, etc.)
├── pages/
│   ├── admin/         # Admin login and dashboard
│   └── participant/   # Join, Lobby, Challenge, Leaderboard pages
├── services/          # Firebase config, Firestore operations, Auth helpers
├── App.jsx            # Router setup
├── main.jsx           # Entry point
└── index.css          # Tailwind + custom styles
```

---

## 🗄️ Firestore Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Participant profiles and scores |
| `questions` | Quiz questions with round assignment |
| `submissions` | Answer submissions per user per question |
| `gameState` | Single document controlling round flow and status |

---

## 🔒 Security

- Admin routes protected by Firebase Authentication
- Firestore security rules included (`firestore.rules`)
- Environment variables for all sensitive config
- `.env` excluded from version control

---

## 🌐 Deployment

```bash
npm install -g firebase-tools
firebase login
firebase init hosting    # public dir: dist, single-page app: yes
npm run build
firebase deploy
```

Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

---

## 🎨 Design

Uses Google's brand color palette:
- 🔵 Blue `#4285F4` — Primary actions
- 🔴 Red `#EA4335` — Errors and danger
- 🟡 Yellow `#FBBC05` — Warnings
- 🟢 Green `#34A853` — Success states

Clean, minimalistic, card-based layout with a professional SaaS-style admin panel.

---

## 📄 License

MIT
