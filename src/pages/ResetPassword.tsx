
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();

  // Verificar que el usuario tenga acceso a esta página (debe estar autenticado por el flujo de reseteo)
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      // Si no hay sesión pero existe un hash en la URL, es probable que el usuario
      // esté siguiendo el flujo de recuperación
      if (!data.session && !window.location.hash) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Validación básica
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const { error: updateError } = await updatePassword(password);
      
      if (!updateError) {
        setResetComplete(true);
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Tu contraseña ha sido actualizada. Puedes iniciar sesión con tu nueva contraseña.' } 
          });
        }, 3000);
      } else {
        setError(updateError.message);
      }
    } catch (err: any) {
      console.error("Error actualizando contraseña:", err);
      setError(err.message || 'Error al actualizar la contraseña');
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
                Establecer Nueva Contraseña
              </h1>
              <p className="text-gray-600">
                Crea una nueva contraseña segura para tu cuenta
              </p>
            </div>
            
            {resetComplete ? (
              <Alert className="mb-6 bg-green-50 border-green-100">
                <AlertDescription className="text-green-800">
                  ¡Tu contraseña ha sido actualizada exitosamente! 
                  Serás redirigido a la página de inicio de sesión...
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert className="mb-6 bg-red-50 border-red-100">
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Nueva Contraseña
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
                      minLength={6}
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
                      type={showPassword ? "text" : "password"}
                      className="pl-10"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Actualizando contraseña...
                    </>
                  ) : "Guardar nueva contraseña"}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;
