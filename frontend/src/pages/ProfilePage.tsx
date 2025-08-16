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
  Camera,
  Heart,
  Eye,
  MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockUser = {
  id: '1',
  name: 'Alex',
  age: 26,
  images: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
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
    <ResponsiveLayout
      title="Mon Profil"
      showNavigation={true}
      maxWidth="lg"
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Header with settings */}
        <div className="flex justify-between items-center p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold text-foreground">Mon Profil</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => navigate('/edit-profile')}
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* Profile images */}
          <div className="relative mx-auto max-w-sm md:max-w-md">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-muted">
              <img
                src={mockUser.images[activeImageIndex]}
                alt={mockUser.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image indicators */}
              {mockUser.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {mockUser.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === activeImageIndex 
                          ? 'bg-white' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              {/* Add photo button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => navigate('/edit-profile')}
              >
                <Camera className="h-5 w-5" />
              </Button>
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
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <h3 className="font-semibold text-foreground mb-4 text-center">
                Statistiques
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 mx-auto mb-2">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{mockUser.stats.matches}</div>
                  <div className="text-xs text-muted-foreground">Matches</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-2">
                    <Heart className="h-6 w-6 text-red-600 fill-current" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{mockUser.stats.likes}</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mx-auto mb-2">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{mockUser.stats.views}</div>
                  <div className="text-xs text-muted-foreground">Vues</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1 gap-2" 
                onClick={() => navigate('/edit-profile')}
              >
                <Edit3 className="h-4 w-4" />
                Modifier mon profil
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => navigate('/discover')}
              >
                <Heart className="h-4 w-4" />
                Découvrir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}