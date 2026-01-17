import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function MessagesScreen() {
    const { theme } = useTheme();
    const chats = [];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.textMain }]}>Messages</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.textMain }]}
                    placeholder="Search conversations..."
                    placeholderTextColor={theme.colors.textMuted}
                />
            </View>

            {chats.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>💬</Text>
                    <Text style={[styles.emptyTitle, { color: theme.colors.textMain }]}>No messages yet</Text>
                    <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>Start chatting with your matches!</Text>
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={[styles.chatItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                            <View style={styles.avatarContainer}>
                                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                                {item.online && <View style={[styles.onlineDot, { borderColor: theme.colors.surface }]} />}
                            </View>
                            <View style={styles.chatInfo}>
                                <View style={styles.chatHeader}>
                                    <Text style={[styles.chatName, { color: theme.colors.textMain }]}>{item.name}</Text>
                                    <Text style={[styles.chatTime, { color: theme.colors.textMuted }]}>{item.time}</Text>
                                </View>
                                <Text style={[styles.chatMessage, { color: theme.colors.textMuted }]} numberOfLines={1}>{item.lastMessage}</Text>
                            </View>
                            {item.unread > 0 && (
                                <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
                                    <Text style={styles.unreadText}>{item.unread}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 20, paddingBottom: 10 },
    title: { fontSize: 28, fontWeight: 'bold' },

    searchContainer: { paddingHorizontal: 20, marginBottom: 10 },
    searchInput: { height: 45, borderRadius: 22, paddingHorizontal: 20, fontSize: 14, borderWidth: 1 },

    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyIcon: { fontSize: 64, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptyText: { fontSize: 14, textAlign: 'center' },

    chatItem: { flexDirection: 'row', padding: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
    avatarContainer: { position: 'relative', marginRight: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    onlineDot: { position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2 },
    chatInfo: { flex: 1, justifyContent: 'center' },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    chatName: { fontSize: 16, fontWeight: '600' },
    chatTime: { fontSize: 12 },
    chatMessage: { fontSize: 14 },
    unreadBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },
    unreadText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
