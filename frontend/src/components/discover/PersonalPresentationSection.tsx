import { MessageSquare } from 'lucide-react';

interface PersonalPresentationSectionProps {
  bio?: string;
  personalOpinion?: string;
}

export function PersonalPresentationSection({ bio, personalOpinion }: PersonalPresentationSectionProps) {
  if (!bio && !personalOpinion) {
    return null;
  }

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Présentation
      </h3>
      <div className="space-y-4">
        {bio && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</h4>
            <p className="text-gray-900 dark:text-white">{bio}</p>
          </div>
        )}
        {personalOpinion && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opinion personnelle</h4>
            <p className="text-gray-900 dark:text-white">{personalOpinion}</p>
          </div>
        )}
      </div>
    </section>
  );
}