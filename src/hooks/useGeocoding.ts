const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI';

export const useGeocoding = () => {
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    throw new Error('No address found');
  };

  return { getAddressFromCoordinates };
}; 