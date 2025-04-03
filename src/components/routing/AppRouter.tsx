
import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import WaitlistPage from '@/pages/WaitlistPage';
import Waitlist from '@/pages/Waitlist';
import HowToPlay from '@/pages/HowToPlay';
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

// Clave para almacenar el estado de desarrollador en localStorage
const DEV_MODE_KEY = 'gloria_dev_mode';

// Parámetro URL para activar el modo desarrollador
const DEV_MODE_PARAM = 'dev_mode';
const DEV_MODE_VALUE = 'true';

const AppRouter = () => {
  const [isDeveloper, setIsDeveloper] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  // Comprobar si el usuario es desarrollador
  useEffect(() => {
    // Verificar si hay un parámetro en la URL para activar el modo desarrollador
    const params = new URLSearchParams(location.search);
    const devModeParam = params.get(DEV_MODE_PARAM);
    
    if (devModeParam === DEV_MODE_VALUE) {
      // Guardar en localStorage para mantener la sesión
      localStorage.setItem(DEV_MODE_KEY, 'true');
      setIsDeveloper(true);
      return;
    }
    
    // Verificar si hay una bandera en localStorage
    const devModeStored = localStorage.getItem(DEV_MODE_KEY) === 'true';
    
    // Verificar si el usuario está autenticado y tiene un rol de admin
    const isAdmin = user && user.role === 'admin';
    
    // Es desarrollador si tiene la bandera en localStorage o es admin
    setIsDeveloper(devModeStored || isAdmin);
  }, [location, user]);
  
  // Si no es desarrollador, mostrar rutas limitadas
  if (!isDeveloper) {
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
  
  // Si es desarrollador, mostrar todas las rutas originales
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
      {/* Añadimos también las rutas de la lista de espera para que sean accesibles */}
      <Route path="/waitlist" element={<Waitlist />} />
      <Route path="/waitlist-page" element={<WaitlistPage />} />
    </Routes>
  );
};

export default AppRouter;
