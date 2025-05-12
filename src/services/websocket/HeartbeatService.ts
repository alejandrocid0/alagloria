
/**
 * Servicio para monitorear la actividad de los canales mediante heartbeats
 */
export class HeartbeatService {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private onCheckActivity: () => void;

  constructor(onCheckActivity: () => void) {
    this.onCheckActivity = onCheckActivity;
  }

  /**
   * Iniciar heartbeat para verificar estado de conexión periódicamente
   */
  public start(): void {
    // Limpiar intervalo existente si hay
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Verificar estado cada 15 segundos
    this.heartbeatInterval = setInterval(() => {
      this.onCheckActivity();
    }, 15000);
  }

  /**
   * Detener el servicio de heartbeat
   */
  public stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
