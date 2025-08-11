# Guide Pre-commit - Projet Matcha

## Installation

### 1. Installer pre-commit

```bash
# Via pip
pip install pre-commit

# Ou via homebrew (macOS)
brew install pre-commit

# Ou via apt (Ubuntu/Debian)
sudo apt install pre-commit
```

### 2. Installer les hooks dans le projet

```bash
cd /path/to/matcha
pre-commit install
```

### 3. (Optionnel) Exécuter sur tous les fichiers

```bash
pre-commit run --all-files
```

## Configuration

Le fichier `.pre-commit-config.yaml` est configuré pour :

### Python Services
- **black** : Formatage automatique du code
- **isort** : Tri des imports
- **flake8** : Linting et vérification de style
- **Cible** : Fichiers dans `api/*/src/*.py`

### Go Services
- **go fmt** : Formatage pour chaque service Go
- **go vet** : Analyse statique pour chaque service Go
- **Services concernés** :
  - `api/auth-service/`
  - `api/chat-service/`
  - `api/gateway/`
  - `api/user-service/`

### Frontend TypeScript/React
- **ESLint** : Linting JavaScript/TypeScript
- **Package manager** : pnpm
- **Cible** : Fichiers dans `frontend/` avec extensions `.ts`, `.tsx`, `.js`, `.jsx`

### Hooks génériques
- **trailing-whitespace** : Supprime les espaces en fin de ligne
- **end-of-file-fixer** : Assure une ligne vide en fin de fichier
- **check-yaml** : Valide la syntaxe YAML
- **check-added-large-files** : Détecte les gros fichiers
- **check-merge-conflict** : Détecte les conflits de merge

## Prérequis

### Pour les services Go
Chaque service Go doit avoir :
```bash
# Dans chaque dossier api/*/
go mod init
go mod tidy
```

### Pour le frontend
```bash
cd frontend
pnpm install
```

### Pour les services Python
```bash
# Installer les outils globalement ou dans un venv
pip install black isort flake8
```

## Utilisation

### Commit automatique
Les hooks s'exécutent automatiquement à chaque `git commit` :
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
# → Les hooks pre-commit s'exécutent automatiquement
```

### Exécution manuelle

```bash
# Tous les hooks sur les fichiers modifiés
pre-commit run

# Tous les hooks sur tous les fichiers
pre-commit run --all-files

# Hook spécifique
pre-commit run black
pre-commit run go-fmt-auth
pre-commit run ts-lint
```

### Bypass temporaire (à éviter)
```bash
git commit -m "fix: correction urgente" --no-verify
```

## Résolution des problèmes

### Erreur Python
```bash
# Si black/isort/flake8 ne sont pas trouvés
pip install black isort flake8

# Ou avec un environnement virtuel
python -m venv venv
source venv/bin/activate
pip install black isort flake8
```

### Erreur Go
```bash
# Aller dans le service concerné
cd api/auth-service
go fmt ./...
go vet ./...

# Vérifier que go.mod existe
ls -la go.mod
```

### Erreur Frontend
```bash
cd frontend
# Vérifier que pnpm est installé
pnpm --version

# Réinstaller les dépendances si nécessaire
pnpm install

# Tester le linting manuellement
pnpm run lint
```

## Intégration CI/CD

Pre-commit est complémentaire au workflow GitHub Actions :
- **Pre-commit** : Vérifications locales avant commit
- **GitHub Actions** : Vérifications sur le serveur lors des PR/push

## Configuration avancée

### Ignorer certains hooks pour des fichiers
```yaml
# Dans .pre-commit-config.yaml
- id: flake8
  exclude: ^api/legacy/.*\.py$
```

### Ajouter des arguments
```yaml
- id: black
  args: [--line-length=120]
```

### Mise à jour des versions
```bash
pre-commit autoupdate
```

## Avantages

1. **Détection précoce** : Erreurs catchées avant le commit
2. **Automatisation** : Formatage automatique du code
3. **Cohérence** : Standards uniformes dans l'équipe
4. **Performance** : Seuls les fichiers modifiés sont vérifiés
5. **Flexibilité** : Configuration par service et langage

## Commandes utiles

```bash
# Vérifier la configuration
pre-commit validate-config

# Nettoyer le cache
pre-commit clean

# Désinstaller les hooks
pre-commit uninstall

# Voir les hooks installés
pre-commit run --help
```
