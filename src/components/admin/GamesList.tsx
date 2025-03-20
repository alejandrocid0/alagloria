
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, Trash2, CalendarIcon, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GameEditor from './GameEditor';
import { gameService } from '@/services/gameService';

interface Game {
  id: string;
  title: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  creator_name?: string;
}

const GamesList = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const gamesData = await gameService.fetchGames();
      setGames(gamesData || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las partidas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleEditGame = (game: Game) => {
    setSelectedGame(game);
    setIsEditing(true);
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta partida? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Partida eliminada',
        description: 'La partida ha sido eliminada correctamente',
      });

      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la partida',
        variant: 'destructive',
      });
    }
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setSelectedGame(null);
    fetchGames();
  };

  if (isEditing && selectedGame) {
    return <GameEditor game={selectedGame} onClose={handleCloseEditor} />;
  }

  const formatGameDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
        locale: es,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Partidas Programadas</CardTitle>
          <CardDescription>
            Administra las partidas existentes, edita su información o elimínalas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-pulse bg-gloria-purple/20 h-8 w-64 rounded-md mb-4 mx-auto"></div>
              <div className="animate-pulse bg-gloria-purple/10 h-4 w-48 rounded-md mx-auto"></div>
            </div>
          ) : games.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No hay partidas programadas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gloria-purple truncate">
                      {game.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {game.description || 'Sin descripción'}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{formatGameDate(game.date)}</span>
                    </div>
                    {game.creator_name && (
                      <div className="flex items-center mt-1 text-sm">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        <span>Creado por: {game.creator_name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex mt-4 md:mt-0 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGame(game)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGame(game.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamesList;
