
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const EditProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  React.useEffect(() => {
    // Redirect to login if no user
    if (!user) {
      navigate('/login', { state: { redirectTo: `/profile/${id}/edit` } });
    }
    // Redirect if not accessing own profile
    else if (user.id !== id) {
      navigate(`/profile/${user.id}/edit`);
    }
  }, [user, navigate, id]);

  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-serif font-bold mb-6">Editar Perfil</h1>
          <p className="text-gray-500">Esta página está en desarrollo.</p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditProfile;
