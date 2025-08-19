import { useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Edit3, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Heart,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockUser = {
  id: '1',
  name: 'Alex',
  age: 26,
  images: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop',
  ],
  photos: [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      description: 'Photo de profil principale - sourire authentique lors d\'une journée ensoleillée'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
      description: 'En randonnée dans les montagnes - l\'une de mes passions favorites'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop',
      description: 'Moment décontracté entre amis lors d\'un weekend'
    }
  ],
  bio: 'Développeur passionné par les nouvelles technologies. J\'adore voyager, faire de la randonnée et découvrir de nouveaux restaurants. À la recherche de quelqu\'un avec qui partager des aventures ! 🚀',
  location: 'Paris, France',
  occupation: 'Développeur Full-Stack',
  education: 'Master en Informatique',
  interests: ['Technologie', 'Voyage', 'Randonnée', 'Cuisine', 'Photographie', 'Musique'],
  stats: {
    matches: 24,
    likes: 156,
    views: 1240,
  },
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ResponsiveLayout
        maxWidth="lg"
      >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header with settings */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mx-4 mt-4 rounded-t-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-foreground">Mon Profil</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-gray-200 dark:border-gray-600"
              onClick={() => navigate('/app/edit-profile')}
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => navigate('/app/settings')}
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-6 bg-white dark:bg-gray-800 mx-4 mb-4 rounded-b-2xl shadow-lg">
          <div className="p-4">
            {/* Profile images */}
            <div className="relative mx-auto max-w-sm md:max-w-md lg:max-w-lg">
              <div 
                className="aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-700 cursor-pointer group shadow-lg border border-gray-200 dark:border-gray-600"
              >
              <img
                src={mockUser.images[activeImageIndex]}
                alt={mockUser.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Image indicators */}
              {mockUser.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {mockUser.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(index);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === activeImageIndex 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
              
            </div>
          </div>

          {/* Profile info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {mockUser.name}, {mockUser.age}
              </h1>
              
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{mockUser.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm">{mockUser.occupation}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-sm">{mockUser.education}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">À propos de moi</h3>
              <p className="text-muted-foreground leading-relaxed">
                {mockUser.bio}
              </p>
            </div>

            {/* Interests */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Centres d'intérêt</h3>
              <div className="flex flex-wrap gap-2">
                {mockUser.interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="bg-gray-100 dark:bg-gray-700 text-foreground border-gray-200 dark:border-gray-600 shadow-lg"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 border border-gray-200 dark:border-gray-600 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4 text-center">
                Statistiques
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 mx-auto mb-2 shadow-lg">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{mockUser.stats.matches}</div>
                  <div className="text-xs text-muted-foreground">Matches</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 mx-auto mb-2 shadow-lg">
                    <Heart className="h-6 w-6 text-white fill-current" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{mockUser.stats.likes}</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 mx-auto mb-2 shadow-lg">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{mockUser.stats.views}</div>
                  <div className="text-xs text-muted-foreground">Vues</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      </ResponsiveLayout>
    </div>
  );
}