import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    // @ts-ignore - React Native specific
    getReactNativePersistence,
    Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, Messaging } from 'firebase/messaging';

// Type definition for config
export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

class FirebaseService {
    private static instance: FirebaseService;
    public app: FirebaseApp;
    public auth: Auth;
    public db: Firestore;
    public storage: FirebaseStorage;
    public messaging: Messaging | null = null;

    private constructor(config: FirebaseConfig, persistence?: any) {
        // Cast config to FirebaseOptions for compatibility
        const firebaseConfig = config as FirebaseOptions;

        if (!getApps().length) {
            this.app = initializeApp(firebaseConfig);
        } else {
            this.app = getApp();
        }

        if (persistence) {
            this.auth = initializeAuth(this.app, { persistence: getReactNativePersistence(persistence) });
        } else {
            this.auth = getAuth(this.app);
        }

        this.db = getFirestore(this.app);
        this.storage = getStorage(this.app);

        try {
            this.messaging = getMessaging(this.app);
        } catch (e) {
            console.warn("Firebase Messaging not initialized:", e);
        }
    }

    public static getInstance(config?: FirebaseConfig, persistence?: any): FirebaseService {
        if (!FirebaseService.instance && config) {
            FirebaseService.instance = new FirebaseService(config, persistence);
        }
        if (!FirebaseService.instance) {
            // In a real app we might throw, but here we might rely on init calling strictly first
            // or return checks. For strict TS we throw or allow null but throwing is safer for usage.
            throw new Error("FirebaseService must be initialized with config first.");
        }
        return FirebaseService.instance;
    }
}

export default FirebaseService;
