import { useState } from 'react';
import { Heart, Clock, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileModal } from '@/components/demo/ProfileModal';

export function LikesTab() {
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Données simulées de likes reçus
  const mockLikes = [
    {
      id: 1,
      user: {
        id: 101,
        first_name: "Emma",
        age: 25,
        current_city: "Paris",
        job: "Designer",
        bio: "Passionnée d'art et de voyages ✈️ J'adore découvrir de nouveaux endroits et créer des designs qui inspirent. Mon métier me permet d'exprimer ma créativité tout en voyageant autour du monde.",
        tags: ["Art", "Voyage", "Design"],
        images: [
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
          "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400"
        ]
      },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      user: {
        id: 102,
        first_name: "Sophie",
        age: 28,
        current_city: "Lyon",
        job: "Développeuse",
        bio: "Geek assumée 💻 Amoureuse du code et des nouvelles technologies. Quand je ne programme pas, je joue aux jeux vidéo ou regarde des films de science-fiction.",
        tags: ["Tech", "Gaming", "Cinéma"],
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          "https://images.unsplash.com/photo-1494790108755-2616b332c42c?w=400"
        ]
      },
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
  ];

  const handleViewProfile = (like: any) => {
    setSelectedProfile({
      id: like.user.id.toString(),
      name: like.user.first_name,
      age: like.user.age,
      images: like.user.images || [],
      bio: like.user.bio,
      location: like.user.current_city,
      occupation: like.user.job,
      interests: like.user.tags || []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  const handleLike = (profileId: string) => {
    console.log('Liked profile:', profileId);
    // Ici vous pouvez ajouter la logique pour liker en retour
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Likes reçus
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Les profils qui vous ont likés
          </p>
        </div>
        <Badge className="bg-pink-100 text-pink-600">
          {mockLikes.length} likes
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockLikes.map((like) => (
          <div key={like.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-shadow">
            <div className="flex items-center p-4 space-x-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {like.user.first_name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {like.user.first_name}, {like.user.age}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(like.created_at)}</span>
                </div>
              </div>
              
              <div className="bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                <Heart className="h-4 w-4 fill-current" />
                Like
              </div>
            </div>

            <div className="px-4 pb-4 space-y-2">
              {like.user.current_city && (
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{like.user.current_city}</span>
                </div>
              )}
              
              {like.user.job && (
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>{like.user.job}</span>
                </div>
              )}

              <p className="text-gray-700 text-sm">{like.user.bio}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {like.user.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewProfile(like)}
                >
                  Voir profil
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                  onClick={() => handleLike(like.user.id.toString())}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Liker
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal du profil */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onLike={handleLike}
        />
      )}
    </div>
  );
}
