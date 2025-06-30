import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { uploadDriverPhoto, uploadPlatePhoto, uploadVehiclePhoto } from '../services/imageService';

interface ImageUploadProps {
  title: string;
  subtitle: string;
  currentImage?: string;
  onImageSelected: (imageUri: string) => void;
  placeholderIcon: keyof typeof MaterialIcons.glyphMap;
  imageStyle?: 'round' | 'square';
  uploadType?: 'driver' | 'vehicle' | 'plate';
}

export default function ImageUpload({
  title,
  subtitle,
  currentImage,
  onImageSelected,
  placeholderIcon,
  imageStyle = 'square',
  uploadType = 'driver'
}: ImageUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permisos Requeridos',
        'Necesitamos acceso a la cámara y galería para subir fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const uploadToFirebase = async (imageUri: string) => {
    if (!user?.uid) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    setIsUploading(true);
    try {
      let uploadResult;
      
      switch (uploadType) {
        case 'driver':
          uploadResult = await uploadDriverPhoto(imageUri, user.uid);
          break;
        case 'vehicle':
          uploadResult = await uploadVehiclePhoto(imageUri, user.uid);
          break;
        case 'plate':
          uploadResult = await uploadPlatePhoto(imageUri, user.uid);
          break;
        default:
          uploadResult = await uploadDriverPhoto(imageUri, user.uid);
      }

      if (uploadResult.success && uploadResult.url) {
        onImageSelected(uploadResult.url);
        Alert.alert('Éxito', 'Imagen subida correctamente');
      } else {
        Alert.alert('Error', uploadResult.error || 'Error al subir la imagen');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: imageStyle === 'round' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadToFirebase(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: imageStyle === 'round' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadToFirebase(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  const handlePhotoUpload = () => {
    if (isUploading) return;
    
    Alert.alert(
      'Subir Foto',
      'Selecciona una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: takePhoto },
        { text: 'Galería', onPress: pickFromGallery }
      ]
    );
  };

  const imageContainerStyle = imageStyle === 'round' ? styles.roundImage : styles.squareImage;
  const imagePreviewStyle = imageStyle === 'round' ? styles.roundPhotoPreview : styles.squarePhotoPreview;

  return (
    <View style={styles.photoSection}>
      <Text style={styles.photoTitle}>{title}</Text>
      <Text style={styles.photoSubtitle}>{subtitle}</Text>
      
      <View style={styles.photoContainer}>
        {currentImage ? (
          <Image source={{ uri: currentImage }} style={imagePreviewStyle} />
        ) : (
          <View style={[styles.photoPlaceholder, imageContainerStyle]}>
            <MaterialIcons name={placeholderIcon} size={48} color="#9CA3AF" />
            <Text style={styles.photoPlaceholderText}>Sin foto</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]} 
          onPress={handlePhotoUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="camera-alt" size={20} color="#2563EB" />
              <Text style={styles.uploadButtonText}>
                {currentImage ? 'Cambiar Foto' : 'Subir Foto'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  photoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundPhotoPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  squarePhotoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roundImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
  },
  squareImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
}); 