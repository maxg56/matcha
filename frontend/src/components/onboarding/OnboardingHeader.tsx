import { Heart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Compte', icon: Heart },
  { id: 2, title: 'Profil', icon: Heart },
  { id: 3, title: 'Photos', icon: Heart },
  { id: 4, title: 'Préférences', icon: Heart },
];

interface OnboardingHeaderProps {
  currentStep: number;
}

export function OnboardingHeader({ currentStep }: OnboardingHeaderProps) {
  return (
    <header className="p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground fill-current" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Matcha</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Étape {currentStep} sur {STEPS.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className={cn(
                  "flex items-center gap-3 flex-1",
                  isActive && "text-primary",
                  isCompleted && "text-primary"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    isActive && "bg-primary border-primary text-primary-foreground",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    !isActive && !isCompleted && "border-muted-foreground/30"
                  )}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={cn(
                    "hidden sm:block font-medium transition-colors",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn(
                    "hidden sm:block h-0.5 bg-border flex-1 mx-4 transition-colors",
                    isCompleted && "bg-primary"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}