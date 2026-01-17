import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const Card = ({ children, style, onPress }) => {
    const { theme } = useTheme();
    const Component = onPress ? TouchableOpacity : View;

    const dynamicStyles = {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
    };

    return (
        <Component style={[styles.card, dynamicStyles, style]} onPress={onPress} activeOpacity={0.7}>
            {children}
        </Component>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
    },
});
