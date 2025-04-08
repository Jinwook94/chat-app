import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Badge, Divider, FAB, Portal, Dialog, TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useChatStore } from '@/src/stores/chatStore';
import { useUserStore } from '@/src/stores/userStore';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
    const { chatRooms, messages, createChatRoom } = useChatStore();
    const { user } = useUserStore();
    const { friends } = useFriendsStore();
    const insets = useSafeAreaInsets();

    const [createDialogVisible, setCreateDialogVisible] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

    // 채팅방 정렬: 마지막 메시지 시간 기준으로 내림차순
    const sortedChatRooms = [...chatRooms].sort((a, b) => {
        const aLastMsg = a.lastMessage?.createdAt || a.createdAt;
        const bLastMsg = b.lastMessage?.createdAt || b.createdAt;
        return bLastMsg - aLastMsg;
    });

    // 읽지 않은 메시지 수 계산
    const getUnreadCount = (chatId: string) => {
        if (!user) return 0;

        const chatMessages = messages[chatId] || [];
        return chatMessages.filter(
            msg => !msg.isRead && msg.senderId !== user.id
        ).length;
    };

    // 채팅방 참가자 이름 표시
    const getParticipantNames = (room: typeof chatRooms[0]) => {
        if (room.isGroup) return room.name;

        if (!user) return '';

        const otherParticipantId = room.participants.find(id => id !== user.id);
        if (!otherParticipantId) return '';

        const friend = friends.find(f => f.id === otherParticipantId);
        return friend ? friend.name : '알 수 없음';
    };

    // 마지막 메시지 형식화
    const formatLastMessage = (chatId: string) => {
        const chatMessages = messages[chatId] || [];
        if (chatMessages.length === 0) return '새 채팅방';

        const lastMsg = chatMessages[chatMessages.length - 1];

        if (lastMsg.imageUrl) return '사진';
        if (lastMsg.videoUrl) return '동영상';
        return lastMsg.text;
    };

    // 그룹 채팅방 생성
    const handleCreateGroupChat = () => {
        if (selectedFriends.length === 0 || !user) {
            setCreateDialogVisible(false);
            return;
        }

        // 채팅방 생성
        const chatId = createChatRoom({
            name: newGroupName || '새 그룹 채팅',
            participants: [user.id, ...selectedFriends],
            isGroup: true
        });

        // 초기화 및 채팅방으로 이동
        setCreateDialogVisible(false);
        setNewGroupName('');
        setSelectedFriends([]);
        router.push(`/chat/${chatId}`);
    };

    // 친구 선택 토글
    const toggleFriendSelection = (friendId: string) => {
        if (selectedFriends.includes(friendId)) {
            setSelectedFriends(prev => prev.filter(id => id !== friendId));
        } else {
            setSelectedFriends(prev => [...prev, friendId]);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={[styles.header, { marginTop: insets.top }]}>
                <ThemedText type="title">채팅</ThemedText>
            </View>

            <FlatList
                data={sortedChatRooms}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={() => <Divider />}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => router.push(`/chat/${item.id}`)}
                    >
                        <View style={styles.chatItemContent}>
                            <Avatar.Text
                                size={50}
                                label={getParticipantNames(item).substring(0, 2)}
                            />
                            <View style={styles.chatInfo}>
                                <ThemedText type="defaultSemiBold">{getParticipantNames(item)}</ThemedText>
                                <ThemedText numberOfLines={1} style={styles.lastMessage}>
                                    {formatLastMessage(item.id)}
                                </ThemedText>
                            </View>
                        </View>

                        {getUnreadCount(item.id) > 0 && (
                            <Badge style={styles.badge}>{getUnreadCount(item.id)}</Badge>
                        )}
                    </TouchableOpacity>
                )}
            />

            <FAB
                icon="plus"
                style={[styles.fab, { bottom: insets.bottom + 16 }]}
                onPress={() => setCreateDialogVisible(true)}
            />

            <Portal>
                <Dialog
                    visible={createDialogVisible}
                    onDismiss={() => setCreateDialogVisible(false)}
                    style={styles.dialog}
                >
                    <Dialog.Title>새 그룹 채팅 만들기</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="그룹 이름"
                            value={newGroupName}
                            onChangeText={setNewGroupName}
                            style={styles.input}
                        />

                        <ThemedText type="defaultSemiBold" style={styles.friendsTitle}>친구 선택</ThemedText>
                        <FlatList
                            data={friends}
                            keyExtractor={item => item.id}
                            style={styles.friendsList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.friendItem,
                                        selectedFriends.includes(item.id) && styles.selectedFriend
                                    ]}
                                    onPress={() => toggleFriendSelection(item.id)}
                                >
                                    <Avatar.Image source={{ uri: item.avatar }} size={40} />
                                    <ThemedText style={styles.friendName}>{item.name}</ThemedText>
                                </TouchableOpacity>
                            )}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setCreateDialogVisible(false)}>취소</Button>
                        <Button
                            onPress={handleCreateGroupChat}
                            disabled={selectedFriends.length === 0}
                        >
                            생성
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    chatItemContent: {
        flexDirection: 'row',
        flex: 1,
    },
    chatInfo: {
        marginLeft: 16,
        flex: 1,
    },
    lastMessage: {
        color: '#666',
        fontSize: 14,
        marginTop: 4,
    },
    badge: {
        backgroundColor: '#4F46E5',
    },
    fab: {
        position: 'absolute',
        right: 16,
    },
    dialog: {
        maxHeight: '80%',
    },
    input: {
        marginBottom: 16,
    },
    friendsTitle: {
        marginVertical: 8,
    },
    friendsList: {
        maxHeight: 300,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
    },
    selectedFriend: {
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
    },
    friendName: {
        marginLeft: 12,
    },
});
