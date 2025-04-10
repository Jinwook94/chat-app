import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Button, IconButton, TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';
import { AndroidSoftInputModes, KeyboardController } from 'react-native-keyboard-controller';
import { ProfileAvatar } from '@/src/components/ProfileAvatar';
import { ImagePickerModal } from '@/src/components/ImagePickerModal';
import { getNamedAvatarUrl } from '@/src/utils/imageUtils';

export default function FriendAddScreen() {
    const { addFriend } = useFriendsStore();
    const [name, setName] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [avatar, setAvatar] = useState<string | undefined>(undefined);
    const [tempImageUri, setTempImageUri] = useState<string | undefined>(undefined);
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

    const handleAddFriend = () => {
        if (name.trim() === '') return;

        // 기본 아바타가 없으면 이름 기반 아바타 생성
        const finalAvatar = tempImageUri || avatar || (name.trim() ? getNamedAvatarUrl(name) : undefined);

        addFriend({
            id: Date.now().toString(),
            name,
            statusMessage,
            avatar: finalAvatar
        });

        router.back();
    };

    const handleImageSelected = (uri: string | null) => {
        setTempImageUri(uri || undefined);
    };

    const handleRemoveImage = () => {
        setTempImageUri(undefined);
        setAvatar(undefined);
    };

    const displayedAvatar = tempImageUri || avatar;

    return (
        <>
            <Stack.Screen
                options={{
                    title: '친구 추가',
                    headerLeft: () => (
                        <IconButton
                            icon="close"
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <ThemedView style={styles.container}>
                <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.avatarContainer}>
                        <ProfileAvatar
                            name={name || 'User'}
                            avatar={displayedAvatar}
                            size={100}
                            onPress={() => setImagePickerVisible(true)}
                            showEditOverlay={true}
                        />
                    </View>

                    <TextInput
                        label="이름"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        autoFocus
                    />

                    <TextInput
                        label="상태 메시지"
                        value={statusMessage}
                        onChangeText={setStatusMessage}
                        style={styles.input}
                    />

                    <Button
                        mode="contained"
                        onPress={handleAddFriend}
                        style={styles.button}
                        disabled={name.trim() === ''}
                    >
                        친구 추가
                    </Button>
                </KeyboardAwareScrollView>

                {/* 이미지 피커 모달 */}
                <ImagePickerModal
                    visible={imagePickerVisible}
                    onDismiss={() => setImagePickerVisible(false)}
                    onImageSelected={handleImageSelected}
                    onRemoveImage={handleRemoveImage}
                    hasExistingImage={!!displayedAvatar}
                />
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        flexGrow: 1,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 24,
        position: 'relative',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
    }
});
