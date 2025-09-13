import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';

interface PasswordResetFormData {
  password: string;
  confirmPassword: string;
}

interface PasswordResetFormProps {
  formData: PasswordResetFormData;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  error: string;
  fieldErrors: {
    password?: string;
    confirmPassword?: string;
  };
  isFormValid: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

export function PasswordResetForm({
  formData,
  showPassword,
  showConfirmPassword,
  isLoading,
  error,
  fieldErrors,
  isFormValid,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onTogglePassword,
  onToggleConfirmPassword,
}: PasswordResetFormProps) {
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
            <form onSubmit={onSubmit} className="space-y-6">
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
                    value={formData.password}
                    onChange={(e) => onPasswordChange(e.target.value)}
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
                    onClick={onTogglePassword}
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
                    value={formData.confirmPassword}
                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
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
                    onClick={onToggleConfirmPassword}
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
                disabled={isLoading || !isFormValid}
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