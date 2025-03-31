
/**
 * Formatea una fecha para mostrarla en formato legible
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
}

/**
 * Calcula y formatea el tiempo restante en formato legible
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "¡Ahora!";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

/**
 * Verifica si una fecha está a menos de X minutos desde ahora
 */
export function isWithinMinutes(dateString: string, minutes: number): boolean {
  if (!dateString) return false;
  
  try {
    const targetDate = new Date(dateString);
    const now = new Date();
    
    // Diferencia en milisegundos
    const diffMs = targetDate.getTime() - now.getTime();
    
    // Convertir a minutos
    const diffMinutes = diffMs / (1000 * 60);
    
    // Verificar si está dentro del rango especificado
    return diffMinutes >= 0 && diffMinutes <= minutes;
  } catch (error) {
    console.error('Error al verificar tiempo:', error);
    return false;
  }
}
