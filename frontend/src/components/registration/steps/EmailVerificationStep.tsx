import React, { useState, useEffect } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const EmailVerificationStep: React.FC = () => {
  const {
    formData,
    emailVerificationCode,
    isEmailVerified,
    isLoading,
    errors,
    setEmailVerificationCode,
    sendEmailVerification,
    verifyEmail,
  } = useRegistrationStore();

  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification();
      setCountdown(60); // 1 minute cooldown
      setCanResend(false);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  };

  useEffect(() => {
    // Send initial verification email when component mounts
    if (!isEmailVerified && canResend) {
      handleSendVerification();
    }
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple header consistent with other steps */}
      <div className="text-center space-y-4">
        
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {isEmailVerified 
              ? "Votre email a été vérifié avec succès. Vous pouvez continuer." 
              : (
                  <>
                    Nous avons envoyé un code de vérification à <br />
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
                onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className={`text-center text-lg font-mono tracking-wider ${
                  errors.emailVerificationCode ? 'border-red-500' : ''
                }`}
              />
              {emailVerificationCode.length === 6 && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            
            {errors.emailVerificationCode && (
              <Alert variant="destructive" className="text-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.emailVerificationCode}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleVerifyCode}
              disabled={isLoading || emailVerificationCode.length !== 6}
              className="w-full"
            >
              {isLoading ? 'Vérification...' : 'Vérifier le code'}
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