import { MMKV } from 'react-native-mmkv';

// MMKV 인스턴스 생성
export const storage = new MMKV();

// 데이터 저장 헬퍼 함수
export const setItem = (key: string, value: any): void => {
    try {
        const jsonValue = JSON.stringify(value);
        storage.set(key, jsonValue);
    } catch (error) {
        console.error('Error saving data', error);
    }
};

// 데이터 불러오기 헬퍼 함수
export const getItem = <T>(key: string): T | null => {
    try {
        const jsonValue = storage.getString(key);
        return jsonValue ? JSON.parse(jsonValue) as T : null;
    } catch (error) {
        console.error('Error reading data', error);
        return null;
    }
};

// 데이터 삭제 헬퍼 함수
export const removeItem = (key: string): void => {
    try {
        storage.delete(key);
    } catch (error) {
        console.error('Error deleting data', error);
    }
};
