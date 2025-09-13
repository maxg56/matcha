import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, Star } from 'lucide-react';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  priceId: string;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  currentPlan?: string;
  onSelect: (priceId: string) => void;
  loading?: boolean;
}

export const SubscriptionCard = ({ 
  plan, 
  currentPlan, 
  onSelect, 
  loading = false 
}: SubscriptionCardProps) => {
  const isCurrentPlan = currentPlan === plan.id;
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: plan.currency,
  }).format(plan.price / 100);

  return (
    <Card className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            <Star className="w-3 h-3 mr-1" />
            Populaire
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {plan.name}
          {isCurrentPlan && (
            <Badge variant="secondary">Actuel</Badge>
          )}
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{formattedPrice}</span>
          <span className="text-muted-foreground">
            /{plan.interval === 'month' ? 'mois' : 'année'}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={() => onSelect(plan.priceId)}
          disabled={isCurrentPlan || loading}
          className="w-full"
          variant={plan.popular ? 'default' : 'outline'}
        >
          {isCurrentPlan ? 'Plan actuel' : 'Choisir ce plan'}
        </Button>
      </CardFooter>
    </Card>
  );
};