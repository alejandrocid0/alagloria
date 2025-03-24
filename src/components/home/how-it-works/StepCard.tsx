
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StepCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  itemVariants: any;
  stepNumber: number;
}

const StepCard = ({ icon: Icon, title, description, itemVariants, stepNumber }: StepCardProps) => {
  return (
    <motion.div 
      className="glass-panel p-8 text-center"
      variants={itemVariants}
    >
      <div className="w-16 h-16 bg-gloria-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon className="h-8 w-8 text-gloria-purple" />
      </div>
      <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-3">{stepNumber}. {title}</h3>
      <p className="text-gray-600">
        {description}
      </p>
    </motion.div>
  );
};

export default StepCard;
