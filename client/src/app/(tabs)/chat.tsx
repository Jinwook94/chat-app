import React, { useState, useRef, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, StatusBar, Platform, Text, Modal, TextInput } from 'react-native';
import { Divider, IconButton, Dialog, Portal, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useChatStore } from '@/src/stores/chatStore';
import { useUserStore } from '@/src/stores/userStore';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileAvatar } from '@/src/components/ProfileAvatar';

export default function ChatScreen() {
    const { chatRooms, messages, leaveChat, updateChatRoom } = useChatStore();
    const { user } = useUserStore();
    const { friends } = useFriendsStore();
    const insets = useSafeAreaInsets();

    // 채팅방 나가기 관련 상태
    const [exitDialogVisible, setExitDialogVisible] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    // 채팅방 이름 수정 관련 상태
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [newChatName, setNewChatName] = useState('');
    const chatNameInputRef = useRef<TextInput>(null);

    // Android용 액션 다이얼로그
    const [actionDialogVisible, setActionDialogVisible] = useState(false);

    // 현재 열려있는 스와이프 아이템 추적
    const [openSwipeableId, setOpenSwipeableId] = useState<string | null>(null);
    const swipeableRefs = useRef<{[key: string]: Swipeable | null}>({});

    // 스와이프 모드 추적 (스와이프 중인지 여부)
    const [isSwipeActive, setIsSwipeActive] = useState(false);
    // 스와이프 후 터치 방지 타이머
    const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 채팅방 정렬: 마지막 메시지 시간 기준으로 내림차순
    const sortedChatRooms = [...chatRooms].sort((a, b) => {
        const aLastMsg = a.lastMessage?.createdAt || a.createdAt;
        const bLastMsg = b.lastMessage?.createdAt || b.createdAt;
        return bLastMsg - aLastMsg;
    });

    // 컴포넌트 언마운트 시 타이머 정리
    useEffect(() => {
        return () => {
            if (swipeTimeoutRef.current) {
                clearTimeout(swipeTimeoutRef.current);
            }
        };
    }, []);

    // 모달이 열릴 때 input에 focus를 주기 위한 useEffect
    useEffect(() => {
        if (editModalVisible && chatNameInputRef.current) {
            setTimeout(() => {
                chatNameInputRef.current?.focus();
            }, 100);
        }
    }, [editModalVisible]);

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

    // 채팅방 이름 수정 모달 열기
    const showEditNameModal = (chatId: string) => {
        const chatRoom = chatRooms.find(room => room.id === chatId);
        if (!chatRoom) return;

        if (openSwipeableId) {
            swipeableRefs.current[openSwipeableId]?.close();
        }

        setSelectedChatId(chatId);

        // 채팅방 이름 초기값 설정
        if (chatRoom.isGroup) {
            setNewChatName(chatRoom.name);
        } else {
            setNewChatName(chatRoom.customName || getParticipantNames(chatRoom));
        }

        setEditModalVisible(true);
    };

    // 채팅방 이름 업데이트 처리
    const handleUpdateChatName = () => {
        if (!selectedChatId || !newChatName.trim()) return;

        const chatRoom = chatRooms.find(room => room.id === selectedChatId);
        if (!chatRoom) return;

        if (chatRoom.isGroup) {
            // 그룹 채팅방은 name 필드 수정
            updateChatRoom(selectedChatId, { name: newChatName });
        } else {
            // 1:1 채팅방은 customName 필드 사용
            updateChatRoom(selectedChatId, { customName: newChatName });
        }

        setEditModalVisible(false);
    };

    // 채팅방 이름 초기화 처리 (1:1 채팅에서만 사용)
    const handleResetChatName = () => {
        if (!selectedChatId) return;

        const chatRoom = chatRooms.find(room => room.id === selectedChatId);
        if (!chatRoom || chatRoom.isGroup) return;

        updateChatRoom(selectedChatId, { customName: undefined });
        setEditModalVisible(false);
    };

    // 채팅방 나가기 처리
    const handleChatExit = () => {
        if (selectedChatId) {
            leaveChat(selectedChatId);
            setExitDialogVisible(false);
            setSelectedChatId(null);
        }
    };

    // 나가기 확인창 표시
    const showExitConfirmation = (chatId: string) => {
        if (openSwipeableId) {
            swipeableRefs.current[openSwipeableId]?.close();
        }
        setSelectedChatId(chatId);
        setExitDialogVisible(true);
    };

    // Android용 액션 다이얼로그 표시
    const showActionDialog = (chatId: string) => {
        setSelectedChatId(chatId);
        setActionDialogVisible(true);
    };

    // 채팅방 터치 핸들러
    const handleChatPress = (chatId: string) => {
        // 스와이프 모드가 활성화된 경우 채팅방 입장 방지
        if (isSwipeActive) {
            return;
        }

        // 열려있는 스와이프가 있으면 닫기
        if (openSwipeableId) {
            swipeableRefs.current[openSwipeableId]?.close();
            // 같은 항목이면 스와이프만 닫고 채팅방 입장 방지
            if (openSwipeableId === chatId) {
                return;
            }
        }

        // 채팅방으로 이동
        router.push(`/chat/${chatId}`);
    };

    // 스와이프 시작 핸들러
    const handleSwipeStart = () => {
        setIsSwipeActive(true);
    };

    // 스와이프 오픈 핸들러
    const handleSwipeOpen = (chatId: string) => {
        setOpenSwipeableId(chatId);
        setIsSwipeActive(true);

        // 스와이프 타이머 설정 (이전 타이머 정리)
        if (swipeTimeoutRef.current) {
            clearTimeout(swipeTimeoutRef.current);
        }

        // 스와이프 후 일정 시간 동안 터치 이벤트 무시
        swipeTimeoutRef.current = setTimeout(() => {
            setIsSwipeActive(false);
        }, 500); // 500ms 딜레이
    };

    // 스와이프 닫힘 핸들러
    const handleSwipeClose = () => {
        setOpenSwipeableId(null);

        // 스와이프 타이머 설정 (이전 타이머 정리)
        if (swipeTimeoutRef.current) {
            clearTimeout(swipeTimeoutRef.current);
        }

        // 스와이프 닫힘 후 일정 시간 동안 터치 이벤트 무시
        swipeTimeoutRef.current = setTimeout(() => {
            setIsSwipeActive(false);
        }, 500); // 500ms 딜레이
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

                    // 오른쪽 스와이프 액션 (iOS용)
                    const renderRightActions = () => {
                        return (
                            <View style={styles.swipeActionsContainer}>
                                <TouchableOpacity
                                    style={[styles.swipeAction, styles.editAction]}
                                    onPress={() => showEditNameModal(item.id)}
                                >
                                    <View style={styles.swipeActionContent}>
                                        <IconButton icon="pencil" size={24} iconColor="#fff" />
                                        <Text style={styles.swipeActionText}>수정</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.swipeAction, styles.deleteAction]}
                                    onPress={() => showExitConfirmation(item.id)}
                                >
                                    <View style={styles.swipeActionContent}>
                                        <IconButton icon="exit-to-app" size={24} iconColor="#fff" />
                                        <Text style={styles.swipeActionText}>나가기</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );
                    };

                    // 채팅방 아이템 내용
                    const chatItemContent = (
                        <>
                            <View style={styles.chatItemLeft}>
                                <ProfileAvatar
                                    name={chatName}
                                    avatar={avatar}
                                    size={50}
                                />
                            </View>

                            <View style={styles.chatItemContent}>
                                <View style={styles.chatItemHeader}>
                                    <ThemedText numberOfLines={1} style={styles.chatName}>{
                                        item.customName || chatName
                                    }</ThemedText>
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
                        </>
                    );

                    // iOS에서는 스와이프 가능한 컴포넌트로 감싸기
                    if (Platform.OS === 'ios') {
                        return (
                            <Swipeable
                                ref={ref => swipeableRefs.current[item.id] = ref}
                                renderRightActions={renderRightActions}
                                onSwipeableOpen={() => handleSwipeOpen(item.id)}
                                onSwipeableClose={handleSwipeClose}
                                onSwipeableWillOpen={handleSwipeStart}
                                friction={2}
                                overshootFriction={8}
                                rightThreshold={40}
                            >
                                <TouchableOpacity
                                    style={styles.chatItem}
                                    onPress={() => handleChatPress(item.id)}
                                    activeOpacity={0.7}
                                >
                                    {chatItemContent}
                                </TouchableOpacity>
                            </Swipeable>
                        );
                    }

                    // Android에서는 롱프레스로 처리
                    return (
                        <TouchableOpacity
                            style={styles.chatItem}
                            onPress={() => router.push(`/chat/${item.id}`)}
                            onLongPress={() => showActionDialog(item.id)}
                            delayLongPress={500}
                        >
                            {chatItemContent}
                        </TouchableOpacity>
                    );
                }}
            />

            {/* 채팅방 나가기 확인 다이얼로그 */}
            <Portal>
                <Dialog visible={exitDialogVisible} onDismiss={() => setExitDialogVisible(false)}>
                    <Dialog.Title>채팅방 나가기</Dialog.Title>
                    <Dialog.Content>
                        <Text>정말 이 채팅방을 나가시겠습니까?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setExitDialogVisible(false)}>취소</Button>
                        <Button onPress={handleChatExit}>나가기</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Android용 액션 다이얼로그 */}
            <Portal>
                <Dialog visible={actionDialogVisible} onDismiss={() => setActionDialogVisible(false)}>
                    <Dialog.Title>채팅방 옵션</Dialog.Title>
                    <Dialog.Content>
                        <View style={styles.actionDialogButtons}>
                            <TouchableOpacity
                                style={styles.actionDialogButton}
                                onPress={() => {
                                    setActionDialogVisible(false);
                                    showEditNameModal(selectedChatId || '');
                                }}
                            >
                                <IconButton icon="pencil" size={32} />
                                <Text>이름 수정</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionDialogButton}
                                onPress={() => {
                                    setActionDialogVisible(false);
                                    showExitConfirmation(selectedChatId || '');
                                }}
                            >
                                <IconButton icon="exit-to-app" size={32} />
                                <Text>나가기</Text>
                            </TouchableOpacity>
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setActionDialogVisible(false)}>취소</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* 채팅방 이름 수정 모달 */}
            <Modal
                visible={editModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setEditModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>채팅방 이름 수정</ThemedText>
                        </View>

                        <View style={styles.modalBody}>
                            <TextInput
                                ref={chatNameInputRef}
                                style={styles.modalInput}
                                value={newChatName}
                                onChangeText={setNewChatName}
                                placeholder="채팅방 이름을 입력하세요"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.modalFooter}>
                            {selectedChatId && !chatRooms.find(room => room.id === selectedChatId)?.isGroup && chatRooms.find(room => room.id === selectedChatId)?.customName && (
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={handleResetChatName}
                                >
                                    <ThemedText>초기화</ThemedText>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <ThemedText>취소</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.primaryButton]}
                                onPress={handleUpdateChatName}
                            >
                                <ThemedText style={styles.primaryButtonText}>저장</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
    swipeActionsContainer: {
        flexDirection: 'row',
    },
    swipeAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
    },
    editAction: {
        backgroundColor: '#4A90E2',
    },
    deleteAction: {
        backgroundColor: '#F23C3C',
    },
    swipeActionContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    swipeActionText: {
        color: 'white',
        fontSize: 12,
        marginTop: -8,
    },
    // 모달 스타일
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
    },
    modalHeader: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    modalBody: {
        padding: 15,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    modalButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginLeft: 10,
    },
    primaryButton: {
        backgroundColor: '#0a7ea4',
        borderRadius: 5,
    },
    primaryButtonText: {
        color: 'white',
    },
    // 안드로이드 액션 다이얼로그 스타일
    actionDialogButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    actionDialogButton: {
        alignItems: 'center',
        padding: 10,
    },
});
