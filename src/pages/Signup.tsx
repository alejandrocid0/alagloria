
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive"
      });
      return false;
    }
    
    if (!isValidEmail(formData.email)) {
      toast({
        title: "Error",
        description: "Por favor, introduce un correo electrónico válido",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return false;
    }
    
    if (!isTermsAccepted) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { user, error } = await signUp(
        formData.email, 
        formData.password, 
        formData.name
      );
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Error",
            description: "Este correo electrónico ya está registrado",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Ha ocurrido un error durante el registro",
            variant: "destructive"
          });
        }
        return;
      }
      
      toast({
        title: "¡Registro completado!",
        description: "Tu cuenta ha sido creada correctamente. Puedes iniciar sesión ahora.",
      });
      
      // Navegamos a login para que el usuario inicie sesión de inmediato
      navigate('/login', { 
        state: { 
          registeredEmail: formData.email,
          message: "Tu cuenta ha sido creada. Por favor, inicia sesión para continuar." 
        } 
      });
    } catch (error) {
      console.error('Error during signup:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error durante el registro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, text: '', color: 'bg-gray-200' };
    
    if (password.length < 8) {
      return { strength: 25, text: 'Débil', color: 'bg-red-500' };
    }
    
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    if (strength <= 25) return { strength, text: 'Débil', color: 'bg-red-500' };
    if (strength <= 50) return { strength, text: 'Media', color: 'bg-yellow-500' };
    if (strength <= 75) return { strength, text: 'Buena', color: 'bg-blue-500' };
    return { strength, text: 'Fuerte', color: 'bg-green-500' };
  };

  const { strength, text, color } = passwordStrength();

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen pt-24 pb-16 bg-gloria-cream bg-opacity-30">
        <div className="container mx-auto px-4 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 md:p-10"
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gloria-purple mb-2">
                Crear Cuenta
              </h1>
              <p className="text-gray-600">
                Únete a la comunidad de A la Gloria
              </p>
              
              <div className="flex items-center justify-center mt-6">
                <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-gloria-purple' : 'bg-gray-300'}`}></div>
                <div className={`w-8 h-0.5 ${step >= 1 ? 'bg-gloria-purple' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-gloria-purple' : 'bg-gray-300'}`}></div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Nombre
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="gloria-input pl-10 w-full"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="gloria-input pl-10 w-full"
                        placeholder="tucorreo@ejemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleNextStep}
                  >
                    Continuar
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        className="gloria-input pl-10 pr-10 w-full"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    {formData.password && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${strength}%` }}></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">Seguridad: {text}</span>
                          <span className="text-xs text-gray-500">Mínimo 8 caracteres</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="gloria-input pl-10 pr-10 w-full"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    {formData.confirmPassword && (
                      <div className="flex mt-1 items-center">
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-xs text-green-500">Las contraseñas coinciden</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                            <span className="text-xs text-red-500">Las contraseñas no coinciden</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      className="h-4 w-4 border-gray-300 rounded text-gloria-purple focus:ring-gloria-purple mt-1"
                      checked={isTermsAccepted}
                      onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      Acepto los{' '}
                      <Link to="/terms" className="text-gloria-purple hover:text-gloria-gold transition-colors">
                        Términos y Condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link to="/privacy" className="text-gloria-purple hover:text-gloria-gold transition-colors">
                        Política de Privacidad
                      </Link>
                    </label>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-1/3"
                      onClick={handlePrevStep}
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-2/3"
                      isLoading={isLoading}
                    >
                      Crear Cuenta
                    </Button>
                  </div>
                </>
              )}
              
              {step === 1 && (
                <>
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-sm text-gray-500">
                        O regístrate con
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full flex justify-center items-center space-x-2"
                    onClick={() => {
                      toast({
                        title: "Google Signup",
                        description: "Esta función estará disponible pronto",
                      });
                    }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Google</span>
                  </Button>
                </>
              )}
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-gloria-purple hover:text-gloria-gold transition-colors font-medium">
                  Inicia Sesión
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
