# MARO BRUTAF TECH — boutique + espace gérant (prototype V2)

## Ce qui est conservé
- Le site vitrine original et son style.
- Catalogue, fiches produits, capacités, couleurs, prix, panier/contact WhatsApp et formulaire de troc.
- Administration de base : ajouter/modifier/supprimer un produit, modifier prix et photos (URL), masquer/afficher un produit, activer/désactiver le troc, modifier les informations de la boutique.
- Interface adaptée au téléphone et à l'ordinateur.

## Ce qui est retiré
- Aucun écran ni champ de gestion du stock dans le nouvel espace gérant.
- Pas de paiement en ligne. Les clients contactent la boutique via WhatsApp.

## Démarrer en local
1. Décompresser le ZIP.
2. Ouvrir le dossier `maro-brutaf-tech-complet` dans Visual Studio Code.
3. Lancer `index.html` avec Live Server.
4. Ouvrir `admin.html` sur la même origine pour tester l'espace gérant.

### Identifiants de démonstration (local uniquement)
- E-mail : `admin@maro.bf`
- Mot de passe : `admin123`

**Attention : cette connexion est simulée et n'est pas sécurisée. Ne publiez pas l'espace admin ainsi sur Internet.** Les changements sont conservés dans `localStorage` sur ce navigateur seulement et ne se synchronisent pas entre appareils.

## Arborescence
```text
maro-brutaf-tech-complet/
├── index.html              # Site vitrine public existant
├── admin.html              # Espace gérant (prototype local)
├── README.md               # Ce guide
├── css/
│   └── admin.css           # Styles responsive de l'administration
├── js/
│   ├── admin.js            # Logique de l'administration locale
│   ├── boutique.js         # Emplacement réservé à la séparation de la logique publique
│   └── donnees.js          # Contrat de données / emplacement réservé
├── assets/
│   ├── images/             # Images locales à ajouter ultérieurement
│   └── icons/              # Icônes locales à ajouter ultérieurement
└── supabase/
    └── schema.sql          # Schéma préparatoire sécurisé pour la future base
```

## Structure des données actuelles
- `maro_p` : catalogue de produits utilisé par le prototype.
- `maro_s` : réglages de la boutique.
- Les prix sont définis par capacité. Le champ technique de disponibilité existant dans le site public est conservé pour ne pas casser les fonctions actuelles, mais il n'est pas modifiable dans l'administration V2 et ne constitue pas une gestion de stock.

## Prochaine étape : rendre l'administration réellement utilisable en ligne
Le dossier `supabase/schema.sql` est préparatoire; **aucune connexion Supabase n'est encore active dans ce prototype**. Pour une vraie mise en ligne avec synchronisation, il faudra :
1. Créer un projet Supabase et exécuter le SQL.
2. Créer le compte gérant dans Authentication puis ajouter son UUID dans `public.admin_users`.
3. Créer/configurer le stockage des photos (bucket Storage et règles d'accès).
4. Connecter le site public et `admin.html` à la base avec la clé publique/publishable Supabase.
5. Tester les règles RLS et le compte gérant avant publication.

Ne jamais utiliser la clé `service_role` dans le navigateur. Le fichier SQL ne connecte pas automatiquement le site : il prépare uniquement la base et ses règles.

## Avant publication
- Remplacer le numéro WhatsApp de démonstration par le numéro réel.
- Vérifier prix, textes et photos des produits.
- Remplacer la connexion simulée par Supabase Auth.
- Vérifier l'affichage sur mobile et tester tous les liens WhatsApp/troc.
