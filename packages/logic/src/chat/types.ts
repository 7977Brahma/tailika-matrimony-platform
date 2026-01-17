export interface Chat {
    chatId: string;
    userIds: [string, string]; // Exactly 2 users
    createdAt: number; // Timestamp
    lastMessage: string;
    lastMessageAt: number; // Timestamp
    isActive: boolean;
}

export interface Message {
    messageId: string;
    chatId: string;
    senderId: string;
    receiverId: string;
    text: string;
    createdAt: number;
    isRead: boolean;
}

export const CHAT_CONSTANTS = {
    MAX_MESSAGE_LENGTH: 500,
    RATE_LIMIT_SECONDS: 2, // 1 message per 2 seconds
    MAX_MESSAGES_PER_DAY: 100,
};

export interface ChatError {
    code: string;
    message: string;
}
