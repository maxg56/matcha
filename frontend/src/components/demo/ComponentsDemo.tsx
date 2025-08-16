import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { MatchCard } from '@/components/cards/MatchCard';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const demoProfile = {
  id: 'demo',
  name: 'Sophie',
  age: 25,
  images: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop'],
  bio: 'Designer passionnée par l\'art et les voyages ✨',
  location: 'Paris',
  occupation: 'UI/UX Designer',
  interests: ['Design', 'Art', 'Voyage', 'Photographie'],
  distance: 3,
};

const demoMatch = {
  id: 'demo-match',
  name: 'Emma',
  image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
  lastMessage: 'Design demo message 💜',
  timestamp: 'now',
  unread: true,
};

const demoMessage = {
  id: 'demo-msg',
  content: 'Voici un exemple de message dans notre design épuré ! 😊',
  timestamp: '14:30',
  isOwn: false,
  status: 'read' as const,
};

export default function ComponentsDemo() {
  const [messages, setMessages] = useState([demoMessage]);

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isOwn: true,
      status: 'sent' as const,
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <AppLayout title="Design Components Demo" showNavigation={false}>
      <div className="space-y-8 p-4 pb-24">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Matcha Design System
          </h1>
          <p className="text-muted-foreground">
            Design épuré avec thème violet et composants shadcn/ui
          </p>
        </div>

        {/* Color Palette */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Palette de couleurs</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">Primary</span>
              </div>
              <div className="h-12 bg-secondary rounded-xl flex items-center justify-center">
                <span className="text-secondary-foreground text-sm font-medium">Secondary</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-accent rounded-xl flex items-center justify-center">
                <span className="text-accent-foreground text-sm font-medium">Accent</span>
              </div>
              <div className="h-12 bg-muted rounded-xl flex items-center justify-center">
                <span className="text-muted-foreground text-sm font-medium">Muted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Boutons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge className="bg-primary/10 text-primary">Custom</Badge>
          </div>
        </div>

        {/* Profile Card */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Carte de Profil</h2>
          <div className="max-w-sm mx-auto">
            <ProfileCard 
              profile={demoProfile}
              onLike={() => console.log('Liked!')}
              onPass={() => console.log('Passed!')}
            />
          </div>
        </div>

        {/* Match Card */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Carte de Match</h2>
          <MatchCard 
            match={demoMatch}
            onClick={() => console.log('Chat opened!')}
          />
        </div>

        {/* Chat Components */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Composants de Chat</h2>
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="space-y-4 mb-4">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
            </div>
            <ChatInput
              onSendMessage={handleSendMessage}
              placeholder="Testez le chat..."
            />
          </div>
        </div>

        {/* Architecture Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Architecture en Couches</h2>
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">1. Layout Layer</h3>
              <p className="text-sm text-muted-foreground">
                AppLayout, TopBar, BottomNavigation - Structure générale
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">2. Components Layer</h3>
              <p className="text-sm text-muted-foreground">
                ProfileCard, MatchCard, ChatBubble - Composants métier
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">3. UI Layer</h3>
              <p className="text-sm text-muted-foreground">
                Button, Badge, Input - Composants shadcn/ui de base
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">4. Utils Layer</h3>
              <p className="text-sm text-muted-foreground">
                Tailwind CSS, cn(), design tokens - Utilitaires de style
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}