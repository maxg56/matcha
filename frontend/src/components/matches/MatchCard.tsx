import { type Match } from '@/services/matchService';

interface MatchCardProps {
  match: Match;
  onUnmatch?: (matchId: number) => void;
  onMessage?: (userId: number) => void;
}

export function MatchCard({ match, onUnmatch, onMessage }: MatchCardProps) {
  const user = match.target_user || match.user;

  if (!user) return null;

  const getInitials = () => {
    const firstName = user.first_name && user.first_name.length > 0 ? user.first_name : 'U';
    return firstName.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-4">
        {user.profile_photos && user.profile_photos.length > 0 ? (
          <img
            src={user.profile_photos[0]}
            alt={user.first_name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
              {getInitials()}
            </span>
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user.first_name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {user.age} ans
          </p>
          {user.bio && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          {onMessage && (
            <button
              onClick={() => onMessage(user.id)}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              Message
            </button>
          )}
          {onUnmatch && (
            <button
              onClick={() => onUnmatch(match.id)}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Unmatch
            </button>
          )}
        </div>
      </div>
    </div>
  );
}