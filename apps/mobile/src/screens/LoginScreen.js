import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { loginWithEmail, registerWithEmail } from '@tailika/services';
import { PrimaryButton } from '../components/PrimaryButton';

export default function LoginScreen({ navigation }) {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await loginWithEmail(email, password);
                if (error) throw error;
            } else {
                const { error } = await registerWithEmail(email, password);
                if (error) throw error;
            }
        } catch (e) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        Alert.alert("Google Login", "Google authentication requires OAuth configuration in Firebase Console.");
    };

    const handlePhoneLogin = () => {
        Alert.alert("Phone Login", "Phone authentication requires reCAPTCHA setup in Firebase Console.");
    };

    const styles = getStyles(theme);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: theme.colors.background }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* App Header */}
                <View style={styles.header}>
                    <Text style={[styles.appTitle, { color: theme.colors.primary }]}>Tailika</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                        Find Your Perfect Match
                    </Text>
                </View>

                {/* Login Card */}
                <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <Text style={[styles.title, { color: theme.colors.textMain }]}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: theme.colors.textMuted }]}>
                        {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
                    </Text>

                    {/* Email Input */}
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.border,
                            color: theme.colors.textMain
                        }]}
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor={theme.colors.textMuted}
                    />

                    {/* Password Input */}
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.border,
                            color: theme.colors.textMain
                        }]}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={theme.colors.textMuted}
                    />

                    {/* Email Submit Button */}
                    <PrimaryButton
                        title={loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        onPress={handleEmailAuth}
                        disabled={loading}
                        style={styles.primaryButton}
                    />

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                        <Text style={[styles.orText, { color: theme.colors.textMuted }]}>OR</Text>
                        <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                    </View>

                    {/* Social Login Buttons */}
                    <TouchableOpacity
                        style={[styles.socialButton, {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                        }]}
                        onPress={handleGoogleLogin}
                    >
                        <Text style={[styles.socialButtonText, { color: theme.colors.textMain }]}>
                            📧 Continue with Google
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.socialButton, {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border,
                            marginTop: 12
                        }]}
                        onPress={handlePhoneLogin}
                    >
                        <Text style={[styles.socialButtonText, { color: theme.colors.textMain }]}>
                            📱 Continue with Phone
                        </Text>
                    </TouchableOpacity>

                    {/* Toggle Login/Register */}
                    <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchContainer}>
                        <Text style={[styles.switchText, { color: theme.colors.textMuted }]}>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                                {isLogin ? 'Sign Up' : 'Login'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appTitle: {
        fontSize: 42,
        fontWeight: 'bold',
        letterSpacing: 1.2,
    },
    subtitle: {
        fontSize: 15,
        marginTop: 8,
    },
    card: {
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 15,
    },
    primaryButton: {
        marginTop: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    line: {
        flex: 1,
        height: 1,
    },
    orText: {
        marginHorizontal: 16,
        fontWeight: '600',
        fontSize: 13,
    },
    socialButton: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    socialButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    switchContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    switchText: {
        fontSize: 14,
    },
    linkText: {
        fontWeight: '700',
    },
});
