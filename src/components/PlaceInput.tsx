import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PlaceInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onPress?: () => void;
  style?: any;
}

export default function PlaceInput({
  placeholder,
  value,
  onChangeText,
  onPress,
  style
}: PlaceInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <MaterialIcons 
          name="place" 
          size={20} 
          color={isFocused ? '#2563EB' : '#9CA3AF'} 
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#9CA3AF"
        />
        {onPress && (
          <TouchableOpacity onPress={onPress} style={styles.button}>
            <MaterialIcons name="my-location" size={20} color="#2563EB" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputContainerFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  button: {
    padding: 4,
  },
});