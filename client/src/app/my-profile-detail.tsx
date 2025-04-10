import React, { useState } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/src/components/ThemedText';
import { useUserStore } from '@/src/stores/userStore';
import { ProfileDetailView } from '@/src/components/ProfileDetailView';

export default function MyProfileDetailScreen() {
    const { user } = useUserStore();
    const [menuVisible, setMenuVisible] = useState(false);

    if (!user) {
        return (
            <View>
                <ThemedText>사용자 정보를 찾을 수 없습니다</ThemedText>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ProfileDetailView
                name={user.name}
                avatar={user.avatar}
                statusMessage={user.statusMessage}
                isMyProfile={true}
                isEditing={false}
                menuVisible={menuVisible}
                setMenuVisible={setMenuVisible}
                onClose={() => router.back()}
                onEditPress={() => {
                    router.push('/profile');
                }}
                onStartChat={() => {}}
            />
        </>
    );
}
