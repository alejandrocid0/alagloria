
import { Link } from 'react-router-dom';

interface NavLogoProps {
  onClick?: () => void;
}

const NavLogo = ({ onClick }: NavLogoProps) => {
  return (
    <Link 
      to="/" 
      className="flex items-center"
      onClick={onClick}
    >
      <img 
        src="/logo.png" 
        alt="A la Gloria" 
        className="h-10 w-auto" 
      />
    </Link>
  );
};

export default NavLogo;
