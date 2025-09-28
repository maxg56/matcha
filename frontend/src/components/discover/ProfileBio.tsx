interface ProfileBioProps {
  bio?: string;
}

export function ProfileBio({ bio }: ProfileBioProps) {
  if (!bio) {
    return null;
  }

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        À propos
      </h4>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
        {bio}
      </p>
    </div>
  );
}