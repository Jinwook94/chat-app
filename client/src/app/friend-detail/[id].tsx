import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, IconButton, TextInput, Menu } from 'react-native-paper';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useChatStore } from '@/src/stores/chatStore';
import { useUserStore } from '@/src/stores/userStore';
import { ProfileAvatar } from '@/src/components/ProfileAvatar';
import { ImagePickerModal } from '@/src/components/ImagePickerModal';

export default function FriendDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const { friends, updateFriend, removeFriend, updateFriendAvatar } = useFriendsStore();
    const { createChatRoom, chatRooms } = useChatStore();
    const { user } = useUserStore();

    const friend = friends.find(f => f.id === id);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(friend?.name || '');
    const [statusMessage, setStatusMessage] = useState(friend?.statusMessage || '');
    const [menuVisible, setMenuVisible] = useState(false);
    const [imagePickerVisible, setImagePickerVisible] = useState(false);

    if (!friend || !user) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>친구를 찾을 수 없습니다</ThemedText>
            </ThemedView>
        );
    }

    const handleSave = () => {
        updateFriend(id, {
            name,
            statusMessage
        });
        setIsEditing(false);
    };

    const handleDelete = () => {
        Alert.alert(
            "친구 삭제",
            "이 친구를 삭제하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "삭제",
                    onPress: () => {
                        removeFriend(id);
                        router.back();
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleImageSelected = async (uri: string | null) => {
        await updateFriendAvatar(id, uri);
    };

    const handleStartChat = () => {
        // 기존 1:1 채팅방이 있는지 확인
        const existingChat = chatRooms.find(room =>
            !room.isGroup && room.participants.includes(user.id) && room.participants.includes(friend.id)
        );

        if (existingChat) {
            // 기존 채팅방으로 이동
            router.push(`/chat/${existingChat.id}`);
        } else {
            // 새 채팅방 생성
            const chatId = createChatRoom({
                name: friend.name,
                participants: [user.id, friend.id],
                isGroup: false
            });
            router.push(`/chat/${chatId}`);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: isEditing ? '친구 정보 수정' : '친구 정보',
                    headerLeft: () => (
                        <IconButton icon="arrow-left" onPress={() => router.back()} />
                    ),
                    headerRight: () => (
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <IconButton
                                    icon="dots-vertical"
                                    onPress={() => setMenuVisible(true)}
                                />
                            }
                        >
                            {isEditing ? (
                                <Menu.Item
                                    title="취소"
                                    leadingIcon="close"
                                    onPress={() => {
                                        setIsEditing(false);
                                        setName(friend.name);
                                        setStatusMessage(friend.statusMessage);
                                        setMenuVisible(false);
                                    }}
                                />
                            ) : (
                                <Menu.Item
                                    title="수정"
                                    leadingIcon="pencil"
                                    onPress={() => {
                                        setIsEditing(true);
                                        setMenuVisible(false);
                                    }}
                                />
                            )}
                            <Menu.Item
                                title="삭제"
                                leadingIcon="delete"
                                onPress={() => {
                                    setMenuVisible(false);
                                    handleDelete();
                                }}
                            />
                        </Menu>
                    )
                }}
            />
            <ThemedView style={styles.container}>
                <View style={styles.profileSection}>
                    <ProfileAvatar
                        name={friend.name}
                        avatar={friend.avatar}
                        size={120}
                        style={styles.avatar}
                        onPress={isEditing ? () => setImagePickerVisible(true) : undefined}
                        showEditOverlay={isEditing}
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
                            <Button
                                mode="contained"
                                onPress={handleSave}
                                style={styles.saveButton}
                            >
                                저장
                            </Button>
                        </View>
                    ) : (
                        <View style={styles.infoContainer}>
                            <ThemedText type="title" style={styles.name}>{friend.name}</ThemedText>
                            <ThemedText style={styles.statusMessage}>{friend.statusMessage}</ThemedText>
                        </View>
                    )}
                </View>

                {!isEditing && (
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleStartChat}
                        >
                            <IconButton icon="chat" size={32} />
                            <ThemedText>채팅하기</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* 이미지 피커 모달 */}
                <ImagePickerModal
                    visible={imagePickerVisible}
                    onDismiss={() => setImagePickerVisible(false)}
                    onImageSelected={handleImageSelected}
                    onRemoveImage={() => handleImageSelected(null)}
                    hasExistingImage={!!friend.avatar}
                />
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    avatar: {
        marginBottom: 16,
    },
    infoContainer: {
        alignItems: 'center',
        width: '100%',
    },
    name: {
        fontSize: 24,
        marginBottom: 8,
    },
    statusMessage: {
        fontSize: 16,
        marginBottom: 8,
        color: '#666',
    },
    editContainer: {
        width: '100%',
    },
    input: {
        marginBottom: 12,
    },
    saveButton: {
        marginTop: 8,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    actionButton: {
        alignItems: 'center',
        marginHorizontal: 16,
    },
});
