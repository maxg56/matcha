import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface ProfileDetailsHeaderProps {
  firstName?: string;
  lastName?: string;
  username?: string;
  profileId: string;
  onClose: () => void;
  onReport?: (id: string) => void;
}

export function ProfileDetailsHeader({
  firstName,
  lastName,
  username,
  profileId,
  onClose,
  onReport
}: ProfileDetailsHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profil détaillé</h2>
        {(firstName || username) && (
          <p className="text-gray-600 dark:text-gray-400">
            {firstName} {lastName && `${lastName}`} {username && `(@${username})`}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {onReport && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReport(profileId)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Shield className="h-4 w-4 mr-1" />
            Signaler
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}