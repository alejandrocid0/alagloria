
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SignupProgressIndicator from './SignupProgressIndicator';
import SignupStepOne from './SignupStepOne';
import SignupStepTwo from './SignupStepTwo';
import { validateEmail, validatePassword, validateName } from './utils/validation';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStep = () => {
    // Validar el primer paso
    if (step === 1) {
      if (!validateName(name)) {
        toast({
          title: "Error de validación",
          description: "Por favor, ingresa un nombre válido",
          variant: "destructive"
        });
        return;
      }

      if (!validateEmail(email)) {
        toast({
          title: "Error de validación",
          description: "Por favor, ingresa un correo electrónico válido",
          variant: "destructive"
        });
        return;
      }
    }

    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar el segundo paso
    if (!validatePassword(password)) {
      toast({
        title: "Error de validación",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error de validación",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Crear la cuenta de usuario
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

            <form onSubmit={step === 2 ? handleSubmit : handleNextStep} className="mt-6">
              {step === 1 ? (
                <SignupStepOne
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  onNext={handleNextStep}
                />
              ) : (
                <SignupStepTwo
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  onPrev={handlePrevStep}
                  isSubmitting={isSubmitting}
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
