#!/bin/bash

# Script d'installation Pre-commit pour le projet Matcha
# Usage: ./setup-precommit.sh

set -e

echo "🚀 Installation de Pre-commit pour le projet Matcha"
echo "=================================================="

# Vérifier que nous sommes dans le bon répertoire
if [[ ! -f ".pre-commit-config.yaml" ]]; then
    echo "❌ Erreur: .pre-commit-config.yaml non trouvé"
    echo "   Veuillez exécuter ce script depuis la racine du projet Matcha"
    exit 1
fi

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Vérifier/installer pre-commit
echo "📦 Vérification de pre-commit..."
if command_exists pre-commit; then
    echo "✅ pre-commit est déjà installé ($(pre-commit --version))"
else
    echo "⚠️  pre-commit non trouvé, tentative d'installation..."

    # Détecter le système d'exploitation
    if [[ -f "/etc/arch-release" ]] && command_exists pacman; then
        echo "🐧 Arch Linux détecté, installation via pipx..."
        if ! command_exists pipx; then
            echo "   Installation de pipx..."
            sudo pacman -S python-pipx --noconfirm || {
                echo "❌ Erreur lors de l'installation de pipx"
                exit 1
            }
        fi
        pipx install pre-commit
        echo "✅ pre-commit installé via pipx"
    elif command_exists pip; then
        # Essayer pip avec --user d'abord
        pip install --user pre-commit 2>/dev/null || {
            echo "⚠️  Installation système requise. Utilisation de --break-system-packages..."
            pip install --break-system-packages pre-commit
        }
        echo "✅ pre-commit installé via pip"
    elif command_exists pip3; then
        pip install --user pre-commit || {
            echo "⚠️  Installation système requise. Utilisation de --break-system-packages..."
            pip install --break-system-packages pre-commit
        }
        echo "✅ pre-commit installé via pip"
    elif command_exists pip3; then
        pip3 install --user pre-commit || {
            echo "⚠️  Installation système requise. Utilisation de --break-system-packages..."
            pip3 install --break-system-packages pre-commit
        }
        echo "✅ pre-commit installé via pip3"
    else
        echo "❌ Erreur: ni pip ni pipx trouvés. Installation manuelle requise:"
        echo "   Sur Arch: sudo pacman -S python-pipx && pipx install pre-commit"
        echo "   Autres: pip install --user pre-commit"
        exit 1
    fi
fi

# 2. Vérifier les outils Python
echo "🐍 Vérification des outils Python..."
python_tools=("black" "isort" "flake8")
missing_tools=()

for tool in "${python_tools[@]}"; do
    if command_exists "$tool"; then
        echo "✅ $tool trouvé"
    else
        missing_tools+=("$tool")
    fi
done

if [ ${#missing_tools[@]} -ne 0 ]; then
    echo "⚠️  Installation des outils Python manquants: ${missing_tools[*]}"

    # Détecter Arch Linux
    if [[ -f "/etc/arch-release" ]] && command_exists pacman; then
        echo "🐧 Arch Linux détecté, installation via pacman..."
        arch_packages=()
        for tool in "${missing_tools[@]}"; do
            case $tool in
                "black") arch_packages+=("python-black") ;;
                "isort") arch_packages+=("python-isort") ;;
                "flake8") arch_packages+=("flake8") ;;
            esac
        done

        if [ ${#arch_packages[@]} -ne 0 ]; then
            sudo pacman -S "${arch_packages[@]}" --noconfirm || {
                echo "⚠️  Installation pacman échouée, essai avec pipx..."
                for tool in "${missing_tools[@]}"; do
                    pipx install "$tool" 2>/dev/null || echo "⚠️  Échec pipx pour $tool"
                done
            }
        fi
    elif command_exists pip; then
        # Essayer --user d'abord, puis --break-system-packages si nécessaire
        pip install --user "${missing_tools[@]}" 2>/dev/null || {
            echo "⚠️  Installation --user échouée, utilisation de --break-system-packages..."
            pip install --break-system-packages "${missing_tools[@]}"
        }
    elif command_exists pip3; then
        pip3 install --user "${missing_tools[@]}" 2>/dev/null || {
            echo "⚠️  Installation --user échouée, utilisation de --break-system-packages..."
            pip3 install --break-system-packages "${missing_tools[@]}"
        }
    else
        echo "❌ Erreur: ni pip ni pacman trouvés"
        echo "   Installation manuelle requise pour: ${missing_tools[*]}"
        echo "   Sur Arch: sudo pacman -S python-black python-isort flake8"
        echo "   Autres: pip install --user black isort flake8"
    fi
    echo "✅ Outils Python installés"
fi

# 3. Vérifier Go
echo "🔧 Vérification de Go..."
if command_exists go; then
    echo "✅ Go trouvé ($(go version))"

    # Vérifier les modules Go dans chaque service
    for service_dir in api/*/; do
        if [[ -f "$service_dir/go.mod" ]]; then
            echo "📁 Vérification de $service_dir"
            (cd "$service_dir" && go mod download) || echo "⚠️  Problème avec $service_dir"
        fi
    done
else
    echo "⚠️  Go non trouvé. Les hooks Go ne fonctionneront pas."
    echo "   Installez Go depuis: https://golang.org/dl/"
fi

# 4. Vérifier Node.js et pnpm
echo "📦 Vérification de Node.js et pnpm..."
if command_exists node; then
    echo "✅ Node.js trouvé ($(node --version))"

    if command_exists pnpm; then
        echo "✅ pnpm trouvé ($(pnpm --version))"

        # Installer les dépendances frontend
        if [[ -f "frontend/package.json" ]]; then
            echo "📁 Installation des dépendances frontend..."
            (cd frontend && pnpm install) || echo "⚠️  Problème avec l'installation frontend"
        fi
    else
        echo "⚠️  pnpm non trouvé. Les hooks TypeScript ne fonctionneront pas."
        echo "   Installez pnpm: npm install -g pnpm"
    fi
else
    echo "⚠️  Node.js non trouvé. Les hooks frontend ne fonctionneront pas."
    echo "   Installez Node.js depuis: https://nodejs.org/"
fi

# 5. Installer les hooks pre-commit
echo "🔗 Installation des hooks pre-commit..."
pre-commit install
echo "✅ Hooks pre-commit installés"

# 6. Test rapide
echo "🧪 Test de la configuration..."
if pre-commit run --all-files --show-diff-on-failure; then
    echo "✅ Tous les hooks fonctionnent correctement!"
else
    echo "⚠️  Certains hooks ont échoué. Vérifiez les erreurs ci-dessus."
    echo "   Vous pouvez exécuter 'pre-commit run --all-files' pour plus de détails."
fi

echo ""
echo "🎉 Installation terminée!"
echo ""
echo "💡 Conseils d'utilisation:"
echo "   • Les hooks s'exécutent automatiquement à chaque commit"
echo "   • Utilisez 'pre-commit run' pour les exécuter manuellement"
echo "   • Consultez doc/Pre-commit_Guide.md pour plus d'informations"
echo ""
echo "🚨 En cas de problème:"
echo "   • Vérifiez que vous êtes dans le bon répertoire de travail"
echo "   • Assurez-vous que tous les outils sont installés"
echo "   • Consultez la documentation dans doc/"
