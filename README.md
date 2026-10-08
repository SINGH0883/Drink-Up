# 💧 Drink Up - Smart Hydration Tracker & Reminder App

<div align="center">

![Drink Up Logo](public/logo.png)

### *Stay Healthy • Stay Energised • Stay Hydrated* 🌊

[![Platform: Android | Web](https://img.shields.io/badge/Platform-Android%20%7C%20Web-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/SINGH0883/Drink-Up)
[![Capacitor](https://img.shields.io/badge/Capacitor-v7.0-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![APK Size](https://img.shields.io/badge/APK_Size-5.29_MB-success?style=for-the-badge&logo=android)](https://github.com/SINGH0883/Drink-Up/raw/main/drink-up.apk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br />

[📥 **Download Android APK (5.29 MB)**](https://github.com/SINGH0883/Drink-Up/raw/main/drink-up.apk) • [✨ **Explore Features**](#-key-features) • [🛠️ **Developer Setup**](#-developer-guide--local-setup) • [📱 **Build APK**](#-building-the-android-apk)

</div>

---

## 📖 Table of Contents

- [About Drink Up](#-about-drink-up)
- [Key Features](#-key-features)
- [App Preview & UX Highlights](#-app-preview--ux-highlights)
- [Tech Stack](#-tech-stack)
- [Project Architecture & Structure](#-project-architecture--structure)
- [Developer Guide & Local Setup](#-developer-guide--local-setup)
- [Building the Android APK](#-building-the-android-apk)
- [APK Optimization & Size Strategy](#-apk-optimization--size-strategy)
- [Configuration & Settings](#-configuration--settings)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📱 About Drink Up

**Drink Up** is a smart, ultra-lightweight hydration companion and reminder application engineered to build and maintain healthy daily drinking habits. Crafted with modern web technologies (**React 19**, **TypeScript**, **Tailwind CSS**) and packaged natively using **Capacitor 7**, Drink Up combines smooth glassmorphic UI, rich fluid animations, dynamic progress rings, expressive Indian female voice notifications, personalized hydration algorithms, and detailed analytics into an ultra-lean **5.29 MB Android APK**.

Whether you are working at your desk, exercising, or on the move, Drink Up guarantees you never miss your daily hydration targets with smart scheduling that respects your sleep cycles.

---

## ✨ Key Features

### 💎 1. Ultra HD Glassmorphism UI & Dynamic Fluid Animations
- **3D Liquid Orb & Water Wave Animation**: Dynamic rising water level with smooth wave graphics reacting in real time as you log intake.
- **Dual-Color Hydration Progress Ring**: High-precision circular gauge with green completed arc and red remaining goal indicator.
- **Micro-Bubbles & Splash FX**: Tactile haptic feedback accompanied by floating volume increments (+150ml, +250ml, +500ml).
- **Celebration Confetti**: Full-screen particle confetti bursts upon achieving 100% of your daily hydration goal.

### 🧭 2. Interactive App Tour & Smooth Onboarding
- **Step-by-Step Guided Tour**: Visual interactive walkthrough (`AppTour`) highlighting key UI elements for new users.
- **Smart Hydration Setup Wizard**: Calculates your baseline intake requirement based on weight, activity level, and climate conditions.

### 🗣️ 3. Indian Female Voice Alerts & Multi-Modal Reminders
- **Human-Like Voice Guidance**: Natural Indian female voice prompts (*"Hey, it's time to drink water and stay hydrated!"*) paired with soothing notification chimes.
- **Flexible Interval Scheduling**: Set reminders every 30 mins, 45 mins, 1 hour, 1.5 hours, 2 hours, or 3 hours.
- **Custom Time Slots**: Pinpoint exact daily reminder times matching your personal schedule.
- **Quiet Sleep Hours**: Automatically silences reminders between your designated bedtime and wake-up times.
- **In-App Reminder Banners & Native Push Notifications**: Seamless notifications whether the app is in the foreground, background, or closed.

### ⚡ 4. Fast Quick-Log & Precision Entry
- **One-Tap Quick Log Presets**: Pre-configured buttons for standard drinking glasses (150ml, 250ml, 500ml).
- **Custom Volume Slider & Modal**: Precise volume entry for water bottles, mugs, or custom containers.
- **Instant Undo Toast**: Floating revert toast with timer to instantly cancel accidental logs.

### 📈 5. Detailed Analytics & Consecutive Streak Tracker
- **Interactive Weekly Bar Charts**: Visual breakdown of your daily consumption against target goals over the last 7 days.
- **Daily Timestamped History**: Chronological log of each drink entry with volume, time, and removal options.
- **Streak Tracker & Best Record**: Tracks consecutive target completions with motivational badge tiers to keep you committed.

### 🌓 6. Customization & Offline-First Persistence
- **Light & Dark Theme Engine**: Seamless automatic or manual switching between sleek dark and crisp light themes.
- **Unit Flexibility**: Full support for Metric (`ml`) and Imperial (`fl oz`) units.
- **100% Offline Support**: Local persistence powered by `@capacitor/preferences` — zero account registration required, keeping all your personal health data private on your device.

---

## 🎨 App Preview & UX Highlights

| Feature | Description |
| :--- | :--- |
| **🌊 Live Wave Orb** | Visualizes current progress with smooth rising water waves and completion percentages. |
| **📊 Quick Status Strip** | Two-tone progress strip showing consumed vs remaining volume at a glance. |
| **👋 Dynamic Greeting** | Time-aware greeting header (*Good Morning, Good Afternoon, Good Evening*) with streak shortcuts. |
| **⏰ Schedule Timeline** | Visual schedule showing upcoming reminder times across your active hours. |
| **🏆 Milestone Celebrations** | Canvas confetti animations rewarding daily goal achievements. |

---

## 🛠️ Tech Stack

### Frontend & Core
- **Framework**: [React 19](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) with PostCSS & CSS3 Keyframe Animations
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visual Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

### Native Mobile Bridge (Capacitor 7)
- **`@capacitor/core` & `@capacitor/android`**: Native runtime bridging web and Android layers.
- **`@capacitor/local-notifications`**: Native scheduled background push alerts.
- **`@capacitor/haptics`**: Precise tactile vibration feedback.
- **`@capacitor-community/text-to-speech`**: Voice synthesis for spoken reminder prompts.
- **`@capacitor/status-bar` & `@capacitor/splash-screen`**: Native Android system bar and startup styling.
- **`@capacitor/preferences`**: High-performance persistent key-value storage.

---

## 📂 Project Architecture & Structure

```
Drink-Up/
├── android/                         # Native Android Studio Capacitor project
│   ├── app/                         # Android application module & manifest
│   └── gradle/                      # Gradle wrapper configuration
├── public/                          # Static web assets, icons & media
│   ├── logo.png                     # High-resolution 3D liquid logo
│   ├── hydrate-bg.webp              # HD background texture
│   └── circle-water.gif             # Wave animation asset
├── src/
│   ├── components/                  # Modular React UI components
│   │   ├── common/                  # AppTour, Header, InAppNotificationBanner, Switch
│   │   ├── history/                 # StreakCard, TodayEntriesList, WeeklyBarChart
│   │   ├── home/                    # WaterRing, QuickAddButtons, CustomAddModal, UndoToast
│   │   ├── navigation/              # Bottom navigation bar & routing tabs
│   │   └── reminders/               # ScheduleTimeline & reminder managers
│   ├── hooks/                       # Custom hooks (useHydration, useNotifications, useSettings)
│   ├── lib/                         # Native wrappers (audio, haptics, notifications, storage)
│   ├── pages/                       # Screen views (HomePage, HistoryPage, RemindersPage, SettingsPage)
│   ├── styles/                      # Tailwind utilities & fluid wave animation stylesheets
│   ├── types/                       # TypeScript interfaces, types & presets
│   ├── App.tsx                      # Root application layout & state orchestrator
│   └── main.tsx                     # React application entry point
├── drink-up.apk                     # Pre-compiled standalone Android APK (5.29 MB)
├── capacitor.config.ts              # Capacitor native configuration
├── tailwind.config.js               # Tailwind design system tokens
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite bundler configuration
└── package.json                     # Project dependencies and npm scripts
```

---

## 💻 Developer Guide & Local Setup

Follow these steps to run Drink Up locally on your machine or test it in an Android emulator.

### 📋 Prerequisites
- **Node.js**: `v18.x` or higher (LTS recommended)
- **Package Manager**: `npm`, `yarn`, or `pnpm`
- **Android Studio** *(for mobile development)*: Android SDK 34+ and command-line tools installed.

### 🚀 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/SINGH0883/Drink-Up.git

# Navigate into project root
cd Drink-Up

# Install dependencies
npm install
```

### 🌐 2. Run Web Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to test the web interface.

### 📱 3. Sync & Run on Android
```bash
# Build production web bundle
npm run build

# Sync assets and plugins to the native Android project
npx cap sync android

# Open project in Android Studio
npx cap open android
```
From Android Studio, click **Run 'app'** to launch on a connected physical device or emulator.

---

## 📦 Building the Android APK

To generate a standalone APK directly from your terminal:

```bash
# 1. Build optimized web assets
npm run build

# 2. Synchronize web bundle with Android
npx cap sync android

# 3. Build APK using Gradle Wrapper (Windows PowerShell)
cd android
./gradlew assembleRelease
# Or for debug APK:
# ./gradlew assembleDebug
```

The compiled APK will be output to:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
# or
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ⚡ APK Optimization & Size Strategy

Drink Up has been optimized to maintain a lightweight footprint (**5.29 MB**):
- **Targeted ABI Architecture**: ARM64-v8a target compilation avoids bundling duplicate 32-bit native libraries.
- **R8 / ProGuard Shrinking**: Dead code elimination and tree-shaking across Java/Kotlin dependencies.
- **Asset Compression**: WebP image encoding and vector SVG icons minimize bundle bloat.
- **Modular Native Imports**: Only required Capacitor modules are included.

---

## ⚙️ Configuration & Settings

| Setting | Options | Default | Description |
| :--- | :--- | :--- | :--- |
| **Unit System** | `ml` / `fl oz` | `ml` | Preferred volume measurement unit |
| **Daily Goal** | `1000ml` - `5000ml` | `2500ml` | Configurable directly or via calculator |
| **Reminder Interval** | `30m`, `45m`, `1h`, `1.5h`, `2h`, `3h` | `1h` | Frequency of scheduled background alerts |
| **Voice Style** | `Indian Female`, `Default` | `Indian Female` | Speech voice for spoken alerts |
| **Sound Alert** | `Enabled` / `Disabled` | `Enabled` | Notification chime playback |
| **Haptic Feedback** | `Enabled` / `Disabled` | `Enabled` | Vibration pulses on logging and actions |
| **Active Hours** | Custom Wake & Sleep times | `07:00` - `22:00` | Sleep quiet period filtering |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork the Repository**
2. **Create a Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit Your Changes** (`git commit -m 'feat: add amazing new feature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Crafted with 💙 by **[SINGH0883](https://github.com/SINGH0883)**

*Don't forget to ⭐ star the repo if you find Drink Up helpful!*

</div>
