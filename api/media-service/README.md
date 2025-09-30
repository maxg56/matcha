# Media Service (Go)

Service de gestion des médias pour l'application Matcha, réécrit en Go pour être cohérent avec les autres services.

## Fonctionnalités

- **Upload d'images** : Support PNG, JPG, JPEG, GIF, WebP
- **Récupération de fichiers** : Servir les images uploadées
- **Redimensionnement** : Créer des versions redimensionnées des images
- **Gestion utilisateur** : Lister les médias par utilisateur
- **Image de profil** : Définir une image comme photo de profil
- **Suppression** : Suppression logique et physique des fichiers

## Structure

```
src/
├── conf/           # Configuration base de données
├── handlers/       # Handlers HTTP
├── models/         # Modèles GORM
├── utils/          # Utilitaires (auth, responses, files)
└── main.go         # Point d'entrée
```

## API Endpoints

### Routes publiques
- `GET /health` - Health check
- `GET /api/v1/media/get/:filename` - Récupérer un fichier
- `GET /api/v1/media/uploads/:filename` - Servir un fichier (compatibilité)
- `GET /api/v1/media/user/:user_id` - Médias d'un utilisateur

### Routes protégées (authentification requise)
- `POST /api/v1/media/upload` - Upload un fichier
- `DELETE /api/v1/media/delete/:filename` - Supprimer un fichier
- `POST /api/v1/media/resize` - Redimensionner une image
- `GET /api/v1/media/my` - Mes médias
- `POST /api/v1/media/profile` - Définir image de profil

## Développement

### Commandes
```bash
# Compilation
go build -o main src/main.go

# Exécution locale
go run src/main.go

# Tests
go test ./...

# Hot reload (avec air)
air -c .air.toml
```

### Variables d'environnement
- `DB_HOST` - Host PostgreSQL (défaut: localhost)
- `DB_PORT` - Port PostgreSQL (défaut: 5432)
- `DB_USER` - Utilisateur PostgreSQL (défaut: postgres)
- `DB_PASSWORD` - Mot de passe PostgreSQL (défaut: password)
- `DB_NAME` - Nom base de données (défaut: matcha_dev)
- `PORT` - Port du service (défaut: 8006)
- `AUTO_MIGRATE` - Auto-migration GORM (défaut: true)
- `GIN_MODE` - Mode Gin (debug/release)

## Modèle de données

```sql
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL UNIQUE,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    is_profile BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    description TEXT,
    alt_text VARCHAR(255)
);
```

## Migrations depuis Python

Le nouveau service Go est compatible avec l'ancienne version Python :
- Même structure de base de données
- Mêmes endpoints API
- Même format de réponses JSON
- Compatible avec les fichiers existants

## Sécurité

- Validation des types de fichiers
- Limitation de la taille des fichiers (16MB)
- Authentification via headers X-User-ID (fourni par le gateway)
- Prévention directory traversal
- Suppression logique des fichiers