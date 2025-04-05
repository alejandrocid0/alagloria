
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WaitingRoomContainer from '@/components/gameplay/waiting-room/WaitingRoomContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

const GameWaitingRoom = () => {
  const { user } = useAuth();
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  // Redirigir a login si no hay usuario autenticado y no es la demo
  useEffect(() => {
    if (!user && gameId !== 'demo-123') {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, gameId]);
  
  return (
    <>
      <Navbar />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <WaitingRoomContainer />
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default GameWaitingRoom;
