import { useAuth } from '@/contexts/AuthContext';
import { acceptRide, RideRequest, updateRideStatus } from '@/services/rideService';
import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DriverRequestsScreen() {
  const { userId } = useAuth();
  const [assignedRides, setAssignedRides] = useState<RideRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    // Escuchar todas las solicitudes con status 'requested' para todos los conductores
    const q = firestore().collection('rideRequests').where('status', '==', 'requested').orderBy('createdAt', 'desc');
    const unsubscribe = q.onSnapshot(snapshot => {
      const rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RideRequest));
      setAssignedRides(rides);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleSelectRequest = (request: RideRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const handleAccept = async () => {
    if (!selectedRequest || !userId) return;
    setLoading(true);
    try {
      // Puedes calcular el precio aquí o pasarlo fijo
      const price = selectedRequest.price || 20;
      await acceptRide(selectedRequest.id!, userId, price);
    } catch (e) {
      // Manejar error
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !userId) return;
    setLoading(true);
    try {
      await updateRideStatus(selectedRequest.id!, 'cancelled', userId);
    } catch (e) {
      // Manejar error
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  // Recarga manual
  const handleManualRefresh = async () => {
    setLoading(true);
    try {
      const q = firestore().collection('rideRequests').where('status', '==', 'requested').orderBy('createdAt', 'desc');
      const snapshot = await q.get();
      const rides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RideRequest));
      setAssignedRides(rides);
      
      // Mostrar mensaje de confirmación
      Alert.alert(
        'Actualización completada',
        `Se encontraron ${rides.length} solicitudes disponibles.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert(
        'Error',
        'No se pudo actualizar la lista de solicitudes. Inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string | undefined) => {
    if (!id) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    const validIds = selectedIds.filter((id): id is string => !!id);
    if (validIds.length === 0) return;
    Alert.alert(
      'Borrar solicitudes',
      `¿Seguro que deseas borrar ${validIds.length} solicitud(es)? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: async () => {
          for (const id of validIds) {
            await firestore().collection('rideRequests').doc(id).delete();
          }
          setAssignedRides(assignedRides.filter(r => !validIds.includes(r.id ?? '')));
          setSelectedIds([]);
          setSelectMode(false);
        }}
      ]
    );
  };

  const renderRideRequest = ({ item }: { item: RideRequest }) => (
    <TouchableOpacity
      onLongPress={() => setSelectMode(true)}
      onPress={() => selectMode ? handleSelect(item.id) : handleSelectRequest(item)}
      style={[
        styles.card, 
        selectMode && selectedIds.includes(item.id ?? '') && styles.cardSelected
      ]}
    >
      {selectMode && (
        <View style={styles.selectionIndicator}>
          <Text style={styles.selectionText}>
            {selectedIds.includes(item.id ?? '') ? '✅' : '⬜️'}
          </Text>
        </View>
      )}
      
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <Text style={styles.cardIcon}>🚗</Text>
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Solicitud #{item.id?.slice(-6)}</Text>
          <Text style={styles.cardStatus}>Pendiente</Text>
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
      </View>
      
      {!selectMode && (
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => handleSelectRequest(item)}
        >
          <Text style={styles.viewDetailsText}>Ver detalles</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Solicitudes Asignadas</Text>
        <Text style={styles.headerSubtitle}>Gestiona las solicitudes de viaje disponibles</Text>
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
        
        {assignedRides.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🚗</Text>
            </View>
            <Text style={styles.emptyTitle}>No hay solicitudes disponibles</Text>
            <Text style={styles.emptyDescription}>
              No hay solicitudes de viaje pendientes en este momento. 
              Las nuevas solicitudes aparecerán aquí automáticamente.
            </Text>
          </View>
        ) : (
          <FlatList
            data={assignedRides}
            keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
            renderItem={renderRideRequest}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalle de Solicitud</Text>
                  <Text style={styles.modalSubtitle}>Revisa la información antes de aceptar</Text>
                </View>
                
                <View style={styles.modalBody}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>ID:</Text>
                    <Text style={styles.modalValue}>#{selectedRequest.id?.slice(-6)}</Text>
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>📍 Origen:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.origin?.address || 'No disponible'}</Text>
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>🎯 Destino:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.destination?.address || 'No disponible'}</Text>
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Estado:</Text>
                    <Text style={styles.modalStatus}>{selectedRequest.status}</Text>
                  </View>
                  
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Fecha:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.createdAt}</Text>
                  </View>
                </View>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.acceptButton]} 
                    onPress={handleAccept} 
                    disabled={loading}
                  >
                    <Text style={styles.modalButtonText}>✅ Aceptar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.rejectButton]} 
                    onPress={handleReject} 
                    disabled={loading}
                  >
                    <Text style={styles.modalButtonText}>❌ Rechazar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.closeButton]} 
                    onPress={handleCloseModal} 
                    disabled={loading}
                  >
                    <Text style={styles.modalButtonText}>🔒 Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#2563EB',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
  },
  content: {
    flex: 1,
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
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
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
    padding: 16,
  },
  cardIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardTitleContainer: {
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardStatus: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 2,
  },
  cardContent: {
    marginTop: 8,
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  viewDetailsButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    width: '85%',
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalInfoRow: {
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  modalValue: {
    fontSize: 14,
    color: '#333',
  },
  modalStatus: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  closeButton: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButtonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  actionButtonTextDisabled: {
    color: '#999',
  },
}); 