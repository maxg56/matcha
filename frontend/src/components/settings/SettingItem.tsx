import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SettingItem({ icon, title, description, children, onClick, className }: SettingItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="text-muted-foreground">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
      {onClick && !children && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );
}