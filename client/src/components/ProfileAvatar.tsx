import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, StyleProp, ViewStyle } from 'react-native';
import { Avatar } from 'react-native-paper';

interface ProfileAvatarProps {
    name: string;
    avatar?: string | null;
    size?: number;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    showEditOverlay?: boolean;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
                                                                name,
                                                                avatar,
                                                                size = 80,
                                                                onPress,
                                                                style,
                                                                showEditOverlay = false,
                                                            }) => {
    // 이름에서 이니셜 생성
    const initials = name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const renderAvatar = () => {
        if (avatar) {
            try {
                return (
                    <Avatar.Image
                        source={{ uri: avatar }}
                        size={size}
                        // 이미지 로드 실패시 텍스트 아바타로 대체
                        onError={() => console.warn("Avatar image load failed")}
                    />
                );
            } catch (error) {
                console.error("Error rendering avatar image:", error);
                return <Avatar.Text size={size} label={initials} />;
            }
        } else {
            return <Avatar.Text size={size} label={initials} />;
        }
    };

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={[styles.container, style]}
                activeOpacity={0.8}
            >
                {renderAvatar()}
                {showEditOverlay && (
                    <View style={styles.editOverlay}>
                        <Text style={styles.editText}>변경</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {renderAvatar()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    editOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editText: {
        color: 'white',
        fontSize: 12,
    },
});
