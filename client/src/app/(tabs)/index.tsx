import { ThemedText } from "@/src/components/ThemedText";
import {ThemedView} from "@/src/components/ThemedView";

export default function HomeScreen() {
    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText type="title">홈</ThemedText>
            <ThemedText>채팅 앱에 오신 것을 환영합니다!</ThemedText>
        </ThemedView>
    );
}
