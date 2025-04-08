import { User } from '../stores/userStore';

// 친구 모델
export interface Friend {
    id: string;
    name: string;
    avatar: string;
    statusMessage: string;
}

// 메시지 모델
export interface Message {
    id: string;
    senderId: string;
    chatId: string;
    text: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt: number;
    isRead: boolean;
}

// 채팅방 모델
export interface ChatRoom {
    id: string;
    name: string;
    participants: string[]; // 사용자 ID 목록
    lastMessage?: Message;
    isGroup: boolean;
    backgroundColor?: string;
    createdAt: number;
}
