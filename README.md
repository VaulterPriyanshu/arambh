# Arambh 🌱

### AI-Powered Mental Wellness & Support App

**Arambh** is a mobile application designed to help students and young individuals understand, manage, and improve their mental well-being. The app combines AI-powered support, personalized wellness activities, progress tracking, and access to professional counselors in one platform.

> **Arambh — A small step towards a healthier mind.**

---

## 🚀 Features

### 🤖 AI Mental Wellness Assistant

* AI-powered conversational support
* Helps users express their thoughts and concerns
* Provides personalized guidance and wellness suggestions
* Available whenever the user needs support

### 🧠 Mental Wellness Assessment

* Simple assessments to understand the user's current emotional state
* Identifies areas such as stress, anxiety, stage fear, and other common challenges
* Provides an indicative wellness level based on responses

### 🧘 Personalized Wellness Activities

* Meditation and breathing exercises
* Relaxation activities
* Focus and mindfulness exercises
* Personalized recommendations based on assessment results

### 📊 Progress Tracking

* Track wellness activities and progress
* Monitor consistency and improvement
* Visualize activity history

### 👨‍⚕️ Professional Counselor Support

* Option to connect with professional counselors
* One-to-one support for users who need additional assistance

### 🔐 Privacy & Security

* Secure user authentication
* Protected user data
* Role-based access where required
* Sensitive wellness information is handled with privacy in mind

---

## 🛠️ Tech Stack

### Frontend

* React Native / Expo
* JavaScript
* Tailwind CSS / Native styling

### Backend

* Node.js
* Express.js

### Database & Authentication

* Supabase
* Supabase Authentication
* PostgreSQL

### AI

* AI-powered chatbot/API
* Prompt-based conversational assistance

### Development Tools

* Git & GitHub
* VS Code
* Figma
* Expo

---

## 🏗️ Application Architecture

```text
User
  │
  ▼
Mobile Application
  │
  ├── Authentication
  ├── Mental Wellness Assessment
  ├── AI Chatbot
  ├── Wellness Activities
  ├── Progress Tracking
  └── Counselor Support
          │
          ▼
      Backend API
          │
     ┌────┴────┐
     ▼         ▼
  Supabase     AI API
     │
     ▼
 PostgreSQL Database
```

---

## 📱 Core Modules

```text
Arambh
│
├── Authentication
│   ├── Login
│   ├── Signup
│   └── Profile
│
├── Mental Wellness
│   ├── Assessment
│   ├── Stress Level
│   └── Personalized Suggestions
│
├── AI Assistant
│   ├── Chat
│   └── Wellness Guidance
│
├── Activities
│   ├── Meditation
│   ├── Breathing
│   └── Exercises
│
├── Progress
│   └── Activity Tracking
│
└── Counselor Support
    └── One-to-One Sessions
```

---

## 🔑 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/arambh.git
```

### 2. Navigate to the project

```bash
cd arambh
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
AI_API_KEY=your_ai_api_key
```

> Never commit your `.env` file or expose private API keys on GitHub.

### 5. Start the application

For an Expo-based React Native project:

```bash
npx expo start
```

Then scan the QR code using Expo Go or run the application on an emulator.

---

## 🔒 Security

Arambh is designed with privacy and security as important considerations.

* Authentication through Supabase
* Database access controlled using Row Level Security (RLS)
* Environment variables for sensitive configuration
* API keys are not hardcoded in the application
* Input validation
* Restricted access to user-specific data
* Secure communication with backend services

---

## ⚠️ Disclaimer

Arambh is a **mental wellness support application** and is not a replacement for a qualified mental-health professional, medical diagnosis, or emergency services.

AI-generated responses are intended for general support and wellness guidance and should not be considered medical advice.

If someone is in immediate danger or experiencing a mental-health emergency, they should contact appropriate local emergency services or a qualified professional.

---

## 🎯 Future Scope

* Advanced personalization using ML
* Improved wellness recommendation engine
* Voice-based AI assistant
* Multilingual support
* Counselor appointment scheduling
* Real-time counselor communication
* More detailed wellness analytics
* Wearable-device integration
* Improved crisis-support workflows

---

## 👥 Team

**Team Arambh**

Developed as a student project with the goal of using technology and AI to make mental-wellness support more accessible and approachable.

---

## 🌱 Vision

> **"Arambh" means a beginning.**

Our vision is to encourage users to take the first step toward understanding their mental well-being and building healthier habits.

---

## 📄 License

This project is developed for educational and project purposes.
