
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile, User as AuthUser } from '@/contexts/auth/types';

interface MobileMenuProps {
  navLinks: Array<{ title: string; path: string }>;
  profile: Profile | null;
  user: AuthUser | null;
  isAdmin: boolean;
  closeMenu: () => void;
  handleSignOut: () => Promise<void>;
}

const MobileMenu = ({ 
  navLinks, 
  profile, 
  user, 
  isAdmin, 
  closeMenu, 
  handleSignOut 
}: MobileMenuProps) => {
  const location = useLocation();
  const isAuthenticated = !!user;

  return (
    <div className="md:hidden absolute top-full left-0 right-0 bg-white bg-opacity-95 backdrop-blur-md shadow-lg animate-slideDown z-50">
      <div className="flex flex-col space-y-3 p-4">
        {navLinks.map(link => (
          <Link 
            key={link.path} 
            to={link.path}
            className={cn(
              "py-3 px-4 rounded-md transition-colors flex items-center",
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
          {isAuthenticated ? (
            <>
              <div className="py-2 px-4 text-gloria-purple font-medium flex items-center">
                <User size={16} className="mr-2" />
                {profile?.name}
              </div>
              
              {isAdmin ? (
                // Para usuarios administradores, mostrar solo el botón de administración
                <Link 
                  to="/admin"
                  className="py-3 px-4 rounded-md border border-gloria-purple text-gloria-purple text-center flex items-center justify-center"
                  onClick={closeMenu}
                >
                  <Settings size={16} className="mr-2" />
                  Administración
                </Link>
              ) : (
                // Para usuarios normales, mostrar todos los enlaces de perfil
                <>
                  <Link 
                    to="/dashboard"
                    className="py-3 px-4 rounded-md border border-gloria-purple text-gloria-purple text-center flex items-center justify-center"
                    onClick={closeMenu}
                  >
                    <User size={16} className="mr-2" />
                    Estadísticas
                  </Link>
                  
                  <Link 
                    to="/suggestions"
                    className="py-3 px-4 rounded-md border border-gloria-purple text-gloria-purple text-center flex items-center justify-center"
                    onClick={closeMenu}
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Buzón de sugerencias
                  </Link>
                </>
              )}
              
              <button 
                onClick={handleSignOut}
                className="py-3 px-4 rounded-md border border-gloria-purple text-gloria-purple text-center flex items-center justify-center"
              >
                <LogOut size={16} className="mr-2" />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="py-3 px-4 rounded-md border border-gloria-purple text-gloria-purple text-center"
                onClick={closeMenu}
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="py-3 px-4 rounded-md bg-gloria-gold text-white text-center"
                onClick={closeMenu}
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
