import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function DriverHistory() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Viajes</Text>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay viajes registrados</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
}); 