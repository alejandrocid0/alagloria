
/**
 * Tipos para el sistema de conexión WebSocket
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
export type ConnectionCallback = (status: ConnectionStatus) => void;
export type ChannelEventCallback = (payload: any) => void;

export interface ManagedChannel {
  channel: any; // Channel from Supabase
  callbacks: Map<string, ChannelEventCallback>;
  status: ConnectionStatus;
  lastActivity: number;
}

export interface SubscriptionOptions {
  tableName: string;
  filter: Record<string, any>;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
}
