import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { theme } from '../theme';

export default function HomeScreen({ navigation }) {
    const { user, profile, logout } = useAuth();

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await logout();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to logout');
                    }
                },
            },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.name}>{profile?.name || 'User'}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Your Profile</Text>
                <View style={styles.profileInfo}>
                    <Text style={styles.infoText}>Gender: {profile?.gender}</Text>
                    <Text style={styles.infoText}>Age: {profile?.age}</Text>
                    <Text style={styles.infoText}>Location: {profile?.location?.city}</Text>
                    <Text style={styles.infoText}>Photos: {profile?.photos?.length || 0}</Text>
                </View>
            </Card>

            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Discovery</Text>
                <Text style={styles.comingSoon}>Match discovery coming soon...</Text>
            </Card>

            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Messages</Text>
                <Text style={styles.comingSoon}>Chat feature coming soon...</Text>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 16,
        color: theme.colors.textMuted,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    logoutButton: {
        padding: 8,
    },
    logoutText: {
        color: theme.colors.error,
        fontWeight: '600',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textMain,
        marginBottom: 12,
    },
    profileInfo: {
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.textMuted,
    },
    comingSoon: {
        fontSize: 14,
        color: theme.colors.textLight,
        fontStyle: 'italic',
    },
});
