import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface EmailSentViewProps {
  message: string;
  onNavigateToLogin: () => void;
  onResendEmail: () => void;
}

export function EmailSentView({
  message,
  onNavigateToLogin,
  onResendEmail,
}: EmailSentViewProps) {
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
                <button
                  onClick={onNavigateToLogin}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </button>

                <button
                  onClick={onResendEmail}
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