
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(email);
      
      if (!error) {
        setEmailSent(true);
      }
    } catch (err) {
      console.error("Error durante el proceso de recuperación:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-gloria-cream bg-opacity-30">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-serif font-bold text-gloria-purple mb-2">
                Recuperar Contraseña
              </h1>
              <p className="text-gray-600">
                Ingresa tu correo electrónico para recibir un enlace de recuperación
              </p>
            </div>
            
            {emailSent ? (
              <>
                <Alert className="mb-6 bg-green-50 border-green-100">
                  <AlertDescription className="text-green-800">
                    Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
                    Por favor, revisa tu correo electrónico y sigue las instrucciones.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gloria-purple text-gloria-purple hover:bg-gloria-purple/5"
                    onClick={() => navigate('/login')}
                  >
                    Volver a Iniciar Sesión
                  </Button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      placeholder="tucorreo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gloria-purple hover:bg-gloria-purple/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Enviando...
                    </>
                  ) : "Enviar enlace de recuperación"}
                </Button>
                
                <div className="pt-2">
                  <Link 
                    to="/login" 
                    className="flex items-center text-sm text-gloria-purple hover:text-gloria-gold transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a Iniciar Sesión
                  </Link>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;
