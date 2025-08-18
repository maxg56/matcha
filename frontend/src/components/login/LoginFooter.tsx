export function LoginFooter() {
  return (
    <div className="text-center mt-8">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        En vous connectant, vous acceptez nos{' '}
        <button className="text-purple-600 dark:text-purple-400 hover:underline">
          Conditions d'utilisation
        </button>{' '}
        et notre{' '}
        <button className="text-purple-600 dark:text-purple-400 hover:underline">
          Politique de confidentialité
        </button>
      </p>
    </div>
  );
}
