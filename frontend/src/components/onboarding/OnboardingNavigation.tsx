import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onComplete: () => void;
}

export function OnboardingNavigation({ 
  currentStep, 
  totalSteps, 
  onPrevStep, 
  onNextStep, 
  onComplete 
}: OnboardingNavigationProps) {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={onPrevStep}
        disabled={currentStep === 1}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Précédent
      </Button>
      
      {currentStep < totalSteps ? (
        <Button onClick={onNextStep} className="gap-2">
          Suivant
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={onComplete} className="gap-2 bg-green-600 hover:bg-green-700">
          <Check className="h-4 w-4" />
          Terminer
        </Button>
      )}
    </div>
  );
}