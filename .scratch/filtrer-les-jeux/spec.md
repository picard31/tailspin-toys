Status: ready-for-agent

# Filtrer le Catalogue par Catégorie et par Éditeur

Source : `backlog/07-filter-games.md` (laissé intact). Vocabulaire : `GLOSSARY.md`. Décision d'architecture : `docs/adr/0001-accueil-rendue-a-la-demande.md`.

## Problème

Sur la page d'accueil, le visiteur voit tout le Catalogue d'un bloc, sous le titre « Featured Games ». Pour trouver les jeux d'un genre qui lui plaît, ou ceux d'un Éditeur qu'il connaît, il doit parcourir toutes les cartes. Plus le Catalogue grandit, moins il trouve les jeux qu'il pourrait soutenir.

## Solution

Au-dessus de la grille, un formulaire de Filtres permet de restreindre le Catalogue à une ou plusieurs Catégories et à un Éditeur. Le visiteur choisit ses Filtres puis clique sur « Apply filters » : la page se recharge avec les seuls Jeux qui correspondent, et l'URL décrit les Filtres actifs, ce qui permet de la partager ou de la mettre en favori. Une ligne indique combien de Jeux sont affichés sur le total. Si aucun Jeu ne correspond, un message le dit, avec un lien pour effacer les Filtres. Tout fonctionne au clavier et sans JavaScript.

## User stories

