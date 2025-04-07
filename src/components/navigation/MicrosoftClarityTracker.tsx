
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
    
    // Comprobar si clarity está disponible
    if (typeof window.clarity === 'function') {
      // Registrar cambio de página en Microsoft Clarity
      window.clarity('newPage');
      
      console.log('Clarity: Registrando cambio de página:', pathname);
    }
  }, [location]);

  return null; // Este componente no renderiza nada visual
};

export default MicrosoftClarityTracker;
