
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export function useRedirectAuthenticated() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading, authChecked } = useAuth();
  const [redirectProcessed, setRedirectProcessed] = useState(false);

  useEffect(() => {
    // Solo ejecutamos la redirección una vez que:
    // 1. Se ha completado la verificación de autenticación
    // 2. No estamos cargando
    // 3. El usuario está autenticado 
    // 4. No hemos procesado la redirección previamente
    if (authChecked && !loading && isAuthenticated && !redirectProcessed) {
      console.log("Authenticated user detected, redirecting...");
      console.log("Auth state:", { isAuthenticated, isAdmin, loading, authChecked });
      console.log("Location state:", location.state);
      
      setRedirectProcessed(true); // Marcamos que ya procesamos la redirección
      
      // Verificar si hay una ruta de redirección, si no, usar la ruta según el rol
      const redirectTo = location.state?.redirectTo || (isAdmin ? '/admin' : '/dashboard');
      console.log("Redirecting to:", redirectTo);
      
      // Usamos setTimeout para evitar posibles problemas con cambios de estado en el mismo ciclo de renderizado
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, isAdmin, navigate, loading, location.state, redirectProcessed, authChecked]);

  // Cuando cambia la ruta (location), resetear el estado de redirección procesada
  // Esto permite que la redirección funcione si el usuario navega manualmente a login/signup
  useEffect(() => {
    setRedirectProcessed(false);
  }, [location.pathname]);

  return { isAuthenticated, loading, redirectProcessed, authChecked };
}
