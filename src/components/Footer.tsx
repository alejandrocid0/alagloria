
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gloria-deepPurple text-white pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="text-3xl font-serif font-bold mb-4 inline-block">
              <span className="text-gloria-gold">A la</span>
              <span className="text-white ml-2">Gloria</span>
            </Link>
            <p className="text-gray-300 mt-4">
              El mejor juego de preguntas sobre la Semana Santa de Sevilla.
            </p>
            <div className="flex space-x-4 mt-6">
              <a 
                href="https://www.instagram.com/alagloria.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-gloria-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://www.tiktok.com/@alagloria.app" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-gloria-gold transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon size={20} />
              </a>
              <a 
                href="https://www.youtube.com/@Alagloriaapp" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-gloria-gold transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a 
                href="https://www.linkedin.com/company/a-la-gloria/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-gloria-gold transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-xl font-serif mb-4 text-gloria-gold">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/games" className="text-gray-300 hover:text-white transition-colors">
                  Partidas
                </Link>
              </li>
              <li>
                <Link to="/how-to-play" className="text-gray-300 hover:text-white transition-colors">
                  Cómo Jugar
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-xl font-serif mb-4 text-gloria-gold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-300 hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-xl font-serif mb-4 text-gloria-gold">Contacto</h3>
            <p className="text-gray-300 mb-2">
              ¿Tienes alguna pregunta?
            </p>
            <a 
              href="mailto:info@alagloria.es" 
              className="text-gloria-gold hover:underline"
            >
              info@alagloria.es
            </a>
          </div>
        </div>
        
        <div className="border-t border-gloria-purple pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} A la Gloria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

// Componente personalizado para el ícono de TikTok ya que no está disponible en Lucide
const TikTokIcon = ({ size = 20 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <path d="M16 8v8" />
      <path d="M12 16v-8" />
      <path d="M20 12V8a4 4 0 0 0-4-4h-1" />
      <path d="M16 5.1V4" />
    </svg>
  );
};

export default Footer;
