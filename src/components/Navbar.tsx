
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin, currentUser, logout, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { title: 'Inicio', path: '/' },
    { title: 'Partidas', path: '/games' },
    { title: 'Cómo Jugar', path: '/how-to-play' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled || isOpen 
        ? 'bg-white bg-opacity-80 backdrop-blur-md shadow-md py-2' 
        : 'bg-transparent py-4'
    )}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="text-gloria-purple text-2xl font-serif font-bold flex items-center"
            onClick={closeMenu}
          >
            <span className="text-gloria-gold">A la</span>
            <span className="ml-2">Gloria</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={cn(
                    "font-medium transition-colors hover:text-gloria-gold fancy-underline",
                    location.pathname === link.path 
                      ? "text-gloria-purple" 
                      : "text-gloria-purple/70"
                  )}
                >
                  {link.title}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              {!loading && isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="text-gloria-purple font-medium">
                    Hola, {currentUser?.name}
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 rounded-md border border-gloria-purple text-gloria-purple hover:bg-gloria-purple hover:text-white transition-all duration-200 flex items-center"
                    >
                      <Settings size={16} className="inline mr-2" />
                      <span>Administración</span>
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-md border border-gloria-purple text-gloria-purple hover:bg-gloria-purple hover:text-white transition-all duration-200 flex items-center"
                  >
                    <User size={16} className="inline mr-2" />
                    <span>Mi Perfil</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-4 py-2 rounded-md border border-gloria-purple text-gloria-purple hover:bg-gloria-purple hover:text-white transition-all duration-200"
                  >
                    <LogOut size={16} className="mr-2" />
                    <span>Salir</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="px-4 py-2 rounded-md border border-gloria-purple text-gloria-purple hover:bg-gloria-purple hover:text-white transition-all duration-200"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-4 py-2 rounded-md bg-gloria-gold text-white hover:bg-gloria-gold/90 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <button 
            className="md:hidden text-gloria-purple focus:outline-none"
            onClick={toggleMenu}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white bg-opacity-95 backdrop-blur-md shadow-lg animate-slideDown">
            <div className="flex flex-col space-y-3 p-4">
              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={cn(
                    "py-2 px-4 rounded-md transition-colors",
                    location.pathname === link.path 
                      ? "bg-gloria-purple/10 text-gloria-purple font-medium" 
                      : "text-gloria-purple/80 hover:bg-gloria-purple/5"
                  )}
                  onClick={closeMenu}
                >
                  {link.title}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-2">
                {!loading && isAuthenticated ? (
                  <>
                    <div className="py-2 px-4 text-gloria-purple font-medium flex items-center">
                      <User size={16} className="mr-2" />
                      {currentUser?.name}
                    </div>
                    {isAdmin && (
                      <Link 
                        to="/admin"
                        className="py-2 px-4 rounded-md border border-gloria-purple text-gloria-purple text-center flex items-center justify-center"
                        onClick={closeMenu}
                      >
                        <Settings size={16} className="mr-2" />
                        Administración
                      </Link>
                    )}
                    <Link 
                      to="/dashboard"
                      className="py-2 px-4 rounded-md border border-gloria-purple text-gloria-purple text-center flex items-center justify-center"
                      onClick={closeMenu}
                    >
                      <User size={16} className="mr-2" />
                      Mi Perfil
                    </Link>
                    <button 
                      onClick={() => {
                        closeMenu();
                        logout();
                      }}
                      className="py-2 px-4 rounded-md border border-gloria-purple text-gloria-purple text-center flex items-center justify-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="py-2 px-4 rounded-md border border-gloria-purple text-gloria-purple text-center"
                      onClick={closeMenu}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      to="/signup" 
                      className="py-2 px-4 rounded-md bg-gloria-gold text-white text-center"
                      onClick={closeMenu}
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
