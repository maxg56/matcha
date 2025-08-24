import { Button } from '@/components/ui/button';
import { X, RotateCcw, Check } from 'lucide-react';

interface FilterHeaderProps {
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
}

export function FilterHeader({ onClose, onReset, onApply }: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Filtres</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={onReset} 
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button 
          onClick={onApply} 
          className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg"
        >
          <Check className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}