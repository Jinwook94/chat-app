import { create } from 'zustand';
import { getItemSync, setItemSync } from '../services/storage';
import * as ImageUtils from '../utils/imageUtils';

export interface User {
    id: string;
    name: string;
    avatar?: string;
    statusMessage: string;
}

interface UserState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User) => void;
    updateUser: (data: Partial<User>) => void;
    clearUser: () => void;
    updateAvatar: (imageUri: string | null) => Promise<void>;
}

// 샘플 사용자
const defaultUser: User = {
    id: 'current-user',
    name: '나',
    avatar: ImageUtils.getDefaultProfileImage(),
    statusMessage: '상태 메시지를 입력해주세요',
};

// 로컬 스토리지에서 사용자 정보 불러오기
const savedUser = getItemSync<User | null>('user', defaultUser);

export const useUserStore = create<UserState>((set, get) => ({
    user: savedUser,
    isLoading: false,

    setUser: (user) => {
        setItemSync('user', user);
        set({ user });
    },

    updateUser: (data) =>
        set((state) => {
            if (!state.user) return state;

            const updatedUser = { ...state.user, ...data };
            setItemSync('user', updatedUser);
            return { user: updatedUser };
        }),

    updateAvatar: async (imageUri) => {
        const { user } = get();
        if (!user) return;

        // 이전 이미지 삭제 (로컬 파일인 경우)
        if (user.avatar && !ImageUtils.isOnlineUrl(user.avatar)) {
            await ImageUtils.deleteImage(user.avatar);
        }

        let finalImageUri: string | undefined = undefined;

        if (imageUri) {
            // 새 이미지 저장
            const savedUri = await ImageUtils.saveImageToLocalStorage(imageUri, user.id);
            if (savedUri) {
                finalImageUri = savedUri;
            }
        }

        // 사용자 정보 업데이트
        set((state) => {
            if (!state.user) return state;

            const updatedUser = {
                ...state.user,
                avatar: finalImageUri
            };

            setItemSync('user', updatedUser);
            return { user: updatedUser };
        });
    },

    clearUser: () => {
        set({ user: null });
    },
}));
