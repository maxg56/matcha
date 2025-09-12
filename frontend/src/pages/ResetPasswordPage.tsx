import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PasswordService } from '@/services/passwordService';
import { PasswordValidator } from '@/utils/passwordValidator';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de réinitialisation manquant ou invalide');
    }
  }, [token]);

  const validatePassword = (password: string): string | undefined => {
    const result = PasswordValidator.validate(password);
    if (!result.isValid && result.errors.length > 0) {
      return result.errors[0]; // Return first error
    }
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword.trim()) {
      return 'Veuillez confirmer votre mot de passe';
    }
    if (confirmPassword !== password) {
      return 'Les mots de passe ne correspondent pas';
    }
    return undefined;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError('');
    
    const passwordError = validatePassword(value);
    setFieldErrors(prev => ({
      ...prev,
      password: passwordError
    }));

    // Also revalidate confirm password if it has been entered
    if (confirmPassword) {
      const confirmError = validateConfirmPassword(confirmPassword, value);
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setError('');
    
    const confirmError = validateConfirmPassword(value, password);
    setFieldErrors(prev => ({
      ...prev,
      confirmPassword: confirmError
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }
    
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);
    
    const validationErrors = {
      password: passwordError,
      confirmPassword: confirmPasswordError
    };
    
    setFieldErrors(validationErrors);
    
    if (passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await PasswordService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réinitialisation';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Mot de passe réinitialisé !
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                
                <Button
                  onClick={() => navigate('/connexion')}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                >
                  Se connecter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Lien invalide
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
                </p>
                
                <div className="space-y-4">
                  <Link
                    to="/mot-de-passe-oublie"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                  >
                    Demander un nouveau lien
                  </Link>
                  
                  <Link
                    to="/connexion"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Nouveau mot de passe
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Choisissez un nouveau mot de passe sécurisé
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    fieldErrors?.password ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full pl-11 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      fieldErrors?.password
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500 pr-20'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-transparent pr-11'
                    }`}
                    placeholder="Votre nouveau mot de passe"
                    autoComplete="new-password"
                  />
                  {fieldErrors?.password && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {fieldErrors?.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    fieldErrors?.confirmPassword ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className={`w-full pl-11 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      fieldErrors?.confirmPassword
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500 pr-20'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-transparent pr-11'
                    }`}
                    placeholder="Confirmez votre mot de passe"
                    autoComplete="new-password"
                  />
                  {fieldErrors?.confirmPassword && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {fieldErrors?.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <ErrorAlert error={error} className="rounded-xl" />

              <Button
                type="submit"
                disabled={
                  isLoading || 
                  !password || 
                  !confirmPassword || 
                  (!token && !manualToken) ||
                  !!fieldErrors.token ||
                  !!fieldErrors.password || 
                  !!fieldErrors.confirmPassword
                }
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Réinitialisation...
                  </div>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <Link
                to="/connexion"
                className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}