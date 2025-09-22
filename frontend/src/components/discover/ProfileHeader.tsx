interface ProfileHeaderProps {
  name: string;
  age: number;
  isOnline?: boolean;
}

export function ProfileHeader({ name, age, isOnline = true }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {name}, {age}
      </h2>
      {isOnline && (
        <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg" />
      )}
    </div>
  );
}