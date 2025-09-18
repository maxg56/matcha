interface ProfileInterestsProps {
  interests?: string[];
  maxVisible?: number;
}

export function ProfileInterests({ interests, maxVisible = 6 }: ProfileInterestsProps) {
  if (!interests || interests.length === 0) {
    return null;
  }

  const visibleInterests = interests.slice(0, maxVisible);
  const remainingCount = interests.length - maxVisible;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1">
        {visibleInterests.map((interest, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium"
          >
            {interest}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
            +{remainingCount}
          </span>
        )}
      </div>
    </div>
  );
}