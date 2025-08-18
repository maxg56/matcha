import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  OnboardingHeader,
  AccountStep,
  ProfileStep,
  PhotosStep,
  PreferencesStep,
  OnboardingNavigation
} from '@/components/onboarding';

const STEPS = [
  { id: 1, title: 'Compte' },
  { id: 2, title: 'Profil' },
  { id: 3, title: 'Photos' },
  { id: 4, title: 'Préférences' },
];

interface FormData {
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2
  dateOfBirth: string;
  location: string;
  occupation: string;
  bio: string;

  // Step 3
  photos: string[];

  // Step 4
  interests: string[];
  ageRange: [number, number];
  maxDistance: number;
  genderPreference: string;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    location: '',
    occupation: '',
    bio: '',
    photos: [],
    interests: [],
    ageRange: [18, 35],
    maxDistance: 50,
    genderPreference: '',
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    console.log('Registration completed:', formData);
    navigate('/discover');
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    updateFormData({ interests: newInterests });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <OnboardingHeader currentStep={currentStep} />

      {/* Content */}
      <main className="px-4 pb-8 lg:px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {currentStep === 1 && 'Créer votre compte'}
                {currentStep === 2 && 'Parlez-nous de vous'}
                {currentStep === 3 && 'Ajoutez vos photos'}
                {currentStep === 4 && 'Vos préférences'}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <AccountStep formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 2 && (
                <ProfileStep formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 3 && (
                <PhotosStep formData={formData} updateFormData={updateFormData} />
              )}
              {currentStep === 4 && (
                <PreferencesStep
                  formData={formData}
                  updateFormData={updateFormData}
                  toggleInterest={toggleInterest}
                />
              )}

              <OnboardingNavigation
                currentStep={currentStep}
                totalSteps={STEPS.length}
                onPrevStep={prevStep}
                onNextStep={nextStep}
                onComplete={handleComplete}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
