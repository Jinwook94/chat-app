import React from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Modal, Portal, Button, Divider } from 'react-native-paper';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import * as ImageUtils from '../utils/imageUtils';

interface ImagePickerModalProps {
    visible: boolean;
    onDismiss: () => void;
    onImageSelected: (uri: string | null) => void;
    onRemoveImage?: () => void;
    hasExistingImage?: boolean;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
                                                                      visible,
                                                                      onDismiss,
                                                                      onImageSelected,
                                                                      onRemoveImage,
                                                                      hasExistingImage = false,
                                                                  }) => {
    const pickFromGallery = async () => {
        try {
            const uri = await ImageUtils.pickImageFromGallery();
            if (uri) {
                onImageSelected(uri);
            }
            onDismiss();
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('오류', '갤러리에서 이미지를 선택하는 중 오류가 발생했습니다.');
            onDismiss();
        }
    };

    const takeNewPhoto = async () => {
        try {
            const uri = await ImageUtils.takePhoto();
            if (uri) {
                onImageSelected(uri);
            }
            onDismiss();
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('오류', '카메라로 사진을 촬영하는 중 오류가 발생했습니다.');
            onDismiss();
        }
    };

    const removeImage = () => {
        if (onRemoveImage) {
            onRemoveImage();
        }
        onDismiss();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.modalContent}
            >
                <ThemedView style={styles.container}>
                    <ThemedText type="subtitle" style={styles.title}>
                        프로필 이미지 선택
                    </ThemedText>

                    <Divider style={styles.divider} />

                    <TouchableOpacity style={styles.option} onPress={pickFromGallery}>
                        <ThemedText>갤러리에서 선택</ThemedText>
                    </TouchableOpacity>

                    <Divider style={styles.divider} />

                    <TouchableOpacity style={styles.option} onPress={takeNewPhoto}>
                        <ThemedText>카메라로 촬영</ThemedText>
                    </TouchableOpacity>

                    {hasExistingImage && (
                        <>
                            <Divider style={styles.divider} />
                            <TouchableOpacity style={styles.option} onPress={removeImage}>
                                <ThemedText style={styles.removeText}>프로필 사진 삭제</ThemedText>
                            </TouchableOpacity>
                        </>
                    )}

                    <Divider style={styles.divider} />

                    <Button
                        mode="text"
                        onPress={onDismiss}
                        style={styles.cancelButton}
                    >
                        취소
                    </Button>
                </ThemedView>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        alignItems: 'center',
        marginHorizontal: 20,
    },
    container: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    title: {
        textAlign: 'center',
        paddingVertical: 16,
    },
    divider: {
        height: 0.5,
    },
    option: {
        padding: 16,
        alignItems: 'center',
    },
    removeText: {
        color: '#ee6666',
    },
    cancelButton: {
        marginVertical: 8,
    },
});
