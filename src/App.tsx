import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Waitlist from '@/pages/Waitlist';
import PoliticaPrivacidad from '@/pages/PoliticaPrivacidad';
import CondicionesUso from '@/pages/CondicionesUso';
import { ToastProvider, Toaster } from "@/components/ui/simple-toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Waitlist />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/condiciones-uso" element={<CondicionesUso />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ToastProvider>
  );
}

export default App;
