
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que envía eventos de cambio de página a Microsoft Clarity
 * cada vez que cambia la ruta en nuestra aplicación React.
 */
const MicrosoftClarityTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    
    // Esperar un momento para asegurar que Clarity esté completamente inicializado
    setTimeout(() => {
      try {
        // Verificar que clarity exista y sea una función que se pueda llamar
        if (window.clarity && typeof window.clarity === 'function') {
          // Registrar cambio de página en Microsoft Clarity
          window.clarity('newPage');
          console.log('Clarity: Registrando cambio de página:', pathname);
        } else {
          console.log('Clarity: No disponible aún para registrar:', pathname);
        }
      } catch (error) {
        console.error('Error al registrar página en Clarity:', error);
      }
    }, 1000); // Esperar 1 segundo para asegurar que Clarity esté inicializado
    
  }, [location]);

  return null; // Este componente no renderiza nada visual
};

export default MicrosoftClarityTracker;
