import { create } from 'zustand';
import { getItemSync, setItemSync } from '../services/storage';

export interface User {
    id: string;
    name: string;
    avatar: string;
    statusMessage: string;
}

interface UserState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User) => void;
    updateUser: (data: Partial<User>) => void;
    clearUser: () => void;
}

// 샘플 사용자
const defaultUser: User = {
    id: 'current-user',
    name: '나',
    avatar: 'https://picsum.photos/id/100/200',
    statusMessage: '상태 메시지를 입력해주세요',
};

// 로컬 스토리지에서 사용자 정보 불러오기
const savedUser = getItemSync<User | null>('user', defaultUser);

export const useUserStore = create<UserState>((set) => ({
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
    clearUser: () => {
        set({ user: null });
    },
}));
