import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    orderBy,
    limit,
    doc,
    updateDoc,
    getDoc,
    Timestamp,
    startAfter
} from 'firebase/firestore';
import FirebaseService from '../firebase/index';
// @ts-ignore - Assuming logic is built and available. In a real monorepo we'd assume proper linking.
import { Chat, Message, CHAT_CONSTANTS } from '@tailika/logic';

const COLLECTION_CHATS = 'chats';
const COLLECTION_MESSAGES = 'messages';

export class ChatService {
    private db = FirebaseService.getInstance().db;

    /**
     * Creates a chat between two users if mutual interest exists.
     * NOTE: Verify mutual interest logic relies on caller or security rules in this Phase.
     * This function primarily ensures we don't duplicate chats.
     */
    async createChatIfMutualInterest(userA: string, userB: string): Promise<string> {
        const sortedIds = [userA, userB].sort();

        // Check if chat exists
        const q = query(
            collection(this.db, COLLECTION_CHATS),
            where('userIds', '==', sortedIds)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return snapshot.docs[0].id; // Return existing chat ID
        }

        // Create new chat
        const chatData: Omit<Chat, 'chatId'> = {
            userIds: sortedIds as [string, string],
            createdAt: Date.now(),
            lastMessage: '',
            lastMessageAt: Date.now(),
            isActive: true
        };

        const docRef = await addDoc(collection(this.db, COLLECTION_CHATS), chatData);

        // We update the doc with its own ID for easier client handling if needed, 
        // though strict types say chatId is string.
        await updateDoc(docRef, { chatId: docRef.id });

        return docRef.id;
    }

    /**
     * Sends a text message.
     * Enforces logic-side rate limiting where possible (though Rules are primary).
     */
    async sendMessage(chatId: string, senderId: string, text: string): Promise<void> {
        if (text.length > CHAT_CONSTANTS.MAX_MESSAGE_LENGTH) {
            throw new Error(`Message exceeds ${CHAT_CONSTANTS.MAX_MESSAGE_LENGTH} characters.`);
        }

        const chatRef = doc(this.db, COLLECTION_CHATS, chatId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            throw new Error("Chat does not exist.");
        }

        const chatData = chatSnap.data() as Chat;
        if (!chatData.isActive) {
            throw new Error("Chat is not active.");
        }

        // Rate limit check (Optimistic - rules will enforce hard limit)
        // Here we could check local timestamp of last message from this user if we queried it, 
        // but for now relying on backend Rules is safer for "Phase 1 Lean".

        const messageData = {
            chatId,
            senderId,
            text,
            createdAt: serverTimestamp(), // Use server time for ordering
            isRead: false
        };

        await addDoc(collection(this.db, COLLECTION_MESSAGES), messageData);

        // Update last message
        await updateDoc(chatRef, {
            lastMessage: text,
            lastMessageAt: serverTimestamp()
        });

        // TODO: Trigger Notification Hook
    }

    async getMessages(chatId: string, limitCount = 20, lastVisible: any = null) {
        let q = query(
            collection(this.db, COLLECTION_MESSAGES),
            where('chatId', '==', chatId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ messageId: doc.id, ...doc.data() }));
    }

    async markAsRead(messageId: string) {
        const msgRef = doc(this.db, COLLECTION_MESSAGES, messageId);
        await updateDoc(msgRef, { isRead: true });
    }
}

export const chatService = new ChatService();
