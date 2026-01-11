import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

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
          
          <div className="flex justify-center gap-4">
            <a 
              href="https://www.instagram.com/alagloria.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a 
              href="https://www.tiktok.com/@alagloria.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
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
