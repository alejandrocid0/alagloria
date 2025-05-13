
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Tipo de estado de conexión
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

/**
 * Opciones para suscripción a eventos de base de datos
 */
export interface SubscriptionOptions {
  tableName: string;
  filter: Record<string, any>;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}

/**
 * Función de callback para eventos de canal
 */
export type ChannelEventCallback = (payload: RealtimePostgresChangesPayload<any>) => void;

/**
 * Función de callback para cambios en estado de conexión
 */
export type ConnectionCallback = (status: ConnectionStatus) => void;

/**
 * Canal gestionado por la aplicación
 */
export interface ManagedChannel {
  channel: RealtimeChannel;
  callbacks: Map<string, ChannelEventCallback>;
  status: ConnectionStatus;
  lastActivity: number;
}
