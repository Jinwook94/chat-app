import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useChatStore } from '@/src/stores/chatStore';
import { useUserStore } from '@/src/stores/userStore';
import { ProfileDetailView } from '@/src/components/ProfileDetailView';

export default function FriendDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { friends, removeFriend, updateFriend, updateFriendAvatar } = useFriendsStore();
    const { createChatRoom, chatRooms } = useChatStore();
    const { user } = useUserStore();
    const friend = friends.find(f => f.id === id);

    const [menuVisible, setMenuVisible] = useState(false);
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
            <View>
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
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ProfileDetailView
                name={friend.name}
                avatar={friend.avatar}
                statusMessage={friend.statusMessage}
                isMyProfile={false}
                isEditing={isEditing}
                menuVisible={menuVisible}
                setMenuVisible={setMenuVisible}
                onClose={() => router.back()}
                onEditPress={() => setIsEditing(true)}
                onDeletePress={handleDelete}
                onStartChat={handleStartChat}
                editName={name}
                editStatusMessage={statusMessage}
                onChangeName={setName}
                onChangeStatusMessage={setStatusMessage}
                onSave={handleSave}
                onCancel={handleCancel}
                imagePickerVisible={imagePickerVisible}
                setImagePickerVisible={setImagePickerVisible}
                onImageSelected={handleImageSelected}
                hasExistingImage={!!friend.avatar}
            />
        </>
    );
}
