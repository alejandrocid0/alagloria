import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/simple-toast';

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Referencias tanto para el formulario como para el hero
  const formRef = useRef<HTMLFormElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('waitlist_subscribers')
        .insert([{ email, name, notes: '' }]);

      if (error) throw error;

      toast({
        title: "¡Gracias por unirte!",
        description: "Te notificaremos cuando esté disponible."
      });
      
      setEmail('');
      setName('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll suave al HERO (título + formulario)
  const scrollToHero = () => {
    if (heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
        <section
          ref={heroRef}
          className="pt-24 pb-16 md:pt-40 md:pb-24 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'80\\' height=\\'80\\' viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%234a2a6b\\' fill-opacity=\\'0.03\\'%3E%3Cpath d=\\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-serif font-bold text-purple-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="text-yellow-600">A la</span> Gloria
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Pon a prueba tus conocimientos sobre la Semana Santa de Sevilla
                y compite por premios en tiempo real.
              </motion.p>
              
              <motion.div 
                className="max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  id="waitlist-form"
                >
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="email"
                    placeholder="Tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Enviando...' : 'Únete a la lista de espera'}
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        <WaitlistHowItWorksSection />
        <WaitlistCtaSection onJoinNowClick={scrollToHero} />
      </div>
      <Footer />
    </>
  );
};

const WaitlistHowItWorksSection = () => {
  return (
    <section className="py-16 md:py-24 bg-purple-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-purple-900 mb-4">¿Cómo funciona?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Prepárate para poner a prueba tus conocimientos sobre la Semana Santa sevillana.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <Step 
            number="01" 
            title="Regístrate" 
            description="Únete a la lista de espera y sé de los primeros en acceder cuando abramos el juego."
          />
          <Step 
            number="02" 
            title="Compite" 
            description="Reta a amigos y otros jugadores en partidas en vivo sobre conocimientos cofrades."
          />
          <Step 
            number="03" 
            title="Gana Premios" 
            description="Los mejores jugadores podrán ganar premios exclusivos relacionados con la Semana Santa."
          />
        </div>
      </div>
    </section>
  );
};

const Step = ({ number, title, description }: { number: string; title: string; description: string }) => {
  return (
    <motion.div 
      className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-yellow-600 text-5xl font-serif font-bold mb-4">{number}</div>
      <h3 className="text-xl font-bold text-purple-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

// Recibe el handler onJoinNowClick como prop para el scroll
const WaitlistCtaSection = ({ onJoinNowClick }: { onJoinNowClick?: () => void }) => {
  return (
    <section className="py-16 md:py-24 bg-purple-900 text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            ¿Listo para la experiencia definitiva sobre la Semana Santa de Sevilla?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Únete a nuestra lista de espera y sé de los primeros en poner a prueba 
            tus conocimientos cuando abramos la aplicación.
          </p>
          <Button
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            onClick={onJoinNowClick}
          >
            Únete ahora
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Waitlist;
