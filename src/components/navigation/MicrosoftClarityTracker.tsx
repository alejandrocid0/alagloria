
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que envía eventos de cambio de página a Microsoft Clarity
 * cada vez que cambia la ruta en nuestra aplicación React.
 */
const MicrosoftClarityTracker = () => {
  const location = useLocation();
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  useEffect(() => {
    const { pathname } = location;
    
    // Función para intentar registrar el cambio de página
    const trackPageChange = () => {
      try {
        // Verificar que clarity exista, sea una función y esté correctamente inicializada
        if (
          window.clarity && 
          typeof window.clarity === 'function' && 
          !String(window.clarity).includes('clarity.q.push')
        ) {
          // Clarity está completamente inicializado
          window.clarity('newPage');
          // Mantenemos este log para diagnóstico de analítica
          console.log('Clarity: Registrando cambio de página:', pathname);
          return true; // Éxito
        } else {
          // Mantenemos este log para diagnóstico
          console.log('Clarity: No disponible aún para registrar:', pathname);
          return false; // No listo
        }
      } catch (error) {
        // Mantenemos los logs de error
        console.error('Error al registrar página en Clarity:', error);
        return false; // Error
      }
    };

    // Función para intentar con retroceso exponencial
    const attemptWithBackoff = () => {
      if (retryCountRef.current >= maxRetries) {
        // Mantenemos los logs de advertencia importantes
        console.warn('Clarity: Máximo de intentos alcanzado para registrar:', pathname);
        return;
      }

      const success = trackPageChange();
      
      if (!success) {
        // Si no tuvo éxito, incrementar contador e intentar de nuevo con tiempo de espera mayor
        const nextRetry = Math.min(2000, 500 * Math.pow(1.5, retryCountRef.current));
        retryCountRef.current += 1;
        
        setTimeout(() => {
          attemptWithBackoff();
        }, nextRetry);
      }
    };

    // Iniciar el proceso de seguimiento con un pequeño retraso inicial
    setTimeout(() => {
      attemptWithBackoff();
    }, 300);

    // Reiniciar el contador cuando cambia la ubicación
    return () => {
      retryCountRef.current = 0;
    };
    
  }, [location]);

  return null; // Este componente no renderiza nada visual
};

export default MicrosoftClarityTracker;
