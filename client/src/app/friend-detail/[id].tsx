import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar, TextInput } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { IconButton, Menu } from 'react-native-paper';
import { ThemedText } from '@/src/components/ThemedText';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useChatStore } from '@/src/stores/chatStore';
import { useUserStore } from '@/src/stores/userStore';
import { ProfileAvatar } from '@/src/components/ProfileAvatar';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ImagePickerModal } from '@/src/components/ImagePickerModal';

export default function FriendDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { friends, removeFriend, updateFriend, updateFriendAvatar } = useFriendsStore();
    const { createChatRoom, chatRooms } = useChatStore();
    const { user } = useUserStore();
    const insets = useSafeAreaInsets();
    const friend = friends.find(f => f.id === id);
    const [menuVisible, setMenuVisible] = useState(false);

    // Editing state
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(friend?.name || '');
    const [statusMessage, setStatusMessage] = useState(friend?.statusMessage || '');
    const [imagePickerVisible, setImagePickerVisible] = useState(false);

    // Update form values when friend data changes
    useEffect(() => {
        if (friend) {
            setName(friend.name);
            setStatusMessage(friend.statusMessage);
        }
    }, [friend]);

    if (!friend || !user) {
        return (
            <View style={styles.container}>
                <ThemedText>친구를 찾을 수 없습니다</ThemedText>
            </View>
        );
    }

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

    const handleDelete = () => {
        removeFriend(id);
        router.back();
    };

    const handleSave = () => {
        updateFriend(id, {
            name: name.trim() ? name : friend.name,
            statusMessage
        });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(friend.name);
        setStatusMessage(friend.statusMessage);
        setIsEditing(false);
    };

    const handleImageSelected = async (uri: string | null) => {
        await updateFriendAvatar(id, uri);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Top navigation */}
            <View style={[styles.header, { paddingTop: insets.top || STATUSBAR_HEIGHT }]}>
                {isEditing ? (
                    // Edit mode header
                    <>
                        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                            <Ionicons name="close-outline" size={30} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <ThemedText style={styles.saveButtonText}>완료</ThemedText>
                        </TouchableOpacity>
                    </>
                ) : (
                    // View mode header
                    <>
                        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                            <Ionicons name="close-outline" size={30} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.headerRight}>
                            <Menu
                                visible={menuVisible}
                                onDismiss={() => setMenuVisible(false)}
                                anchor={
                                    <TouchableOpacity
                                        style={styles.moreButton}
                                        onPress={() => setMenuVisible(true)}
                                    >
                                        <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
                                    </TouchableOpacity>
                                }
                            >
                                <Menu.Item
                                    title="수정"
                                    leadingIcon="pencil"
                                    onPress={() => {
                                        setMenuVisible(false);
                                        setIsEditing(true);
                                    }}
                                />
                                <Menu.Item
                                    title="삭제"
                                    leadingIcon="delete"
                                    onPress={() => {
                                        setMenuVisible(false);
                                        handleDelete();
                                    }}
                                />
                            </Menu>
                        </View>
                    </>
                )}
            </View>

            {/* Main content area */}
            <View style={styles.content}>
                {/* Profile area */}
                {isEditing ? (
                    // Edit mode profile section
                    <View style={styles.editProfileSection}>
                        <ProfileAvatar
                            name={name || friend.name}
                            avatar={friend.avatar}
                            size={100}
                            isRounded={true}
                            onPress={() => setImagePickerVisible(true)}
                            showEditOverlay={true}
                        />

                        <View style={styles.editForm}>
                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>이름</ThemedText>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    placeholder="이름을 입력하세요"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>상태 메시지</ThemedText>
                                <TextInput
                                    value={statusMessage}
                                    onChangeText={setStatusMessage}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    placeholder="상태 메시지를 입력하세요"
                                />
                            </View>
                        </View>
                    </View>
                ) : (
                    // View mode profile section
                    <View style={styles.profileSection}>
                        <ProfileAvatar
                            name={friend.name}
                            avatar={friend.avatar}
                            size={100}
                            isRounded={true}
                        />
                        <View style={styles.nameContainer}>
                            <ThemedText style={styles.name}>{friend.name}</ThemedText>
                        </View>

                        {/* Show status message in view mode if available */}
                        {friend.statusMessage && (
                            <ThemedText style={styles.statusMessage}>{friend.statusMessage}</ThemedText>
                        )}
                    </View>
                )}

                {/* Bottom action buttons - only show in view mode */}
                {!isEditing && (
                    <View style={styles.bottomContainer}>
                        <View style={[styles.actionButtons, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleStartChat}
                            >
                                <View style={styles.actionIconCircle}>
                                    <IconButton icon="chat" size={26} iconColor="#FFFFFF" style={styles.chatIcon} />
                                </View>
                                <ThemedText style={styles.actionText}>1:1 채팅</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <View style={styles.actionIconCircle}>
                                    <IconButton icon="phone" size={26} iconColor="#FFFFFF" style={styles.chatIcon} />
                                </View>
                                <ThemedText style={styles.actionText}>통화하기</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <View style={styles.actionIconCircle}>
                                    <IconButton icon="video" size={26} iconColor="#FFFFFF" style={styles.chatIcon} />
                                </View>
                                <ThemedText style={styles.actionText}>페이스톡</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* Image picker modal for avatar selection */}
            <ImagePickerModal
                visible={imagePickerVisible}
                onDismiss={() => setImagePickerVisible(false)}
                onImageSelected={handleImageSelected}
                onRemoveImage={() => handleImageSelected(null)}
                hasExistingImage={!!friend.avatar}
            />
        </View>
    );
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : RNStatusBar.currentHeight || 0;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#7d8a96', // Darker to match Kakao Talk's background color
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 15,
        zIndex: 10,
    },
    closeButton: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRight: {
        flexDirection: 'row',
    },
    moreButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: '#FFFFFF',
        backgroundColor: 'transparent', // 변경 - 배경색 투명하게
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginTop: 4,
    },
    saveButton: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginRight: 4,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    profileSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '90%', // This pushes the content lower in the screen
    },
    editProfileSection: {
        paddingTop: 20,
        alignItems: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    statusMessage: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
        textAlign: 'center',
    },
    editIcon: {
        margin: 0,
    },
    editForm: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 30,
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginBottom: 8,
    },
    textInput: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        paddingVertical: 8,
        fontSize: 16,
        color: '#FFFFFF',
    },
    bottomContainer: {
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        paddingTop: 12,
        marginBottom: 23, // Move up the bottom container
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    actionButton: {
        alignItems: 'center',
    },
    actionIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 3, // Reduced margin to bring icon and text closer
    },
    chatIcon: {
        margin: 0,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
    },
});
