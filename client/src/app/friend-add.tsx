import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, IconButton, TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { useFriendsStore } from '@/src/stores/friendsStore';

export default function FriendAddScreen() {
    const { addFriend } = useFriendsStore();
    const [name, setName] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [avatar, setAvatar] = useState(`https://picsum.photos/id/${Math.floor(Math.random() * 100)}/200`);

    const handleAddFriend = () => {
        if (name.trim() === '') return;

        addFriend({
            id: Date.now().toString(),
            name,
            statusMessage,
            avatar
        });

        router.back();
    };

    const handleRandomAvatar = () => {
        setAvatar(`https://picsum.photos/id/${Math.floor(Math.random() * 100)}/200?random=${Date.now()}`);
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: '친구 추가',
                    headerLeft: () => (
                        <IconButton
                            icon="close"
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <ThemedView style={styles.container}>
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        source={{ uri: avatar }}
                        size={100}
                    />
                    <IconButton
                        icon="refresh"
                        size={24}
                        style={styles.refreshButton}
                        onPress={handleRandomAvatar}
                    />
                </View>

                <TextInput
                    label="이름"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    autoFocus
                />

                <TextInput
                    label="상태 메시지"
                    value={statusMessage}
                    onChangeText={setStatusMessage}
                    style={styles.input}
                />

                <Button
                    mode="contained"
                    onPress={handleAddFriend}
                    style={styles.button}
                    disabled={name.trim() === ''}
                >
                    친구 추가
                </Button>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 24,
        position: 'relative',
    },
    refreshButton: {
        position: 'absolute',
        bottom: 0,
        right: '30%',
        backgroundColor: 'white',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
    }
});
