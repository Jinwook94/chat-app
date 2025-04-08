import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Button, FAB, IconButton, Menu, Searchbar, Portal, Modal } from 'react-native-paper';
import { router } from 'expo-router';
import ColorPicker from 'react-native-wheel-color-picker';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FriendsScreen() {
    const { friends, backgroundColor, setBackgroundColor } = useFriendsStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [currentColor, setCurrentColor] = useState(backgroundColor);
    const insets = useSafeAreaInsets();
    const [menuVisible, setMenuVisible] = useState(false);

    // 친구 검색 기능
    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.statusMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 색상 선택 완료 처리
    const handleColorComplete = () => {
        setBackgroundColor(currentColor);
        setColorPickerVisible(false);
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <View style={[styles.header, { marginTop: insets.top }]}>
                <ThemedText type="title" style={styles.title}>친구</ThemedText>
                <View style={styles.headerRight}>
                    <IconButton
                        icon="palette"
                        size={24}
                        onPress={() => setColorPickerVisible(true)}
                        style={styles.actionButton}
                    />
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={
                            <IconButton
                                icon="dots-vertical"
                                size={24}
                                onPress={() => setMenuVisible(true)}
                                style={styles.actionButton}
                            />
                        }
                    >
                        <Menu.Item
                            title="친구 추가"
                            leadingIcon="account-plus"
                            onPress={() => {
                                setMenuVisible(false);
                                router.push('/friend-add');
                            }}
                        />
                    </Menu>
                </View>
            </View>

            <Searchbar
                placeholder="이름 또는 상태메시지로 검색"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
            />

            <FlatList
                data={filteredFriends}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.friendItem}
                        onPress={() => router.push(`/friend-detail/${item.id}`)}
                    >
                        <Avatar.Image
                            source={{ uri: item.avatar }}
                            size={50}
                        />
                        <View style={styles.friendInfo}>
                            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                            <ThemedText>{item.statusMessage}</ThemedText>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <FAB
                icon="account-plus"
                style={[styles.fab, { bottom: insets.bottom + 16 }]}
                onPress={() => router.push('/friend-add')}
            />

            <Portal>
                <Modal
                    visible={colorPickerVisible}
                    onDismiss={() => setColorPickerVisible(false)}
                    contentContainerStyle={styles.colorPickerModal}
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
                        <View style={styles.colorPickerButtons}>
                            <Button
                                mode="outlined"
                                onPress={() => setColorPickerVisible(false)}
                                style={styles.colorPickerButton}
                            >
                                취소
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleColorComplete}
                                style={styles.colorPickerButton}
                            >
                                확인
                            </Button>
                        </View>
                    </ThemedView>
                </Modal>
            </Portal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    title: {
        fontSize: 28,
    },
    headerRight: {
        flexDirection: 'row',
    },
    actionButton: {
        marginLeft: 8,
    },
    searchBar: {
        marginHorizontal: 16,
        marginVertical: 8,
        elevation: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    list: {
        paddingHorizontal: 16,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    friendInfo: {
        marginLeft: 16,
    },
    fab: {
        position: 'absolute',
        right: 16,
    },
    colorPickerModal: {
        alignItems: 'center',
        justifyContent: 'center',
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
    colorPickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    colorPickerButton: {
        width: '40%',
    }
});
