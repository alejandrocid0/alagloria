
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export function useRedirectAuthenticated() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [redirectProcessed, setRedirectProcessed] = useState(false);

  useEffect(() => {
    // Solo ejecutamos la redirección si:
    // 1. No estamos cargando
    // 2. El usuario está autenticado 
    // 3. No hemos procesado la redirección previamente
    if (!loading && isAuthenticated && !redirectProcessed) {
      console.log("Redirigiendo usuario autenticado...");
      setRedirectProcessed(true); // Marcamos que ya procesamos la redirección
      
      // Verificar si hay una ruta de redirección, si no, usar la ruta según el rol
      const redirectTo = location.state?.redirectTo || (isAdmin ? '/admin' : '/dashboard');
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, loading, location.state, redirectProcessed]);

  return { isAuthenticated, loading, redirectProcessed };
}
