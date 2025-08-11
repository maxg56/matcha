# Résolution des erreurs Pre-commit

## Erreurs détectées et solutions

### 1. Erreurs Python (flake8)

**Fichier :** `api/match-service/src/main.py`
```python
# ERREUR: F401 'flask.request' imported but unused
# SOLUTION: Supprimer l'import inutilisé
from flask import Flask  # au lieu de: from flask import Flask, request
```

**Fichier :** `api/media-service/src/main.py`
```python
# ERREUR: F401 imports inutilisés + E501 ligne trop longue
# SOLUTION:
# 1. Supprimer les imports inutiles
# 2. Raccourcir les lignes > 79 caractères
```

### 2. Erreur Frontend (ESLint)

**Fichier :** `frontend/src/components/ui/button.tsx`
```typescript
// ERREUR: Fast refresh only works when a file only exports components
// SOLUTION: Séparer les constantes des composants

// AVANT (dans button.tsx):
export const buttonVariants = cva(...)
export const Button = React.forwardRef(...)

// APRÈS: Créer un fichier séparé pour les constantes
// button-variants.ts:
export const buttonVariants = cva(...)

// button.tsx:
import { buttonVariants } from './button-variants'
export const Button = React.forwardRef(...)
```

## Commandes pour corriger

```bash
# 1. Corriger manuellement les erreurs Python dans les fichiers mentionnés

# 2. Réexécuter pre-commit pour vérifier
export PATH="$HOME/.local/bin:$PATH"
pre-commit run --all-files

# 3. Si tout est correct, faire un commit
git add .
git commit -m "fix: corrections pre-commit hooks"
```

## Test rapide

Pour tester un hook spécifique :
```bash
# Tester seulement black
pre-commit run black

# Tester seulement flake8
pre-commit run flake8

# Tester seulement ESLint
pre-commit run ts-lint
```
