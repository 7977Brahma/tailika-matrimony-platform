import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export const PrimaryButton = ({ title, onPress, style, disabled }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            disabled={disabled}
        >
            <Animated.View style={[styles.button, style, { transform: [{ scale: scaleValue }] }, disabled && styles.disabled]}>
                <Text style={styles.text}>{title}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabled: {
        backgroundColor: theme.colors.textMuted,
        shadowOpacity: 0,
    },
    text: {
        ...theme.typography.button,
    }
});
