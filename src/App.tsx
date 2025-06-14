
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import SimpleRouter from '@/components/SimpleRouter';
import { ToastProvider, Toaster } from "@/components/ui/simple-toast";

function App() {
  return (
    <ToastProvider>
      <Router>
        <SimpleRouter />
        <Toaster />
      </Router>
    </ToastProvider>
  );
}

export default App;
