
import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { PlayCircle } from 'lucide-react';

interface ActionButtonsProps {
  hasGameStarted: boolean;
  handlePlayNow: () => void;
}

const ActionButtons = ({ hasGameStarted, handlePlayNow }: ActionButtonsProps) => {
  if (!hasGameStarted) return null;
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Button
        variant="primary"
        size="sm"
        onClick={handlePlayNow}
        className="flex items-center gap-2"
      >
        <PlayCircle className="w-4 h-4" />
        Jugar ahora
      </Button>
    </motion.div>
  );
};

export default ActionButtons;
