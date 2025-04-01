
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
