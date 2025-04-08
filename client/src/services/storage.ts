import AsyncStorage from '@react-native-async-storage/async-storage';

// 데이터 저장 헬퍼 함수
export const setItem = async (key: string, value: any): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error('Error saving data', error);
    }
};

// 데이터 불러오기 헬퍼 함수
export const getItem = async <T>(key: string): Promise<T | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue ? JSON.parse(jsonValue) as T : null;
    } catch (error) {
        console.error('Error reading data', error);
        return null;
    }
};

// 데이터 삭제 헬퍼 함수
export const removeItem = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error deleting data', error);
    }
};

// 동기식으로 데이터 처리를 위한 임시 캐시
const memoryCache: Record<string, any> = {};

// 메모리 캐시에서 값 가져오기 (동기식)
export const getItemSync = <T>(key: string, initialValue: T): T => {
    if (memoryCache[key] !== undefined) {
        return memoryCache[key] as T;
    }
    // 초기값 반환 및 캐시에 저장
    memoryCache[key] = initialValue;
    // 비동기로 저장된 값이 있으면 나중에 로드
    AsyncStorage.getItem(key).then(value => {
        if (value) {
            memoryCache[key] = JSON.parse(value);
        }
    }).catch(err => console.error(err));

    return initialValue;
};

// 메모리 캐시에 값 저장 (동기식)
export const setItemSync = <T>(key: string, value: T): void => {
    memoryCache[key] = value;
    // 비동기로 실제 저장
    AsyncStorage.setItem(key, JSON.stringify(value))
        .catch(err => console.error(err));
};

// 메모리 캐시에서 값 삭제 (동기식)
export const removeItemSync = (key: string): void => {
    delete memoryCache[key];
    // 비동기로 실제 삭제
    AsyncStorage.removeItem(key)
        .catch(err => console.error(err));
};
