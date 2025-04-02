
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // Redirect to login if no user
    if (!user) {
      navigate('/login', { state: { redirectTo: `/profile/${id}` } });
      return;
    }
    
    // If viewing own profile, redirect to dashboard
    if (user.id === id) {
      navigate('/dashboard');
    }
  }, [user, navigate, id]);

  // This will only show briefly or for other users' profiles
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-serif font-bold mb-6">Perfil de Usuario</h1>
          <p className="text-gray-500">Esta página está en desarrollo.</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
