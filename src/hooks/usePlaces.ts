const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI';

export const usePlaces = () => {
  const searchPlaces = async (text: string) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_API_KEY}&language=es`
    );
    const data = await response.json();
    return data.predictions || [];
  };

  const getPlaceDetails = async (placeId: string) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&language=es&fields=geometry,formatted_address`
    );
    const data = await response.json();
    return data.result;
  };

  return { searchPlaces, getPlaceDetails };
}; 