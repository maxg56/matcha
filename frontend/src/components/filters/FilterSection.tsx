import { cn } from '@/lib/utils';

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  sectionKey: string;
  activeSection: string | null;
  onToggleSection: (sectionKey: string) => void;
}

export function FilterSection({ 
  title, 
  icon, 
  children, 
  sectionKey, 
  activeSection, 
  onToggleSection 
}: FilterSectionProps) {
  return (
    <div className="mb-6">
      <button
        onClick={() => onToggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        <div className={cn(
          "transition-transform duration-200",
          activeSection === sectionKey ? "rotate-180" : "rotate-0"
        )}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {activeSection === sectionKey && (
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}