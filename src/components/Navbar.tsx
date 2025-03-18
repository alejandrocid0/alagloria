
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Import our new components
import NavLogo from './navigation/NavLogo';
import DesktopNav from './navigation/DesktopNav';
import MobileMenu from './navigation/MobileMenu';
import { navLinks } from './navigation/navConstants';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  
  const isAdmin = profile?.is_admin || false;

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
            navLinks={navLinks}
            profile={profile}
            user={user}
            isAdmin={isAdmin}
            handleSignOut={handleSignOut}
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
            navLinks={navLinks}
            profile={profile}
            user={user}
            isAdmin={isAdmin}
            closeMenu={closeMenu}
            handleSignOut={handleSignOut}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
