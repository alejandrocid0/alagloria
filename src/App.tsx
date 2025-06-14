
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import SimpleRouter from '@/components/SimpleRouter';
import { Toaster } from "@/components/ui/simple-toast";

function App() {
  return (
    <Router>
      <SimpleRouter />
      <Toaster />
    </Router>
  );
}

export default App;
