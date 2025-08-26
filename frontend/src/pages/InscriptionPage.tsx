import { Button } from '@/components/ui/button';
import { FormErrors } from '@/components/ui/form-errors';
import { Heart, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '@/hooks/useRegistration';
import { ProgressBar } from '@/components/registration';
import {
  AccountStep,
  BasicInfoStep,
  AppearanceStep,
  LifestyleStep,
  ActivityStep,
  PersonalStep,
  InterestsStep,
  EmailVerificationStep,
  ImageUploadStep
} from '@/components/registration/steps';
import { registrationSteps, stepDescriptions } from '@/constants/registrationSteps';

export default function InscriptionPage() {
  const navigate = useNavigate();
  const {
    formData,
    currentStep,
    isLoading,
    errors,
    globalError,
    updateField,
    toggleTag,
    canContinue,
    nextStep,
    prevStep,
    completeRegistration,
    clearGlobalError
  } = useRegistration();


  const renderStepContent = () => {
    const commonProps = { formData, errors, updateField };
    
    switch (currentStep) {
      case 1:
        return <AccountStep {...commonProps} />;
      case 2:
        return <EmailVerificationStep />;
      case 3:
        return <BasicInfoStep {...commonProps} />;
      case 4:
        return <AppearanceStep {...commonProps} />;
      case 5 :
        return <LifestyleStep {...commonProps} />;
      case 6:
        return <ActivityStep {...commonProps} />;
      case 7 :
        return <PersonalStep {...commonProps} />;
      case 8:
        return <InterestsStep formData={formData} errors={errors} toggleTag={toggleTag} />;
      case 9:
        return <ImageUploadStep />;
      default:
        return null;
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-violet-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="flex items-center justify-center pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="h-6 w-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inscription</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Créez votre profil Matcha</p>
          </div>
        </div>
      </div>

      <ProgressBar 
        currentStep={currentStep} 
        totalSteps={registrationSteps.length} 
        steps={registrationSteps} 
      />

      {/* Main Content */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {registrationSteps[currentStep - 1].title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {stepDescriptions[currentStep as keyof typeof stepDescriptions]}
              </p>
            </div>

            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? () => navigate('/login') : prevStep}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? 'Retour' : 'Précédent'}
              </Button>

              {currentStep < registrationSteps.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!canContinue() || isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white disabled:opacity-50"
                >
                  {currentStep === 1 ? 'Créer le compte' : 'Suivant'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={completeRegistration}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Finalisation...
                    </>
                  ) : (
                    <>
                      Finaliser mon profil
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}