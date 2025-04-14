
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }
    
    if (!acceptedPolicy) {
      toast({
        title: "Error",
        description: "Debes aceptar la política de privacidad para continuar",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Guardar en Supabase
      const { error } = await supabase
        .from('waitlist_subscribers')
        .insert([
          { name, email }
        ]);
        
      if (error) throw error;
      
      setHasSubmitted(true);
      toast({
        title: "¡Gracias por unirte!",
        description: "Te avisaremos cuando la aplicación esté disponible",
      });
    } catch (error) {
      console.error("Error al guardar en lista de espera:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="pt-24 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-gloria-cream to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <motion.h1 
                className="text-3xl md:text-5xl font-serif font-bold text-gloria-purple mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="text-gloria-gold">Lista de</span> Espera
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-700 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Sé de los primeros en probar <span className="font-bold">A la Gloria</span>, el juego
                definitivo sobre la Semana Santa de Sevilla.
              </motion.p>
            </div>
            
            {hasSubmitted ? (
              <motion.div 
                className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gloria-purple mb-4">¡Gracias por unirte!</h2>
                <p className="text-gray-600 mb-6">
                  Te hemos añadido a nuestra lista de espera. Te avisaremos por email
                  cuando la aplicación esté disponible.
                </p>
                <Button 
                  variant="primary"
                  href="/"
                >
                  Volver al inicio
                </Button>
              </motion.div>
            ) : (
              <motion.form 
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="mb-6">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gloria-purple focus:border-transparent"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gloria-purple focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                
                <div className="flex items-start space-x-2 mb-6">
                  <Checkbox 
                    id="privacy-policy"
                    checked={acceptedPolicy}
                    onCheckedChange={(checked) => setAcceptedPolicy(checked === true)}
                  />
                  <label 
                    htmlFor="privacy-policy" 
                    className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Acepto la <a href="#" className="text-gloria-purple hover:underline">política de privacidad</a> y los términos de uso.
                  </label>
                </div>
                
                <Button 
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !acceptedPolicy}
                >
                  {isSubmitting ? 'Procesando...' : 'Unirme a la lista de espera'}
                </Button>
                
                <p className="text-gray-500 text-sm mt-4 text-center">
                  No compartiremos tu información con nadie. Solo te contactaremos 
                  cuando la aplicación esté disponible.
                </p>
              </motion.form>
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Waitlist;
