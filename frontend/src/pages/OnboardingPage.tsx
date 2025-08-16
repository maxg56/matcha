import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  MapPin, 
  Briefcase,
  Heart,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Compte', icon: User },
  { id: 2, title: 'Profil', icon: User },
  { id: 3, title: 'Photos', icon: Upload },
  { id: 4, title: 'Préférences', icon: Heart },
];

const INTERESTS = [
  'Voyage', 'Photographie', 'Cuisine', 'Sport', 'Musique', 'Art', 
  'Lecture', 'Cinéma', 'Technologie', 'Nature', 'Fitness', 'Danse',
  'Yoga', 'Gaming', 'Mode', 'Design', 'Écriture', 'Théâtre'
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
      {/* Header */}
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
              {/* Step 1: Account */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData({ firstName: e.target.value })}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData({ lastName: e.target.value })}
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => updateFormData({ password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Profile */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date de naissance</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="pl-10"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) => updateFormData({ location: e.target.value })}
                        placeholder="Paris, France"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Profession</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="occupation"
                        className="pl-10"
                        value={formData.occupation}
                        onChange={(e) => updateFormData({ occupation: e.target.value })}
                        placeholder="Développeur, Designer..."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => updateFormData({ bio: e.target.value })}
                      placeholder="Parlez-nous de vous, vos passions, ce que vous cherchez..."
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.bio.length}/500 caractères
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Photos */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-6">
                      Ajoutez jusqu'à 6 photos pour montrer votre personnalité
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "aspect-[3/4] rounded-2xl border-2 border-dashed border-border",
                          "flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors",
                          "bg-muted/20"
                        )}
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Photo {index + 1}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Choisir des photos
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Preferences */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Centres d'intérêt</Label>
                      <p className="text-sm text-muted-foreground">
                        Choisissez au moins 3 centres d'intérêt
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {INTERESTS.map((interest) => {
                          const isSelected = formData.interests.includes(interest);
                          return (
                            <Badge
                              key={interest}
                              variant={isSelected ? "default" : "outline"}
                              className={cn(
                                "cursor-pointer transition-all hover:scale-105",
                                isSelected && "bg-primary text-primary-foreground"
                              )}
                              onClick={() => toggleInterest(interest)}
                            >
                              {interest}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Je cherche</Label>
                        <Select
                          value={formData.genderPreference}
                          onValueChange={(value) => updateFormData({ genderPreference: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="men">Des hommes</SelectItem>
                            <SelectItem value="women">Des femmes</SelectItem>
                            <SelectItem value="both">Homme et femmes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Distance max: {formData.maxDistance}km</Label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={formData.maxDistance}
                          onChange={(e) => updateFormData({ maxDistance: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Précédent
                </Button>
                
                {currentStep < STEPS.length ? (
                  <Button onClick={nextStep} className="gap-2">
                    Suivant
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleComplete} className="gap-2 bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4" />
                    Terminer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}