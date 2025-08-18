import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle
} from 'lucide-react';

interface LoginFormProps {
  formData: {
    login: string;
    password: string;
  };
  showPassword: boolean;
  isLoading: boolean;
  error: string;
  isFormValid: boolean;
  isEmail: (str: string) => boolean;
  onInputChange: (field: 'login' | 'password', value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onTogglePassword: () => void;
}

export function LoginForm({
  formData,
  showPassword,
  isLoading,
  error,
  isFormValid,
  isEmail,
  onInputChange,
  onSubmit,
  onForgotPassword,
  onTogglePassword,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Login Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pseudo ou Email
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {isEmail(formData.login) ? (
              <Mail className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <input
            type="text"
            value={formData.login}
            onChange={(e) => onInputChange('login', e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            placeholder="votre.email@exemple.com ou @pseudo"
            autoComplete="username"
          />
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Lock className="h-5 w-5" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => onInputChange('password', e.target.value)}
            className="w-full pl-11 pr-11 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            placeholder="Votre mot de passe"
            autoComplete="current-password"
          />
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Forgot Password */}
      <div className="text-right">
        <button
          type="button"
          className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
          onClick={onForgotPassword}
        >
          Mot de passe oublié ?
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Connexion...
          </div>
        ) : (
          'Se connecter'
        )}
      </Button>
    </form>
  );
}
