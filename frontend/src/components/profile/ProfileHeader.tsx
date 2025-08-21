import { Button } from '@/components/ui/button';
import { Settings, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfileHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mx-4 mt-4 rounded-t-2xl shadow-lg">
      <h2 className="text-lg font-semibold text-foreground">Mon Profil</h2>
      <div className="flex gap-2 pr-12">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-gray-200 dark:border-gray-600"
          onClick={() => navigate('/app/edit-profile')}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => navigate('/app/settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}