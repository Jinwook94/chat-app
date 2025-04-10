import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, TextInput, Portal, Modal } from 'react-native-paper';
import ColorPicker from 'react-native-wheel-color-picker';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useUserStore } from '@/src/stores/userStore';
import { useThemeStore } from '@/src/stores/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';
import { AndroidSoftInputModes, KeyboardController } from 'react-native-keyboard-controller';
import { ProfileAvatar } from '@/src/components/ProfileAvatar';
import { ImagePickerModal } from '@/src/components/ImagePickerModal';

export default function ProfileScreen() {
    const { user, updateUser, updateAvatar } = useUserStore();
    const { primaryColor, setPrimaryColor } = useThemeStore();
    const insets = useSafeAreaInsets();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [currentColor, setCurrentColor] = useState(primaryColor);
    const [imagePickerVisible, setImagePickerVisible] = useState(false);

    // Android에서 adjustResize 모드 설정
    useEffect(() => {
        if (Platform.OS === 'android') {
            KeyboardController.setInputMode(
                AndroidSoftInputModes.SOFT_INPUT_ADJUST_RESIZE
            );
            return () => {
                KeyboardController.setDefaultMode();
            };
        }
    }, []);

    if (!user) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>사용자 정보를 찾을 수 없습니다</ThemedText>
            </ThemedView>
        );
    }

    const handleSave = () => {
        updateUser({
            name: name.trim() ? name : user.name,
            statusMessage
        });
        setIsEditing(false);
    };

    const handleImageChange = async (uri: string | null) => {
        if (uri) {
            await updateAvatar(uri);
        }
    };

    const handleRemoveAvatar = async () => {
        await updateAvatar(null);
    };

    const handleColorComplete = () => {
        setPrimaryColor(currentColor);
        setColorPickerVisible(false);
    };

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.header, { marginTop: insets.top }]}>
                <ThemedText type="title">프로필</ThemedText>
            </View>

            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContent}
                extraScrollHeight={20}
            >
                <View style={styles.profileContainer}>
                    <ProfileAvatar
                        name={user.name}
                        avatar={user.avatar}
                        size={120}
                        style={styles.avatar}
                        onPress={() => setImagePickerVisible(true)}
                        showEditOverlay={true}
                        isUserProfile={true}
                    />

                    {isEditing ? (
                        <View style={styles.editContainer}>
                            <TextInput
                                label="이름"
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                            />
                            <TextInput
                                label="상태 메시지"
                                value={statusMessage}
                                onChangeText={setStatusMessage}
                                style={styles.input}
                            />

                            <View style={styles.editButtons}>
                                <Button
                                    mode="outlined"
                                    onPress={() => {
                                        setIsEditing(false);
                                        setName(user.name);
                                        setStatusMessage(user.statusMessage);
                                    }}
                                    style={[styles.editButton, { marginRight: 8 }]}
                                >
                                    취소
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleSave}
                                    style={styles.editButton}
                                >
                                    저장
                                </Button>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.infoContainer}>
                            <ThemedText type="title" style={styles.name}>{user.name}</ThemedText>
                            <ThemedText style={styles.statusMessage}>{user.statusMessage}</ThemedText>

                            <Button
                                mode="outlined"
                                onPress={() => setIsEditing(true)}
                                style={styles.editProfileButton}
                            >
                                프로필 수정
                            </Button>
                        </View>
                    )}
                </View>

                <View style={styles.settingsContainer}>
                    <ThemedText type="subtitle" style={styles.settingsTitle}>앱 설정</ThemedText>

                    <View
                        style={styles.settingItem}
                        onTouchEnd={() => setColorPickerVisible(true)}
                    >
                        <ThemedText>앱 테마 색상</ThemedText>
                        <View style={[styles.colorPreview, { backgroundColor: primaryColor }]} />
                    </View>
                </View>
            </KeyboardAwareScrollView>

            {/* 이미지 선택 모달 */}
            <ImagePickerModal
                visible={imagePickerVisible}
                onDismiss={() => setImagePickerVisible(false)}
                onImageSelected={handleImageChange}
                onRemoveImage={handleRemoveAvatar}
                hasExistingImage={!!user.avatar}
            />

            {/* 색상 선택 모달 */}
            <Portal>
                <Modal
                    visible={colorPickerVisible}
                    onDismiss={() => setColorPickerVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <ThemedView style={styles.colorPickerContainer}>
                        <ThemedText type="subtitle" style={styles.colorPickerTitle}>
                            테마 색상 선택
                        </ThemedText>
                        <View style={styles.colorPicker}>
                            <ColorPicker
                                color={currentColor}
                                onColorChangeComplete={setCurrentColor}
                                thumbSize={30}
                                sliderSize={20}
                                noSnap={true}
                                row={false}
                            />
                        </View>
                        <View style={styles.pickerButtons}>
                            <Button
                                mode="outlined"
                                onPress={() => setColorPickerVisible(false)}
                                style={styles.pickerButton}
                            >
                                취소
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleColorComplete}
                                style={styles.pickerButton}
                            >
                                확인
                            </Button>
                        </View>
                    </ThemedView>
                </Modal>
            </Portal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
    avatar: {
        marginBottom: 16,
    },
    infoContainer: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
    },
    name: {
        fontSize: 24,
        marginBottom: 8,
    },
    statusMessage: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    editProfileButton: {
        marginTop: 8,
    },
    editContainer: {
        width: '100%',
        paddingHorizontal: 16,
    },
    input: {
        marginBottom: 12,
    },
    editButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    editButton: {
        flex: 1,
    },
    settingsContainer: {
        marginTop: 32,
        paddingHorizontal: 16,
    },
    settingsTitle: {
        marginBottom: 16,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    colorPreview: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    modalContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorPickerContainer: {
        width: '80%',
        padding: 20,
        borderRadius: 10,
    },
    colorPickerTitle: {
        textAlign: 'center',
        marginBottom: 20,
    },
    colorPicker: {
        height: 300,
    },
    pickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    pickerButton: {
        width: '40%',
    },
});
