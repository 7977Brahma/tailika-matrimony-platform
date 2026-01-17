import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components/Card';

export default function MatchesScreen() {
    const { theme } = useTheme();
    const matches = [];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textMain }]}>Matches</Text>
            </View>

            {matches.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>💕</Text>
                    <Text style={[styles.emptyTitle, { color: theme.colors.textMain }]}>No matches yet</Text>
                    <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Keep swiping to find your perfect match!</Text>
                </View>
            ) : (
                <FlatList
                    data={matches}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Card style={styles.matchCard}>
                            <Image source={{ uri: item.photo }} style={styles.matchPhoto} />
                            <View style={styles.matchInfo}>
                                <Text style={[styles.matchName, { color: theme.colors.textMain }]}>{item.name}</Text>
                                <Text style={[styles.matchDetails, { color: theme.colors.textMuted }]}>{item.age} • {item.location}</Text>
                            </View>
                            <TouchableOpacity style={[styles.chatButton, { backgroundColor: theme.colors.primary }]}>
                                <Text style={styles.chatButtonText}>Chat</Text>
                            </TouchableOpacity>
                        </Card>
                    )}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingBottom: 10 },
    title: { fontSize: 28, fontWeight: 'bold' },

    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptyText: { fontSize: 14, textAlign: 'center' },

    list: { padding: 20, paddingTop: 10 },
    matchCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 12 },
    matchPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
    matchInfo: { flex: 1 },
    matchName: { fontSize: 16, fontWeight: '600' },
    matchDetails: { fontSize: 14, marginTop: 2 },
    chatButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 },
    chatButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
