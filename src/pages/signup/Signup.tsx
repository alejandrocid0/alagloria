
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SignupStepOne from './SignupStepOne';
import SignupStepTwo from './SignupStepTwo';
import SignupProgressIndicator from './SignupProgressIndicator';
import { validateStep1, validateStep2 } from './utils/validation';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (validateStep1(formData)) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2(formData, isTermsAccepted)) {
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
              
              <SignupProgressIndicator currentStep={step} />
            </div>
            
            {step === 1 ? (
              <SignupStepOne 
                formData={formData} 
                handleChange={handleChange} 
                handleNextStep={handleNextStep} 
              />
            ) : (
              <SignupStepTwo 
                formData={formData} 
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handlePrevStep={handlePrevStep}
                isLoading={isLoading}
                isTermsAccepted={isTermsAccepted}
                setIsTermsAccepted={setIsTermsAccepted}
              />
            )}
            
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
