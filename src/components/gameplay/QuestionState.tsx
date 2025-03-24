
import React from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';

import TimeRemaining from './question/TimeRemaining';
import PotentialPoints from './question/PotentialPoints';
import QuestionDisplay from './question/QuestionDisplay';
import OptionsList from './question/OptionsList';
import StatusMessage from './question/StatusMessage';
import { useQuestionTimer } from './question/useQuestionTimer';

interface QuestionStateProps {
  currentQuestionData: QuizQuestion;
  timeRemaining: number;
  myRank: number;
  selectedOption: string | null;
  handleSelectOption: (optionId: string) => void;
}

const QuestionState: React.FC<QuestionStateProps> = ({
  currentQuestionData,
  timeRemaining,
  myRank,
  selectedOption,
  handleSelectOption,
}) => {
  const {
    secondsLeft,
    isWarning,
    isUrgent,
    flashWarning,
    hasPulsed,
    potentialPoints
  } = useQuestionTimer({ timeRemaining, selectedOption });
  
  const isTimeRunningOut = secondsLeft <= 5;
  
  return (
    <motion.div 
      key="question"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="py-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <TimeRemaining 
          secondsLeft={secondsLeft}
          timeRemaining={timeRemaining}
          isTimeRunningOut={isTimeRunningOut}
          isUrgent={isUrgent}
          flashWarning={flashWarning}
        />
        
        <PotentialPoints 
          potentialPoints={potentialPoints}
          isTimeRunningOut={isTimeRunningOut}
          selectedOption={selectedOption}
        />
      </div>
      
      <QuestionDisplay question={currentQuestionData.question} />
      
      <OptionsList 
        options={currentQuestionData.options}
        selectedOption={selectedOption}
        handleSelectOption={handleSelectOption}
      />
      
      <StatusMessage
        selectedOption={selectedOption}
        isTimeRunningOut={isTimeRunningOut}
        isUrgent={isUrgent}
      />
    </motion.div>
  );
};

export default QuestionState;
