
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que restaura la posición del scroll al inicio de la página
 * cada vez que ocurre un cambio de ruta.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuando cambia la ruta, scroll hacia arriba
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Hace que el scroll sea suave
    });
  }, [pathname]);

  return null; // Este componente no renderiza nada
};

export default ScrollToTop;
