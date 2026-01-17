import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
    colors: {
        primary: '#c26779',
        primaryDark: '#a34d5f',
        primaryLight: '#d88997',
        secondary: '#4F46E5',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        error: '#DC2626',
        success: '#10B981',
        textMain: '#1E293B',
        textMuted: '#64748B',
        textLight: '#94A3B8',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    borderRadius: { sm: 8, md: 12, lg: 16, xl: 24 },
    typography: {
        caption: { fontSize: 12, color: '#64748B' }
    }
};

export const darkTheme = {
    colors: {
        primary: '#c26779',
        primaryDark: '#d88997',
        primaryLight: '#a34d5f',
        secondary: '#6366F1',
        background: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        error: '#EF4444',
        success: '#22C55E',
        textMain: '#F1F5F9',
        textMuted: '#94A3B8',
        textLight: '#64748B',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    borderRadius: { sm: 8, md: 12, lg: 16, xl: 24 },
    typography: {
        caption: { fontSize: 12, color: '#94A3B8' }
    }
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) {
                setIsDark(savedTheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDark;
            setIsDark(newTheme);
            await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const theme = isDark ? darkTheme : lightTheme;

    if (loading) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// Export default lightTheme for backwards compatibility
export const theme = lightTheme;
