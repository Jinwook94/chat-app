import { create } from 'zustand';
import { getItemSync, setItemSync } from '../services/storage';

interface ThemeState {
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
}

const defaultTheme = {
    primaryColor: '#4F46E5'
};

const savedTheme = getItemSync<{ primaryColor: string }>('theme', defaultTheme);

export const useThemeStore = create<ThemeState>((set) => ({
    primaryColor: savedTheme.primaryColor,
    setPrimaryColor: (color) =>
        set(() => {
            const updatedTheme = { primaryColor: color };
            setItemSync('theme', updatedTheme);
            return updatedTheme;
        })
}));
