import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-purple-900 text-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center space-y-4">
          <p className="text-purple-200">
            El juego definitivo sobre la Semana Santa de Sevilla
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              to="/politica-privacidad" 
              className="text-purple-300 hover:text-white transition-colors"
            >
              Política de Privacidad
            </Link>
            <span className="text-purple-500">|</span>
            <Link 
              to="/condiciones-uso" 
              className="text-purple-300 hover:text-white transition-colors"
            >
              Condiciones de Uso
            </Link>
            <span className="text-purple-500">|</span>
            <a 
              href="mailto:info@alagloria.es" 
              className="text-purple-300 hover:text-white transition-colors"
            >
              info@alagloria.es
            </a>
          </div>
          
          <p className="text-purple-300 text-sm">
            © 2025 A la Gloria. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
