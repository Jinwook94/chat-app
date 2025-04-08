import { ThemedText } from '@/src/components/ThemedText';
import {ThemedView} from "@/src/components/ThemedView";

export default function FriendsScreen() {
    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText type="title">친구</ThemedText>
            <ThemedText>친구 목록이 표시됩니다.</ThemedText>
        </ThemedView>
    );
}
