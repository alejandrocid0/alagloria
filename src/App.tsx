
import React from 'react';
import Waitlist from '@/pages/Waitlist';
import { ToastProvider, Toaster } from "@/components/ui/simple-toast";

function App() {
  return (
    <ToastProvider>
      <Waitlist />
      <Toaster />
    </ToastProvider>
  );
}

export default App;
