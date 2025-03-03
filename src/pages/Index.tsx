
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Clock, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import GameCard from '@/components/GameCard';

const Index = () => {
  const [upcomingGames, setUpcomingGames] = useState([
    {
      id: '1',
      title: 'Especial Semana Santa 2023',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      participants: 84,
      maxParticipants: 200,
      prizePool: 160,
      image: 'https://images.unsplash.com/photo-1554394985-1b222cdcc912?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      title: 'Trivia La Macarena',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      participants: 150,
      maxParticipants: 150,
      prizePool: 120,
      image: 'https://images.unsplash.com/photo-1588638261318-9569c316c152?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      title: 'Hermandades Domingo de Ramos',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      participants: 35,
      maxParticipants: 100,
      prizePool: 80,
      image: 'https://images.unsplash.com/photo-1553524790-5872ab69e309?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ]);

  const [counter, setCounter] = useState({
    users: 0,
    games: 0,
    prizes: 0
  });

  // Counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => ({
        users: prev.users >= 5000 ? 5000 : prev.users + 50,
        games: prev.games >= 120 ? 120 : prev.games + 2,
        prizes: prev.prizes >= 15000 ? 15000 : prev.prizes + 200
      }));
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
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
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-gloria-cream to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'80\\' height=\\'80\\' viewBox=\\'0 0 80 80\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%234a2a6b\\' fill-opacity=\\'0.03\\'%3E%3Cpath d=\\'M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z\\' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-serif font-bold text-gloria-purple mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-gloria-gold">A la</span> Gloria
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
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button 
                variant="secondary" 
                size="lg" 
                href="/games"
              >
                Ver Partidas Disponibles
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                href="/how-to-play"
              >
                Cómo Jugar
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>
      
      {/* How It Works */}
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
                Elige una de las partidas disponibles y regístrate con solo 1€ para participar.
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
              <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-3">3. Gana premios</h3>
              <p className="text-gray-600">
                Los tres primeros puestos reciben premios económicos del bote acumulado.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Stats Counter */}
      <section className="py-16 bg-gloria-deepPurple text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <p className="text-4xl md:text-5xl font-serif font-bold text-gloria-gold mb-2">
                +{counter.users.toLocaleString()}
              </p>
              <p className="text-lg text-gray-300">Jugadores</p>
            </div>
            
            <div>
              <p className="text-4xl md:text-5xl font-serif font-bold text-gloria-gold mb-2">
                +{counter.games.toLocaleString()}
              </p>
              <p className="text-lg text-gray-300">Partidas jugadas</p>
            </div>
            
            <div>
              <p className="text-4xl md:text-5xl font-serif font-bold text-gloria-gold mb-2">
                +{counter.prizes.toLocaleString()}€
              </p>
              <p className="text-lg text-gray-300">En premios repartidos</p>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Upcoming Games */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gloria-purple mb-3">Próximas partidas</h2>
              <p className="text-lg text-gray-600">
                No te pierdas las partidas que tenemos preparadas
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-4 md:mt-0"
            >
              <Button 
                variant="outline" 
                href="/games"
              >
                Ver todas las partidas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {upcomingGames.map((game) => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard {...game} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
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
      
      <Footer />
    </>
  );
};

export default Index;
