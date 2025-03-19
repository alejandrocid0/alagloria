
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionButtonProps {
  index: number;
  text: string;
  selectedIdx?: number;
  correctAnswer?: number;
  answered: boolean;
  showResult: boolean;
  onClick: (index: number) => void;
}

const OptionButton = ({
  index,
  text,
  selectedIdx,
  correctAnswer,
  answered,
  showResult,
  onClick
}: OptionButtonProps) => {
  
  const getOptionClassName = () => {
    let className = "relative p-4 border rounded-lg transition-all duration-200 cursor-pointer";
    
    if (!answered && !showResult) {
      className += " hover:border-gloria-purple hover:bg-gloria-purple/5";
      className += selectedIdx === index ? " border-gloria-purple bg-gloria-purple/5" : " border-gray-200";
    } else if (showResult) {
      if (index === correctAnswer) {
        className += " border-green-500 bg-green-50";
      } else if (selectedIdx === index && index !== correctAnswer) {
        className += " border-red-500 bg-red-50";
      } else {
        className += " border-gray-200 opacity-70";
      }
    }
    
    return className;
  };
  
  return (
    <motion.div 
      className={getOptionClassName()}
      onClick={() => !answered && onClick(index)}
      whileHover={!answered ? { scale: 1.01 } : {}}
      whileTap={!answered ? { scale: 0.99 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 h-6 w-6 rounded-full border border-current flex items-center justify-center text-sm mr-3 mt-0.5">
          {String.fromCharCode(65 + index)}
        </div>
        <div className="text-base">{text}</div>
      </div>
      
      {showResult && index === correctAnswer && (
        <div className="absolute top-2 right-2 text-green-600">
          <CheckCircle size={18} />
        </div>
      )}
      
      {showResult && selectedIdx === index && index !== correctAnswer && (
        <div className="absolute top-2 right-2 text-red-600">
          <XCircle size={18} />
        </div>
      )}
    </motion.div>
  );
};

export default OptionButton;
