# Documentation - Workflow GitHub Actions : Lint & Format Checks

## Vue d'ensemble

Ce workflow GitHub Actions (`lint.yml`) automatise les vérifications de qualité de code pour tous les composants du projet Matcha. Il s'exécute sur les branches `main`  lors des push et pull requests.

## Structure du projet supportée

Le workflow est conçu pour une architecture microservices avec :
- **Frontend** : TypeScript/React avec Vite et pnpm
- **Services Go** : Multiples services dans `api/*/`
- **Services Python** : Multiples services dans `api/*/`

## Jobs du workflow

### 1. `lint-go` - Vérification du code Go

**Outils utilisés :**
- `go fmt` : Formatage automatique
- `go vet` : Analyse statique
- `golangci-lint` : Linter avancé

**Fonctionnement :**
```bash
# Pour chaque service Go dans api/*/
for dir in api/*/; do
  if [ -f "$dir/go.mod" ]; then
    cd "$dir"
    go fmt ./...      # Vérification du formatage
    go vet ./...      # Analyse statique
    golangci-lint run # Linting avancé
  fi
done
```

**Services concernés :**
- `api/auth-service/`
- `api/chat-service/`
- `api/gateway/`
- `api/user-service/`

### 2. `lint-ts` - Vérification du code TypeScript

**Configuration :**
- Node.js version 20
- pnpm version 10.14.0
- ESLint pour le linting

**Étapes :**
1. Installation de pnpm
2. Installation des dépendances (`pnpm install`)
3. Exécution d'ESLint (`pnpm run lint`)

**Répertoire concerné :**
- `frontend/`

### 3. `lint-py` - Vérification du code Python

**Outils utilisés :**
- `black` : Formatage automatique
- `isort` : Tri des imports
- `flake8` : Linting et vérification de style

**Fonctionnement :**
```bash
# Installation des dépendances pour chaque service
for dir in api/*/; do
  if [ -f "$dir/requirements.txt" ]; then
    pip install -r "$dir/requirements.txt"
  fi
done

# Vérifications pour chaque service Python
for dir in api/*/; do
  if [ -f "$dir/requirements.txt" ] && [ -d "$dir/src" ]; then
    black --check "$dir/src"        # Vérification formatage
    isort --check-only "$dir/src"   # Vérification tri imports
    flake8 "$dir/src"               # Linting
  fi
done
```

**Services concernés :**
- `api/match-service/`
- `api/media-service/`
- `api/notify-service/`

## Configuration requise

### Frontend (`package.json`)
```json
{
  "scripts": {
    "lint": "eslint ."
  },
  "packageManager": "pnpm@10.14.0"
}
```

### Services Go
Chaque service doit avoir :
- Un fichier `go.mod` à la racine du service
- Configuration `golangci-lint` (optionnelle)

### Services Python
Chaque service doit avoir :
- Un fichier `requirements.txt`
- Un dossier `src/` contenant le code source

## Déclenchement

Le workflow se déclenche sur :
- **Push** vers les branches `main`
- **Pull Request** vers les branches `main`

## Gestion des erreurs

Si une vérification échoue :
1. Le job correspondant s'arrête avec un code d'erreur
2. Les autres jobs continuent leur exécution
3. Le workflow global est marqué comme "failed"

## Exemple d'usage

### Pour corriger les erreurs Go :
```bash
# Formatage automatique
go fmt ./...

# Correction manuelle des erreurs de go vet et golangci-lint
```

### Pour corriger les erreurs TypeScript :
```bash
cd frontend
pnpm run lint --fix  # Si un script fix existe
```

### Pour corriger les erreurs Python :
```bash
# Formatage automatique
black src/
isort src/

# Correction manuelle des erreurs flake8
```

## Avantages

1. **Automatisation** : Vérifications automatiques sur chaque modification
2. **Consistance** : Standards de code uniformes sur tout le projet
3. **Détection précoce** : Identification des problèmes avant merge
4. **Multi-langage** : Support de Go, TypeScript et Python
5. **Microservices** : Adaptation à l'architecture distribuée

## Maintenance

Pour mettre à jour le workflow :
1. Modifier les versions des outils dans `.github/workflows/lint.yml`
2. Adapter les chemins si la structure change
3. Tester sur une branche de développement

## Dépendances externes

- GitHub Actions marketplace
- golangci/golangci-lint-action@v6
- actions/checkout@v4
- actions/setup-go@v5
- actions/setup-node@v4
- pnpm/action-setup@v4
- actions/setup-python@v5
