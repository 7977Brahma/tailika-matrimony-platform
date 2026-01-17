import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/Card';

export default function ProfileScreen({ navigation }) {
    const { user, profile, logout } = useAuth();
    const { theme, isDark, toggleTheme } = useTheme();

    const handleLogout = () => {
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
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.textMain }]}>Profile</Text>
                </View>

                <Card style={styles.section}>
                    <View style={styles.profileHeader}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.avatarText}>{profile?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                        </View>
                        <Text style={[styles.name, { color: theme.colors.textMain }]}>{profile?.name || 'User'}</Text>
                        <Text style={[styles.email, { color: theme.colors.textMuted }]}>{user?.email}</Text>
                    </View>
                </Card>

                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textMain }]}>Profile Information</Text>
                    <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Gender</Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textMain }]}>{profile?.gender || '-'}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Age</Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textMain }]}>{profile?.age || '-'}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Location</Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textMain }]}>{profile?.city || '-'}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderBottomColor: 'transparent' }]}>
                        <Text style={[styles.infoLabel, { color: theme.colors.textMuted }]}>Photos</Text>
                        <Text style={[styles.infoValue, { color: theme.colors.textMain }]}>{profile?.photos?.length || 0} uploaded</Text>
                    </View>
                </Card>

                <Card style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textMain }]}>Settings</Text>
                    <View style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.menuText, { color: theme.colors.textMain }]}>Dark Theme</Text>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#E2E8F0', true: theme.colors.primary }}
                            thumbColor={'#FFFFFF'}
                        />
                    </View>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.menuText, { color: theme.colors.textMain }]}>Edit Profile</Text>
                        <Text style={[styles.menuArrow, { color: theme.colors.textMuted }]}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: 'transparent' }]}>
                        <Text style={[styles.menuText, { color: theme.colors.textMain }]}>Manage Photos</Text>
                        <Text style={[styles.menuArrow, { color: theme.colors.textMuted }]}>›</Text>
                    </TouchableOpacity>
                </Card>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    header: { marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold' },

    section: { marginBottom: 16 },
    profileHeader: { alignItems: 'center', paddingVertical: 10 },
    avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
    name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    email: { fontSize: 14 },

    sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
    infoLabel: { fontSize: 14 },
    infoValue: { fontSize: 14, fontWeight: '500' },

    menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
    menuText: { fontSize: 15 },
    menuArrow: { fontSize: 24 },

    logoutButton: { marginTop: 10, marginBottom: 30, paddingVertical: 16, backgroundColor: '#FEE2E2', borderRadius: 12, alignItems: 'center' },
    logoutText: { fontSize: 16, fontWeight: '600' },
});
