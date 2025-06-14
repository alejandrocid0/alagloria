
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WaitlistPage from '@/pages/WaitlistPage';
import Waitlist from '@/pages/Waitlist';

const SimpleRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<WaitlistPage />} />
      <Route path="/waitlist" element={<Waitlist />} />
      {/* Redirigir cualquier otra ruta a la página principal */}
      <Route path="*" element={<WaitlistPage />} />
    </Routes>
  );
};

export default SimpleRouter;
