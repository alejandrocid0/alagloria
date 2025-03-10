
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Trophy, Award } from 'lucide-react';

interface GameResult {
  id: string;
  gameId: string;
  gameTitle: string;
  date: Date;
  position: number;
  entryFee: number;
  correctAnswers: number;
  totalAnswers: number;
}

interface GameHistoryCardProps {
  gameHistory: GameResult[];
}

const GameHistoryCard = ({ gameHistory }: GameHistoryCardProps) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<keyof GameResult>('date');
  
  const sortedGames = [...gameHistory].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'position') {
      return sortOrder === 'desc' ? a.position - b.position : b.position - a.position;
    } else {
      return 0;
    }
  });
  
  const handleSort = (column: keyof GameResult) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gloria-purple">
          <Calendar className="h-5 w-5" />
          Historial de partidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {gameHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aún no has participado en ninguna partida</p>
            <p className="text-sm mt-2">¡Únete a una partida para ver tu historial aquí!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th 
                    className="px-4 py-2 text-left cursor-pointer hover:text-gloria-gold"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Fecha
                      {sortBy === 'date' && (
                        <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left">Partida</th>
                  <th 
                    className="px-4 py-2 text-center cursor-pointer hover:text-gloria-gold"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center justify-center">
                      Posición
                      {sortBy === 'position' && (
                        <span className="ml-1">{sortOrder === 'desc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-2 text-center">Aciertos</th>
                </tr>
              </thead>
              <tbody>
                {sortedGames.map((game) => (
                  <tr key={game.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(game.date), "d MMMM yyyy, HH:mm", { locale: es })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{game.gameTitle}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <div className={`
                          flex items-center justify-center rounded-full w-8 h-8
                          ${game.position === 1 ? 'bg-yellow-100' : 
                            game.position <= 3 ? 'bg-gray-100' : 'bg-gray-50'}
                        `}>
                          {game.position <= 3 && (
                            <Award className={`h-4 w-4 ${
                              game.position === 1 ? 'text-gloria-gold' : 
                              game.position === 2 ? 'text-gray-400' : 
                              'text-amber-700'
                            }`} />
                          )}
                          <span className={`
                            font-semibold text-sm
                            ${game.position === 1 ? 'text-gloria-gold' : ''}
                          `}>
                            {game.position}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm">
                        {game.correctAnswers}/{game.totalAnswers} 
                        <span className="text-xs text-gray-500 ml-1">
                          ({((game.correctAnswers/game.totalAnswers)*100).toFixed(0)}%)
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameHistoryCard;
