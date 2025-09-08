import React, { useState, useEffect } from 'react';
import { useRegistration } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ErrorAlert, FieldError } from '@/components/ui/error-alert';

export const EmailVerificationStep: React.FC = () => {
  const {
    formData,
    emailVerificationCode,
    isEmailVerified,
    isLoading,
    errors,
    globalError,
    setEmailVerificationCode,
    sendEmailVerification,
    verifyEmail,
    clearGlobalError,
  } = useRegistration();

  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification();
      setCountdown(60); // 1 minute cooldown
      setCanResend(false);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // L'erreur est maintenant gérée automatiquement par le store
    }
  };

  useEffect(() => {
    // Ne pas envoyer automatiquement l'email au montage du composant
    // L'email est maintenant envoyé automatiquement lors de la création du compte
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerifyCode = async () => {
    if (!emailVerificationCode.trim()) return;
    
    try {
      await verifyEmail();
      // If successful, the store will automatically move to step 3
    } catch (error) {
      console.error('Email verification failed:', error);
      // L'erreur est maintenant gérée automatiquement par le store
    }
  };

  return (
    <div className="space-y-6">
      {/* Affichage des erreurs globales */}
      {globalError && (
        <ErrorAlert 
          error={globalError} 
          onDismiss={clearGlobalError}
          className="mb-4"
        />
      )}

      {/* Simple header consistent with other steps */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {isEmailVerified 
              ? "Votre email a été vérifié avec succès. Vous pouvez continuer." 
              : (
                  <>
                    Un code de vérification a été envoyé à <br />
                    <span className="font-medium text-purple-600">{formData.email}</span>
                  </>
                )
            }
          </p>
        </div>
      </div>

      {!isEmailVerified && (
        <div className="max-w-sm mx-auto space-y-6">
          {/* Code input */}
          <div className="space-y-3">
            <Label htmlFor="verification-code" className="text-center block font-medium">
              Code de vérification
            </Label>
            <div className="relative">
              <Input
                id="verification-code"
                type="text"
                placeholder="123456"
                value={emailVerificationCode}
                onChange={(e) => {
                  const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setEmailVerificationCode(cleanValue);
                  // Clear global error when user starts typing
                  if (globalError) clearGlobalError();
                }}
                maxLength={6}
                className={`text-center text-lg font-mono tracking-wider ${
                  errors.emailVerificationCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
                }`}
              />
              {emailVerificationCode.length === 6 && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            
            {/* Erreur de champ spécifique */}
            <FieldError error={errors.emailVerificationCode} />
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleVerifyCode}
              disabled={isLoading || emailVerificationCode.length !== 6}
              className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Vérification...
                </div>
              ) : (
                'Vérifier le code'
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleSendVerification}
              disabled={!canResend || isLoading}
              className="w-full"
            >
              {countdown > 0 
                ? `Renvoyer le code (${countdown}s)` 
                : 'Renvoyer le code'
              }
            </Button>

            {/* Message d'aide */}
            <div className="text-xs text-center text-gray-500 dark:text-gray-400 space-y-1">
              <p>Vérifiez vos spams si vous ne recevez pas l'email</p>
              <p>Le code expire après 10 minutes</p>
            </div>
          </div>
        </div>
      )}

      {isEmailVerified && (
        <div className="max-w-sm mx-auto">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Email vérifié ! Vous pouvez maintenant continuer vers l'étape suivante.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};