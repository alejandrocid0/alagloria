
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="A la Gloria" 
            className="h-12 w-auto mx-auto mb-4" 
          />
          <p className="text-purple-200 mb-4">
            El juego definitivo sobre la Semana Santa de Sevilla
          </p>
          <p className="text-purple-300 text-sm">
            © 2024 A la Gloria. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
