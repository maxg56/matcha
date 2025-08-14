# Media Service

Service de gestion des médias pour l'application Matcha. Permet l'upload, la récupération, la suppression et le redimensionnement d'images.

## 📋 Fonctionnalités

- **Upload de fichiers** : Upload sécurisé avec validation des types et tailles
- **Récupération de fichiers** : Service de fichiers avec gestion d'erreurs
- **Suppression de fichiers** : Suppression sécurisée par nom de fichier
- **Redimensionnement d'images** : Redimensionnement avec optimisation
- **Health Check** : Monitoring de l'état du service

## 🚀 Démarrage Rapide

### Prérequis

- Python 3.8+
- Dépendances listées dans `requirements.txt`

### Installation

```bash
# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

### Lancement

```bash
cd src
python main.py
```

Le service démarrera sur le port 8006 par défaut.

## 📡 API Endpoints

### Health Check
```
GET /health
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "media-service"
  }
}
```

### Upload de Fichier
```
POST /api/v1/media/upload
Content-Type: multipart/form-data
```

**Paramètres :**
- `file` : Fichier à uploader (required)

**Formats supportés :** PNG, JPG, JPEG, GIF, WEBP  
**Taille max :** 16MB

**Réponse :**
```json
{
  "success": true,
  "data": {
    "filename": "image_uuid.jpg",
    "url": "http://localhost:8006/api/v1/media/get/image_uuid.jpg",
    "original_name": "image.jpg"
  },
  "message": "File uploaded successfully"
}
```

### Récupération de Fichier
```
GET /api/v1/media/get/<filename>
```

**Réponse :** Le fichier binaire ou erreur 404 si non trouvé

### Suppression de Fichier
```
DELETE /api/v1/media/delete/<filename>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "filename": "image_uuid.jpg"
  },
  "message": "File deleted successfully"
}
```

### Redimensionnement d'Image
```
POST /api/v1/media/resize
Content-Type: application/json
```

**Body :**
```json
{
  "filename": "image_uuid.jpg",
  "width": 200,
  "height": 200
}
```

**Contraintes :**
- Width/Height : 1-4096 pixels
- Formats : PNG, JPG, JPEG, GIF, WEBP

**Réponse :**
```json
{
  "success": true,
  "data": {
    "original_filename": "image_uuid.jpg",
    "resized_filename": "image_uuid_resized_200x200.jpg",
    "url": "http://localhost:8006/api/v1/media/get/image_uuid_resized_200x200.jpg",
    "width": 200,
    "height": 200
  },
  "message": "Image resized successfully"
}
```

## 🔒 Sécurité

- Validation stricte des types de fichiers
- Noms de fichiers sécurisés avec UUID
- Limitation de taille des uploads
- Validation des paramètres d'entrée
- Logs détaillés pour monitoring

## ⚙️ Configuration

### Variables d'Environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | `8006` | Port d'écoute du service |
| `DEBUG` | `true` | Mode debug Flask |
| `UPLOAD_FOLDER` | `uploads` | Dossier de stockage des fichiers |

### Paramètres

- **Formats autorisés :** PNG, JPG, JPEG, GIF, WEBP
- **Taille max :** 16MB par fichier
- **Dossier uploads :** Créé automatiquement si inexistant

## 🧪 Tests

### Lancer les tests
```bash
# Avec l'environnement virtuel activé
pytest src/test_main.py -v
```

### Couverture des tests
- ✅ Health check
- ✅ Upload de fichiers (valides/invalides)
- ✅ Récupération de fichiers (existants/inexistants)
- ✅ Suppression de fichiers
- ✅ Redimensionnement d'images
- ✅ Gestion d'erreurs complète
- ✅ Workflow d'intégration complet

**19/19 tests passent** ✅

## 🏗️ Architecture

### Structure du Code
```
api/media-service/
├── src/
│   ├── main.py          # Point d'entrée principal
│   └── test_main.py     # Tests unitaires
├── requirements.txt     # Dépendances Python
├── Dockerfile          # Configuration Docker
└── README.md           # Cette documentation
```

### Dépendances Principales
- **Flask** : Framework web
- **Flask-CORS** : Gestion CORS
- **Pillow** : Traitement d'images
- **Werkzeug** : Utilitaires web sécurisés

## 🔧 Intégration Gateway

Le service est intégré au gateway API sur les routes :
- `POST /api/media/upload`
- `GET /api/media/get/:filename`
- `DELETE /api/media/delete/:filename`
- `POST /api/media/resize`
- `GET /api/media/health`

**Note :** Toutes les routes sauf `/health` nécessitent une authentification JWT.

## 📊 Logging

Le service log toutes les opérations importantes :
- Requêtes d'upload/suppression/redimensionnement
- Erreurs avec stack traces
- Informations de démarrage du service

Format : `[LEVEL] [timestamp] [module:line] message`

## 🚨 Gestion d'Erreurs

### Codes de Retour
- **200** : Succès
- **400** : Erreur de validation
- **404** : Fichier non trouvé
- **500** : Erreur interne du serveur

### Format d'Erreur Standard
```json
{
  "success": false,
  "error": "Message d'erreur descriptif"
}
```

## 🔄 Workflow Typique

1. **Upload** : `POST /upload` avec fichier → Retourne URL
2. **Récupération** : `GET /get/<filename>` → Retourne fichier
3. **Redimensionnement** : `POST /resize` avec dimensions → Nouvelle URL
4. **Suppression** : `DELETE /delete/<filename>` → Confirmation

## 📈 Performance

- Images optimisées automatiquement lors du redimensionnement
- Noms de fichiers uniques évitent les collisions
- Streaming des fichiers pour économiser la mémoire
- Validation rapide des types de fichiers

## 🔍 Troubleshooting

### Problèmes Courants

**Service ne démarre pas :**
- Vérifier que le port 8006 est libre
- Vérifier les dépendances installées

**Upload échoue :**
- Vérifier la taille du fichier (< 16MB)
- Vérifier le format (PNG, JPG, JPEG, GIF, WEBP)
- Vérifier l'existence du dossier uploads

**Erreur de redimensionnement :**
- Vérifier que le fichier existe
- Vérifier les dimensions (1-4096 pixels)
- Vérifier que le fichier est une image valide