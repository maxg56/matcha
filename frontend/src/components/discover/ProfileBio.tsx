interface ProfileBioProps {
  bio?: string;
}

export function ProfileBio({ bio }: ProfileBioProps) {
  if (!bio) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
        {bio}
      </p>
    </div>
  );
}