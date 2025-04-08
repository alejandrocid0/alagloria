
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que envía eventos de cambio de página a Google Analytics
 * cada vez que cambia la ruta en nuestra aplicación React.
 */
const GoogleAnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;
    
    // Comprobar si gtag está disponible
    if (typeof window.gtag === 'function') {
      // Enviar evento de cambio de página a Google Analytics
      window.gtag('config', 'G-4Z7G3558C3', {
        page_path: pathname,
        page_location: window.location.href
      });
      
      // Mantenemos este log para diagnóstico de analítica
      console.log('GA: Registrando vista de página:', pathname);
    }
  }, [location]);

  return null; // Este componente no renderiza nada visual
};

export default GoogleAnalyticsTracker;
