import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, StatusBar } from 'react-native';
import { Divider, IconButton, Searchbar } from 'react-native-paper';
import { router } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useFriendsStore } from '@/src/stores/friendsStore';
import { User, useUserStore } from '@/src/stores/userStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Friend } from "@/src/types/models";
import { ProfileAvatar } from '@/src/components/ProfileAvatar';

type FriendsListItem =
    | { type: 'myProfile', data: User | null }
    | { type: 'divider' }
    | { type: 'friend', data: Friend };

export default function FriendsScreen() {
    const { friends } = useFriendsStore();
    const { user } = useUserStore();
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const insets = useSafeAreaInsets();

    // 친구 검색 기능
    const filteredFriends = friends.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.statusMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
        if (isSearchVisible) setSearchQuery('');
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f6f6f6" />

            {/* 헤더 */}
            <View style={[styles.header, { marginTop: insets.top }]}>
                <ThemedText type="title" style={styles.title}>친구</ThemedText>
                <View style={styles.headerIcons}>
                    <IconButton
                        icon="magnify"
                        size={24}
                        onPress={toggleSearch}
                        style={styles.iconButton}
                    />
                    <IconButton
                        icon="account-plus"
                        size={24}
                        onPress={() => router.push('/friend-add')}
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

            {/* 검색바 */}
            {isSearchVisible && (
                <Searchbar
                    placeholder="이름 또는 상태메시지로 검색"
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={styles.searchInput}
                    iconColor="#aaa"
                />
            )}

            <FlatList
                data={[
                    { type: 'myProfile', data: user } as FriendsListItem,
                    { type: 'divider' } as FriendsListItem,
                    ...filteredFriends.map(friend => ({ type: 'friend', data: friend } as FriendsListItem))
                ]}
                keyExtractor={(item: FriendsListItem, index) => {
                    if (item.type === 'divider') return `divider-${index}`;
                    if (item.type === 'myProfile') return 'my-profile';
                    return item.type === 'friend' ? item.data.id : `unknown-${index}`;
                }}
                renderItem={({ item }: { item: FriendsListItem }) => {
                    if (item.type === 'divider') {
                        return <Divider style={styles.divider} />;
                    }

                    if (item.type === 'myProfile' && user) {
                        return (
                            <TouchableOpacity
                                style={styles.myProfileItem}
                                onPress={() => router.push('/my-profile-detail')}
                            >
                                <ProfileAvatar
                                    name={user.name}
                                    avatar={user.avatar}
                                    size={60}
                                />
                                <View style={styles.profileInfo}>
                                    <ThemedText style={styles.myName}>{user.name}</ThemedText>
                                    <ThemedText style={styles.statusMessage}>{user.statusMessage}</ThemedText>
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    if (item.type === 'friend') {
                        return (
                            <TouchableOpacity
                                style={styles.friendItem}
                                onPress={() => router.push(`/friend-detail/${item.data.id}`)}
                            >
                                <ProfileAvatar
                                    name={item.data.name}
                                    avatar={item.data.avatar}
                                    size={50}
                                />
                                <View style={styles.friendInfo}>
                                    <ThemedText style={styles.friendName}>{item.data.name}</ThemedText>
                                    <ThemedText style={styles.statusMessage}>{item.data.statusMessage}</ThemedText>
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    return null;
                }}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
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
    searchBar: {
        marginHorizontal: 16,
        marginBottom: 8,
        elevation: 0,
        backgroundColor: '#eeeeee',
        borderRadius: 20,
        height: 40,
    },
    searchInput: {
        fontSize: 14,
    },
    myProfileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f6f6f6',
    },
    profileInfo: {
        marginLeft: 16,
        justifyContent: 'center',
    },
    myName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    divider: {
        height: 0.5,
        backgroundColor: '#dddddd',
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f6f6f6',
    },
    friendInfo: {
        marginLeft: 16,
    },
    friendName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    statusMessage: {
        fontSize: 13,
        color: '#888',
    },
});
