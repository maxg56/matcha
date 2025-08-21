# Configuration Email - Auth Service

## Mode de développement (par défaut)

En mode développement, si les variables SMTP ne sont pas configurées, les codes de vérification sont simplement affichés dans les logs du service :

```
📧 Email verification code for user@example.com: 123456
   (SMTP not configured - email not sent)
```

## Configuration SMTP

Pour envoyer de vrais emails, configurez les variables d'environnement suivantes :

### Variables d'environnement

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@matcha.app
FROM_NAME=Matcha
```

### Configuration Gmail

1. **Activer l'authentification à 2 facteurs** sur votre compte Google
2. **Générer un "Mot de passe d'application"** :
   - Allez dans les paramètres de sécurité Google
   - Sélectionnez "Mots de passe d'application"
   - Générez un mot de passe pour "Mail"
3. **Utiliser les paramètres** :
   - `SMTP_USERNAME` : votre adresse Gmail
   - `SMTP_PASSWORD` : le mot de passe d'application généré

### Autres fournisseurs SMTP

- **Outlook/Office365** : `smtp.office365.com:587`
- **Yahoo** : `smtp.mail.yahoo.com:587`
- **SendGrid** : `smtp.sendgrid.net:587`
- **Mailgun** : `smtp.mailgun.org:587`

## Template Email

Le service envoie un email HTML avec :
- Design responsive avec gradient Matcha
- Code de vérification à 6 chiffres bien visible
- Expiration de 15 minutes clairement indiquée
- Instructions et informations de support

## Gestion des erreurs

- Si l'email ne peut pas être envoyé, le code reste valide
- L'erreur est loggée mais n'empêche pas l'inscription
- L'utilisateur peut redemander un code si nécessaire

## Test

Pour tester en développement :
1. Laisser les variables SMTP vides → codes dans les logs
2. Configurer un compte test → emails réels envoyés

## Sécurité

- Codes à 6 chiffres générés cryptographiquement
- Expiration automatique après 15 minutes  
- Un seul code actif par email à la fois
- Nettoyage automatique des codes expirés