import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar as RNStatusBar, TextInput } from 'react-native';
import { IconButton, Menu } from 'react-native-paper';
import { ThemedText } from '@/src/components/ThemedText';
import { ProfileAvatar } from '@/src/components/ProfileAvatar';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ImagePickerModal } from '@/src/components/ImagePickerModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileDetailViewProps {
    // Profile data
    name: string;
    avatar?: string | null;
    statusMessage?: string;

    // View mode
    isMyProfile?: boolean;
    isEditing: boolean;
    menuVisible: boolean;
    setMenuVisible: (visible: boolean) => void;

    // Actions
    onClose: () => void;
    onEditPress?: () => void;
    onDeletePress?: () => void;
    onStartChat?: () => void;

    // Edit mode
    editName?: string;
    editStatusMessage?: string;
    onChangeName?: (text: string) => void;
    onChangeStatusMessage?: (text: string) => void;
    onSave?: () => void;
    onCancel?: () => void;

    // Image picker
    imagePickerVisible?: boolean;
    setImagePickerVisible?: (visible: boolean) => void;
    onImageSelected?: (uri: string | null) => Promise<void>;
    hasExistingImage?: boolean;
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : RNStatusBar.currentHeight || 0;

export const ProfileDetailView = ({
                                      name,
                                      avatar,
                                      statusMessage,
                                      isMyProfile = false,
                                      isEditing,
                                      menuVisible,
                                      setMenuVisible,
                                      onClose,
                                      onEditPress,
                                      onDeletePress,
                                      onStartChat,
                                      editName = '',
                                      editStatusMessage = '',
                                      onChangeName,
                                      onChangeStatusMessage,
                                      onSave,
                                      onCancel,
                                      imagePickerVisible = false,
                                      setImagePickerVisible = () => {},
                                      onImageSelected = async () => {},
                                      hasExistingImage = false
                                  }: ProfileDetailViewProps) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Top navigation */}
            <View style={[styles.header, { paddingTop: insets.top || STATUSBAR_HEIGHT }]}>
                {isEditing ? (
                    // Edit mode header
                    <>
                        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                            <Ionicons name="close-outline" size={30} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={onSave}
                        >
                            <ThemedText style={styles.saveButtonText}>완료</ThemedText>
                        </TouchableOpacity>
                    </>
                ) : (
                    // View mode header
                    <>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                                        if (onEditPress) onEditPress();
                                    }}
                                />
                                {!isMyProfile && onDeletePress && (
                                    <Menu.Item
                                        title="삭제"
                                        leadingIcon="delete"
                                        onPress={() => {
                                            setMenuVisible(false);
                                            onDeletePress();
                                        }}
                                    />
                                )}
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
                            name={editName || name}
                            avatar={avatar}
                            size={100}
                            isRounded={true}
                            onPress={() => setImagePickerVisible(true)}
                            showEditOverlay={true}
                        />

                        <View style={styles.editForm}>
                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>이름</ThemedText>
                                <TextInput
                                    value={editName}
                                    onChangeText={onChangeName}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    placeholder="이름을 입력하세요"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <ThemedText style={styles.inputLabel}>상태 메시지</ThemedText>
                                <TextInput
                                    value={editStatusMessage}
                                    onChangeText={onChangeStatusMessage}
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
                            name={name}
                            avatar={avatar}
                            size={100}
                            isRounded={true}
                            isUserProfile={isMyProfile}
                        />
                        <View style={styles.nameContainer}>
                            <ThemedText style={styles.name}>{name}</ThemedText>
                        </View>

                        {/* Show status message in view mode if available */}
                        {statusMessage && (
                            <ThemedText style={styles.statusMessage}>{statusMessage}</ThemedText>
                        )}
                    </View>
                )}

                {/* Bottom action buttons - only show in view mode */}
                {!isEditing && (
                    <View style={styles.bottomContainer}>
                        <View style={[styles.actionButtons, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={onStartChat}
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
            {(isEditing || !isMyProfile) && (
                <ImagePickerModal
                    visible={imagePickerVisible}
                    onDismiss={() => setImagePickerVisible(false)}
                    onImageSelected={onImageSelected}
                    onRemoveImage={() => onImageSelected(null)}
                    hasExistingImage={hasExistingImage}
                />
            )}
        </View>
    );
};

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
        backgroundColor: 'transparent',
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
