import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import FirebaseService from '@tailika/services';

export default function App() {
    useEffect(() => {
        try {
            FirebaseService.getInstance({
                apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
            });
        } catch (e) {
            // Already initialized
        }
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <AppNavigator />
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
