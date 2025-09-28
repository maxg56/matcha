interface ProfileInterestsProps {
  interests?: string[];
  maxVisible?: number;
}

export function ProfileInterests({ interests }: ProfileInterestsProps) {
  if (!interests || interests.length === 0) {
    return null;
  }

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Centres d'intérêt</h4>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest, index) => (
          <span
            key={index}
            className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-medium"
          >
            {interest}
          </span>
        ))}
      </div>
    </div>
  );
}