
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ConnectionStatus, ConnectionCallback, ChannelEventCallback, ManagedChannel, SubscriptionOptions } from './types';
import { ChannelManager } from './ChannelManager';
import { ReconnectionHandler } from './ReconnectionHandler';
import { HeartbeatService } from './HeartbeatService';

/**
 * Gestor centralizado de conexiones WebSocket
 * Maneja todas las conexiones, reconexiones y estado de canales WebSocket
 */
class ConnectionManager {
  private channels: Map<string, ManagedChannel> = new Map();
  private globalListeners: ConnectionCallback[] = [];
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectionHandler: ReconnectionHandler;
  private heartbeatService: HeartbeatService;

  constructor() {
    console.log('[ConnectionManager] Inicializando gestor de conexiones WebSocket');
    
    // Inicializar el manejador de reconexiones
    this.reconnectionHandler = new ReconnectionHandler(this.handleReconnect.bind(this));
    
    // Inicializar el servicio de heartbeat
    this.heartbeatService = new HeartbeatService(this.checkChannelsActivity.bind(this));
    this.heartbeatService.start();
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
    return this.reconnectionHandler.getAttempts();
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
      // Crear opciones de suscripción
      const options: SubscriptionOptions = {
        tableName,
        filter,
        event
      };
      
      // Función para manejar eventos del canal
      const handleChannelEvent = (payload: any) => {
        console.log(`[ConnectionManager] Recibido evento en tabla ${tableName}:`, payload);
        
        // Actualizar timestamp de última actividad
        if (this.channels.has(channelId)) {
          const managedChannel = this.channels.get(channelId)!;
          const updatedChannel = ChannelManager.updateChannelStatus(managedChannel, 'connected');
          this.channels.set(channelId, updatedChannel);
          
          // Ejecutar todos los callbacks registrados para este canal
          updatedChannel.callbacks.forEach(cb => {
            try {
              cb(payload);
            } catch (err) {
              console.error(`[ConnectionManager] Error en callback para canal ${channelId}:`, err);
            }
          });
        }
        
        // Actualizar estado global de conexión
        this.updateConnectionStatus('connected');
      };
      
      // Función para manejar cambios de estado del canal
      const handleStatusChange = (status: string) => {
        console.log(`[ConnectionManager] Canal ${channelId} estado:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log(`[ConnectionManager] Canal ${channelId} suscrito correctamente`);
          
          if (this.channels.has(channelId)) {
            const managedChannel = this.channels.get(channelId)!;
            const updatedChannel = ChannelManager.updateChannelStatus(managedChannel, 'connected');
            this.channels.set(channelId, updatedChannel);
          }
          
          this.updateConnectionStatus('connected');
        }
        
        if (status === 'CHANNEL_ERROR') {
          console.error(`[ConnectionManager] Error en canal ${channelId}`);
          
          if (this.channels.has(channelId)) {
            const managedChannel = this.channels.get(channelId)!;
            const updatedChannel = ChannelManager.updateChannelStatus(managedChannel, 'error');
            this.channels.set(channelId, updatedChannel);
          }
          
          this.updateConnectionStatus('error');
          this.reconnectionHandler.scheduleReconnect(channelId);
        }
        
        if (status === 'CLOSED') {
          console.warn(`[ConnectionManager] Canal ${channelId} cerrado`);
          
          if (this.channels.has(channelId)) {
            const managedChannel = this.channels.get(channelId)!;
            const updatedChannel = ChannelManager.updateChannelStatus(managedChannel, 'disconnected');
            this.channels.set(channelId, updatedChannel);
          }
          
          // Comprobar si todos los canales están desconectados
          this.checkAllChannelsStatus();
          this.reconnectionHandler.scheduleReconnect(channelId);
        }
      };
      
      // Crear y registrar el canal
      const managedChannel = ChannelManager.createChannel(
        channelId,
        options,
        handleChannelEvent,
        handleStatusChange
      );
      
      // Crear ID para el callback
      const callbackId = `${channelId}-${Date.now()}`;
      
      // Guardar canal y su callback
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
          ChannelManager.removeChannel(managedChannel.channel);
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
      this.reconnectChannel(channelId, managedChannel);
    }
  }

  /**
   * Reconectar un canal específico
   */
  private reconnectChannel(channelId: string, managedChannel: ManagedChannel): void {
    console.log(`[ConnectionManager] Reconectando canal ${channelId}`);
    
    try {
      // Primero eliminar el canal actual
      ChannelManager.removeChannel(managedChannel.channel);
      
      // Recuperar todos los callbacks actuales
      const callbacks = [...managedChannel.callbacks.entries()];
      
      // Crear un nuevo canal con la misma configuración
      // Nota: Esto es una simplificación y requiere más información para ser completamente funcional
      const newChannel = supabase.channel(channelId);
      
      // Actualizar el canal en nuestro registro con estado de conectando
      const updatedManagedChannel: ManagedChannel = {
        channel: newChannel,
        callbacks: managedChannel.callbacks,
        status: 'connecting',
        lastActivity: Date.now()
      };
      
      this.channels.set(channelId, updatedManagedChannel);
      
      // Suscribirse de nuevo al canal
      newChannel.subscribe();
    } catch (error) {
      console.error(`[ConnectionManager] Error reconectando canal ${channelId}:`, error);
      
      if (this.channels.has(channelId)) {
        const currentChannel = this.channels.get(channelId)!;
        const updatedChannel = ChannelManager.updateChannelStatus(currentChannel, 'error');
        this.channels.set(channelId, updatedChannel);
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
        if (this.reconnectionHandler.getAttempts() > 0) {
          toast({
            title: "Conexión restablecida",
            description: "La conexión ha sido restablecida correctamente",
            variant: "default"
          });
        }
      }
      
      // Resetear contador de reconexiones si conectamos correctamente
      if (newStatus === 'connected') {
        this.reconnectionHandler.resetAttempts();
      }
    }
  }

  /**
   * Manejador para la reconexión de canales
   */
  private handleReconnect(channelId?: string): void {
    if (channelId && this.channels.has(channelId)) {
      // Reconectar canal específico
      this.reconnectChannel(channelId, this.channels.get(channelId)!);
    } else {
      // Reconectar todos los canales
      this.reconnectAll();
    }
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
        
        // Intentar reconexión
        this.reconnectionHandler.scheduleReconnect(channelId);
      }
    }
  }

  /**
   * Limpiar recursos al destruir
   */
  public destroy(): void {
    console.log('[ConnectionManager] Destruyendo gestor de conexiones');
    
    // Limpiar servicios
    this.heartbeatService.stop();
    this.reconnectionHandler.destroy();
    
    // Cerrar todos los canales
    for (const [channelId, managedChannel] of this.channels.entries()) {
      console.log(`[ConnectionManager] Cerrando canal ${channelId}`);
      ChannelManager.removeChannel(managedChannel.channel);
    }
    
    this.channels.clear();
    this.globalListeners = [];
  }
}

// Exportar una única instancia del gestor de conexiones
export const connectionManager = new ConnectionManager();
export type { ConnectionStatus } from './types';
