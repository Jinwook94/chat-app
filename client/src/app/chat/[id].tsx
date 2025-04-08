import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { Avatar, IconButton, Menu, TextInput, Button, Portal, Modal } from 'react-native-paper';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import ColorPicker from 'react-native-wheel-color-picker';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useChatStore } from '@/src/stores/chatStore';
import { useUserStore } from '@/src/stores/userStore';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { chatRooms, messages, updateChatRoom, sendMessage, markMessagesAsRead, setChatBackgroundColor } = useChatStore();
    const { user } = useUserStore();
    const { friends } = useFriendsStore();
    const insets = useSafeAreaInsets();

    const chatRoom = chatRooms.find(room => room.id === id);
    const chatMessages = messages[id] || [];

    const [menuVisible, setMenuVisible] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [renamingGroup, setRenamingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [currentColor, setCurrentColor] = useState(chatRoom?.backgroundColor || '#F9FAFB');
    const [isColorChanging, setIsColorChanging] = useState(false);

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

    // 그룹 이름 변경
    const handleRenameGroup = () => {
        if (chatRoom.isGroup && newGroupName.trim() !== '') {
            updateChatRoom(id, { name: newGroupName });
        }
        setRenamingGroup(false);
        setMenuVisible(false);
    };

    // 색상 선택 완료
    const handleColorComplete = () => {
        setChatBackgroundColor(id, currentColor);
        setColorPickerVisible(false);
    };

    // 메시지 발신자의 이름 가져오기
    const getSenderName = (senderId: string) => {
        if (senderId === user.id) return '나';

        const sender = friends.find(friend => friend.id === senderId);
        return sender ? sender.name : '알 수 없음';
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

    return (
        <>
            <Stack.Screen
                options={{
                    title: getChatName(),
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
                            {chatRoom.isGroup && (
                                <Menu.Item
                                    title="그룹 이름 변경"
                                    leadingIcon="pencil"
                                    onPress={() => {
                                        setNewGroupName(chatRoom.name);
                                        setRenamingGroup(true);
                                        setMenuVisible(false);
                                    }}
                                />
                            )}
                            <Menu.Item
                                title="배경색 변경"
                                leadingIcon="palette"
                                onPress={() => {
                                    setCurrentColor(chatRoom.backgroundColor || '#F9FAFB');
                                    setColorPickerVisible(true);
                                    setMenuVisible(false);
                                }}
                            />
                        </Menu>
                    )
                }}
            />
            <ThemedView style={[styles.container, { backgroundColor: chatRoom.backgroundColor || '#F9FAFB' }]}>
                <FlatList
                    ref={flatListRef}
                    data={chatMessages}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    renderItem={({ item, index }) => {
                        const isUser = item.senderId === user.id;
                        const showSender =
                            chatRoom.isGroup &&
                            item.senderId !== user.id &&
                            (index === 0 || chatMessages[index - 1].senderId !== item.senderId);

                        return (
                            <View style={[
                                styles.messageContainer,
                                isUser ? styles.userMessageContainer : styles.otherMessageContainer
                            ]}>
                                {showSender && (
                                    <ThemedText style={styles.senderName}>{getSenderName(item.senderId)}</ThemedText>
                                )}

                                <View style={[
                                    styles.messageBubble,
                                    isUser ? styles.userBubble : styles.otherBubble
                                ]}>
                                    <ThemedText>{item.text}</ThemedText>
                                </View>

                                <ThemedText style={styles.messageTime}>{formatTime(item.createdAt)}</ThemedText>
                            </View>
                        );
                    }}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={100}
                    style={[styles.inputContainer, { marginBottom: insets.bottom }]}
                >
                    <TextInput
                        ref={messageInputRef}
                        mode="outlined"
                        value={messageText}
                        onChangeText={setMessageText}
                        placeholder="메시지 입력..."
                        right={
                            <TextInput.Icon
                                icon="send"
                                onPress={handleSendMessage}
                                disabled={messageText.trim() === ''}
                            />
                        }
                        style={styles.input}
                    />
                </KeyboardAvoidingView>

                <Portal>
                    <Modal
                        visible={renamingGroup}
                        onDismiss={() => setRenamingGroup(false)}
                        contentContainerStyle={styles.modalContent}
                    >
                        <ThemedView style={styles.modalContainer}>
                            <ThemedText type="subtitle">그룹 이름 변경</ThemedText>
                            <TextInput
                                mode="outlined"
                                label="새 그룹 이름"
                                value={newGroupName}
                                onChangeText={setNewGroupName}
                                style={styles.modalInput}
                            />
                            <View style={styles.modalButtons}>
                                <Button
                                    mode="outlined"
                                    onPress={() => setRenamingGroup(false)}
                                    style={styles.modalButton}
                                >
                                    취소
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleRenameGroup}
                                    style={styles.modalButton}
                                    disabled={newGroupName.trim() === ''}
                                >
                                    변경
                                </Button>
                            </View>
                        </ThemedView>
                    </Modal>

                    <Modal
                        visible={colorPickerVisible}
                        onDismiss={() => setColorPickerVisible(false)}
                        contentContainerStyle={styles.modalContent}
                    >
                        <ThemedView style={styles.colorPickerContainer}>
                            <ThemedText type="subtitle" style={styles.colorPickerTitle}>
                                배경 색상 선택
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
                            <View style={styles.modalButtons}>
                                <Button
                                    mode="outlined"
                                    onPress={() => setColorPickerVisible(false)}
                                    style={styles.modalButton}
                                >
                                    취소
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleColorComplete}
                                    style={styles.modalButton}
                                >
                                    확인
                                </Button>
                            </View>
                        </ThemedView>
                    </Modal>
                </Portal>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messageList: {
        padding: 16,
        paddingBottom: 80,
    },
    messageContainer: {
        marginBottom: 12,
        maxWidth: '80%',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
    },
    otherMessageContainer: {
        alignSelf: 'flex-start',
    },
    senderName: {
        fontSize: 12,
        marginBottom: 2,
        color: '#666',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 20,
        minWidth: 60,
    },
    userBubble: {
        backgroundColor: '#DCF8C6',
        borderBottomRightRadius: 0,
    },
    otherBubble: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 0,
    },
    messageTime: {
        fontSize: 10,
        color: '#666',
        marginTop: 2,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    input: {
        backgroundColor: 'white',
    },
    modalContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        borderRadius: 10,
    },
    modalInput: {
        marginTop: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    modalButton: {
        width: '40%',
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
});
