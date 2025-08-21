import React, { useState, useEffect } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {isEmailVerified ? (
            <CheckCircle className="w-12 h-12 text-green-500" />
          ) : (
            <Mail className="w-12 h-12 text-blue-500" />
          )}
        </div>
        <CardTitle>Vérification de l'email</CardTitle>
        <CardDescription>
          {isEmailVerified 
            ? "Votre email a été vérifié avec succès !" 
            : `Nous avons envoyé un code de vérification à ${formData.email}`
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isEmailVerified && (
          <>
            <div className="space-y-2">
              <Label htmlFor="verification-code">Code de vérification</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Entrez le code à 6 chiffres"
                value={emailVerificationCode}
                onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className={errors.emailVerificationCode ? 'border-red-500' : ''}
              />
              {errors.emailVerificationCode && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.emailVerificationCode}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex flex-col space-y-2">
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

            <div className="text-sm text-muted-foreground text-center">
              <p>Vous n'avez pas reçu le code ?</p>
              <p>Vérifiez votre dossier spam ou cliquez sur "Renvoyer le code"</p>
            </div>
          </>
        )}

        {isEmailVerified && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Email vérifié ! Vous pouvez maintenant continuer vers l'étape suivante.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};