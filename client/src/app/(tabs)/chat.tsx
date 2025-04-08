import { ThemedText } from "@/src/components/ThemedText";
import {ThemedView} from "@/src/components/ThemedView";

export default function ChatScreen() {
    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText type="title">채팅</ThemedText>
            <ThemedText>채팅 목록이 표시됩니다.</ThemedText>
        </ThemedView>
    );
}
