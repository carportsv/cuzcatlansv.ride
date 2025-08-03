import { openStreetMapService } from '@/services/openStreetMapService';

export const useGeocoding = () => {
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      return await openStreetMapService.getAddressFromCoordinates(latitude, longitude);
    } catch (error) {
      console.error('Error en useGeocoding:', error);
      throw new Error('No se pudo obtener la dirección');
    }
  };

  return { getAddressFromCoordinates };
}; 