
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
        // Corregimos el error usando una aserción de tipo para window
        const win = window as Window;
        win.addEventListener('resize', updateSize);
        return () => win.removeEventListener('resize', updateSize);
      }
    }
    
    // Return undefined para evitar errores de TypeScript
    return undefined;
  }, []);

  return isMobile;
}
