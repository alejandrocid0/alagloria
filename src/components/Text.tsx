
import React from 'react';
import { useContent } from '@/contexts/ContentContext';

interface TextProps {
  id: string;
  defaultText?: string;
  className?: string;
  as?: React.ElementType;
}

/**
 * Componente que muestra texto dinámico desde la base de datos de contenido
 */
const Text = ({ 
  id, 
  defaultText = '', 
  className = '', 
  as: Component = 'span'
}: TextProps) => {
  const { getText } = useContent();
  const displayText = getText(id, defaultText);
  
  return (
    <Component className={className}>
      {displayText}
    </Component>
  );
};

export default Text;
