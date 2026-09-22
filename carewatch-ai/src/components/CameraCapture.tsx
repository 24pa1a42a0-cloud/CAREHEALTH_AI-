import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Button } from './Button';

interface CameraCaptureProps {
  onConfirm: (uri: string) => void;
  onSkip: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onConfirm, onSkip }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Permissions are still loading
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // No permission
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
        <Text style={styles.rationaleTitle}>Camera Access</Text>
        <Text style={styles.rationaleText}>
          We use this to analyze daily physical changes and posture. 
          Please grant camera permissions to capture your daily check-in photo.
        </Text>
        <Button title="Grant Permission" onPress={requestPermission} style={{ marginBottom: 12, width: '100%' }} />
        <Button title="Skip photo" variant="outline" onPress={onSkip} style={{ width: '100%' }} />
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: false });
      if (photo) {
        setPhotoUri(photo.uri);
      }
    }
  };

  if (photoUri) {
    // Review Step
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
        <View style={styles.reviewControls}>
          <TouchableOpacity style={styles.retakeButton} onPress={() => setPhotoUri(null)}>
            <Ionicons name="refresh" size={24} color={colors.textPrimary} />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirm(photoUri)}>
            <Ionicons name="checkmark" size={24} color={colors.white} />
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Live Camera
  return (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.camera} facing="front" ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <TouchableOpacity style={styles.skipTopBtn} onPress={onSkip}>
            <Text style={styles.skipTopText}>Skip</Text>
          </TouchableOpacity>
          <View style={styles.shutterContainer}>
            <TouchableOpacity style={styles.shutterOuter} onPress={handleCapture}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    minHeight: 300,
  },
  rationaleTitle: {
    fontFamily: fonts.inter.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  rationaleText: {
    fontFamily: fonts.inter.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  cameraContainer: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 3 / 4,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  skipTopBtn: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skipTopText: {
    color: colors.white,
    fontFamily: fonts.inter.medium,
    fontSize: 14,
  },
  shutterContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  shutterOuter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
  },
  previewContainer: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 3 / 4,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  reviewControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retakeText: {
    fontFamily: fonts.inter.medium,
    marginLeft: 6,
    color: colors.textPrimary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmText: {
    fontFamily: fonts.inter.medium,
    marginLeft: 6,
    color: colors.white,
  },
});
