import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { HapticTab } from '@/src/components/HapticTab';
// iOS에만 있는 컴포넌트를 조건부로 임포트
const TabBarBG = Platform.OS === 'ios'
    ? require('@/src/components/ui/TabBarBackground.ios').default
    : () => <View style={{backgroundColor: 'white', flex: 1}} />;

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                // @ts-ignore - 타입 무시
                tabBarButton: (props) => <HapticTab {...props} />,
                // @ts-ignore - 타입 무시
                tabBarBackground: () => Platform.OS === 'ios' ? <TabBarBG /> : null,
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: '홈',
                    // @ts-ignore - 타입 무시
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="friends"
                options={{
                    title: '친구',
                    // @ts-ignore - 타입 무시
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: '채팅',
                    // @ts-ignore - 타입 무시
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: '프로필',
                    // @ts-ignore - 타입 무시
                    tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle.fill" color={color} />,
                }}
            />
        </Tabs>
    );
}
