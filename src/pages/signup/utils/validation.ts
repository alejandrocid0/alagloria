
import { toast } from '@/hooks/use-toast';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const validateStep1 = (formData: Pick<SignupFormData, 'name' | 'email'>) => {
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

export const validateStep2 = (
  formData: Pick<SignupFormData, 'password' | 'confirmPassword'>, 
  isTermsAccepted: boolean
) => {
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

export const isValidEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};
