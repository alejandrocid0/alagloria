
import { Calendar, Users, Clock, Award, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Button from './Button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface GameCardProps {
  id: string;
  title: string;
  date: Date;
  participants: number;
  maxParticipants: number;
  prizePool: number;
  image?: string;
}

const GameCard = ({ id, title, date, participants, maxParticipants, prizePool, image }: GameCardProps) => {
  const isGameFull = participants >= maxParticipants;
  const isPastGame = date < new Date();
  const percentageFilled = (participants / maxParticipants) * 100;
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [showDemoButton, setShowDemoButton] = useState(false);
  
  const formattedDate = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const timeToGame = formatDistanceToNow(date, {
    addSuffix: true,
    locale: es
  });

  const handleCardClick = () => {
    setShowDemoButton(prev => !prev);
  };

  const handleDemoGame = () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión para jugar",
        description: "Necesitas iniciar sesión para jugar en modo demostración",
        variant: "destructive"
      });
      navigate("/login", { state: { redirectTo: `/games` } });
      return;
    }
    
    // Navigate to the demo game
    navigate(`/game/demo-123`);
    
    toast({
      title: "Modo demostración activado",
      description: "Estás jugando una partida de demostración",
    });
  };
  
  return (
    <div className="glass-panel overflow-hidden transition-all duration-300 hover:shadow-xl relative">
      <div 
        className="h-40 overflow-hidden relative cursor-pointer" 
        onClick={handleCardClick}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gloria-deepPurple/40 z-10" />
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gloria-purple/30 flex items-center justify-center">
            <span className="text-white text-opacity-70 font-serif text-xl">A la Gloria</span>
          </div>
        )}
        
        {isPastGame && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-20">
            Finalizada
          </div>
        )}
        
        {!isPastGame && isGameFull && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-20">
            Completa
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-2">{title}</h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2 text-gloria-purple" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 text-gloria-purple" />
            <span>{timeToGame}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-2 text-gloria-purple" />
            <span>{participants} de {maxParticipants} participantes</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Award size={16} className="mr-2 text-gloria-gold" />
            <span className="font-medium text-gloria-gold">{prizePool.toFixed(2)}€ en premios</span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gloria-gold h-2 rounded-full" 
            style={{ width: `${percentageFilled}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {maxParticipants - participants} plazas disponibles
          </span>
          
          <Button
            variant={isPastGame ? "ghost" : isGameFull ? "outline" : "secondary"}
            size="sm"
            disabled={isPastGame || isGameFull}
            href={isPastGame ? `/results/${id}` : isGameFull ? "#" : `/join/${id}`}
          >
            {isPastGame ? "Ver resultados" : isGameFull ? "Completa" : "Unirse - 1€"}
          </Button>
        </div>

        {showDemoButton && (
          <div className="mt-4 w-full">
            <Button
              variant="primary"
              size="sm"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleDemoGame}
            >
              <Play size={16} /> Jugar Demo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
