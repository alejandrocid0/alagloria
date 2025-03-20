
import { motion } from 'framer-motion';
import Button from '@/components/Button';

const CtaSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gloria-purple text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            ¿Listo para poner a prueba tus conocimientos?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Únete ahora y compite por premios mientras demuestras cuánto sabes
            sobre la Semana Santa de Sevilla.
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            href="/signup"
          >
            Crea tu cuenta gratis
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
