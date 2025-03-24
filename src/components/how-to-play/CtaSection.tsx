
import { motion } from 'framer-motion';
import Button from '@/components/Button';

const CtaSection = () => {
  return (
    <motion.div 
      className="text-center py-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gloria-purple mb-6">
        ¿Listo para demostrar tus conocimientos?
      </h2>
      <Button 
        variant="secondary"
        size="lg"
        href="/games"
      >
        Ver Partidas Disponibles
      </Button>
    </motion.div>
  );
};

export default CtaSection;
