#!/bin/bash

# Installation rapide pre-commit pour Arch Linux
# Ce script utilise les paquets système d'Arch plutôt que pip

echo "🐧 Installation Pre-commit pour Arch Linux"
echo "========================================="

set -e

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Vérifier qu'on est sur Arch
if [[ ! -f "/etc/arch-release" ]]; then
    echo "❌ Ce script est conçu pour Arch Linux uniquement"
    echo "   Utilisez ./setup-precommit.sh pour les autres distributions"
    exit 1
fi

# Vérifier pacman
if ! command_exists pacman; then
    echo "❌ pacman non trouvé"
    exit 1
fi

echo "📦 Installation des paquets système..."

# Paquets à installer
packages=(
    "python-pipx"      # Pour pre-commit
    "python-black"     # Formatage Python
    "python-isort"     # Tri des imports Python
    "flake8"          # Linting Python
    "go"              # Langage Go (si pas déjà installé)
)

# Installation des paquets
sudo pacman -S --needed "${packages[@]}"

echo "🔗 Installation de pre-commit via pipx..."
pipx install pre-commit

# Ajouter pipx au PATH si nécessaire
if ! command_exists pre-commit; then
    echo "⚠️  Ajout de ~/.local/bin au PATH..."
    export PATH="$HOME/.local/bin:$PATH"

    # Ajouter de façon permanente
    if [[ -f ~/.zshrc ]]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
        echo "✅ PATH mis à jour dans ~/.zshrc"
    elif [[ -f ~/.bashrc ]]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
        echo "✅ PATH mis à jour dans ~/.bashrc"
    fi
fi

echo "🔧 Installation des hooks pre-commit..."
pre-commit install

echo "📁 Vérification du frontend..."
if [[ -f "frontend/package.json" ]]; then
    if ! command_exists pnpm; then
        echo "📦 Installation de pnpm..."
        echo "📦 Installation de pnpm (version 10.14.0)..."
        npm install -g pnpm@10.14.0
    fi

    echo "📦 Installation des dépendances frontend..."
    (cd frontend && pnpm install)
fi

echo "🧪 Test de la configuration..."
if pre-commit run --all-files; then
    echo "✅ Installation réussie!"
else
    echo "⚠️  Des corrections ont été appliquées. C'est normal pour la première exécution."
fi

echo ""
echo "🎉 Installation terminée!"
echo ""
echo "💡 Commandes utiles:"
echo "   pre-commit run              # Exécuter sur les fichiers modifiés"
echo "   pre-commit run --all-files  # Exécuter sur tous les fichiers"
echo "   pipx upgrade pre-commit     # Mettre à jour pre-commit"
echo ""
echo "📚 Documentation: doc/Pre-commit_Guide.md"
