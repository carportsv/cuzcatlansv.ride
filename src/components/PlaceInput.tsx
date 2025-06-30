import { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

interface PlaceInputProps {
  placeholder: string;
  onPress: (data: { description: string; place_id: string; coords?: { latitude: number; longitude: number } }) => void;
  styles?: any;
  textInputProps?: any;
}

interface Suggestion {
  description: string;
  place_id: string;
}

export default function PlaceInput({ 
  placeholder, 
  onPress, 
  styles = {}, 
  textInputProps = {} 
}: PlaceInputProps) {
  const [fallbackText, setFallbackText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<any>(null);

  const defaultStyles = {
    container: {
      flex: 0,
      width: '100%',
    },
    description: {
      color: '#1F2937',
      fontSize: 14,
    },
    listView: {
      backgroundColor: '#fff',
      borderColor: '#E5E7EB',
      borderRadius: 8,
      borderWidth: 1,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      maxHeight: 200,
    },
    powered: {
      display: 'none',
    },
    row: {
      flexDirection: 'row',
      height: 44,
      padding: 13,
    },
    separator: {
      backgroundColor: '#E5E7EB',
      height: 1,
    },
    textInput: {
      backgroundColor: '#F3F4F6',
      borderColor: '#E5E7EB',
      borderRadius: 8,
      borderWidth: 1,
      color: '#1F2937',
      fontSize: 16,
      height: 44,
      paddingHorizontal: 12,
    },
    textInputContainer: {
      backgroundColor: '#fff',
      borderBottomWidth: 0,
      borderTopWidth: 0,
      marginHorizontal: 0,
      paddingHorizontal: 0,
    },
  };

  const mergedStyles = {
    ...defaultStyles,
    ...styles,
  };

  // Buscar lugares usando la API de Google Places Autocomplete
  const searchPlaces = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const apiKey = 'AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI';
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&language=es&types=geocode`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.predictions && Array.isArray(data.predictions)) {
        const places = data.predictions.map((pred: any) => ({
          description: pred.description,
          place_id: pred.place_id,
        }));
        setSuggestions(places);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener detalles del lugar usando el place_id
  const fetchPlaceDetails = async (place_id: string) => {
    const apiKey = 'AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}&language=es`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.result && data.result.geometry && data.result.geometry.location) {
        return {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
        };
      }
    } catch (error) {
      // Ignorar error, coords será undefined
    }
    return undefined;
  };

  const handleFallbackPress = async (suggestion: Suggestion) => {
    setFallbackText(suggestion.description);
    setShowSuggestions(false);
    let coords;
    if (suggestion.place_id) {
      coords = await fetchPlaceDetails(suggestion.place_id);
    }
    onPress({
      description: suggestion.description,
      place_id: suggestion.place_id,
      coords,
    });
  };

  const handleFallbackChangeText = (text: string) => {
    setFallbackText(text);
    searchPlaces(text);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    if (textInputProps.onFocus) {
      textInputProps.onFocus();
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
    if (textInputProps.onBlur) {
      textInputProps.onBlur();
    }
  };

  return (
    <View style={mergedStyles.container}>
      <TextInput
        ref={inputRef}
        style={mergedStyles.textInput}
        placeholder={placeholder}
        value={fallbackText}
        onChangeText={handleFallbackChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...textInputProps}
      />
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <View style={mergedStyles.listView}>
          {isLoading && (
            <View style={mergedStyles.row}>
              <Text style={{ color: '#666', fontStyle: 'italic' }}>
                Buscando...
              </Text>
            </View>
          )}
          {suggestions.map((suggestion, index) => (
            <View key={index}>
              <Text
                style={[mergedStyles.row, { color: '#1F2937' }]}
                onPress={() => handleFallbackPress(suggestion)}
              >
                {suggestion.description}
              </Text>
              {index < suggestions.length - 1 && (
                <View style={mergedStyles.separator} />
              )}
            </View>
          ))}
          {suggestions.length === 0 && !isLoading && fallbackText.length >= 3 && (
            <View style={mergedStyles.row}>
              <Text style={{ color: '#666', fontStyle: 'italic' }}>
                No se encontraron resultados
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
} 