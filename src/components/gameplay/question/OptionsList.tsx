
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { QuizQuestion } from '@/types/quiz';

interface OptionsListProps {
  options: QuizQuestion['options'];
  selectedOption: string | null;
  handleSelectOption: (optionId: string) => void;
}

const OptionsList: React.FC<OptionsListProps> = ({
  options,
  selectedOption,
  handleSelectOption
}) => {
  const optionsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const optionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const isOptionSelected = (optionId: string) => selectedOption === optionId;

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      variants={optionsContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {options.map((option, index) => {
        const isSelected = isOptionSelected(option.id);
        
        return (
          <motion.button
            key={option.id}
            variants={optionVariants}
            whileHover={{ scale: selectedOption ? 1 : 1.02, boxShadow: selectedOption ? "none" : "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            whileTap={{ scale: selectedOption ? 1 : 0.98 }}
            onClick={() => !selectedOption && handleSelectOption(option.id)}
            disabled={selectedOption !== null}
            className={cn(
              "relative p-4 rounded-lg border-2 text-left transition-all",
              isSelected 
                ? "border-gloria-purple bg-gloria-purple/10" 
                : selectedOption 
                  ? "border-gray-200 bg-gray-50 opacity-70" 
                  : "border-gray-200 hover:border-gloria-purple/50 hover:bg-gloria-purple/5"
            )}
          >
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-2 right-2"
              >
                <CheckCircle className="w-6 h-6 text-gloria-purple" />
              </motion.div>
            )}
            
            <div className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gloria-purple/10 text-gloria-purple mr-3 text-sm font-medium">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="block text-base md:text-lg font-medium">
                {option.text}
              </span>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default OptionsList;
