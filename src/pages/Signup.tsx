
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { signUp, session } = useAuth();
  const navigate = useNavigate();

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (session) {
    navigate('/dashboard');
    return null;
  }

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      return "Por favor complete todos los campos";
    }
    
    if (password !== confirmPassword) {
      return "Las contraseñas no coinciden";
    }
    
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    
    if (!acceptTerms) {
      return "Debe aceptar los términos y condiciones";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const { error: signUpError } = await signUp(email, password, name);
    
    if (!signUpError) {
      navigate('/login', { 
        state: { message: 'Registro exitoso. Por favor verifica tu correo electrónico.' } 
      });
    }
    
    setIsSubmitting(false);
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
                Crear Cuenta
              </h1>
              <p className="text-gray-600">
                Únete a A la Gloria y demuestra tus conocimientos
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    className="pl-10"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              
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
                <Label htmlFor="password">
                  Contraseña
                </Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmar Contraseña
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  className="mt-1"
                  checked={acceptTerms}
                  onChange={() => setAcceptTerms(!acceptTerms)}
                  disabled={isSubmitting}
                  required
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  Acepto los <Link to="/terms" className="text-gloria-purple">términos y condiciones</Link>
                </Label>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gloria-purple hover:bg-gloria-purple/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Creando cuenta...
                  </>
                ) : "Crear Cuenta"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-gloria-purple hover:text-gloria-gold transition-colors font-medium">
                  Iniciar Sesión
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

export default Signup;
