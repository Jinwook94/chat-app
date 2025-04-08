import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BlurTabBarBackground() {
  return (
      <BlurView
          tint="systemChromeMaterial"
          intensity={100}
          style={StyleSheet.absoluteFill}
      />
  );
}

// 간단한 구현으로 대체
export function useBottomTabOverflow() {
  const { bottom } = useSafeAreaInsets();
  return 49 - bottom; // 49는 일반적인 탭 바 높이
}
