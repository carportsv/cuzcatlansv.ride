import { openStreetMapService } from '@/services/openStreetMapService';

export const usePlaces = () => {
  const searchPlaces = async (text: string) => {
    try {
      const results = await openStreetMapService.searchPlaces(text, 5);
      return results.map(result => ({
        description: result.display_name,
        place_id: result.place_id.toString(),
        structured_formatting: {
          main_text: result.display_name.split(',')[0],
          secondary_text: result.display_name.split(',').slice(1).join(',').trim()
        }
      }));
    } catch (error) {
      console.error('Error en usePlaces searchPlaces:', error);
      return [];
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      // Para OpenStreetMap, necesitamos buscar el lugar por su ID
      // Como Nominatim no tiene un endpoint directo para place_id, 
      // usaremos una búsqueda alternativa
      const results = await openStreetMapService.searchPlaces(placeId, 1);
      if (results.length > 0) {
        return {
          geometry: {
            location: {
              lat: parseFloat(results[0].lat),
              lng: parseFloat(results[0].lon)
            }
          },
          formatted_address: results[0].display_name
        };
      }
      throw new Error('Lugar no encontrado');
    } catch (error) {
      console.error('Error en usePlaces getPlaceDetails:', error);
      throw new Error('Error al obtener detalles del lugar');
    }
  };

  return { searchPlaces, getPlaceDetails };
}; 