
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from '@/components/routing/AppRouter';
import { Toaster } from "@/components/ui/toaster";

// Dominio principal donde solo mostraremos la landing page
const MAIN_DOMAIN = 'alagloria.es';

function App() {
  const [currentDomain, setCurrentDomain] = useState('');

  useEffect(() => {
    // Detectar el dominio actual
    const hostname = window.location.hostname;
    setCurrentDomain(hostname);
    
    // Para depuración en consola (opcional)
    console.log(`Dominio actual: ${hostname}`);
    console.log(`¿Mostrando aplicación completa?: ${hostname !== MAIN_DOMAIN ? 'Sí' : 'No'}`);
  }, []);

  return (
    <Router>
      <AppRouter />
      <Toaster />
    </Router>
  );
}

export default App;
