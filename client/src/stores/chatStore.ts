import { create } from 'zustand';
import {getItemSync, setItem, setItemSync} from '../services/storage';
import { ChatRoom, Message } from '../types/models';
import { useUserStore } from './userStore';

interface ChatState {
    chatRooms: ChatRoom[];
    messages: Record<string, Message[]>; // 채팅방별 메시지
    isLoading: boolean;
    createChatRoom: (chatRoom: Omit<ChatRoom, 'id' | 'createdAt'>) => string;
    updateChatRoom: (id: string, data: Partial<ChatRoom>) => void;
    sendMessage: (chatId: string, text: string, imageUrl?: string, videoUrl?: string) => void;
    markMessagesAsRead: (chatId: string) => void;
    setChatBackgroundColor: (chatId: string, color: string) => void;
}

// 샘플 채팅방 데이터
const initialChatRooms: ChatRoom[] = [
    {
        id: '1',
        name: '김철수',
        participants: ['current-user', '1'],
        isGroup: false,
        createdAt: Date.now() - 24 * 60 * 60 * 1000
    },
    {
        id: '2',
        name: '친구들',
        participants: ['current-user', '1', '2', '3'],
        isGroup: true,
        createdAt: Date.now() - 48 * 60 * 60 * 1000
    }
];

// 샘플 메시지 데이터
const initialMessages: Record<string, Message[]> = {
    '1': [
        {
            id: '1-1',
            senderId: '1',
            chatId: '1',
            text: '안녕하세요!',
            createdAt: Date.now() - 22 * 60 * 60 * 1000,
            isRead: true
        },
        {
            id: '1-2',
            senderId: 'current-user',
            chatId: '1',
            text: '네, 안녕하세요!',
            createdAt: Date.now() - 21 * 60 * 60 * 1000,
            isRead: true
        }
    ],
    '2': [
        {
            id: '2-1',
            senderId: '1',
            chatId: '2',
            text: '그룹 채팅방에 오신 것을 환영합니다!',
            createdAt: Date.now() - 47 * 60 * 60 * 1000,
            isRead: true
        },
        {
            id: '2-2',
            senderId: '2',
            chatId: '2',
            text: '안녕하세요~',
            createdAt: Date.now() - 46 * 60 * 60 * 1000,
            isRead: true
        },
        {
            id: '2-3',
            senderId: '3',
            chatId: '2',
            text: '반갑습니다!',
            createdAt: Date.now() - 45 * 60 * 60 * 1000,
            isRead: true
        }
    ]
};

// 저장된 데이터 불러오기
const savedChatRooms = getItemSync<ChatRoom[]>('chatRooms', initialChatRooms);
const savedMessages = getItemSync<Record<string, Message[]>>('messages', initialMessages);

export const useChatStore = create<ChatState>((set, get) => ({
    chatRooms: savedChatRooms,
    messages: savedMessages,
    isLoading: false,
    createChatRoom: (chatRoomData) => {
        const id = Date.now().toString();
        const newChatRoom: ChatRoom = {
            ...chatRoomData,
            id,
            createdAt: Date.now()
        };

        set((state) => {
            const updatedChatRooms = [...state.chatRooms, newChatRoom];
            setItemSync('chatRooms', updatedChatRooms);

            // 새 채팅방의 메시지 배열 초기화
            const updatedMessages = {
                ...state.messages,
                [id]: []
            };
            setItemSync('messages', updatedMessages);

            return {
                chatRooms: updatedChatRooms,
                messages: updatedMessages
            };
        });

        return id;
    },
    updateChatRoom: (id, data) =>
        set((state) => {
            const updatedChatRooms = state.chatRooms.map(chatRoom =>
                chatRoom.id === id ? { ...chatRoom, ...data } : chatRoom
            );
            setItemSync('chatRooms', updatedChatRooms);
            return { chatRooms: updatedChatRooms };
        }),
    sendMessage: (chatId, text, imageUrl, videoUrl) => {
        const currentUser = useUserStore.getState().user;
        if (!currentUser) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            chatId,
            text,
            imageUrl,
            videoUrl,
            createdAt: Date.now(),
            isRead: false
        };

        set((state) => {
            // 채팅방의 메시지 목록 업데이트
            const chatMessages = state.messages[chatId] || [];
            const updatedMessages = {
                ...state.messages,
                [chatId]: [...chatMessages, newMessage]
            };

            // 채팅방의 마지막 메시지 업데이트
            const updatedChatRooms = state.chatRooms.map(chatRoom =>
                chatRoom.id === chatId ? { ...chatRoom, lastMessage: newMessage } : chatRoom
            );

            setItemSync('messages', updatedMessages);
            setItemSync('chatRooms', updatedChatRooms);

            return {
                messages: updatedMessages,
                chatRooms: updatedChatRooms
            };
        });
    },
    markMessagesAsRead: (chatId) =>
        set((state) => {
            const chatMessages = state.messages[chatId] || [];

            // 읽지 않은 메시지가 있는지 확인
            const hasUnreadMessages = chatMessages.some(message => !message.isRead);

            // 읽지 않은 메시지가 없으면 상태 업데이트하지 않음
            if (!hasUnreadMessages) return state;

            const updatedChatMessages = chatMessages.map(message => ({
                ...message,
                isRead: true
            }));

            const updatedMessages = {
                ...state.messages,
                [chatId]: updatedChatMessages
            };

            setItem('messages', updatedMessages);
            return { messages: updatedMessages };
        }),
    setChatBackgroundColor: (chatId, color) =>
        set((state) => {
            const updatedChatRooms = state.chatRooms.map(chatRoom =>
                chatRoom.id === chatId ? { ...chatRoom, backgroundColor: color } : chatRoom
            );
            setItemSync('chatRooms', updatedChatRooms);
            return { chatRooms: updatedChatRooms };
        })
}));
