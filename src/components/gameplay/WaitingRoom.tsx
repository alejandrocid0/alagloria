
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player } from '@/types/liveGame';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WaitingRoomProps {
  gameTitle: string;
  playersOnline: Player[];
  isGameHost?: boolean;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameTitle,
  playersOnline: initialPlayersOnline,
  isGameHost = false,
}) => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const [playersOnline, setPlayersOnline] = useState<Player[]>(initialPlayersOnline);
  const [isStarting, setIsStarting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Subscribe to player updates
  useEffect(() => {
    if (!gameId) return;
    
    const channel = supabase
      .channel(`game-participants-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);
  
  // Subscribe to game state updates
  useEffect(() => {
    if (!gameId) return;
    
    const channel = supabase
      .channel(`game-state-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'live_games',
          filter: `id=eq.${gameId}`
        },
        (payload: any) => {
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
            if (payload.new.status === 'question') {
              navigate(`/game/${gameId}`);
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, navigate]);
  
  // Fetch participants
  const fetchParticipants = async () => {
    if (!gameId) return;
    
    try {
      const { data, error } = await supabase
        .from('game_participants')
        .select('user_id')
        .eq('game_id', gameId);
        
      if (error) throw error;
      
      if (data) {
        // Get user profiles
        const userIds = data.map(p => p.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        const participants: Player[] = profiles.map((profile, index) => ({
          id: profile.id,
          name: profile.name,
          points: 0,
          rank: index + 1,
          lastAnswer: null,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=5D3891&color=fff`
        }));
        
        setPlayersOnline(participants);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  };
  
  // Handle start game
  const handleStartGame = async () => {
    if (!gameId || !isGameHost) return;
    
    setIsStarting(true);
    setCountdown(10);
    
    // Countdown to start
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          startGame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Start the game
  const startGame = async () => {
    if (!gameId) return;
    
    try {
      const { error } = await supabase.rpc('start_live_game', { game_id: gameId });
      
      if (error) {
        console.error('Error starting game:', error);
        toast({
          title: "Error",
          description: "No se pudo iniciar la partida",
          variant: "destructive"
        });
        setIsStarting(false);
        return;
      }
      
      navigate(`/game/${gameId}`);
    } catch (err) {
      console.error('Error starting game:', err);
      setIsStarting(false);
    }
  };
  
  // Handle join game
  const handleJoinGame = () => {
    if (gameId) {
      navigate(`/game/${gameId}`);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gloria-purple p-4">
        <h2 className="text-xl font-serif font-bold text-white">{gameTitle}</h2>
        <p className="text-sm text-gloria-purple-100">Sala de espera</p>
      </div>
      
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-gloria-purple">
              {isStarting ? 'La partida comienza en...' : 'Esperando a que comience la partida'}
            </h3>
            
            {countdown !== null && (
              <div className="bg-gloria-purple text-white font-bold px-4 py-2 rounded-full">
                {countdown}
              </div>
            )}
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex-1">
              <p className="text-sm text-blue-800 font-medium">{playersOnline.length} Participantes</p>
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex-1">
              <p className="text-sm text-green-800 font-medium">Estado: {isStarting ? 'Comenzando' : 'Esperando'}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="font-medium text-gray-700 mb-3">Participantes</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {playersOnline.map(player => (
              <div key={player.id} className="bg-gray-50 p-3 rounded-lg text-center">
                <img 
                  src={player.avatar} 
                  alt={player.name} 
                  className="w-10 h-10 rounded-full mx-auto mb-2"
                />
                <p className="text-sm font-medium truncate">{player.name}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center">
          {isGameHost ? (
            <Button
              onClick={handleStartGame}
              disabled={isStarting}
              className="bg-gloria-purple hover:bg-gloria-purple/90 text-white"
            >
              {isStarting ? 'Iniciando...' : 'Iniciar partida'}
            </Button>
          ) : (
            <Button
              onClick={handleJoinGame}
              className="bg-gloria-purple hover:bg-gloria-purple/90 text-white"
            >
              Unirse a la partida
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
