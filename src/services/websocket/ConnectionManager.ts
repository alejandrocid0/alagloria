import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Tipos para el gestor de conexiones
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
export type ConnectionCallback = (status: ConnectionStatus) => void;
export type ChannelEventCallback = (payload: any) => void;

interface ManagedChannel {
  channel: RealtimeChannel;
  callbacks: Map<string, ChannelEventCallback>;
  status: ConnectionStatus;
  lastActivity: number;
}

/**
 * Gestor centralizado de conexiones WebSocket
 * Maneja todas las conexiones, reconexiones y estado de canales WebSocket
 */
class ConnectionManager {
  private channels: Map<string, ManagedChannel> = new Map();
  private globalListeners: ConnectionCallback[] = [];
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 10;
  private reconnectionTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    console.log('[ConnectionManager] Inicializando gestor de conexiones WebSocket');
    this.startHeartbeat();
  }

  /**
   * Obtener el estado actual de la conexión
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Obtener el número de intentos de reconexión
   */
  public getReconnectionAttempts(): number {
    return this.reconnectionAttempts;
  }

  /**
   * Suscribirse a cambios de estado de la conexión
   */
  public onConnectionChange(callback: ConnectionCallback): () => void {
    this.globalListeners.push(callback);
    
    // Ejecutar inmediatamente con el estado actual
    callback(this.connectionStatus);
    
    // Devolver función para dejar de escuchar
    return () => {
      this.globalListeners = this.globalListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Suscribirse a cambios en una tabla específica
   */
  public subscribeToTable(
    tableName: string, 
    filter: Record<string, any>,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
    callback: ChannelEventCallback
  ): string {
    const channelId = `${tableName}-${JSON.stringify(filter)}-${event}`;
    console.log(`[ConnectionManager] Suscribiendo a tabla ${tableName} con filtro:`, filter);
    
    // Si el canal ya existe, añadir nuevo callback
    if (this.channels.has(channelId)) {
      const callbackId = `${channelId}-${Date.now()}-${Math.random()}`;
      const managedChannel = this.channels.get(channelId)!;
      managedChannel.callbacks.set(callbackId, callback);
      return callbackId;
    }
    
    // Crear nuevo canal
    try {
      // Crear una instancia del canal
      const channel = supabase.channel(channelId);
      
      // Configurar el canal para escuchar cambios en la base de datos
      channel.on(
        'postgres_changes', 
        {
          event: event, 
          schema: 'public', 
          table: tableName,
          filter: filter
        }, 
        (payload) => {
          console.log(`[ConnectionManager] Recibido evento en tabla ${tableName}:`, payload);
          
          // Actualizar timestamp de última actividad
          if (this.channels.has(channelId)) {
            const managedChannel = this.channels.get(channelId)!;
            managedChannel.lastActivity = Date.now();
            managedChannel.status = 'connected';
            
            // Ejecutar todos los callbacks registrados para este canal
            managedChannel.callbacks.forEach(cb => {
              try {
                cb(payload);
              } catch (err) {
                console.error(`[ConnectionManager] Error en callback para canal ${channelId}:`, err);
              }
            });
          }
          
          // Actualizar estado global de conexión
          this.updateConnectionStatus('connected');
        }
      );
      
      // Ahora suscribirse al canal después de configurar los listeners
      channel.subscribe((status) => {
        console.log(`[ConnectionManager] Canal ${channelId} estado:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log(`[ConnectionManager] Canal ${channelId} suscrito correctamente`);
          
          if (this.channels.has(channelId)) {
            const managedChannel = this.channels.get(channelId)!;
            managedChannel.status = 'connected';
          }
          
          this.updateConnectionStatus('connected');
        }
        
        if (status === 'CHANNEL_ERROR') {
          console.error(`[ConnectionManager] Error en canal ${channelId}`);
          
          if (this.channels.has(channelId)) {
            const managedChannel = this.channels.get(channelId)!;
            managedChannel.status = 'error';
          }
          
          this.updateConnectionStatus('error');
          this.scheduleReconnect(channelId);
        }
        
        if (status === 'CLOSED') {
          console.warn(`[ConnectionManager] Canal ${channelId} cerrado`);
          
          if (this.channels.has(channelId)) {
            const managedChannel = this.channels.get(channelId)!;
            managedChannel.status = 'disconnected';
          }
          
          // Comprobar si todos los canales están desconectados
          this.checkAllChannelsStatus();
          this.scheduleReconnect(channelId);
        }
      });
      
      // Guardar canal gestionado
      const callbackId = `${channelId}-${Date.now()}`;
      const managedChannel: ManagedChannel = {
        channel,
        callbacks: new Map([[callbackId, callback]]),
        status: 'connecting',
        lastActivity: Date.now()
      };
      
      this.channels.set(channelId, managedChannel);
      this.updateConnectionStatus('connecting');
      
      return callbackId;
    } catch (error) {
      console.error('[ConnectionManager] Error creando canal:', error);
      this.updateConnectionStatus('error');
      throw error;
    }
  }

  /**
   * Cancelar suscripción a un callback específico
   */
  public unsubscribe(callbackId: string): boolean {
    // Buscar el canal que contiene este callback
    for (const [channelId, managedChannel] of this.channels.entries()) {
      if (managedChannel.callbacks.has(callbackId)) {
        managedChannel.callbacks.delete(callbackId);
        
        // Si no quedan callbacks, cerrar el canal
        if (managedChannel.callbacks.size === 0) {
          console.log(`[ConnectionManager] Cerrando canal ${channelId} por falta de suscriptores`);
          supabase.removeChannel(managedChannel.channel);
          this.channels.delete(channelId);
        }
        
        return true;
      }
    }
    
    return false;
  }

  /**
   * Reconectar todos los canales
   */
  public reconnectAll(): void {
    console.log('[ConnectionManager] Intentando reconectar todos los canales');
    this.updateConnectionStatus('connecting');
    
    for (const [channelId, managedChannel] of this.channels.entries()) {
      console.log(`[ConnectionManager] Reconectando canal ${channelId}`);
      
      try {
        // Primero eliminar el canal actual
        supabase.removeChannel(managedChannel.channel);
        
        // Crear nuevo canal con las mismas configuraciones
        const newChannel = supabase.channel(channelId);
        
        // Re-suscribir con los mismos parámetros
        // Nota: Esto es una simplificación, habría que extraer los parámetros exactos
        newChannel.subscribe();
        
        // Actualizar el canal en nuestro registro
        managedChannel.channel = newChannel;
        managedChannel.status = 'connecting';
        managedChannel.lastActivity = Date.now();
      } catch (error) {
        console.error(`[ConnectionManager] Error reconectando canal ${channelId}:`, error);
        managedChannel.status = 'error';
      }
    }
  }

  /**
   * Verificar estado de todos los canales gestionados
   */
  private checkAllChannelsStatus(): void {
    let allDisconnected = true;
    let anyError = false;
    let anyConnecting = false;
    
    for (const [, managedChannel] of this.channels.entries()) {
      if (managedChannel.status === 'connected') {
        allDisconnected = false;
      }
      
      if (managedChannel.status === 'error') {
        anyError = true;
      }
      
      if (managedChannel.status === 'connecting') {
        anyConnecting = true;
      }
    }
    
    // Actualizar estado global según el estado de todos los canales
    if (allDisconnected) {
      this.updateConnectionStatus('disconnected');
    } else if (anyError) {
      this.updateConnectionStatus('error');
    } else if (anyConnecting) {
      this.updateConnectionStatus('connecting');
    } else {
      this.updateConnectionStatus('connected');
    }
  }

  /**
   * Actualizar el estado global de la conexión y notificar a los suscriptores
   */
  private updateConnectionStatus(newStatus: ConnectionStatus): void {
    // Solo notificar si el estado ha cambiado
    if (this.connectionStatus !== newStatus) {
      const previousStatus = this.connectionStatus;
      this.connectionStatus = newStatus;
      
      console.log(`[ConnectionManager] Estado de conexión cambiado: ${previousStatus} -> ${newStatus}`);
      
      // Notificar a todos los suscriptores
      this.globalListeners.forEach(callback => {
        try {
          callback(newStatus);
        } catch (err) {
          console.error('[ConnectionManager] Error en callback de estado de conexión:', err);
        }
      });
      
      // Mostrar notificación al usuario solo en ciertos casos
      if (previousStatus === 'connected' && newStatus === 'disconnected') {
        toast({
          title: "Conexión perdida",
          description: "Intentando reconectar...",
          variant: "destructive"
        });
      }
      
      if (previousStatus !== 'connected' && newStatus === 'connected') {
        if (this.reconnectionAttempts > 0) {
          toast({
            title: "Conexión restablecida",
            description: "La conexión ha sido restablecida correctamente",
            variant: "default"
          });
        }
      }
      
      // Resetear contador de reconexiones si conectamos correctamente
      if (newStatus === 'connected') {
        this.reconnectionAttempts = 0;
      }
    }
  }

  /**
   * Programar un intento de reconexión con backoff exponencial
   */
  private scheduleReconnect(channelId?: string): void {
    // Evitar múltiples timers de reconexión
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
    }
    
    if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
      console.error(`[ConnectionManager] Máximo número de intentos de reconexión alcanzado (${this.maxReconnectionAttempts})`);
      
      toast({
        title: "Error de conexión",
        description: "No se pudo restablecer la conexión después de varios intentos",
        variant: "destructive"
      });
      
      return;
    }
    
    this.reconnectionAttempts++;
    
    // Backoff exponencial: 1s, 2s, 4s, 8s, 16s, etc. con un máximo de 30s
    const delay = Math.min(30000, Math.pow(2, this.reconnectionAttempts) * 500);
    
    console.log(`[ConnectionManager] Programando reconexión en ${delay}ms (intento ${this.reconnectionAttempts})`);
    
    this.reconnectionTimer = setTimeout(() => {
      console.log(`[ConnectionManager] Ejecutando reconexión programada (intento ${this.reconnectionAttempts})`);
      
      if (channelId && this.channels.has(channelId)) {
        // Reconectar canal específico
        const managedChannel = this.channels.get(channelId)!;
        
        try {
          // Recrear canal
          supabase.removeChannel(managedChannel.channel);
          const newChannel = supabase.channel(channelId);
          newChannel.subscribe();
          
          managedChannel.channel = newChannel;
          managedChannel.status = 'connecting';
          managedChannel.lastActivity = Date.now();
        } catch (error) {
          console.error(`[ConnectionManager] Error reconectando canal ${channelId}:`, error);
          managedChannel.status = 'error';
          this.scheduleReconnect(channelId); // Intentar de nuevo
        }
      } else {
        // Reconectar todos los canales
        this.reconnectAll();
      }
    }, delay);
  }

  /**
   * Iniciar heartbeat para verificar estado de conexión periódicamente
   */
  private startHeartbeat(): void {
    // Limpiar intervalo existente si hay
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Verificar estado cada 15 segundos
    this.heartbeatInterval = setInterval(() => {
      this.checkChannelsActivity();
    }, 15000);
  }

  /**
   * Verificar actividad reciente en los canales
   */
  private checkChannelsActivity(): void {
    const now = Date.now();
    const inactivityThreshold = 60000; // 1 minuto
    
    for (const [channelId, managedChannel] of this.channels.entries()) {
      // Si no ha habido actividad reciente y el canal debería estar conectado
      if (now - managedChannel.lastActivity > inactivityThreshold && 
          managedChannel.status === 'connected') {
        console.warn(`[ConnectionManager] Canal ${channelId} inactivo por más de 1 minuto`);
        
        // Intentar ping o reconexión
        this.scheduleReconnect(channelId);
      }
    }
  }

  /**
   * Limpiar recursos al destruir
   */
  public destroy(): void {
    console.log('[ConnectionManager] Destruyendo gestor de conexiones');
    
    // Limpiar intervalos
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
    }
    
    // Cerrar todos los canales
    for (const [channelId, managedChannel] of this.channels.entries()) {
      console.log(`[ConnectionManager] Cerrando canal ${channelId}`);
      supabase.removeChannel(managedChannel.channel);
    }
    
    this.channels.clear();
    this.globalListeners = [];
  }
}

// Exportar una única instancia del gestor de conexiones
export const connectionManager = new ConnectionManager();
