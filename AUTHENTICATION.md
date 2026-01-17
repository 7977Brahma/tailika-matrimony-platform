# Authentication Implementation Guide

## Overview
This document outlines the authentication flows implemented for the Tailika Matrimony Platform.

---

## 1. Email/Password Authentication ✅

**Status**: **Fully Implemented**

**Client Implementation** (`LoginScreen.js`):
- Uses `loginWithEmail()` and `registerWithEmail()` from `@tailika/services`
- Basic email/password form with toggle between login/signup

**Backend**: 
- Firebase Authentication handles this natively
- No additional Cloud Functions required

---

## 2. Google OAuth Authentication ⚠️

**Status**: **UI Ready, Requires Configuration**

**Implementation** (`LoginScreen.js`):
```javascript
import * as Google from 'expo-auth-session/providers/google';

const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID',
});
```

**Required Steps**:
1. **Firebase Console**:
   - Enable Google Sign-In in Authentication → Sign-in methods
   
2. **Google Cloud Console**:
   - Create OAuth 2.0 credentials for:
     - Web Client (for Expo)
     - Android Client (SHA-1 fingerprint required)
     - iOS Client (if targeting iOS)

3. **Configuration**:
   - Add Client IDs to `LoginScreen.js`
   - For Android: Generate SHA-1 using:
     ```bash
     cd android && ./gradlew signingReport
     ```

4. **Testing**:
   - On device: Works with real credentials
   - On Expo Go: Limited (requires custom dev client)

**Current State**: Placeholder IDs in place, will work once configured.

---

## 3. Phone OTP Authentication ⚠️

**Status**: **UI Placeholder, Backend Ready**

**Requirements**:
- Firebase Phone Authentication
- reCAPTCHA verification (required by Firebase)
- Premium Firebase plan (phone auth has free tier limits)

**Implementation Path**:

### Option A: Firebase Phone Auth (Recommended)
```javascript
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

// In component:
const [verificationId, setVerificationId] = useState(null);

// Send OTP
const sendOTP = async (phoneNumber) => {
  const phoneProvider = new PhoneAuthProvider(auth);
  const verId = await phoneProvider.verifyPhoneNumber(
    phoneNumber,
    recaptchaVerifier.current
  );
  setVerificationId(verId);
};

// Verify OTP
const verifyOTP = async (code) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  await signInWithCredential(auth, credential);
};
```

### Steps to Enable:
1. **Firebase Console**:
   - Enable Phone Authentication in Firebase Console
   - Add test phone numbers (for development)

2. **Update `LoginScreen.js`**:
   - Replace placeholder with actual implementation
   - Add reCAPTCHA modal
   - Add phone input + OTP verification UI

3. **Security Rules**:
   - Already configured to accept phone auth

---

## Profile Completion Gate ✅

**Status**: **Fully Implemented**

**Logic** (`AppNavigator.js`):
```javascript
{!user ? (
  <LoginScreen />
) : (
  !profile || !profile.isProfileComplete ? (
    <ProfileSetupScreen />
  ) : (
    <HomeScreen />
  )
)}
```

**Enforcement**:
1. User signs up → `isProfileComplete: false` in Firestore
2. Forced to `ProfileSetupScreen` until:
   - All required fields filled
   - Minimum 4 photos uploaded
   - Gender selected
3. Upon completion → `isProfileComplete: true` → Access granted

**Validation** (`ProfileSetupScreen.js`):
- Client-side: React state + `validateImageSet()` from `@tailika/logic`
- Server-side: Firestore rules prevent incomplete profile usage

---

## Image Compression ✅

**Status**: **Fully Implemented**

**Configuration** (`imageProcessing.js`):
- **Format**: WebP
- **Max Width**: 1080px
- **Quality**: 75%
- **Hash**: MD5 (for duplicate detection)

**Usage**:
```javascript
import { processMobileImage } from '../utils/imageProcessing';

const processed = await processMobileImage(uri);
// Returns: { uri, width, height, size, hash, type: 'image/webp' }
```

---

## Next Steps

### Immediate Priority:
1. **Configure Google OAuth** (if needed):
   - Generate Client IDs
   - Update `LoginScreen.js`

2. **Implement Phone Auth** (if required):
   - Add reCAPTCHA modal
   - Create OTP flow UI
   - Test with Firebase

### Future Enhancements:
- Social login (Facebook, Apple) - if needed
- Biometric authentication (Face ID, Fingerprint)
- Multi-factor authentication (2FA)

---

## Testing Checklist

- [x] Email/Password login works
- [x] Profile completion gate blocks unauthenticated users
- [x] Minimum 4 photos enforced
- [x] Image compression to WebP @ 1080px, 75%
- [ ] Google OAuth flow (pending credentials)
- [ ] Phone OTP flow (pending implementation)
