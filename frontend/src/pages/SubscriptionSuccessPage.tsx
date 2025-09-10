import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Crown, Sparkles } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // You might want to verify the payment status here
    // and update the user's subscription status
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <Crown className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Paiement réussi !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <Sparkles className="w-5 h-5" />
              <p className="font-medium">Bienvenue dans Matcha Premium !</p>
              <Sparkles className="w-5 h-5" />
            </div>
            
            <p className="text-muted-foreground">
              Votre abonnement a été activé avec succès. Vous avez maintenant accès à toutes les fonctionnalités premium.
            </p>
            
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 text-sm">
              <h4 className="font-medium text-gray-800 mb-2">Nouvelles fonctionnalités débloquées :</h4>
              <ul className="text-left space-y-1 text-gray-600">
                <li>✨ Likes illimités</li>
                <li>💫 Super Likes quotidiens</li>
                <li>👻 Mode invisible</li>
                <li>🔥 Boost mensuel gratuit</li>
                <li>👑 Badge Premium</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={() => navigate('/app/discover')}
                className="w-full"
              >
                Commencer à explorer
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/app/subscription')}
                className="w-full"
              >
                Gérer mon abonnement
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Un reçu de votre achat vous sera envoyé par email sous peu.
          </p>
        </div>
      </div>
    </div>
  );
}