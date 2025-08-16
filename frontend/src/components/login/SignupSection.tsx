import { Button } from '@/components/ui/button';

interface SignupSectionProps {
  onNavigateToSignup: () => void;
}

export function SignupSection({ onNavigateToSignup }: SignupSectionProps) {
  return (
    <>
      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
        <span className="px-4 text-sm text-gray-500 dark:text-gray-400">ou</span>
        <div className="flex-1 border-t border-gray-200 dark:border-gray-600"></div>
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          Vous n'avez pas encore de compte ?
        </p>
        <Button
          variant="outline"
          onClick={onNavigateToSignup}
          className="w-full py-3 border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-semibold rounded-xl transition-colors"
        >
          Créer un compte
        </Button>
      </div>
    </>
  );
}
