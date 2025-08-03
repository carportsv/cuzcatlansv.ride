import { realtimeService, UserPriority } from '@/services/realtimeService';
import { useEffect, useState } from 'react';

interface UseHybridRealtimeOptions {
  userId: string;
  context: {
    role: 'user' | 'driver';
    hasActiveRide?: boolean;
    isAvailable?: boolean;
    isSearching?: boolean;
  };
  onRealtimeUpdate?: (data: any) => void;
  onPollingUpdate?: (data: any) => void;
}

interface UseHybridRealtimeReturn {
  isRealtimeActive: boolean;
  priority: UserPriority;
  stats: {
    activeConnections: number;
    maxConnections: number;
    pollingUsers: number;
    totalUsers: number;
  };
  connect: () => Promise<void>;
  disconnect: () => void;
  updateContext: (newContext: UseHybridRealtimeOptions['context']) => Promise<void>;
}

export const useHybridRealtime = ({
  userId,
  context,
  onRealtimeUpdate,
  onPollingUpdate
}: UseHybridRealtimeOptions): UseHybridRealtimeReturn => {
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [priority, setPriority] = useState<UserPriority>(UserPriority.LOW);
  const [stats, setStats] = useState({
    activeConnections: 0,
    maxConnections: 2,
    pollingUsers: 0,
    totalUsers: 0
  });

  const connect = async () => {
    try {
      await realtimeService.realtimeManager.connectUser(userId, context);
      
      // Actualizar estado
      const currentStats = realtimeService.realtimeManager.getStats();
      setStats(currentStats);
      setIsRealtimeActive(currentStats.activeConnections > 0);
      
      // Determinar prioridad actual
      const userSession = realtimeService.realtimeManager['userSessions'].get(userId);
      if (userSession) {
        setPriority(userSession.priority);
      }
      
      console.log(`[useHybridRealtime] Conectado ${userId} con prioridad ${priority}`);
    } catch (error) {
      console.error(`[useHybridRealtime] Error conectando ${userId}:`, error);
    }
  };

  const disconnect = () => {
    realtimeService.realtimeManager.disconnectUser(userId);
    setIsRealtimeActive(false);
    console.log(`[useHybridRealtime] Desconectado ${userId}`);
  };

  const updateContext = async (newContext: UseHybridRealtimeOptions['context']) => {
    try {
      // Desconectar con contexto anterior
      disconnect();
      
      // Reconectar con nuevo contexto
      await realtimeService.realtimeManager.connectUser(userId, newContext);
      
      // Actualizar estado
      const currentStats = realtimeService.realtimeManager.getStats();
      setStats(currentStats);
      setIsRealtimeActive(currentStats.activeConnections > 0);
      
      // Determinar nueva prioridad
      const userSession = realtimeService.realtimeManager['userSessions'].get(userId);
      if (userSession) {
        setPriority(userSession.priority);
      }
      
      console.log(`[useHybridRealtime] Contexto actualizado para ${userId}:`, newContext);
    } catch (error) {
      console.error(`[useHybridRealtime] Error actualizando contexto para ${userId}:`, error);
    }
  };

  // Conectar automáticamente al montar
  useEffect(() => {
    if (userId) {
      connect();
    }

    // Limpiar al desmontar
    return () => {
      if (userId) {
        disconnect();
      }
    };
  }, [userId]);

  // Actualizar contexto cuando cambie
  useEffect(() => {
    if (userId) {
      updateContext(context);
    }
  }, [userId, JSON.stringify(context)]);

  return {
    isRealtimeActive,
    priority,
    stats,
    connect,
    disconnect,
    updateContext
  };
};

// Hook simplificado para casos básicos
export const useSimpleHybridRealtime = (userId: string, role: 'user' | 'driver') => {
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const context = {
      role,
      hasActiveRide: false,
      isAvailable: false,
      isSearching: false
    };

    const connect = async () => {
      await realtimeService.realtimeManager.connectUser(userId, context);
      const stats = realtimeService.realtimeManager.getStats();
      setIsRealtimeActive(stats.activeConnections > 0);
    };

    connect();

    return () => {
      realtimeService.realtimeManager.disconnectUser(userId);
    };
  }, [userId, role]);

  return { isRealtimeActive };
}; 