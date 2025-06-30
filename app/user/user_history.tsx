import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RideRequest {
  id: string;
  origin: { address: string };
  destination: { address: string };
  status: string;
  createdAt: string;
}

const UserHistoryScreen = () => {
  const [rides, setRides] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userUID, setUserUID] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const fetchUserIdAndListen = async () => {
      const uid = await AsyncStorage.getItem('userUID');
      setUserUID(uid);
      if (!uid) {
        Alert.alert('Error', 'No se pudo obtener el ID del usuario');
        setLoading(false);
        return;
      }
      const q = firestore()
        .collection('rideRequests')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc');

      unsubscribe = q.onSnapshot((querySnapshot) => {
        const ridesData: RideRequest[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            origin: data.origin,
            destination: data.destination,
            status: data.status,
            createdAt: data.createdAt,
          };
        });
        setRides(ridesData);
        setLoading(false);
      });
    };
    fetchUserIdAndListen();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleManualRefresh = async () => {
    if (!userUID) return;
    setLoading(true);
    const q = firestore()
      .collection('rideRequests')
      .where('userId', '==', userUID)
      .orderBy('createdAt', 'desc');
    const querySnapshot = await q.get();
    const ridesData: RideRequest[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        origin: data.origin,
        destination: data.destination,
        status: data.status,
        createdAt: data.createdAt,
      };
    });
    setRides(ridesData);
    setLoading(false);
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      'Borrar viajes',
      `¿Seguro que deseas borrar ${selectedIds.length} viaje(s)? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: async () => {
          for (const id of selectedIds) {
            await firestore().collection('rideRequests').doc(id).delete();
          }
          setRides(rides.filter(r => !selectedIds.includes(r.id)));
          setSelectedIds([]);
          setSelectMode(false);
        }}
      ]
    );
  };

  const renderItem = ({ item }: { item: RideRequest }) => (
    <TouchableOpacity
      onLongPress={() => setSelectMode(true)}
      onPress={() => selectMode ? handleSelect(item.id) : null}
      style={[
        styles.card, 
        selectMode && selectedIds.includes(item.id) && styles.cardSelected
      ]}
    >
      {selectMode && (
        <View style={styles.selectionIndicator}>
          <Text style={styles.selectionText}>
            {selectedIds.includes(item.id) ? '✅' : '⬜️'}
          </Text>
        </View>
      )}
      
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Text style={styles.cardIcon}>🚗</Text>
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Viaje #{item.id?.slice(-6)}</Text>
          <Text style={styles.cardStatus}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>📍 Origen:</Text>
          <Text style={styles.locationText}>{item.origin?.address || 'No disponible'}</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>🎯 Destino:</Text>
          <Text style={styles.locationText}>{item.destination?.address || 'No disponible'}</Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>📅 Fecha:</Text>
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial de Viajes</Text>
        <Text style={styles.headerSubtitle}>Revisa tus viajes anteriores</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, loading && styles.actionButtonDisabled]} 
            onPress={handleManualRefresh}
            disabled={loading}
          >
            <Text style={[styles.actionButtonText, loading && styles.actionButtonTextDisabled]}>
              {loading ? '⏳ Actualizando...' : '🔄 Actualizar'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, selectMode && styles.actionButtonActive]} 
            onPress={() => {
              if (selectMode) {
                setSelectMode(false);
                setSelectedIds([]);
              } else {
                setSelectMode(true);
              }
            }}
          >
            <Text style={[styles.actionButtonText, selectMode && styles.actionButtonTextActive]}>
              {selectMode ? "❌ Cancelar" : "✅ Seleccionar"}
            </Text>
          </TouchableOpacity>
          
          {selectMode && selectedIds.length > 0 && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSelected}>
              <Text style={styles.deleteButtonText}>🗑️ Borrar ({selectedIds.length})</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {rides.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🚗</Text>
            </View>
            <Text style={styles.emptyTitle}>No hay viajes registrados</Text>
            <Text style={styles.emptyDescription}>
              Aún no tienes viajes en tu historial. 
              Los viajes completados aparecerán aquí automáticamente.
            </Text>
          </View>
        ) : (
          <FlatList
            data={rides}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default UserHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#2563EB',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
  actionButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  deleteButton: {
    padding: 16,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardSelected: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  selectionIndicator: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  selectionText: {
    fontSize: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    backgroundColor: '#2563EB',
    borderRadius: 50,
    padding: 12,
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  cardStatus: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    textAlign: 'center',
  },
  cardContent: {
    flex: 1,
  },
  locationContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
  },
  dateContainer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyIconContainer: {
    backgroundColor: '#2563EB',
    borderRadius: 50,
    padding: 16,
  },
  emptyIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingBottom: 16,
  },
}); 