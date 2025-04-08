import * as Haptics from 'expo-haptics';
import { Pressable, Platform } from 'react-native';

// 간단한 타입 정의
type HapticTabProps = {
    onPressIn?: (e: any) => void;
    [key: string]: any;
};

export function HapticTab(props: HapticTabProps) {
    return (
        <Pressable
            {...props}
            onPressIn={(ev: any) => {
                if (Platform.OS === 'ios') {
                    // Add a soft haptic feedback when pressing down on the tabs.
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                props.onPressIn?.(ev);
            }}
        />
    );
}
