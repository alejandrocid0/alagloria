
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import SignupProgressIndicator from './SignupProgressIndicator';
import SignupStepOne from './SignupStepOne';
import SignupStepTwo from './SignupStepTwo';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Manejar el envío del formulario del primer paso
  const handleStepOneComplete = (data: { name: string; email: string }) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  // Manejar el envío del formulario del segundo paso
  const handleStepTwoComplete = async (data: { password: string; confirmPassword: string }) => {
    setFormData(prev => ({ ...prev, ...data }));
    
    try {
      setIsSubmitting(true);
      
      // Registrar al usuario
      const { error } = await signUp(formData.email, data.password, formData.name);
      
      if (error) {
        console.error('Error al registrar:', error);
        
        let errorMessage = "No se pudo completar el registro.";
        
        if (error.message.includes('Email')) {
          errorMessage = "El correo electrónico ya está en uso o no es válido.";
        } else if (error.message.includes('password')) {
          errorMessage = "La contraseña no cumple con los requisitos de seguridad.";
        }
        
        toast({
          title: "Error en el registro",
          description: errorMessage,
          variant: "destructive"
        });
        
        return;
      }
      
      // Mostrar mensaje de éxito
      toast({
        title: "Cuenta creada con éxito",
        description: "Se ha enviado un enlace de confirmación a tu correo electrónico.",
      });
      
      // Redirigir a la página de inicio de sesión
      navigate('/login', { 
        state: { 
          registeredEmail: formData.email,
          message: 'Revisa tu correo electrónico para confirmar tu cuenta.' 
        } 
      });
      
    } catch (error) {
      console.error('Error inesperado durante el registro:', error);
      toast({
        title: "Error en el registro",
        description: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
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
            <div className="text-center mb-8">
              <h1 className="text-2xl font-serif font-bold text-gloria-purple mb-2">
                Crear Cuenta
              </h1>
              <p className="text-gray-600">
                Únete a A la Gloria y demuestra tus conocimientos
              </p>
            </div>
            
            <SignupProgressIndicator currentStep={currentStep} totalSteps={2} />
            
            {currentStep === 1 ? (
              <SignupStepOne 
                initialData={{ name: formData.name, email: formData.email }}
                onNext={handleStepOneComplete} 
              />
            ) : (
              <SignupStepTwo 
                onBack={() => setCurrentStep(1)} 
                onComplete={handleStepTwoComplete}
                isSubmitting={isSubmitting}
              />
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
