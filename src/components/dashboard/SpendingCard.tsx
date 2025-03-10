
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CreditCard } from 'lucide-react';

interface GameResult {
  date: Date;
  entryFee: number;
}

interface SpendingCardProps {
  totalSpent: number;
  gameHistory: GameResult[];
}

const SpendingCard = ({ totalSpent, gameHistory }: SpendingCardProps) => {
  // Group spending by month
  const spendingByMonth = gameHistory.reduce((acc: Record<string, number>, game) => {
    const month = new Date(game.date).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + game.entryFee;
    return acc;
  }, {});
  
  // Convert to array for chart
  const chartData = Object.entries(spendingByMonth).map(([month, amount]) => ({
    month,
    amount
  }));
  
  // Sort by date
  chartData.sort((a, b) => {
    const [monthA, yearA] = a.month.split(' ');
    const [monthB, yearB] = b.month.split(' ');
    
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
    
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return months.indexOf(monthA.toLowerCase()) - months.indexOf(monthB.toLowerCase());
  });
  
  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gloria-purple">
          <CreditCard className="h-5 w-5" />
          Dinero invertido
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total invertido</p>
            <p className="text-2xl font-bold text-gloria-gold">{totalSpent.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Partidas</p>
            <p className="text-2xl font-bold">{gameHistory.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Media por partida</p>
            <p className="text-2xl font-bold">
              {gameHistory.length > 0 ? (totalSpent / gameHistory.length).toFixed(2) : '0.00'}€
            </p>
          </div>
        </div>
        
        {chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 5,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `${value}€`}
                  tickMargin={10}
                />
                <Tooltip 
                  formatter={(value) => [`${value}€`, 'Invertido']}
                  labelFormatter={(label) => `Mes: ${label}`}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#D4AF37" 
                  radius={[4, 4, 0, 0]} 
                  name="Invertido"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>No hay datos suficientes para mostrar el gráfico</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpendingCard;
