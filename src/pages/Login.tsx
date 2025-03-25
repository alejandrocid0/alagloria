
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  // Manejar la redirección si el usuario ya está autenticado
  useEffect(() => {
    if (session) {
      navigate('/games');
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        // Redirección a la página de partidas después de un inicio de sesión exitoso
        navigate('/games');
      }
    } catch (err) {
      console.error("Error durante el inicio de sesión:", err);
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
                Iniciar Sesión
              </h1>
              <p className="text-gray-600">
                Bienvenido de nuevo a A la Gloria
              </p>
            </div>
            
            {message && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                {message}
              </div>
            )}
            
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
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">
                    Contraseña
                  </Label>
                  <Link to="/forgot-password" className="text-xs text-gloria-purple hover:text-gloria-gold transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
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
                    Iniciando sesión...
                  </>
                ) : "Iniciar Sesión"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link to="/signup" className="text-gloria-purple hover:text-gloria-gold transition-colors font-medium">
                  Regístrate
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
