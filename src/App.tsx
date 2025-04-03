
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from '@/components/routing/AppRouter';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <AppRouter />
      <Toaster />
    </Router>
  );
}

export default App;
