# 💧 Drink Up - Smart Hydration Tracker & Reminder App

<div align="center">

![Drink Up Logo](public/logo.png)

### Stay Healthy, Stay Energised, Stay Hydrated! 🌊

[![Android](https://img.shields.io/badge/Platform-Android%20%7C%20Web-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/SINGH0883/Drink-Up)
[![Capacitor](https://img.shields.io/badge/Capacitor-v7.0-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Size: 5.29 MB](https://img.shields.io/badge/APK_Size-5.29_MB-success?style=for-the-badge&logo=android)](https://github.com/SINGH0883/Drink-Up/raw/main/drink-up.apk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[📥 **Download Android APK (5.29 MB)**](https://github.com/SINGH0883/Drink-Up/raw/main/drink-up.apk)

</div>

---

## 📱 About Drink Up

**Drink Up** is a smart, modern hydration companion designed to help you build and maintain healthy daily drinking habits. Built with **React 19**, **Tailwind CSS**, and **Capacitor 7**, Drink Up offers fluid animations, personalized hydration targets, intelligent reminders, expressive Indian female voice alerts, and detailed hydration analytics — packaged in an optimized **5.29 MB Android APK** featuring full HD animated background graphics.

---

## ✨ Key Features

### 💎 1. Ultra HD 3D Glassmorphism Logo & Modern UI
- **Crisp 3D Liquid Orb Icon**: Brand-new ultra-high-definition glowing liquid crystal logo across all device densities (mdpi to xxxhdpi).
- **Interactive Dual-Color Hydration Ring**: Green arc for completed intake and Red arc for remaining goal.
- **Hydration Animation Orb**: Embedded water animation with dynamic rising liquid level.
- **Micro-Bubbles & Splash Effects**: Visual and haptic feedback with floating volume increments whenever water is logged.
- **Celebration Confetti**: Dynamic celebration confetti when hitting your daily goal.

### 📊 2. Real-Time Status Bar
- **Slim Two-Tone Progress Strip**: Placed conveniently between quick log buttons and the navigation bar.
- Shows live amount consumed (with completion percentage) vs remaining milliliters at a single glance.

### 👋 3. Dynamic 3D Greeting Header
- **3D Animated Waving Hand**: Welcoming greeting with time-of-day contextual messages (*Good morning*, *Good afternoon*, *Good evening*).
- **Streak & Reminders Shortcut**: Direct access to your consecutive streak counter and alarm manager.

### 🎯 4. Personalized Smart Goal Calculator
- Calculates optimal daily intake based on:
  - Weight & Body Metrics
  - Activity Level (Sedentary, Moderate, Active)
  - Climate & Weather (Normal, Warm, Hot)
  - Biological Factors & Custom overrides

### ⚡ 5. Quick-Add & Custom Logging
- One-tap quick add buttons with custom presets (150ml, 250ml, 500ml).
- Custom volume selector for exact amounts.
- Floating **Undo Toast** to instantly revert accidental entries.

### 🗣️ 6. Natural Indian Female Voice Alerts & Reminders
- **Human-Like Expressive Voice**: Natural Indian female voice announcement (*"Hey, it's time to drink water and stay hydrated!"*) alongside custom notification chimes.
- **Interval Reminders**: Automatically schedule alerts every 30m, 1h, 1.5h, 2h, or 3h.
- **Custom Time Slots**: Set exact daily alarm times.
- **Wake & Sleep Smart Hours**: Prevents notifications during your sleep cycle.
- **Multi-Modal Alert Styles**: Voice announcements, acoustic chimes, haptic vibrations, and in-app banner toasts.

### 📈 7. Comprehensive Analytics & Streak Tracking
- **Weekly Trend Charts**: Interactive bar graphs highlighting daily goal attainment.
- **Drink Breakdown**: Chronological log with timestamps and volumes.
- **Streak Tracker**: Tracks consecutive days of hitting your goal to keep you motivated.

### 🚀 8. High Performance & Optimization
- **Targeted ABI Architecture**: ARM64 optimized for lightning-fast launch and minimal footprint.
- **ProGuard / R8 Resource Shrinking**: Minified and stripped unused resources.
- **Theme Modes**: Seamless Light and Dark mode support.
- **Units**: Supports both Metric (`ml`) and Imperial (`fl oz`).

---

## 📲 Download & Install APK

You can download the pre-built Android APK directly from this repository:

👉 **[Download `drink-up.apk` (5.29 MB)](https://github.com/SINGH0883/Drink-Up/raw/main/drink-up.apk)**

### Installation Steps on Android:
1. Download `drink-up.apk` onto your Android smartphone.
2. Tap the downloaded file to install.
3. If prompted, allow *"Install from unknown sources"*.
4. Launch **Drink Up** and start tracking your hydration!

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), CSS3 Wave Animations, Glassmorphism
- **Icons**: [Lucide React](https://lucide.dev/)
- **Cross-Platform / Native Bridge**: [Capacitor 7](https://capacitorjs.com/)
  - `@capacitor/local-notifications` - Native scheduled background alerts
  - `@capacitor/haptics` - Native tactile feedback
  - `@capacitor-community/text-to-speech` - Voice notification prompts
  - `@capacitor/status-bar` & `@capacitor/splash-screen` - Native OS styling
  - `@capacitor/preferences` - Persistent offline storage
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 📂 Project Structure

```
Drink-Up/
├── android/                   # Native Android Capacitor project
├── public/                    # Static assets & icons
│   ├── logo.png
│   ├── hydrate-bg.webp
│   └── circle-water.gif
├── src/
│   ├── components/            # UI components
│   │   ├── common/            # Header, Navigation, Modal wrappers
│   │   ├── history/           # Charts and analytics components
│   │   ├── home/              # WaterRing, QuickAddButtons, CustomAddModal
│   │   ├── onboarding/        # Goal setup wizards
│   │   ├── reminders/         # Notification schedules & time pickers
│   │   └── settings/          # Unit toggles, themes, user preferences
│   ├── hooks/                 # Custom React hooks (useHydration, useReminders)
│   ├── lib/                   # Native wrappers (audio, haptics, notifications, storage)
│   ├── pages/                 # Main app views (Home, History, Reminders, Settings)
│   ├── styles/                # Tailwind & custom CSS animations
│   ├── types/                 # TypeScript interfaces and type definitions
│   ├── App.tsx                # App root & navigation router
│   └── main.tsx               # Entry point
├── drink-up.apk               # Pre-built ready-to-install Android APK (< 5 MB)
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Made with 💙 by <b>SINGH0883</b>
</div>
