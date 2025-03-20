
import { useState, useEffect } from "react";

// Aumentamos el breakpoint para dispositivos móviles para mejorar la experiencia
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Inicializar con un valor basado en la pantalla actual, si está disponible
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    // Fallback para SSR
    return false;
  });

  useEffect(() => {
    // Función para actualizar el estado basado en el tamaño de la ventana
    const updateSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Usar ResizeObserver si está disponible, o fallback a evento resize
    if (typeof window !== 'undefined') {
      if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(document.body);
        return () => resizeObserver.disconnect();
      } else {
        // Fallback para navegadores que no soportan ResizeObserver
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
      }
    }
  }, []);

  return isMobile;
}
