
import { motion } from 'framer-motion';

const PageHeader = () => {
  return (
    <motion.div 
      className="text-center mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-gloria-purple mb-4">
        Cómo Jugar
      </h1>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto">
        Sigue estos simples pasos para participar en nuestras partidas y demostrar tus conocimientos
      </p>
    </motion.div>
  );
};

export default PageHeader;
