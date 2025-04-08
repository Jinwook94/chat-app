// This is a shim for web and Android where the tab bar is generally opaque.
const TabBarBackground = undefined; // 명시적으로 undefined로 설정
export default TabBarBackground;

export function useBottomTabOverflow() {
  return 0;
}
