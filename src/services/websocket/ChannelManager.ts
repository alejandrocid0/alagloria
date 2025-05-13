
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionOptions, ManagedChannel, ChannelEventCallback, ConnectionStatus } from './types';

/**
 * Crea y gestiona canales de Supabase
 */
export class ChannelManager {
  /**
   * Crea un canal de Supabase
   */
  public static createChannel(
    channelId: string,
    options: SubscriptionOptions,
    onEvent: ChannelEventCallback,
    onStatusChange: (status: string) => void
  ): ManagedChannel {
    console.log(`[ChannelManager] Creando canal ${channelId} para tabla ${options.tableName}`);
    
    // Crear una instancia del canal
    const channel = supabase.channel(channelId);
    
    // Configurar el canal para escuchar cambios en la base de datos
    channel.on(
      'postgres_changes' as any, 
      {
        event: options.event, 
        schema: 'public', 
        table: options.tableName,
        filter: options.filter
      }, 
      onEvent
    );
    
    // Suscribirse al canal
    channel.subscribe(onStatusChange);
    
    // Crear el objeto de canal gestionado
    const managedChannel: ManagedChannel = {
      channel,
      callbacks: new Map([[channelId, onEvent]]),
      status: 'connecting',
      lastActivity: Date.now()
    };
    
    return managedChannel;
  }

  /**
   * Elimina un canal
   */
  public static removeChannel(channel: any): void {
    try {
      supabase.removeChannel(channel);
    } catch (error) {
      console.error('[ChannelManager] Error eliminando canal:', error);
    }
  }

  /**
   * Actualiza el estado de un canal
   */
  public static updateChannelStatus(managedChannel: ManagedChannel, newStatus: ConnectionStatus): ManagedChannel {
    return {
      ...managedChannel,
      status: newStatus,
      lastActivity: Date.now()
    };
  }
}
