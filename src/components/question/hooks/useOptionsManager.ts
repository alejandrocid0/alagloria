
import { useState, useMemo } from 'react';

// Define a type for our randomized options
type RandomizedOption = string | { text: string; originalIndex: number };

interface UseOptionsManagerProps {
  options: string[];
  selectedOption?: number;
  showResult: boolean;
  answered: boolean;
}

const useOptionsManager = ({ options, selectedOption, showResult, answered }: UseOptionsManagerProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(selectedOption);
  
  // Aleatorizar opciones al iniciar, pero mantener el índice correcto
  const randomizedOptions = useMemo(() => {
    // Si estamos mostrando resultados, no mezclar para no confundir al usuario
    if (showResult || answered) {
      return options;
    }
    
    // Crear array de objetos con el texto y el índice original
    const optionsWithIndex = options.map((text, index) => ({ text, originalIndex: index }));
    
    // Mezclar el array
    for (let i = optionsWithIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
    }
    
    return optionsWithIndex;
  }, [options, showResult, answered]);

  return {
    randomizedOptions,
    selectedIdx,
    setSelectedIdx
  };
};

export default useOptionsManager;
