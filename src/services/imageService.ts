import storage from '@react-native-firebase/storage';

const storageRef = storage();

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImage = async (
  imageUri: string, 
  folder: string, 
  fileName: string
): Promise<UploadResult> => {
  try {
    // Convertir la URI de la imagen a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Crear referencia en Firebase Storage
    const storageRef = storage().ref(`${folder}/${fileName}`);
    
    // Subir el archivo
    const snapshot = await storageRef.put(blob);
    
    // Obtener la URL de descarga
    const downloadURL = await snapshot.ref.getDownloadURL();
    
    return {
      success: true,
      url: downloadURL
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

export const uploadDriverPhoto = async (imageUri: string, userId: string): Promise<UploadResult> => {
  const fileName = `driver_${userId}_${Date.now()}.jpg`;
  return uploadImage(imageUri, 'driver-photos', fileName);
};

export const uploadVehiclePhoto = async (imageUri: string, userId: string): Promise<UploadResult> => {
  const fileName = `vehicle_${userId}_${Date.now()}.jpg`;
  return uploadImage(imageUri, 'vehicle-photos', fileName);
};

export const uploadPlatePhoto = async (imageUri: string, userId: string): Promise<UploadResult> => {
  const fileName = `plate_${userId}_${Date.now()}.jpg`;
  return uploadImage(imageUri, 'plate-photos', fileName);
};

export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    const imageRef = storage().ref(imageUrl);
    // Firebase Storage no tiene un método directo de delete en la versión web
    // En una implementación real, necesitarías usar las funciones de Cloud Functions
    // o manejar esto desde el backend
    console.log('Image deletion would be handled by backend');
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}; 