import { Check, X } from 'lucide-react';

interface Feature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface FeaturesListProps {
  features: Feature[];
  className?: string;
}

export function FeaturesList({ features, className = '' }: FeaturesListProps) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {features.map((feature, index) => (
        <li
          key={index}
          className={`flex items-start gap-3 ${feature.highlight ? 'font-medium text-purple-600 dark:text-purple-400' : ''}`}
        >
          <div className={`flex-shrink-0 rounded-full p-1 ${
            feature.included
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
          }`}>
            {feature.included ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
          </div>
          <span className={`text-sm ${
            feature.included
              ? 'text-gray-700 dark:text-gray-300'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {feature.text}
          </span>
        </li>
      ))}
    </ul>
  );
}