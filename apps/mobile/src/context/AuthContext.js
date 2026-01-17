import React, { createContext, useState, useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch Profile Status
                try {
                    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setProfile(userDoc.data());
                    } else {
                        // Create initial user document on first login
                        const initialProfile = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            isProfileComplete: false,
                            createdAt: Date.now(),
                            updatedAt: Date.now()
                        };
                        await setDoc(doc(db, 'users', currentUser.uid), initialProfile);
                        setProfile(initialProfile);
                    }
                } catch (e) {
                    console.error("Error fetching/creating profile", e);
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const refreshProfile = async () => {
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setProfile(userDoc.data());
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, refreshProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
