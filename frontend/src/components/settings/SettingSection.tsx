interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-3 px-4">{title}</h2>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}
