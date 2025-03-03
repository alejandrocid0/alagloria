
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate form
    let isValid = true;
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Introduce un correo electrónico válido';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    }
    
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
    
    // Simulate login
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Redirect would happen here in a real app
      console.log('Login successful', { email, password });
    }, 1500);
  };
  
  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };
  
  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-panel p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-gloria-purple mb-2">
                  Iniciar Sesión
                </h1>
                <p className="text-gray-600">
                  Accede a tu cuenta para participar en partidas
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`gloria-input w-full pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-gloria-purple'}`}
                      placeholder="tu@correo.com"
                    />
                    {errors.email && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <Link to="/forgot-password" className="text-xs text-gloria-purple hover:text-gloria-gold transition-colors">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`gloria-input w-full pl-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-gloria-purple'}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {errors.password && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <AlertCircle size={14} className="mr-1" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
                
                <div className="relative flex items-center justify-center my-6">
                  <div className="border-t border-gray-300 absolute w-full"></div>
                  <span className="bg-white px-4 text-sm text-gray-500 relative">
                    O continúa con
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg" className="w-5 h-5" alt="Google" />
                    <span className="text-sm font-medium">Google</span>
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <img src="https://cdn.cdnlogo.com/logos/f/83/facebook.svg" className="w-5 h-5" alt="Facebook" />
                    <span className="text-sm font-medium">Facebook</span>
                  </button>
                </div>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  ¿No tienes una cuenta?{' '}
                  <Link to="/signup" className="text-gloria-purple hover:text-gloria-gold transition-colors font-medium inline-flex items-center">
                    Regístrate
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Login;
