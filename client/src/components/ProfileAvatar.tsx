import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, StyleProp, ViewStyle, Image } from 'react-native';

interface ProfileAvatarProps {
    name: string;
    avatar?: string | null;
    size?: number;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    showEditOverlay?: boolean;
    isRounded?: boolean; // Controls rounded square vs circle
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
                                                                name,
                                                                avatar,
                                                                size = 80,
                                                                onPress,
                                                                style,
                                                                showEditOverlay = false,
                                                                isRounded = false,
                                                            }) => {
    // Create initials from name
    const initials = name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    // Calculate border radius based on shape preference
    // Increased to 0.4 (40%) from 0.25 to get the Kakao "squircle" look
    const borderRadius = isRounded ? size * 0.4 : size / 2;

    // Container style
    const containerStyle: ViewStyle = {
        width: size,
        height: size,
        borderRadius: borderRadius,
        backgroundColor: avatar ? undefined : '#a0b4d6', // Kakao's light blue color
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden' as const,
    };

    // Render the default Kakao-style avatar (silhouette)
    const renderDefaultAvatar = () => {
        return (
            <View style={kakaoAvatarStyles.container}>
                {/* Head circle */}
                <View style={kakaoAvatarStyles.head} />
                {/* Body shape */}
                <View style={kakaoAvatarStyles.body} />
            </View>
        );
    };

    // This function handles rendering the avatar content
    const renderAvatarContent = () => {
        if (avatar) {
            try {
                return (
                    <Image
                        source={{ uri: avatar }}
                        style={{
                            width: size,
                            height: size,
                        }}
                        resizeMode="cover"
                    />
                );
            } catch (error) {
                console.error("Error rendering avatar image:", error);
                return renderDefaultAvatar();
            }
        } else {
            // If no avatar, show Kakao-style default avatar
            return renderDefaultAvatar();
        }
    };

    // Wrap in TouchableOpacity if onPress is provided
    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={[styles.outerContainer, style]}
                activeOpacity={0.8}
            >
                <View style={containerStyle}>
                    {renderAvatarContent()}
                </View>
                {showEditOverlay && (
                    <View style={styles.editOverlay}>
                        <Text style={styles.editText}>변경</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    }

    return (
        <View style={[styles.outerContainer, style]}>
            <View style={containerStyle}>
                {renderAvatarContent()}
            </View>
        </View>
    );
};

// Styles for the Kakao default avatar silhouette
const kakaoAvatarStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    head: {
        width: '30%',
        height: '30%',
        borderRadius: 50,
        backgroundColor: '#d6e2f3',
        marginBottom: '5%',
    },
    body: {
        width: '50%',
        height: '25%',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        backgroundColor: '#d6e2f3',
    },
});

const styles = StyleSheet.create({
    outerContainer: {
        position: 'relative',
    },
    initials: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
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
