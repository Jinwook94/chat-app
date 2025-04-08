import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput as RNTextInput, TouchableOpacity, StatusBar } from 'react-native';
import { IconButton, Avatar } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useChatStore } from '@/src/stores/chatStore';
import { useUserStore } from '@/src/stores/userStore';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { chatRooms, messages, sendMessage, markMessagesAsRead } = useChatStore();
    const { user } = useUserStore();
    const { friends } = useFriendsStore();
    const insets = useSafeAreaInsets();

    const chatRoom = chatRooms.find(room => room.id === id);
    const chatMessages = messages[id] || [];

    const [messageText, setMessageText] = useState('');
    const messageInputRef = useRef<RNTextInput>(null);
    const flatListRef = useRef<FlatList>(null);

    // 메시지를 읽음으로 표시
    useEffect(() => {
        if (id) {
            markMessagesAsRead(id);
        }
    }, [id]);

    if (!chatRoom || !user) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>채팅방을 찾을 수 없습니다</ThemedText>
            </ThemedView>
        );
    }

    // 채팅방 이름 표시
    const getChatName = () => {
        if (chatRoom.isGroup) return chatRoom.name;

        const otherParticipantId = chatRoom.participants.find(partId => partId !== user.id);
        if (!otherParticipantId) return '채팅';

        const otherUser = friends.find(friend => friend.id === otherParticipantId);
        return otherUser ? otherUser.name : '알 수 없음';
    };

    // 메시지 전송
    const handleSendMessage = () => {
        if (messageText.trim() === '') return;

        sendMessage(id, messageText);
        setMessageText('');
        messageInputRef.current?.focus();
    };

    // 시간 형식화
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${ampm} ${formattedHours}:${formattedMinutes}`;
    };

    // 같은 날짜의 연속 메시지인지 확인
    const isSameGroup = (currentIndex: number) => {
        if (currentIndex === 0) return false;

        const currentMsg = chatMessages[currentIndex];
        const prevMsg = chatMessages[currentIndex - 1];

        // 같은 보낸사람이고 5분 이내 메시지인지 확인
        return currentMsg.senderId === prevMsg.senderId &&
            currentMsg.createdAt - prevMsg.createdAt < 5 * 60 * 1000;
    };

    // 프로필 이미지 가져오기
    const getProfileImage = (senderId: string) => {
        if (senderId === user.id) return user.avatar;
        const sender = friends.find(f => f.id === senderId);
        return sender?.avatar || '';
    };

    const backgroundColor = chatRoom.backgroundColor || '#9bbbd4';

    return (
        <View style={{ flex: 1, backgroundColor }}>
            <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
            <Stack.Screen
                options={{
                    title: getChatName(),
                    headerTransparent: true,
                    headerBackgroundContainerStyle: {
                        backgroundColor: `${backgroundColor}CC`,  // CC는 80% 투명도
                        borderBottomWidth: 0,
                    },
                    headerStyle: {
                        backgroundColor: 'transparent',
                    },
                    headerTitleStyle: {
                        fontSize: 17,
                        fontWeight: '600',
                    },
                    headerLeft: () => (
                        <IconButton
                            icon="arrow-left"
                            size={22}
                            iconColor="#000"
                            onPress={() => router.back()}
                            style={{ marginLeft: -5 }}
                        />
                    ),
                    headerRight: () => (
                        <View style={styles.headerRight}>
                            <IconButton icon="magnify" size={22} iconColor="#000" style={{ margin: 0 }} />
                            <IconButton icon="menu" size={22} iconColor="#000" style={{ margin: 0 }} />
                        </View>
                    ),
                }}
            />

            <View style={[styles.container, { backgroundColor, paddingTop: 40 }]}>
                <FlatList
                    ref={flatListRef}
                    data={chatMessages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    renderItem={({ item, index }) => {
                        const isUser = item.senderId === user.id;
                        const sameGroup = isSameGroup(index);
                        const showSenderName = !isUser && !sameGroup;
                        const showTime = !sameGroup || index === chatMessages.length - 1;
                        const showAvatar = !isUser && !sameGroup;

                        return (
                            <View style={[
                                styles.messageContainer,
                                isUser ? styles.userMessageContainer : styles.otherMessageContainer,
                                sameGroup && styles.groupedMessage
                            ]}>
                                {showSenderName && (
                                    <ThemedText style={styles.senderName}>
                                        {friends.find(f => f.id === item.senderId)?.name || '알 수 없음'}
                                    </ThemedText>
                                )}

                                <View style={styles.messageRow}>
                                    {!isUser && (
                                        showAvatar ? (
                                            <Avatar.Image
                                                source={{ uri: getProfileImage(item.senderId) }}
                                                size={36}
                                                style={styles.avatar}
                                            />
                                        ) : (
                                            <View style={styles.avatarPlaceholder} />
                                        )
                                    )}

                                    <View style={[
                                        styles.messageBubble,
                                        isUser ? styles.userBubble : styles.otherBubble
                                    ]}>
                                        <ThemedText style={isUser ? styles.userMessageText : styles.otherMessageText}>
                                            {item.text}
                                        </ThemedText>
                                    </View>

                                    {showTime && (
                                        <ThemedText style={[
                                            styles.messageTime,
                                            isUser ? styles.userMessageTime : styles.otherMessageTime
                                        ]}>
                                            {formatTime(item.createdAt)}
                                        </ThemedText>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
                style={styles.inputContainer}
            >
                <View style={styles.inputWrapperOuter}>
                    <View style={styles.inputWrapper}>
                        <TouchableOpacity style={styles.plusButton}>
                            <IconButton icon="plus" size={26} iconColor="#333" style={{ margin: 0 }} />
                        </TouchableOpacity>

                        <RNTextInput
                            ref={messageInputRef}
                            value={messageText}
                            onChangeText={setMessageText}
                            placeholder="메시지 입력..."
                            style={styles.input}
                            multiline
                            placeholderTextColor="#aaa"
                        />

                        {messageText.trim() !== '' ? (
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={handleSendMessage}
                            >
                                <ThemedText style={styles.sendButtonText}>전송</ThemedText>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.inputButtons}>
                                <IconButton icon="emoticon" size={26} iconColor="#333" style={styles.inputButton} />
                                <IconButton icon="pound" size={26} iconColor="#333" style={styles.inputButton} />
                            </View>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
    },
    messageList: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    messageContainer: {
        marginBottom: 4,
        maxWidth: '75%',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
        marginRight: 5,
    },
    otherMessageContainer: {
        alignSelf: 'flex-start',
        marginLeft: 5,
    },
    groupedMessage: {
        marginBottom: 1,
    },
    senderName: {
        fontSize: 12,
        color: '#666',
        marginBottom: 3,
        marginLeft: 44, // 아바타 이미지 크기 + 여백
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    avatar: {
        marginRight: 6,
    },
    avatarPlaceholder: {
        width: 36,
        marginRight: 6,
    },
    messageBubble: {
        padding: 9,
        borderRadius: 13,
        maxWidth: '80%',
    },
    userBubble: {
        backgroundColor: '#FEE500', // 카카오톡 노란색
        borderTopRightRadius: 3,
    },
    otherBubble: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 3,
    },
    userMessageText: {
        color: '#000',
        fontSize: 15,
    },
    otherMessageText: {
        color: '#000',
        fontSize: 15,
    },
    messageTime: {
        fontSize: 11,
        color: '#888',
        alignSelf: 'flex-end',
        marginHorizontal: 4,
    },
    userMessageTime: {
        marginRight: 2,
    },
    otherMessageTime: {
        marginLeft: 2,
    },
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 0.5,
        borderTopColor: '#d8d8d8',
    },
    inputWrapperOuter: {
        backgroundColor: 'white',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        backgroundColor: 'white',
    },
    plusButton: {
        marginHorizontal: 2,
    },
    input: {
        flex: 1,
        maxHeight: 100,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 8,
        marginHorizontal: 8,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#FEE500',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
        marginHorizontal: 6,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#000',
        fontWeight: '500',
    },
    inputButtons: {
        flexDirection: 'row',
        marginRight: 4,
    },
    inputButton: {
        margin: 0,
    },
});
