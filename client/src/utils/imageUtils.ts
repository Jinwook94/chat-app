import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const IMAGE_DIRECTORY = `${FileSystem.documentDirectory}profileImages/`;

/**
 * 이미지 저장 디렉토리가 존재하는지 확인하고 없으면 생성합니다.
 */
export const ensureDirectoryExists = async (): Promise<void> => {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIRECTORY);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGE_DIRECTORY, { intermediates: true });
    }
};

/**
 * 갤러리에서 이미지를 선택합니다.
 * @returns 선택한 이미지의 URI 또는 실패/취소 시 null
 */
export const pickImageFromGallery = async (): Promise<string | null> => {
    try {
        // 권한 요청
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            console.warn('미디어 라이브러리 접근 권한이 거부되었습니다.');
            return null;
        }

        // 이미지 선택
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        return result.assets[0].uri;
    } catch (error) {
        console.error('이미지 선택 중 오류 발생:', error);
        return null;
    }
};

/**
 * 카메라로 사진을 찍습니다.
 * @returns 찍은 사진의 URI 또는 실패/취소 시 null
 */
export const takePhoto = async (): Promise<string | null> => {
    try {
        // 권한 요청
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            console.warn('카메라 접근 권한이 거부되었습니다.');
            return null;
        }

        // 카메라 실행
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
            return null;
        }

        return result.assets[0].uri;
    } catch (error) {
        console.error('사진 촬영 중 오류 발생:', error);
        return null;
    }
};

/**
 * 이미지를 내부 저장소에 저장합니다.
 * @param sourceUri 저장할 이미지의 URI
 * @param userId 사용자 ID (파일명 구분용)
 * @returns 저장된 이미지의 로컬 URI 또는 실패 시 null
 */
export const saveImageToLocalStorage = async (
    sourceUri: string,
    userId: string
): Promise<string | null> => {
    try {
        await ensureDirectoryExists();

        const fileName = `profile_${userId}_${Date.now()}.jpg`;
        const destinationUri = `${IMAGE_DIRECTORY}${fileName}`;

        await FileSystem.copyAsync({
            from: sourceUri,
            to: destinationUri,
        });

        return destinationUri;
    } catch (error) {
        console.error('이미지 저장 중 오류 발생:', error);
        return null;
    }
};

/**
 * 이미지를 삭제합니다.
 * @param imageUri 삭제할 이미지의 URI
 */
export const deleteImage = async (imageUri: string): Promise<boolean> => {
    try {
        // 외부 URL이면 삭제하지 않음
        if (imageUri.startsWith('http')) {
            return true;
        }

        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(imageUri);
        }
        return true;
    } catch (error) {
        console.error('이미지 삭제 중 오류 발생:', error);
        return false;
    }
};

/**
 * 기본 프로필 이미지 URL을 반환합니다.
 * @returns 기본 프로필 이미지 URL
 */
export const getDefaultProfileImage = (): string => {
    return 'https://ui-avatars.com/api/?background=random&name=User&size=200';
};

/**
 * 이름이나 텍스트를 기반으로 한 아바타 이미지 URL을 생성합니다.
 * @param name 이름 또는 텍스트
 * @returns 아바타 이미지 URL
 */
export const getNamedAvatarUrl = (name: string): string => {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?background=random&name=${encodedName}&size=200`;
};

/**
 * 이미지 URI가 온라인 URL인지 로컬 파일인지 확인합니다.
 * @param uri 이미지 URI
 * @returns 온라인 URL인 경우 true, 로컬 파일인 경우 false
 */
export const isOnlineUrl = (uri?: string): boolean => {
    if (!uri) return false;
    return uri.startsWith('http://') || uri.startsWith('https://');
};
