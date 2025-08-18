import { Heart } from 'lucide-react';

export function LoginHeader() {
  return (
    <div className="flex items-center justify-center pt-8 pb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Heart className="h-7 w-7 text-white fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Matcha</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Trouvez l'amour</p>
        </div>
      </div>
    </div>
  );
}
