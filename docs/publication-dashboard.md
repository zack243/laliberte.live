# Publication depuis l'administration — version transitoire sans base de données

Le site public charge `data/church-content.json` avec `js/church-content.js`. Il affiche uniquement les fiches de prédication (`sermons`), podcasts et événements portant `status: "published"`. Le lecteur YouTube ne s'affiche que lorsque `live.isLive === true` et que `live.youtubeVideoId` est une ID vidéo YouTube valide.

L'ancien catalogue de vidéos officielles reste intact. Le bloc CMS est masqué si le flux JSON ne contient rien à afficher. Les fiches `campuses` sont prévues dans le contrat pour un raccordement ultérieur sur la page Campus, mais ne changent pas actuellement les informations des campus existants.

## Workflow temporaire de validation

1. Depuis le dashboard de test `https://laliberte-admin-preview.vercel.app/`, saisir des contenus non sensibles ; marquer une fiche `Prêt` après vérification.
2. Ouvrir « Préparer la publication » et télécharger `church-content.json`. L'export ne contient que les fiches prêtes ; les fiches sans lien vidéo YouTube valide ne sont pas exportées comme prédications/podcasts.
3. Faire valider le JSON (titres, consentement à la diffusion, liens, horaires), puis mettre à jour manuellement `data/church-content.json` par GitHub.
4. Vérifier la production après déploiement Vercel.

**Sécurité :** le prototype n'a pas de connexion administrateur fiable. La possibilité d'exporter ne confère aucun droit de publication. Ne jamais exposer une API acceptant ce JSON depuis le navigateur sans vérification d'identité, rôles et validation serveur.

## Contrat JSON

```json
{
  "version": 1,
  "publishedAt": null,
  "sermons": [],
  "podcasts": [],
  "events": [],
  "campuses": [],
  "live": {
    "title": "Culte en direct",
    "schedule": "",
    "youtubeVideoId": null,
    "isLive": false
  }
}
```

Chacune des listes d'articles accepte des objets avec `title`, `description`, `speaker`, `url`, `date`, `location`, `schedule` et `status`. Le front public filtre par `status: "published"`, borne chaque liste à 6 contenus et crée les éléments DOM en texte non HTML. Seuls les liens YouTube reconnus deviennent cliquables.

## Passage à GoDaddy

- Installer un serveur applicatif privé (PHP/MySQL si l'hébergement le permet), sessions et droits d'accès par rôle.
- Les brouillons ne doivent jamais être dans les flux de lecture publique.
- L'API publique fournit seulement les enregistrements publiés, en lecture seule, avec cache et contrôles de données.
- Pour publier, une API distincte authentifiée valide les champs, les liens, les permissions et garde une trace d'audit.
- Les demandes de prière sont stockées séparément des publications du site et ne doivent jamais traverser cette API publique.
- Mettre en place des sauvegardes et tester leur restauration avant l'ouverture aux véritables utilisateurs.
