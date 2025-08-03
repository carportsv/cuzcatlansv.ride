import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { DriverService } from '@/services/driverService';
import { acceptRide, RideRequest } from '@/services/rideService';
import { supabase } from '@/services/supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DriverRequestsScreen() {
  const { userId: firebaseUid } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [assignedRides, setAssignedRides] = useState<RideRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const [lastRequestCount, setLastRequestCount] = useState(0);

  const MAX_REQUESTS = 20; // Límite de solicitudes a mostrar

  // Obtener el driver_id de Supabase
  useEffect(() => {
    const getDriverId = async () => {
      if (!firebaseUid) return;
      
      const driverId = await DriverService.getDriverIdByFirebaseUid(firebaseUid);
      if (driverId) {
        setDriverId(driverId);
      } else {
        console.error('[DriverRequests] No se pudo obtener el driver_id para:', firebaseUid);
      }
    };
    getDriverId();
  }, [firebaseUid]);

  useEffect(() => {
    if (!driverId) return;
    
    let subscription: any = null;
    let isMounted = true;
    
    const fetchRequests = async () => {
      try {
        console.log('[DriverRequests] Cargando solicitudes...');
        const { data, error } = await supabase
          .from('ride_requests')
          .select('*')
          .eq('status', 'requested')
          .is('driver_id', null) // Solo solicitudes sin asignar
          .order('created_at', { ascending: false })
          .limit(MAX_REQUESTS);
        
        if (error) {
          console.error('[DriverRequests] Error al cargar solicitudes:', error);
          return;
        }
        
        if (isMounted) {
          const newCount = data?.length || 0;
          console.log('[DriverRequests] Solicitudes cargadas:', newCount);
          
          // Detectar si hay nuevas solicitudes
          if (newCount > lastRequestCount && lastRequestCount > 0) {
            setHasNewRequests(true);
            console.log('[DriverRequests] ¡Nuevas solicitudes detectadas!');
          }
          
          setLastRequestCount(newCount);
          setAssignedRides(data || []);
        }
      } catch (error) {
        console.error('[DriverRequests] Error inesperado:', error);
      }
    };
    
    // Cargar solicitudes iniciales
    fetchRequests();
    
    // Configurar suscripción en tiempo real
    subscription = supabase
      .channel('driver_requests_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ride_requests',
          filter: 'status=eq.requested'
        },
        (payload) => {
          console.log('[DriverRequests] Nueva solicitud detectada:', payload);
          if (isMounted) {
            fetchRequests();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ride_requests',
          filter: 'status=eq.requested'
        },
        (payload) => {
          console.log('[DriverRequests] Solicitud actualizada:', payload);
          if (isMounted) {
            fetchRequests();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'ride_requests',
          filter: 'status=eq.requested'
        },
        (payload) => {
          console.log('[DriverRequests] Solicitud eliminada:', payload);
          if (isMounted) {
            fetchRequests();
          }
        }
      )
      .subscribe((status) => {
        console.log('[DriverRequests] Estado de suscripción:', status);
      });
    
    return () => {
      console.log('[DriverRequests] Limpiando suscripción...');
      isMounted = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [driverId]);

  const handleSelectRequest = (request: RideRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const handleAccept = async () => {
    if (!selectedRequest || !driverId) return;
    setLoading(true);
    try {
      // Puedes calcular el precio aquí o pasarlo fijo
      const price = selectedRequest.price || 20;
      await acceptRide(selectedRequest.id!, driverId, price);
      handleCloseModal();
      
      // Mostrar mensaje de éxito
      Alert.alert(
        '¡Viaje Aceptado!',
        'Has aceptado el viaje exitosamente. El pasajero será notificado.',
        [
          { 
            text: 'Ver Viaje Activo', 
            onPress: () => {
              // Navegar a la pantalla de viaje activo
              // Aquí puedes agregar la navegación si es necesaria
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (e) {
      console.error('Error al aceptar viaje:', e);
      Alert.alert('Error', 'No se pudo aceptar el viaje');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar ${selectedIds.length} solicitud(es)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // En Supabase, podemos marcar como eliminado o usar soft delete
              // Por ahora, solo eliminamos de la vista local
              setAssignedRides(prev => prev.filter(ride => !selectedIds.includes(ride.id!)));
              setSelectedIds([]);
              setSelectMode(false);
            } catch (error) {
              console.error('Error al eliminar solicitudes:', error);
              Alert.alert('Error', 'No se pudieron eliminar las solicitudes seleccionadas');
            }
          }
        }
      ]
    );
  };

  const handleManualRefresh = async () => {
    if (!driverId) return;
    setLoading(true);
    setHasNewRequests(false); // Limpiar notificación al actualizar manualmente
    
    try {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('status', 'requested')
        .is('driver_id', null) // Solo solicitudes sin asignar
        .order('created_at', { ascending: false })
        .limit(MAX_REQUESTS);
      
      if (error) {
        console.error('Error al actualizar:', error);
        Alert.alert('Error', 'No se pudo actualizar la lista de solicitudes');
        return;
      }
      
      setAssignedRides(data);
      console.log('[DriverRequests] Actualización manual completada:', data.length, 'solicitudes');
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar la lista de solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const renderRequestItem = ({ item }: { item: RideRequest }) => (
    <TouchableOpacity
      onLongPress={() => setSelectMode(true)}
      onPress={() => selectMode ? handleSelect(item.id!) : handleSelectRequest(item)}
      style={[
        styles.card, 
        selectMode && selectedIds.includes(item.id!) && styles.cardSelected
      ]}
    >
      {selectMode && (
        <View style={styles.selectionIndicator}>
          <MaterialIcons 
            name={selectedIds.includes(item.id!) ? 'check-circle' : 'radio-button-unchecked'} 
            size={24} 
            color={selectedIds.includes(item.id!) ? '#2563EB' : '#9CA3AF'} 
          />
        </View>
      )}
      
      <View style={styles.cardHeader}>
        <View style={styles.cardIconContainer}>
          <MaterialIcons name="local-taxi" size={24} color="#fff" />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>Solicitud #{item.id?.slice(-6)}</Text>
          <Text style={styles.cardStatus}>Pendiente</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <MaterialIcons name="my-location" size={16} color="#2563EB" />
            <Text style={styles.locationLabel}>Origen:</Text>
          </View>
          <Text style={styles.locationText}>{item.origin?.address || 'No disponible'}</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <MaterialIcons name="place" size={16} color="#EF4444" />
            <Text style={styles.locationLabel}>Destino:</Text>
          </View>
          <Text style={styles.locationText}>{item.destination?.address || 'No disponible'}</Text>
        </View>
        
        <View style={styles.dateContainer}>
          <View style={styles.locationRow}>
            <MaterialIcons name="schedule" size={16} color="#6B7280" />
            <Text style={styles.dateLabel}>Fecha:</Text>
          </View>
          <Text style={styles.dateText}>
            {item.createdAt ? new Date(item.createdAt).toLocaleString('es-ES') : 'Fecha no disponible'}
          </Text>
        </View>
      </View>
      
      {!selectMode && (
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => handleSelectRequest(item)}
        >
          <MaterialIcons name="visibility" size={16} color="#fff" />
          <Text style={styles.viewDetailsText}>Ver detalles</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading && assignedRides.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <AppHeader subtitle="Solicitudes de viaje" />
      <View style={styles.container}>
        <View style={styles.content}>
          {hasNewRequests && (
            <View style={styles.newRequestsBanner}>
              <MaterialIcons name="notifications-active" size={20} color="#fff" />
              <Text style={styles.newRequestsText}>
                ¡Nuevas solicitudes disponibles! Toca "Actualizar" para verlas.
              </Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                loading && styles.actionButtonDisabled,
                hasNewRequests && styles.actionButtonNewRequests
              ]} 
              onPress={handleManualRefresh}
              disabled={loading}
            >
              <MaterialIcons 
                name={loading ? 'hourglass-empty' : hasNewRequests ? 'notifications-active' : 'refresh'} 
                size={20} 
                color={loading ? '#9CA3AF' : hasNewRequests ? '#10B981' : '#2563EB'} 
              />
              <Text style={[
                styles.actionButtonText, 
                loading && styles.actionButtonTextDisabled,
                hasNewRequests && styles.actionButtonTextNewRequests
              ]}>
                {loading ? 'Actualizando...' : hasNewRequests ? '¡Nuevas solicitudes!' : 'Actualizar'}
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
              <MaterialIcons 
                name={selectMode ? 'close' : 'check-box'} 
                size={20} 
                color={selectMode ? '#fff' : '#2563EB'} 
              />
              <Text style={[styles.actionButtonText, selectMode && styles.actionButtonTextActive]}>
                {selectMode ? "Cancelar" : "Seleccionar"}
              </Text>
            </TouchableOpacity>
            
            {selectMode && selectedIds.length > 0 && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSelected}>
                <MaterialIcons name="delete" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>Borrar ({selectedIds.length})</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {assignedRides.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <MaterialIcons name="local-taxi" size={48} color="#fff" />
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
              keyExtractor={(item) => item.id!}
              renderItem={renderRequestItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalles del Viaje</Text>
            {selectedRequest && (
              <View style={styles.modalDetails}>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Origen: </Text>
                  {selectedRequest.origin?.address}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Destino: </Text>
                  {selectedRequest.destination?.address}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Distancia: </Text>
                  {selectedRequest.distance ? `${(selectedRequest.distance / 1000).toFixed(1)} km` : 'No disponible'}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Duración: </Text>
                  {selectedRequest.duration ? `${Math.round(selectedRequest.duration / 60)} min` : 'No disponible'}
                </Text>
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.acceptButton, loading && styles.acceptButtonDisabled]} 
                onPress={handleAccept}
                disabled={loading}
              >
                <Text style={styles.acceptButtonText}>
                  {loading ? 'Aceptando...' : 'Aceptar Viaje'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 8,
    fontFamily: 'Poppins',
  },
  actionButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  actionButtonTextDisabled: {
    color: '#9CA3AF',
  },
  actionButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  actionButtonTextActive: {
    color: '#fff',
  },
  actionButtonNewRequests: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  actionButtonTextNewRequests: {
    color: '#fff',
  },
  newRequestsBanner: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  newRequestsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Poppins',
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
    fontFamily: 'Poppins',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardSelected: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  selectionIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    backgroundColor: '#2563EB',
    borderRadius: 50,
    padding: 12,
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Poppins',
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    fontFamily: 'Poppins',
  },
  cardContent: {
    flex: 1,
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  locationText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginLeft: 20,
    fontFamily: 'Poppins',
  },
  dateContainer: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  dateText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginLeft: 20,
    fontFamily: 'Poppins',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Poppins',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontFamily: 'Poppins',
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    backgroundColor: '#2563EB',
    borderRadius: 50,
    padding: 20,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins',
    marginBottom: 24,
  },
  list: {
    paddingBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  modalDetails: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  modalLabel: {
    fontWeight: '600',
    color: '#6B7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
}); 