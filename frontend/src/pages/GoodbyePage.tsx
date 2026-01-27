import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoodbyePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers la page d'accueil après 5 secondes
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <img 
              src="/MatchaLogo.png" 
              alt="Matcha" 
              className="w-20 h-20 mx-auto mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Au revoir ! 👋
            </h1>
          </div>
          
          <div className="space-y-4 text-gray-600">
            <p>
              Votre compte Matcha a été supprimé avec succès.
            </p>
            <p>
              Nous sommes désolés de vous voir partir. Si vous changez d'avis, 
              vous pourrez toujours créer un nouveau compte.
            </p>
            <p className="text-sm text-gray-500">
              Vous allez être redirigé automatiquement dans quelques secondes...
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
