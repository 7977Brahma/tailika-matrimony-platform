# Tailika Matrimony Platform

Production-ready matrimonial mobile application built with modern technologies and best practices.

## Tech Stack

**Frontend**
- React Native (Expo managed workflow)
- React Navigation (bottom tabs + stack)
- Context API for state management
- AsyncStorage for persistence
- Theme support (light + dark modes)

**Backend**
- Firebase Authentication (Email/Password, Google, Phone OTP)
- Cloud Firestore (NoSQL database)
- Firestore Security Rules (server-side validation)

**Media**
- Cloudinary (unsigned client-side uploads)
- Image processing and optimization
- Profile photo management (min 4, max 8 photos)

## Project Structure

```
tailika-matrimony-platform/
├── apps/
│   ├── mobile/          # React Native Expo app
│   └── web/             # Web application (secondary)
├── packages/
│   ├── ui/              # Shared UI components
│   ├── logic/           # Business logic (compatibility engine, validation)
│   └── services/        # Firebase services
├── firebase/
│   ├── rules/           # Firestore security rules
│   └── functions/       # Cloud Functions (optional)
└── docs/                # Documentation
```

## Key Features

- **Strict Profile Completion Gating**: Users must complete profile with minimum 4 photos before accessing main app
- **Multi-Auth Support**: Email/Password, Google Sign-In, Phone OTP (placeholders for Facebook/Instagram)
- **Shaadi-Style UI**: Matrimonial-focused design with calm, elegant aesthetics
- **Theme System**: Light and dark mode support with AsyncStorage persistence
- **Navigation Guards**: Auth and profile completion checks at multiple levels
- **Media Pipeline**: Client-side Cloudinary uploads with validation and duplicate detection

## Setup

**Prerequisites**:
- Node.js 18+
- Expo CLI
- Firebase project with Auth and Firestore enabled
- Cloudinary account with unsigned upload preset

**Installation**:
```bash
npm install
cd apps/mobile && npm install
```

**Environment Configuration**:
```bash
# apps/mobile/.env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Run Mobile App**:
```bash
cd apps/mobile
npm start
```

## Security & Rules

- Firestore rules enforce profile completion (min 4 photos)
- Multi-layer validation: UI, navigation, server-side rules
- No user can bypass profile gates
- All auth methods create user documents with `isProfileComplete: false`

## Authentication Flow

```
Splash (2.5s) → Onboarding (3 slides) → Login/Register → Auth Check → Profile Complete?
                                                                            ├─ NO → Profile Setup (LOCKED)
                                                                            └─ YES → Main App (UNLOCKED)
```

## Profile Completion Requirements

**Mandatory Fields**:
- Name, Gender, Age, City, Religion, Mother Tongue, Marital Status, Phone Number

**Photo Requirements**:
- Minimum: 4 photos (enforced)
- Maximum: 8 photos
- Profile locked until ≥4 photos uploaded

## License

Private - Not for public distribution

## Contact

Built with ❤️ for modern matrimonial matchmaking
