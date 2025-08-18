import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Plus, Trash2, Star } from 'lucide-react';

interface PhotoManagerProps {
  avatar: string;
  photos: string[];
  username: string;
  onAddPhoto: (photo: string) => void;
  onRemovePhoto: (index: number) => void;
  onSetAvatar: (avatar: string) => void;
}

export function PhotoManager({
  avatar,
  photos,
  username,
  onAddPhoto,
  onRemovePhoto,
  onSetAvatar,
}: PhotoManagerProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Handle actual file upload
      const mockUrl = URL.createObjectURL(file);
      onAddPhoto(mockUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={avatar} alt={username} />
          <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            {username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Photo de profil</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cette photo sera votre image principale
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload">
            <Button size="sm" className="mt-2" asChild>
              <span className="cursor-pointer">
                <Camera className="h-4 w-4 mr-2" />
                Changer
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Additional Photos */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Photos additionnelles ({photos.length}/8)
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  onClick={() => onSetAvatar(photo)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white p-1"
                >
                  <Star className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onRemovePhoto(index)}
                  className="bg-red-500 hover:bg-red-600 text-white p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {/* Add Photo Button */}
          {photos.length < 8 && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload">
                <div className="w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
