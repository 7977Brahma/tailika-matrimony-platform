import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/Card';

export default function DiscoveryScreen() {
    const { theme } = useTheme();
    const scaleValue = new Animated.Value(1);

    const handlePress = (type) => {
        Animated.sequence([
            Animated.timing(scaleValue, { toValue: 0.97, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleValue, { toValue: 1, tension: 100, friction: 7, useNativeDriver: true })
        ]).start();
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.colors.textMain }]}>Discover</Text>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={[styles.filterText, { color: theme.colors.primary }]}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                <Card style={styles.matchCard}>
                    <View style={styles.matchBanner}>
                        <Text style={[styles.bannerText, { color: theme.colors.primary }]}>✨ Your Chemistry got matched!</Text>
                    </View>

                    <View style={styles.profileCard}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: 'https://via.placeholder.com/400' }}
                                style={styles.profileImage}
                            />
                            <View style={styles.overlay}>
                                <View style={styles.overlayContent}>
                                    <Text style={styles.profileName}>Finding matches...</Text>
                                    <Text style={styles.profileDetails}>Complete your profile to discover</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                                <TouchableOpacity
                                    style={[styles.passButton, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}
                                    onPress={() => handlePress('pass')}
                                >
                                    <Text style={[styles.passIcon, { color: theme.colors.textMuted }]}>✕</Text>
                                </TouchableOpacity>
                            </Animated.View>
                            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                                <TouchableOpacity
                                    style={[styles.likeButton, { backgroundColor: theme.colors.primary }]}
                                    onPress={() => handlePress('like')}
                                >
                                    <Text style={styles.likeIcon}>♥</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold' },
    filterButton: { padding: 8 },
    filterText: { fontSize: 20 },

    matchCard: { marginBottom: 20 },
    matchBanner: { marginBottom: 16, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(194, 103, 121, 0.1)' },
    bannerText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
    profileCard: { alignItems: 'center' },
    imageContainer: { width: '100%', position: 'relative', marginBottom: 20 },
    profileImage: { width: '100%', height: 400, borderRadius: 16 },
    overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, padding: 20 },
    overlayContent: { alignItems: 'flex-start' },
    profileName: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
    profileDetails: { fontSize: 15, color: '#FFFFFF', opacity: 0.9 },

    actions: { flexDirection: 'row', gap: 20 },
    passButton: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
    likeButton: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
    passIcon: { fontSize: 32, fontWeight: '600' },
    likeIcon: { fontSize: 32, color: '#FFFFFF' },
});
