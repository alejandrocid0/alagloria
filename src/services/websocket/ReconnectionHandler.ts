
import { ConnectionStatus } from './types';
import { toast } from '@/hooks/use-toast';

/**
 * Maneja la lógica de reconexión para los canales WebSocket
 */
export class ReconnectionHandler {
  private reconnectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 10;
  private reconnectionTimer: NodeJS.Timeout | null = null;
  private onReconnect: (channelId?: string) => void;
  
  constructor(onReconnect: (channelId?: string) => void) {
    this.onReconnect = onReconnect;
  }

  /**
   * Obtiene el número actual de intentos de reconexión
   */
  public getAttempts(): number {
    return this.reconnectionAttempts;
  }

  /**
   * Resetea el contador de reconexiones
   */
  public resetAttempts(): void {
    this.reconnectionAttempts = 0;
  }

  /**
   * Programa un intento de reconexión con backoff exponencial
   */
  public scheduleReconnect(channelId?: string): void {
    // Evitar múltiples timers de reconexión
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
    }
    
    if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
      console.error(`[ReconnectionHandler] Máximo número de intentos de reconexión alcanzado (${this.maxReconnectionAttempts})`);
      
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
    
    console.log(`[ReconnectionHandler] Programando reconexión en ${delay}ms (intento ${this.reconnectionAttempts})`);
    
    this.reconnectionTimer = setTimeout(() => {
      console.log(`[ReconnectionHandler] Ejecutando reconexión programada (intento ${this.reconnectionAttempts})`);
      this.onReconnect(channelId);
    }, delay);
  }

  /**
   * Limpia los recursos de reconexión
   */
  public destroy(): void {
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }
  }
}
