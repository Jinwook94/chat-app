import { ThemedText } from "@/src/components/ThemedText";
import {ThemedView} from "@/src/components/ThemedView";

export default function ProfileScreen() {
    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ThemedText type="title">프로필</ThemedText>
            <ThemedText>사용자 프로필 정보가 표시됩니다.</ThemedText>
        </ThemedView>
    );
}
