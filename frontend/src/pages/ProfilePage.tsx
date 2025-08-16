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
  LogOut
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(mockUser);

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
              variant={isEditing ? "default" : "outline"} 
              size="sm" 
              className="gap-2"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4" />
              {isEditing ? "Sauvegarder" : "Modifier"}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
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
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.location}
                      onChange={(e) => setEditedUser({...editedUser, location: e.target.value})}
                      className="text-sm flex-1 bg-transparent border-b border-border focus:border-primary outline-none"
                      placeholder="Votre localisation"
                    />
                  ) : (
                    <span className="text-sm">{editedUser.location}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.occupation}
                      onChange={(e) => setEditedUser({...editedUser, occupation: e.target.value})}
                      className="text-sm flex-1 bg-transparent border-b border-border focus:border-primary outline-none"
                      placeholder="Votre profession"
                    />
                  ) : (
                    <span className="text-sm">{editedUser.occupation}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.education}
                      onChange={(e) => setEditedUser({...editedUser, education: e.target.value})}
                      className="text-sm flex-1 bg-transparent border-b border-border focus:border-primary outline-none"
                      placeholder="Votre formation"
                    />
                  ) : (
                    <span className="text-sm">{editedUser.education}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">À propos de moi</h3>
              {isEditing ? (
                <textarea
                  value={editedUser.bio}
                  onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none"
                  rows={4}
                  placeholder="Parlez-nous de vous..."
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {editedUser.bio}
                </p>
              )}
            </div>

            {/* Interests */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Centres d'intérêt</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.interests.join(', ')}
                  onChange={(e) => setEditedUser({
                    ...editedUser, 
                    interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  })}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Vos centres d'intérêt séparés par des virgules"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {editedUser.interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <h3 className="font-semibold text-foreground mb-4 text-center">
                Mes statistiques
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {mockUser.stats.matches}
                  </div>
                  <div className="text-sm text-muted-foreground">Matches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {mockUser.stats.likes}
                  </div>
                  <div className="text-sm text-muted-foreground">Likes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {mockUser.stats.views}
                  </div>
                  <div className="text-sm text-muted-foreground">Vues</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
                Paramètres
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}