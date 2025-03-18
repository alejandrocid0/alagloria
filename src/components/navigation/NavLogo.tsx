
import { Link } from 'react-router-dom';

interface NavLogoProps {
  onClick?: () => void;
}

const NavLogo = ({ onClick }: NavLogoProps) => {
  return (
    <Link 
      to="/" 
      className="text-gloria-purple text-2xl font-serif font-bold flex items-center"
      onClick={onClick}
    >
      <span className="text-gloria-gold">A la</span>
      <span className="ml-2">Gloria</span>
    </Link>
  );
};

export default NavLogo;
