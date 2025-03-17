
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SignupProgressIndicator from './SignupProgressIndicator';
import SignupStepOne from './SignupStepOne';
import SignupStepTwo from './SignupStepTwo';

const Signup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Corregir aquí: cambiar user por currentUser
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error al obtener la sesión:", error);
          return;
        }
        
        if (data.session) {
          // Verificar si el usuario es admin
          const { data: adminData, error: adminError } = await supabase
            .from('admin_roles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .maybeSingle();
          
          if (adminError) {
            console.error("Error al verificar si el usuario es admin:", adminError);
          }
          
          const isAdmin = !!adminData;
          
          // Redirigir al usuario si ya está autenticado
          navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error al verificar el estado de autenticación:', error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const handleNextStep = () => {
    setAuthError(null);
    
    // Validar el primer paso
    if (!name.trim()) {
      setAuthError("Por favor, ingresa un nombre válido");
      toast({
        title: "Error de validación",
        description: "Por favor, ingresa un nombre válido",
        variant: "destructive"
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setAuthError("Por favor, ingresa un correo electrónico válido");
      toast({
        title: "Error de validación",
        description: "Por favor, ingresa un correo electrónico válido",
        variant: "destructive"
      });
      return;
    }

    setStep(2);
  };

  const handlePrevStep = () => {
    setAuthError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validar el segundo paso
    if (password.length < 8) {
      setAuthError("La contraseña debe tener al menos 8 caracteres");
      toast({
        title: "Error de validación",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("Las contraseñas no coinciden");
      toast({
        title: "Error de validación",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    if (!isTermsAccepted) {
      setAuthError("Debes aceptar los términos y condiciones");
      toast({
        title: "Error de validación",
        description: "Debes aceptar los términos y condiciones",
        variant: "destructive"
      });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Crear la cuenta de usuario directamente con Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });

      if (error) {
        let errorMessage = "Ha ocurrido un error durante el registro";

        if (error.message.includes("Email already registered")) {
          errorMessage = "El correo electrónico ya está registrado";
        }

        setAuthError(errorMessage);
        toast({
          title: "Error de registro",
          description: errorMessage,
          variant: "destructive"
        });

        setIsSubmitting(false);
        return;
      }

      // Registro exitoso
      toast({
        title: "¡Registro exitoso!",
        description: "Por favor, verifica tu correo electrónico para confirmar tu cuenta"
      });

      // Redireccionar a la página de inicio de sesión con el correo electrónico
      navigate('/login', { state: { registeredEmail: email } });
    } catch (error) {
      console.error('Error durante el registro:', error);
      setAuthError("Ha ocurrido un error inesperado durante el registro");
      toast({
        title: "Error",
        description: "Ha ocurrido un error durante el registro",
        variant: "destructive"
      });
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
                Crear una cuenta
              </h1>
              <p className="text-gray-600">
                Únete a A la Gloria y participa en juegos
              </p>
            </div>

            <SignupProgressIndicator currentStep={step} />
            
            {authError && (
              <div className="mt-4 mb-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={step === 2 ? handleSubmit : handleNextStep} className="mt-6">
              {step === 1 ? (
                <SignupStepOne
                  formData={{ name, email }}
                  handleChange={(e) => {
                    const { name, value } = e.target;
                    if (name === 'name') setName(value);
                    if (name === 'email') setEmail(value);
                  }}
                  handleNextStep={handleNextStep}
                />
              ) : (
                <SignupStepTwo
                  formData={{ password, confirmPassword }}
                  handleChange={(e) => {
                    const { name, value } = e.target;
                    if (name === 'password') setPassword(value);
                    if (name === 'confirmPassword') setConfirmPassword(value);
                  }}
                  handlePrevStep={handlePrevStep}
                  isLoading={isSubmitting}
                  isTermsAccepted={isTermsAccepted}
                  setIsTermsAccepted={setIsTermsAccepted}
                />
              )}
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
