
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Waitlist from '@/pages/Waitlist';

const SimpleRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Waitlist />} />
      <Route path="*" element={<Waitlist />} />
    </Routes>
  );
};

export default SimpleRouter;
