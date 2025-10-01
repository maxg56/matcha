import { LastSeenIndicator, OnlineStatus } from '@/components/ui/LastSeenIndicator';

interface ProfileHeaderProps {
  name: string;
  age: number;
  lastSeen?: string;
  showDetailedStatus?: boolean;
}

export function ProfileHeader({ name, age, lastSeen, showDetailedStatus = false }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-2 mb-3">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {name}, {age}
        </h2>
        <OnlineStatus lastSeen={lastSeen} size="md" />
      </div>

      {showDetailedStatus && (
        <LastSeenIndicator
          lastSeen={lastSeen}
          showIcon={false}
          size="sm"
          className="text-gray-600 dark:text-gray-400"
        />
      )}
    </div>
  );
}