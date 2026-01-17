import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, profile } = useAuth();
    const [showSplash, setShowSplash] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
            if (!hasSeenOnboarding) {
                setShowOnboarding(true);
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
        }
    };

    const handleOnboardingComplete = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            setShowOnboarding(false);
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    };

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    if (showOnboarding) {
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                    />
                ) : (
                    !profile || !profile.isProfileComplete ? (
                        <Stack.Screen
                            name="ProfileSetup"
                            component={ProfileSetupScreen}
                            options={{ headerShown: true, title: 'Complete Your Profile' }}
                        />
                    ) : (
                        <Stack.Screen
                            name="MainApp"
                            component={TabNavigator}
                        />
                    )
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
