
import React from 'react';
import { Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionInfoProps {
  isConnected: boolean;
  lastUpdateTime: string;
}

const ConnectionInfo: React.FC<ConnectionInfoProps> = ({
  isConnected,
  lastUpdateTime
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-2">
        <Wifi className={cn(
          "h-4 w-4",
          "text-green-500"
        )} />
        <div className="text-sm">
          Conexión: <span className="font-medium">Activa</span>
        </div>
      </div>
      <div className="text-sm text-right">
        Último cambio: {lastUpdateTime}
      </div>
    </div>
  );
};

export default ConnectionInfo;
