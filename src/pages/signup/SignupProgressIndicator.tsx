
interface SignupProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const SignupProgressIndicator = ({ currentStep, totalSteps }: SignupProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center mt-6">
      <div className={`w-3 h-3 rounded-full ${currentStep === 1 ? 'bg-gloria-purple' : 'bg-gray-300'}`}></div>
      <div className={`w-8 h-0.5 ${currentStep >= 1 ? 'bg-gloria-purple' : 'bg-gray-300'}`}></div>
      <div className={`w-3 h-3 rounded-full ${currentStep === 2 ? 'bg-gloria-purple' : 'bg-gray-300'}`}></div>
    </div>
  );
};

export default SignupProgressIndicator;
