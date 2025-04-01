
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Monitor de Partida</CardTitle>
        <CardDescription>Cargando datos de la partida...</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full"></div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
