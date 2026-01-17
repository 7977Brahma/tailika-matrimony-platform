import {
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    UserCredential,
    PhoneAuthProvider
} from 'firebase/auth';
import FirebaseService from './index';

export const googleProvider = new GoogleAuthProvider();

export const getPhoneProvider = () => {
    const auth = FirebaseService.getInstance().auth;
    return new PhoneAuthProvider(auth);
};

export const loginWithEmail = async (email: string, password: string): Promise<{ user: any, error: any }> => {
    const auth = FirebaseService.getInstance().auth;
    try {
        const result: UserCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error) {
        return { user: null, error };
    }
};

export const registerWithEmail = async (email: string, password: string): Promise<{ user: any, error: any }> => {
    const auth = FirebaseService.getInstance().auth;
    try {
        const result: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error) {
        return { user: null, error };
    }
};

export const logout = async (): Promise<void> => {
    const auth = FirebaseService.getInstance().auth;
    return firebaseSignOut(auth);
}
