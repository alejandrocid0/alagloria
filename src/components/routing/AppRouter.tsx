
import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import WaitlistPage from '@/pages/WaitlistPage';
import Waitlist from '@/pages/Waitlist';
import HowToPlay from '@/pages/HowToPlay';
import Suggestions from '@/pages/Suggestions';
import { useAuth } from '@/contexts/AuthContext';

// Importamos todas las rutas originales de la aplicación
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Games from '@/pages/Games';
import Game from '@/pages/Game';
import JoinGame from '@/pages/JoinGame';
import Profile from '@/pages/Profile';
import EditProfile from '@/pages/EditProfile';
import Results from '@/pages/Results';
import GameResults from '@/pages/GameResults';
import Admin from '@/pages/AdminDashboard';
import CreateGame from '@/pages/CreateGame';
import EditGame from '@/pages/EditGame';
import GameWaitingRoom from '@/pages/GameWaitingRoom';
import GamePlay from '@/pages/GamePlay';
import Dashboard from '@/pages/Dashboard';
import Signup from '@/pages/Signup';

// Dominio principal donde solo mostraremos la landing page
const MAIN_DOMAIN = 'alagloria.es';

const AppRouter = () => {
  const [showFullApp, setShowFullApp] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Comprobar el dominio actual y determinar qué versión mostrar
  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Mostrar app completa si:
    // 1. No estamos en el dominio principal (estamos en lovable.app u otro dominio de desarrollo)
    // 2. El usuario es administrador
    const isMainDomain = hostname === MAIN_DOMAIN;
    const isAdmin = user && user.role === 'admin';
    
    setShowFullApp(!isMainDomain || isAdmin);
    
    // Registrar la vista de página en GA para debugging
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname,
      });
      console.log('GA Debug: Vista de página registrada:', location.pathname);
    }
  }, [location, user]);
  
  // Si estamos en el dominio principal y no somos admin, mostrar rutas limitadas
  if (!showFullApp) {
    return (
      <Routes>
        <Route path="/" element={<WaitlistPage />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/how-to-play" element={<HowToPlay />} />
        {/* Redirigir cualquier otra ruta a la página de inicio de lista de espera */}
        <Route path="*" element={<WaitlistPage />} />
      </Routes>
    );
  }
  
  // En otros casos (desarrollo, lovable.app, admin), mostrar todas las rutas
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/games" element={<Games />} />
      <Route path="/game/:gameId" element={<Game />} />
      <Route path="/game/:gameId/play" element={<GamePlay />} />
      <Route path="/join/:gameId" element={<JoinGame />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/profile/:id/edit" element={<EditProfile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/results" element={<Results />} />
      <Route path="/results/:gameId" element={<GameResults />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/create" element={<CreateGame />} />
      <Route path="/admin/edit/:gameId" element={<EditGame />} />
      <Route path="/game/:gameId/waiting" element={<GameWaitingRoom />} />
      <Route path="/how-to-play" element={<HowToPlay />} />
      <Route path="/suggestions" element={<Suggestions />} />
      {/* Añadimos también las rutas de la lista de espera para que sean accesibles */}
      <Route path="/waitlist" element={<Waitlist />} />
      <Route path="/waitlist-page" element={<WaitlistPage />} />
    </Routes>
  );
};

export default AppRouter;
