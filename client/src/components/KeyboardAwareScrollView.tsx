import React, { ReactNode } from 'react';
import { ScrollView, ScrollViewProps, Platform } from 'react-native';
import {
    KeyboardAwareScrollView as RNKCKeyboardAwareScrollView,
    AndroidSoftInputModes,
    KeyboardController
} from 'react-native-keyboard-controller';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
    children: ReactNode;
    /**
     * 키보드가 올라왔을 때 추가로 적용할 패딩값
     */
    extraScrollHeight?: number;

    /**
     * 키보드가 내려갔을 때 적용할 패딩값
     */
    bottomPadding?: number;
}

/**
 * 키보드 위치에 맞게 컨텐츠를 스크롤해주는 컴포넌트
 */
export function KeyboardAwareScrollView({
                                            children,
                                            extraScrollHeight = 20,
                                            bottomPadding = 0,
                                            ...props
                                        }: KeyboardAwareScrollViewProps) {
    // Android에서는 항상 adjustResize 모드를 사용
    React.useEffect(() => {
        if (Platform.OS === 'android') {
            KeyboardController.setInputMode(
                AndroidSoftInputModes.SOFT_INPUT_ADJUST_RESIZE
            );
            return () => {
                KeyboardController.setDefaultMode();
            };
        }
    }, []);

    return (
        <RNKCKeyboardAwareScrollView
            bottomOffset={extraScrollHeight}
            keyboardShouldPersistTaps="handled"
            {...props}
        >
            {children}
        </RNKCKeyboardAwareScrollView>
    );
}
