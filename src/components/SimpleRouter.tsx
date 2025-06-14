
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Waitlist from '@/pages/Waitlist';

const SimpleRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Waitlist />} />
      <Route path="/waitlist" element={<Waitlist />} />
      {/* Todas las rutas redirigen a la lista de espera */}
      <Route path="*" element={<Waitlist />} />
    </Routes>
  );
};

export default SimpleRouter;
