import { Star } from 'lucide-react';

interface InterestsSectionProps {
  interests?: string[];
}

export function InterestsSection({ interests }: InterestsSectionProps) {
  if (!interests || interests.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Star className="h-5 w-5" />
        Centres d'intérêt
      </h3>
      <div className="flex flex-wrap gap-2">
        {interests.map((interest, index) => (
          <span
            key={index}
            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
          >
            {interest}
          </span>
        ))}
      </div>
    </section>
  );
}