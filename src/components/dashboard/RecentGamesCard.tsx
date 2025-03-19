
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays } from 'lucide-react';

interface GameResult {
  id: string;
  gameTitle: string;
  date: Date;
  position: number;
  correctAnswers: number;
  totalAnswers: number;
  entryFee: number;
}

interface RecentGamesCardProps {
  recentGames: GameResult[];
}

const RecentGamesCard = ({ recentGames }: RecentGamesCardProps) => {
  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-gloria-purple">
          <CalendarDays className="h-5 w-5" />
          Partidas recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentGames.length > 0 ? (
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partida</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Aciertos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGames.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell className="font-medium">{game.gameTitle}</TableCell>
                    <TableCell>{new Date(game.date).toLocaleDateString()}</TableCell>
                    <TableCell>{game.position}º</TableCell>
                    <TableCell>{game.correctAnswers}/{game.totalAnswers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Aún no has participado en ninguna partida</p>
            <p className="mt-2">¡Participa para ver tus estadísticas!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentGamesCard;
