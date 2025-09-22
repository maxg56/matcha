import { PasswordValidator, PasswordValidationResult } from '@/utils/passwordValidator';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  showDetailedFeedback?: boolean;
  className?: string;
}

export function PasswordStrength({ 
  password, 
  showDetailedFeedback = false,
  className 
}: PasswordStrengthProps) {
  if (!password) return null;

  const validation = PasswordValidator.validate(password);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Barre de progression de la force */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Force du mot de passe
          </span>
          <span className={cn(
            "text-xs font-medium capitalize",
            {
              'text-red-600': validation.strength === 'weak',
              'text-orange-600': validation.strength === 'medium',
              'text-green-600': validation.strength === 'strong',
            }
          )}>
            {validation.strength === 'weak' && 'Faible'}
            {validation.strength === 'medium' && 'Moyenne'}
            {validation.strength === 'strong' && 'Forte'}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300 progress-width",
              {
                'bg-red-500': validation.strength === 'weak',
                'bg-orange-500': validation.strength === 'medium',
                'bg-green-500': validation.strength === 'strong',
              }
            )}
            style={{"--width": `${validation.score}%`} as React.CSSProperties}
          />
        </div>
      </div>

      {/* Feedback détaillé */}
      {showDetailedFeedback && (
        <div className="space-y-2">
          {/* Erreurs */}
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <X className="h-3 w-3 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Exigences satisfaites */}
          <div className="grid grid-cols-1 gap-1 text-xs">
            <PasswordRequirement 
              met={password.length >= 8}
              text="Au moins 8 caractères"
            />
            <PasswordRequirement 
              met={/[A-Z]/.test(password)}
              text="Au moins une majuscule"
            />
            <PasswordRequirement 
              met={/[a-z]/.test(password)}
              text="Au moins une minuscule"
            />
            <PasswordRequirement 
              met={/\d/.test(password)}
              text="Au moins un chiffre"
            />
            <PasswordRequirement 
              met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)}
              text="Au moins un caractère spécial"
            />
          </div>

          {/* Suggestions */}
          {validation.score < 80 && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Suggestions pour améliorer votre mot de passe :
                </span>
              </div>
              <div className="space-y-1">
                {PasswordValidator.getPasswordSuggestions(password).map((suggestion, index) => (
                  <div key={index} className="text-xs text-blue-600 dark:text-blue-400 ml-5">
                    • {suggestion}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

function PasswordRequirement({ met, text }: PasswordRequirementProps) {
  return (
    <div className={cn(
      "flex items-center gap-2",
      met ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500"
    )}>
      {met ? (
        <Check className="h-3 w-3 flex-shrink-0" />
      ) : (
        <X className="h-3 w-3 flex-shrink-0" />
      )}
      <span>{text}</span>
    </div>
  );
}