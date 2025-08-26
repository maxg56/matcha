import { ErrorAlert, FieldError } from "./error-alert";
import type { FieldErrors } from "@/utils/errorHandler";

interface FormErrorsProps {
  /** Erreur globale du formulaire */
  globalError?: string;
  /** Erreurs spécifiques aux champs */
  fieldErrors?: FieldErrors;
  /** Champs à afficher les erreurs (si non spécifié, affiche toutes les erreurs) */
  fieldsToShow?: string[];
  /** Callback quand l'erreur globale est fermée */
  onDismissGlobal?: () => void;
  /** Classes CSS personnalisées */
  className?: string;
}

export function FormErrors({
  globalError,
  fieldErrors = {},
  fieldsToShow,
  onDismissGlobal,
  className = ""
}: FormErrorsProps) {
  // Détermine quelles erreurs de champ afficher
  const fieldsWithErrors = fieldsToShow 
    ? fieldsToShow.filter(field => fieldErrors[field])
    : Object.keys(fieldErrors).filter(field => fieldErrors[field]);

  const hasAnyErrors = globalError || fieldsWithErrors.length > 0;

  if (!hasAnyErrors) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Erreur globale */}
      {globalError && (
        <ErrorAlert 
          error={globalError} 
          onDismiss={onDismissGlobal}
          className="rounded-xl"
        />
      )}

      {/* Erreurs de champs groupées */}
      {fieldsWithErrors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Veuillez corriger les erreurs suivantes :
          </h4>
          {fieldsWithErrors.map(field => (
            <FieldError 
              key={field}
              error={`${getFieldLabel(field)} : ${fieldErrors[field]}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Utilitaire pour obtenir des libellés de champs plus lisibles
function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    // Champs de connexion
    login: 'Pseudo/Email',
    password: 'Mot de passe',
    
    // Champs d'inscription
    username: 'Pseudo',
    email: 'Email',
    firstName: 'Prénom',
    lastName: 'Nom',
    birthDate: 'Date de naissance',
    confirmPassword: 'Confirmation mot de passe',
    
    // Champs de profil
    bio: 'Biographie',
    currentCity: 'Ville actuelle',
    birthCity: 'Ville de naissance',
    height: 'Taille',
    job: 'Profession',
    
    // Autres
    images: 'Photos',
    tags: 'Centres d\'intérêt',
    emailVerificationCode: 'Code de vérification',
  };

  return labels[fieldName] || fieldName;
}

interface SingleFieldErrorProps {
  /** Nom du champ */
  fieldName: string;
  /** Erreurs du formulaire */
  fieldErrors?: FieldErrors;
  /** Classes CSS personnalisées */
  className?: string;
}

/**
 * Composant pour afficher l'erreur d'un champ spécifique
 * Utile pour les champs individuels dans les formulaires
 */
export function SingleFieldError({ fieldName, fieldErrors, className }: SingleFieldErrorProps) {
  return (
    <FieldError 
      error={fieldErrors?.[fieldName]} 
      className={className}
    />
  );
}