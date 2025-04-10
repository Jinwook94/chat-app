import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, StatusBar } from 'react-native';
import { Divider, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useChatStore } from '@/src/stores/chatStore';
import { useUserStore } from '@/src/stores/userStore';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileAvatar } from '@/src/components/ProfileAvatar';

export default function ChatScreen() {
    const { chatRooms, messages } = useChatStore();
    const { user } = useUserStore();
    const { friends } = useFriendsStore();
    const insets = useSafeAreaInsets();

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

    // 시간 포맷팅
    const formatTime = (timestamp: number) => {
        const now = new Date();
        const msgDate = new Date(timestamp);

        // 오늘 메시지인 경우 시간만 표시
        if (msgDate.getDate() === now.getDate() &&
            msgDate.getMonth() === now.getMonth() &&
            msgDate.getFullYear() === now.getFullYear()) {

            const hours = msgDate.getHours();
            const minutes = msgDate.getMinutes();
            const ampm = hours >= 12 ? '오후' : '오전';
            const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

            return `${ampm} ${formattedHours}:${formattedMinutes}`;
        }

        // 어제 메시지인 경우
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (msgDate.getDate() === yesterday.getDate() &&
            msgDate.getMonth() === yesterday.getMonth() &&
            msgDate.getFullYear() === yesterday.getFullYear()) {
            return '어제';
        }

        // 그 외의 경우 날짜 표시
        return `${msgDate.getMonth() + 1}월 ${msgDate.getDate()}일`;
    };

    // 채팅방 프로필 또는 친구의 아바타 가져오기
    const getChatAvatar = (room: typeof chatRooms[0]) => {
        if (!user) return undefined;

        if (room.isGroup) {
            return undefined; // 그룹은 아바타 없음
        }

        const otherParticipantId = room.participants.find(id => id !== user.id);
        if (!otherParticipantId) return undefined;

        const friend = friends.find(f => f.id === otherParticipantId);
        return friend?.avatar;
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* 헤더 */}
            <View style={[styles.header, { marginTop: insets.top }]}>
                <ThemedText type="title" style={styles.title}>채팅</ThemedText>
                <View style={styles.headerIcons}>
                    <IconButton
                        icon="magnify"
                        size={24}
                        onPress={() => {}}
                        style={styles.iconButton}
                    />
                    <IconButton
                        icon="plus"
                        size={24}
                        onPress={() => {}}
                        style={styles.iconButton}
                    />
                    <IconButton
                        icon="cog"
                        size={24}
                        onPress={() => {}}
                        style={styles.iconButton}
                    />
                </View>
            </View>

            <FlatList
                data={sortedChatRooms}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={() => <Divider style={styles.divider} />}
                renderItem={({ item }) => {
                    const chatName = getParticipantNames(item);
                    const lastMessage = formatLastMessage(item.id);
                    const unreadCount = getUnreadCount(item.id);
                    const lastTime = formatTime(item.lastMessage?.createdAt || item.createdAt);
                    const avatar = getChatAvatar(item);

                    return (
                        <TouchableOpacity
                            style={styles.chatItem}
                            onPress={() => router.push(`/chat/${item.id}`)}
                        >
                            <View style={styles.chatItemLeft}>
                                <ProfileAvatar
                                    name={chatName}
                                    avatar={avatar}
                                    size={50}
                                />
                            </View>

                            <View style={styles.chatItemContent}>
                                <View style={styles.chatItemHeader}>
                                    <ThemedText numberOfLines={1} style={styles.chatName}>{chatName}</ThemedText>
                                    <ThemedText style={styles.timeText}>{lastTime}</ThemedText>
                                </View>

                                <View style={styles.chatItemFooter}>
                                    <ThemedText numberOfLines={1} style={styles.lastMessage}>
                                        {lastMessage}
                                    </ThemedText>

                                    {unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <ThemedText style={styles.unreadText}>{unreadCount}</ThemedText>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        margin: 0,
    },
    divider: {
        height: 0.5,
        backgroundColor: '#eeeeee',
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#ffffff',
    },
    chatItemLeft: {
        marginRight: 12,
    },
    chatItemContent: {
        flex: 1,
        justifyContent: 'center',
    },
    chatItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    timeText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 8,
    },
    chatItemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    unreadBadge: {
        backgroundColor: '#F23C3C',
        borderRadius: 15,
        minWidth: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        paddingHorizontal: 6,
    },
    unreadText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
