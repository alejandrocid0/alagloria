
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Monitor de Partida</CardTitle>
        <CardDescription>Error al cargar la partida</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-red-600 gap-2">
          <AlertTriangle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorState;
