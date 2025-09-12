import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorAlert } from '@/components/ui/error-alert';
import { PasswordService } from '@/services/passwordService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Veuillez saisir votre adresse email';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return 'Format d\'email invalide';
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await PasswordService.requestPasswordReset(email);
      setIsSuccess(true);
      setMessage(response.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'email';
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
                  Email envoyé !
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {message}
                </p>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                  Si vous ne recevez pas d'email dans quelques minutes, vérifiez votre dossier spam.
                </p>
                
                <div className="space-y-4">
                  <Link
                    to="/connexion"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la connexion
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                      setMessage('');
                    }}
                    className="w-full px-4 py-3 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                  >
                    Renvoyer l'email
                  </button>
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
                Mot de passe oublié ?
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Saisissez votre adresse email pour recevoir un lien de réinitialisation
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="w-full pl-11 py-3 border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent border-gray-300 dark:border-gray-600 transition-all duration-200"
                    placeholder="votre.email@exemple.com"
                    autoComplete="email"
                  />
                  {error && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              <ErrorAlert error={error} className="rounded-xl" />

              <Button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </div>
                ) : (
                  'Envoyer le lien'
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