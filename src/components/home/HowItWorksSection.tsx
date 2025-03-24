
import { motion } from 'framer-motion';
import { Users, Clock, Award } from 'lucide-react';

const HowItWorksSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gloria-purple mb-4">¿Cómo funciona?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Una experiencia de juego única sobre la Semana Santa de Sevilla
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className="glass-panel p-8 text-center"
            variants={itemVariants}
          >
            <div className="w-16 h-16 bg-gloria-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-gloria-purple" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-3">1. Únete a una partida</h3>
            <p className="text-gray-600">
              Elige una de las partidas disponibles y regístrate para participar gratuitamente.
            </p>
          </motion.div>
          
          <motion.div 
            className="glass-panel p-8 text-center"
            variants={itemVariants}
          >
            <div className="w-16 h-16 bg-gloria-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-gloria-purple" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-3">2. Responde preguntas</h3>
            <p className="text-gray-600">
              Contesta correctamente y lo más rápido posible para acumular más puntos.
            </p>
          </motion.div>
          
          <motion.div 
            className="glass-panel p-8 text-center"
            variants={itemVariants}
          >
            <div className="w-16 h-16 bg-gloria-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="h-8 w-8 text-gloria-purple" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-3">3. Consigue logros</h3>
            <p className="text-gray-600">
              Demuestra tus conocimientos y compite por los primeros puestos del ranking.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
