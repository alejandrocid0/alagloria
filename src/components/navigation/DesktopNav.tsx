
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile, User as AuthUser } from '@/contexts/auth/types';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DesktopNavProps {
  navLinks: Array<{ title: string; path: string }>;
  profile: Profile | null;
  user: AuthUser | null;
  isAdmin: boolean;
  handleSignOut: () => Promise<void>;
}

const DesktopNav = ({ 
  navLinks, 
  profile, 
  user, 
  isAdmin, 
  handleSignOut 
}: DesktopNavProps) => {
  const location = useLocation();
  const isAuthenticated = !!user;

  return (
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
        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            <div className="text-gloria-purple font-medium">
              Hola, {profile?.name}
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 rounded-md border border-gloria-purple text-gloria-purple hover:bg-gloria-purple hover:text-white transition-all duration-200 flex items-center">
                  <User size={16} className="inline mr-2" />
                  <span>Mi Perfil</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full cursor-pointer">
                    <User size={16} className="mr-2" />
                    Estadísticas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/suggestions" className="w-full cursor-pointer">
                    <MessageSquare size={16} className="mr-2" />
                    Buzón de sugerencias
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut size={16} className="mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
  );
};

export default DesktopNav;
