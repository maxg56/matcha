import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessViewProps {
  onNavigateToLogin: () => void;
}

export function SuccessView({ onNavigateToLogin }: SuccessViewProps) {
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
                onClick={onNavigateToLogin}
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