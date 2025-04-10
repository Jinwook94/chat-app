import { create } from 'zustand';
import { getItemSync, setItemSync } from '../services/storage';
import { Friend } from '../types/models';
import * as ImageUtils from '../utils/imageUtils';

interface FriendsState {
    friends: Friend[];
    isLoading: boolean;
    addFriend: (friend: Friend) => void;
    removeFriend: (id: string) => void;
    updateFriend: (id: string, data: Partial<Friend>) => void;
    updateFriendAvatar: (id: string, imageUri: string | null) => Promise<void>;
    setBackgroundColor: (color: string) => void;
    backgroundColor: string;
}

// 샘플 친구 데이터
const initialFriends: Friend[] = [
    {
        id: '1',
        name: '김철수',
        avatar: 'https://picsum.photos/id/1/200',
        statusMessage: '오늘도 좋은 하루!'
    },
    {
        id: '2',
        name: '이영희',
        avatar: 'https://picsum.photos/id/2/200',
        statusMessage: '열심히 공부중입니다.'
    },
    {
        id: '3',
        name: '박지성',
        avatar: 'https://picsum.photos/id/3/200',
        statusMessage: '축구는 인생이다!'
    }
];

// 저장된 친구 목록 불러오기
const savedFriends = getItemSync<Friend[]>('friends', initialFriends);
const savedBackgroundColor = getItemSync<string>('friendsBackgroundColor', '#F9FAFB');

export const useFriendsStore = create<FriendsState>((set, get) => ({
    friends: savedFriends,
    backgroundColor: savedBackgroundColor,
    isLoading: false,

    addFriend: (friend) =>
        set((state) => {
            const newFriends = [...state.friends, friend];
            setItemSync('friends', newFriends);
            return { friends: newFriends };
        }),

    removeFriend: (id) =>
        set((state) => {
            const newFriends = state.friends.filter(friend => friend.id !== id);
            setItemSync('friends', newFriends);
            return { friends: newFriends };
        }),

    updateFriend: (id, data) =>
        set((state) => {
            const newFriends = state.friends.map(friend =>
                friend.id === id ? { ...friend, ...data } : friend
            );
            setItemSync('friends', newFriends);
            return { friends: newFriends };
        }),

    updateFriendAvatar: async (id, imageUri) => {
        const { friends } = get();
        const friend = friends.find(f => f.id === id);

        if (!friend) return;

        // 이전 이미지 삭제 (로컬 파일인 경우)
        if (friend.avatar && !ImageUtils.isOnlineUrl(friend.avatar)) {
            await ImageUtils.deleteImage(friend.avatar);
        }

        let finalImageUri: string | undefined = undefined;

        if (imageUri) {
            // 새 이미지 저장
            const savedUri = await ImageUtils.saveImageToLocalStorage(imageUri, id);
            if (savedUri) {
                finalImageUri = savedUri;
            }
        }

        // 친구 정보 업데이트
        set((state) => {
            const newFriends = state.friends.map(f =>
                f.id === id ? { ...f, avatar: finalImageUri } : f
            );

            setItemSync('friends', newFriends);
            return { friends: newFriends };
        });
    },

    setBackgroundColor: (color) =>
        set(() => {
            setItemSync('friendsBackgroundColor', color);
            return { backgroundColor: color };
        })
}));
