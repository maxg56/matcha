import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface ProfileDetailsProps {
  bio: string;
  interests: string[];
  profileId: string;
  isOpen: boolean;
  onClose: () => void;
  onReport?: (id: string) => void;
}

export function ProfileDetails({
  bio,
  interests,
  profileId,
  isOpen,
  onClose,
  onReport
}: ProfileDetailsProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-end z-50">
      <div className="w-full bg-white dark:bg-gray-800 rounded-t-3xl p-6 max-h-[70%] overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">À propos</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {bio}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="secondary"
                  className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bouton Signaler dans la bio */}
          {onReport && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => onReport(profileId)}
              >
                <Shield className="h-4 w-4" />
                Signaler ce profil
              </Button>
            </div>
          )}

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}