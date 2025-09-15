import { useState } from 'react';
import { MessageCircle, Camera } from 'lucide-react';
import { InfoCard } from './InfoCard';
import { lifestyleLabels } from './ProfileLabels';

interface ProfileBioProps {
  bio: string;
  user: any;
  photos: any[];
}

export function ProfileBio({ bio, user, photos }: ProfileBioProps) {
  const [showMore, setShowMore] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const isLongBio = bio.length > 150;

  return (
    <>
      <InfoCard title="À propos de moi" icon={<MessageCircle className="h-4 w-4" />}>
        <div className="text-muted-foreground leading-relaxed mb-2">
          <p className="whitespace-pre-wrap">
            {expanded || !isLongBio ? bio : `${bio.slice(0, 150)}...`}
          </p>
          {isLongBio && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary hover:text-primary/80 text-sm font-medium mt-2 block"
            >
              {expanded ? 'Voir moins' : 'Voir plus'}
            </button>
          )}
        </div>
      </InfoCard>

      {/* Modal détaillé */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowMore(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
            >
              ×
            </button>
            
            <h3 className="font-semibold text-foreground mb-4 text-xl">Profil complet</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">À propos de moi</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {bio}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2">Informations personnelles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>Ville de naissance: {user.birthCity}</div>
                  <div>Éducation: {lifestyleLabels.educationLevel[user.educationLevel as keyof typeof lifestyleLabels.educationLevel]}</div>
                  <div>Type de relation: {lifestyleLabels.relationshipType[user.relationshipType as keyof typeof lifestyleLabels.relationshipType]}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photos
                </h4>
                <div className="flex gap-2 overflow-x-auto">
                  {photos.map(photo => (
                    <div key={photo.id} className="flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                      <img src={photo.url} alt={photo.description} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}