1. En tant que visiteur, je veux filtrer le Catalogue par Catégorie, pour ne voir que les Jeux du genre qui m'intéresse.
2. En tant que visiteur, je veux choisir plusieurs Catégories à la fois, pour voir ensemble les Jeux de tous les genres qui m'intéressent.
3. En tant que visiteur, je veux que choisir plusieurs Catégories m'affiche les Jeux de l'une **ou** de l'autre, puisqu'un Jeu n'appartient qu'à une seule Catégorie.
4. En tant que visiteur, je veux filtrer le Catalogue par Éditeur, pour voir ce que publie une société que j'apprécie.
5. En tant que visiteur, je veux combiner Catégories et Éditeur, pour ne voir que les Jeux d'un Éditeur dans les genres qui m'intéressent.
6. En tant que visiteur, je veux qu'en l'absence de Filtre tout le Catalogue s'affiche, pour que la page d'accueil reste la même tant que je ne filtre pas.
7. En tant que visiteur, je veux que la liste des Catégories proposées soit complète et triée par nom, pour trouver vite celle que je cherche.
8. En tant que visiteur, je veux que la liste des Éditeurs proposés soit complète et triée par nom, pour trouver vite celui que je cherche.
9. En tant que visiteur, je veux appliquer mes Filtres avec un bouton « Apply filters », pour que la page ne change pas pendant que je fais mes choix.
10. En tant que visiteur, je veux qu'après le rechargement les contrôles montrent les Filtres actifs, pour savoir ce qui restreint la liste.
11. En tant que visiteur, je veux voir « Showing N of M games », pour savoir quelle part du Catalogue j'ai sous les yeux.
12. En tant que visiteur, je veux un message « No games match these filters. » quand aucun Jeu ne correspond, pour comprendre que la liste est vide à cause de mes Filtres et non parce que le Catalogue est vide.
13. En tant que visiteur, je veux un lien « Clear filters », pour revenir d'un geste à tout le Catalogue.
14. En tant que visiteur, je veux que l'URL décrive mes Filtres, pour partager ma sélection ou la retrouver en favori.
15. En tant que visiteur qui ouvre une URL abîmée ou ancienne (valeur non numérique, doublon, Catégorie qui n'existe plus), je veux une page qui s'affiche quand même, plutôt qu'une erreur.
16. En tant qu'utilisateur du clavier, je veux atteindre chaque contrôle de Filtre et le bouton avec Tab, avec un focus toujours visible, pour filtrer sans souris.
17. En tant qu'utilisateur d'un lecteur d'écran, je veux que le groupe des Catégories soit annoncé par sa légende et que la liste des Éditeurs ait une étiquette, pour savoir ce que je règle.
18. En tant qu'utilisateur d'un lecteur d'écran, je veux que le titre de la page change quand un Filtre est actif, pour savoir dès le chargement que la liste est filtrée.
19. En tant qu'utilisateur sans JavaScript, je veux que le filtrage fonctionne quand même, puisque c'est un simple formulaire.
20. En tant que développeur, je veux que les règles de filtrage vivent dans `src/lib/` et soient prouvées par Vitest, puisque les postes de la formation n'ont pas de navigateur de test.
21. En tant que développeur, je veux que chaque famille de Filtres ait ses propres fichiers, pour livrer en parallèle le filtre par Éditeur et le filtre à plusieurs Catégories, chacun dans son worktree, sans conflit.
22. En tant que testeur, je veux des `data-testid` sur le formulaire, chaque contrôle, le bouton, le lien d'effacement, la ligne de résultats et le message vide, pour que les tests e2e futurs les ciblent.

## Décisions d'implémentation

### Architecture

- La page d'accueil passe en rendu à la demande (`prerender = false`), comme la route d'API d'un Jeu (ADR 0001). Elle lit les paramètres de son URL et interroge SQLite à chaque visite.
- Les Filtres passent par un formulaire `GET` qui pointe sur la page d'accueil. On ne les applique qu'avec le bouton : pas d'envoi automatique au changement (WCAG 3.2.2), et pas de JavaScript.
- Le titre « Featured Games » et la carte de Jeu ne changent pas.

### Contrat d'URL

- `category` : identifiant numérique d'une Catégorie, qu'on peut répéter (`?category=2&category=5`), comme le font nativement les cases à cocher d'un formulaire GET.
- `publisher` : identifiant numérique d'un Éditeur.
- Aucune erreur n'est jamais renvoyée :
  - une valeur non numérique ou vide est ignorée, y compris la valeur vide du bouton « All categories » ;
  - les doublons sont fusionnés ;
  - un identifiant numérique inconnu est gardé : il ne trouve aucun Jeu et la page affiche le message vide ;
  - pour l'Éditeur, seule la première valeur valide compte.

### Sémantique

- Entre Catégories : OU. Entre Catégories et Éditeur : ET.
- Aucune Catégorie choisie et aucun Éditeur choisi : pas de restriction. Une liste vide veut dire « tout le Catalogue », jamais « aucun Jeu ».
- Les résultats restent triés par titre, comme aujourd'hui.

### Modules

- **Le Catalogue filtré**, ajouté au module des Jeux et seul appelé par la page d'accueil. `getCatalog(db, searchParams)` reçoit les paramètres bruts de l'URL et rend `{ games, total, filters }` : les Jeux retenus, le nombre de Jeux du Catalogue entier et les Filtres retenus après le traitement des valeurs invalides, qui servent à pré-remplir les contrôles. Il s'appuie sur `getCatalogGames(db, filters)`, qui assemble par ET les conditions de chaque famille sur la requête existante.
- **Le type des Filtres et leur lecture**, dans un module dédié : `CatalogFilters`, et une fonction qui construit ce type depuis les paramètres d'URL en déléguant à chaque famille. Sa forme finale : `{ categoryIds: number[]; publisherId: number | null }`. Le ticket 01 pose seulement `categoryIds`, sous forme de liste dès le départ.
- **La famille Catégorie**, dans son propre module : la lecture de `category`, la condition SQL (une appartenance à une liste dès le ticket 01) et `getAllCategories(db)`, trié par nom.
- **La famille Éditeur**, dans son propre module : la lecture de `publisher`, la condition SQL d'égalité et `getAllPublishers(db)`, trié par nom.
- **Composants** : un formulaire `CatalogFilters` (le bouton « Apply filters », le lien « Clear filters » vers `/` et l'emplacement de chaque famille), un composant `CategoryFilter` et un composant `PublisherFilter`. Chaque composant de famille va chercher lui-même ses options en base et reçoit les Filtres retenus pour afficher l'état courant.
- **Contrôles** :
  - Catégories : un `<fieldset>` avec une `<legend>` « Category ». Dans le ticket 01, ce sont des boutons radio, avec « All categories » en premier ; le ticket 03 les remplace par des cases à cocher, sans option « All ».
  - Éditeur : un `<label>` « Publisher » et un `<select>` dont la première option est « All publishers ».
  - Un focus visible sur tous les contrôles, dans le style du bouton du menu de l'en-tête.
- **Affichage des résultats** :
  - une ligne visible « Showing N of M games » sous le formulaire ;
  - le `<title>` « Filtered games - Tailspin Toys » quand au moins un Filtre est actif, et le titre actuel sinon ;
  - pas de région `aria-live` : le formulaire recharge la page, elle n'annoncerait rien ;
  - « No games match these filters. » quand des Filtres sont actifs et que rien ne correspond. Le message actuel, « No games available at the moment. », reste réservé au Catalogue vide.
- **`data-testid`** : `catalog-filters` (le formulaire), `category-filter` (le fieldset), `category-option` (chaque radio ou case), `publisher-filter` (le select), `apply-filters`, `clear-filters`, `results-count` et `no-matching-games`. Ceux qui existent, `games-grid` et `game-card`, ne changent pas.
- Aucun changement de schéma ni de migration.

## Décisions de test

- On teste ce que la page voit, pas la tuyauterie. Il y a deux points d'entrée, et seulement deux :
  1. `getCatalog(db, searchParams)`, qui prouve toutes les règles : chaque famille, le OU entre Catégories, le ET avec l'Éditeur, le Catalogue entier sans Filtre, le tri par titre, `total`, les Filtres retenus et chaque cas de valeur invalide du contrat d'URL ;
  2. `getAllCategories(db)` et `getAllPublishers(db)` : des listes complètes, triées par nom.
- Les fonctions de lecture d'une famille et les conditions SQL ne sont pas testées directement : un test qui les vise casserait au premier remaniement sans rien prouver de plus.
- Chaque famille garde ses tests dans son propre fichier de test. Ces tests appellent `getCatalog` avec des paramètres de leur seule famille. Les tests de combinaison (ticket 04) vont dans le fichier de test du module des Jeux.
- Chaque test part d'une base en mémoire, migrée par `createTestDatabase()`, et y insère ses propres Catégories, Éditeurs et Jeux. Le modèle est `src/lib/games.test.ts` : insertion dans un ordre inverse pour prouver le tri, identifiants récupérés avec `returning`.
- Les composants Astro ne passent pas par Vitest. On les vérifie à la main, au clavier, sur `npm run dev` : tabulation, focus visible, état des contrôles après rechargement, lien d'effacement. On n'écrit pas de nouveau test e2e et on ne lance pas Playwright.
- Une tranche est finie quand `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Hors périmètre

- La recherche par titre (ticket 01 du backlog), le tri (02) et la pagination (06). Leurs paramètres viendront plus tard s'ajouter à la même URL.
- Les pages d'Éditeur (ticket 04 du backlog).
- Les compteurs par option, comme « Strategy (4) » : ils empiètent sur le résumé du Catalogue (ticket 05 du backlog).
- Le renommage du titre « Featured Games ».
- Un document des règles d'accessibilité du projet.
- Les slugs dans l'URL.
- Tout JavaScript côté navigateur pour les Filtres.
- Tout nouveau test e2e.

## Notes

La livraison se fait en quatre tranches verticales, chacune dans son ticket sous `issues/` :

| Ticket | Bloqué par | Livre | Fichiers touchés |
|---|---|---|---|
| 01 Une Catégorie | — | Le filtrage par une seule Catégorie, de bout en bout. Il pose tout ce qui est partagé : la page à la demande, le formulaire, le type, `getCatalog` et `getCatalogGames`, la ligne de résultats, le titre, le message vide. | Il crée la famille Catégorie et les fichiers partagés. |
| 02 Éditeur | 01 | Le filtre par Éditeur. | Il crée la famille Éditeur. C'est le **seul** ticket à modifier les fichiers partagés (le type, la lecture, la requête, le formulaire), d'une ligne chacun. |
| 03 Plusieurs Catégories | 01 | Les cases à cocher, et toutes les valeurs de `category` gardées. | **Uniquement** les fichiers de la famille Catégorie. |
| 04 Combinaison | 02, 03 | La preuve du OU et du ET, la vérification manuelle et les critères du ticket 07 cochés. Pas de code de production, sauf si un test révèle un défaut. | Le fichier de test du module des Jeux. |

02 et 03 sont livrés en parallèle, chacun dans un worktree créé à partir de `HEAD` après la fusion de 01. Grâce à ce rangement, aucun fichier n'est modifié par les deux.
