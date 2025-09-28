import { type ReactNode } from 'react';

interface DetailSectionProps {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export function DetailSection({ title, icon: Icon, children, columns = 2 }: DetailSectionProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </h3>
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {children}
      </div>
    </section>
  );
}