import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  error?: string;
  className?: string;
  onDismiss?: () => void;
  variant?: 'default' | 'destructive';
}

export function ErrorAlert({ 
  error, 
  className, 
  onDismiss,
  variant = 'destructive'
}: ErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert 
      variant={variant} 
      className={cn("relative", className)}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="pr-8">
        {error}
      </AlertDescription>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Fermer l'alerte"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className={cn(
      "flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg",
      className
    )}>
      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    </div>
  );
}