
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';

export function useLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    // Validación básica
    if (!email || !password) {
      setAuthError("Por favor, completa todos los campos");
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        let errorMessage = "Credenciales inválidas";
        
        if (error.message.includes("Invalid login")) {
          errorMessage = "Correo electrónico o contraseña incorrectos";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Tu correo electrónico no ha sido confirmado. Por favor, revisa tu bandeja de entrada.";
        }
        
        setAuthError(errorMessage);
        toast({
          title: "Error de inicio de sesión",
          description: errorMessage,
          variant: "destructive"
        });
        
        setIsSubmitting(false);
        return;
      }
      
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente"
      });
      
      // La redirección será manejada por el useEffect en el componente Login
      
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      setAuthError("Ha ocurrido un error inesperado durante el inicio de sesión");
      toast({
        title: "Error",
        description: "Ha ocurrido un error durante el inicio de sesión",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isSubmitting,
    authError,
    handleSubmit
  };
}
