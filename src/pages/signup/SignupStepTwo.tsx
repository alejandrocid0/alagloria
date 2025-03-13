
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';

interface SignupStepTwoProps {
  formData: {
    password: string;
    confirmPassword: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handlePrevStep: () => void;
  isLoading: boolean;
  isTermsAccepted: boolean;
  setIsTermsAccepted: (value: boolean) => void;
}

const SignupStepTwo = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  handlePrevStep, 
  isLoading, 
  isTermsAccepted, 
  setIsTermsAccepted 
}: SignupStepTwoProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <form onSubmit={handleSubmit} className="space-y-6">
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
    </form>
  );
};

export default SignupStepTwo;
