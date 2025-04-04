
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

// Import our new components
import NavLogo from './navigation/NavLogo';
import DesktopNav from './navigation/DesktopNav';
import MobileMenu from './navigation/MobileMenu';
import { navLinks, waitlistNavLinks } from './navigation/navConstants';

// Dominio principal donde solo mostraremos la landing page
const MAIN_DOMAIN = 'alagloria.es';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showFullNav, setShowFullNav] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();
  
  const isAdmin = profile?.is_admin || false;
  
  useEffect(() => {
    // Determinar si mostrar el menú completo basado en el dominio actual
    const hostname = window.location.hostname;
    const isMainDomain = hostname === MAIN_DOMAIN;
    
    // Mostrar menú completo si:
    // 1. No estamos en el dominio principal (estamos en lovable.app u otro dominio)
    // 2. El usuario es administrador
    setShowFullNav(!isMainDomain || isAdmin);
  }, [isAdmin]);
  
  // Determinar qué enlaces mostrar basado en el dominio
  const currentNavLinks = showFullNav ? navLinks : waitlistNavLinks;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
  };

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled || isOpen 
        ? 'bg-white bg-opacity-80 backdrop-blur-md shadow-md py-2' 
        : 'bg-transparent py-4'
    )}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center">
          <NavLogo onClick={closeMenu} />
          
          {/* Desktop Navigation */}
          <DesktopNav 
            navLinks={currentNavLinks}
            profile={profile}
            user={user}
            isAdmin={isAdmin}
            handleSignOut={handleSignOut}
            showAuthButtons={showFullNav}
          />
          
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
          <MobileMenu 
            navLinks={currentNavLinks}
            profile={profile}
            user={user}
            isAdmin={isAdmin}
            closeMenu={closeMenu}
            handleSignOut={handleSignOut}
            showAuthButtons={showFullNav}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
