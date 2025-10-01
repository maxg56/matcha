import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Search className="h-16 w-16 text-white" />
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>

          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Page introuvable
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            Vérifiez l'URL ou retournez à l'accueil pour continuer votre recherche.
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <Button
            onClick={handleGoHome}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
}