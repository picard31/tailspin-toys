Status: ready-for-agent

# Trier le Catalogue par titre et par Note

Source : `backlog/02-sort-games.md` (laissé intact). Vocabulaire : `GLOSSARY.md` (Tri, Note, Filtre). Décisions d'architecture : `docs/adr/0005-tri-du-catalogue.md` et `docs/adr/0001-accueil-rendue-a-la-demande.md`.

## Problème

Sur la page d'accueil, le Catalogue est toujours présenté par titre, de A à Z. Le visiteur qui veut voir d'abord les Jeux les mieux notés doit parcourir toutes les cartes et comparer leurs étoiles ; celui qui cherche un Jeu en fin d'alphabet fait défiler toute la grille. Les Filtres restreignent la liste, mais rien n'en change l'ordre.

## Solution

Dans le formulaire de Filtres, deux listes déroulantes choisissent le Tri : « Sort by » (Title, Rating) et « Order » (Ascending, Descending). Le visiteur clique sur « Apply » : la page se recharge avec les mêmes Jeux dans l'ordre choisi, et l'URL décrit le Tri, ce qui permet de la partager ou de la mettre en favori. Le Tri s'applique aux Jeux retenus par les Filtres, et « Clear filters » efface les Filtres sans toucher au Tri. Sans Tri choisi, la page reste triée par titre A→Z, comme aujourd'hui. Les Jeux sans Note viennent toujours après les Jeux notés. Tout fonctionne au clavier et sans JavaScript.

## User stories

1. En tant que visiteur, je veux trier le Catalogue par Note décroissante, pour voir d'abord les Jeux les mieux notés.
2. En tant que visiteur, je veux trier le Catalogue par titre de A à Z, pour retrouver un Jeu dont je connais le nom.
3. En tant que visiteur, je veux trier le Catalogue par titre de Z à A, pour atteindre vite les Jeux de la fin de l'alphabet.
4. En tant que visiteur, je veux trier le Catalogue par Note croissante, pour repérer les Jeux les moins bien notés.
5. En tant que visiteur, je veux qu'en l'absence de Tri choisi la page reste triée par titre de A à Z, pour que l'accueil ne change pas tant que je ne trie pas.
6. En tant que visiteur, je veux que les Jeux sans Note viennent après tous les Jeux notés, dans les deux sens, pour qu'un Jeu pas encore noté ne passe ni pour le meilleur ni pour le pire.
7. En tant que visiteur, je veux qu'à Note égale les Jeux soient rangés par titre de A à Z, dans les deux sens, pour lire les ex æquo dans un ordre que je reconnais.
8. En tant que visiteur, je veux que les Jeux sans Note soient eux aussi rangés par titre de A à Z, pour les parcourir facilement.
9. En tant que visiteur, je veux que le tri par titre de Z à A soit l'inverse exact du tri de A à Z, pour que changer de sens retourne simplement la liste.
10. En tant que visiteur, je veux que le même Tri donne toujours le même ordre, même entre deux Jeux de même titre, pour retrouver un Jeu à la même place d'une visite à l'autre.
11. En tant que visiteur, je veux que le Tri s'applique aux Jeux retenus par mes Filtres, pour classer ma sélection plutôt que tout le Catalogue.
12. En tant que visiteur, je veux que le Tri ne retire aucun Jeu, et que « Showing N of M games » reste le même quand je trie, pour ne pas confondre trier et filtrer.
13. En tant que visiteur, je veux choisir le Tri dans le même formulaire que les Filtres et tout appliquer d'un seul bouton « Apply », pour que la page ne change pas pendant que je fais mes choix.
14. En tant que visiteur, je veux qu'après le rechargement les deux listes déroulantes montrent le Tri retenu, pour savoir dans quel ordre je lis la liste.
15. En tant que visiteur, je veux que « Clear filters », dans le formulaire comme dans le message « No games match these filters. », efface mes Filtres sans perdre mon Tri, puisque le Tri n'est pas un Filtre.
16. En tant que visiteur, je veux que l'URL décrive mon Tri, pour partager ma liste triée ou la retrouver en favori.
17. En tant que visiteur, je veux qu'un Tri seul ne donne pas à la page le titre « Filtered games - Tailspin Toys », puisque rien n'est filtré.
18. En tant que visiteur qui ouvre une URL abîmée (valeur inconnue, vide ou de casse différente, paramètre répété), je veux une page qui s'affiche quand même, triée selon les valeurs valides, plutôt qu'une erreur.
19. En tant que visiteur qui ouvre une URL tapée à la main avec un seul des deux paramètres de Tri, je veux que l'autre prenne sa valeur par défaut, pour obtenir un ordre prévisible.
20. En tant qu'utilisateur du clavier, je veux atteindre les deux listes déroulantes avec Tab et les changer aux flèches, avec un focus toujours visible, pour trier sans souris.
21. En tant qu'utilisateur d'un lecteur d'écran, je veux que chaque liste déroulante ait une étiquette visible, « Sort by » et « Order », pour savoir ce que je règle.
22. En tant qu'utilisateur sans JavaScript, je veux que le Tri fonctionne quand même, puisque c'est un simple formulaire.
23. En tant que développeur, je veux que les règles du Tri vivent dans `src/lib/` et soient prouvées par Vitest, puisque les postes de la formation n'ont pas de navigateur de test.
24. En tant que développeur, je veux que le Tri ait son propre module, pour que les fichiers partagés de l'accueil ne changent que de quelques lignes et que les branches de la vague 2 (01, 07.2, 07.3) fusionnent avec des conflits d'une ligne.
25. En tant que testeur, je veux des `data-testid` sur les deux listes déroulantes, pour que les tests e2e futurs les ciblent.

## Décisions d'implémentation

### Architecture

- Le Tri est lu dans la query string de l'accueil, rendue à la demande, comme les Filtres (ADR 0001). Il passe par le même formulaire GET et le même bouton, sans envoi automatique au changement (WCAG 3.2.2) et sans JavaScript.
- Le Tri n'est pas un Filtre (glossaire, ADR 0005) :
  - il n'entre pas dans le type des Filtres, et `hasActiveFilters` ne change pas ;
  - le titre « Filtered games - Tailspin Toys », la ligne « Showing N of M games » et les deux messages vides ne réagissent pas au Tri.
- Le bouton « Apply filters » devient « Apply », puisqu'il applique aussi le Tri. Son `data-testid`, `apply-filters`, ne change pas. Le ticket 01 fait le même changement, sur la même ligne : git fusionne les deux seul.
- Le titre « Featured Games » et la carte de Jeu ne changent pas.

### Contrat d'URL

- `sortProperty` : `title` (par défaut) ou `rating`.
- `sortDirection` : `asc` (par défaut) ou `desc`.
- Les deux paramètres sont lus séparément. Un paramètre absent ou invalide prend sa propre valeur par défaut, sans toucher l'autre :
  - `?sortProperty=rating` seul trie par Note croissante ;
  - `?sortDirection=desc` seul trie par titre de Z à A.
- Aucune erreur n'est jamais renvoyée :
  - une valeur vide, inconnue ou de casse différente (`Rating`, `DESC`) est ignorée ;
  - pour chaque paramètre, seule la première valeur valide compte.
- Le formulaire envoie toujours les deux paramètres, puisqu'une liste déroulante a toujours une option choisie.

### L'ordre

L'ordre est total : le même Tri donne toujours le même ordre, ce dont la pagination (ticket 06) aura besoin.

- **Titre, croissant** : le titre de A à Z, puis l'identifiant croissant.
- **Titre, décroissant** : le titre de Z à A, puis l'identifiant décroissant, l'inverse exact du sens croissant.
- **Note, dans les deux sens** :
  - la Note dans le sens choisi, puis le titre de A à Z, puis l'identifiant croissant ;
  - les Jeux sans Note viennent après tous les Jeux notés, dans les deux sens, rangés entre eux par titre de A à Z puis identifiant croissant ;
  - la valeur triée est la Note stockée, sans la borne 0–5 ni l'arrondi de l'affichage.
- Le titre garde l'ordre binaire de SQLite, celui de `getAllGames` : majuscules avant minuscules, lettres accentuées après « z ».
- Le SQLite de Node gère `NULLS LAST`, qui garde les Jeux sans Note en dernier quel que soit le sens.

### Modules

- **Le module du Tri**, nouveau, sur le modèle d'une famille de Filtres. Il contient :
  - le type `CatalogSort`, `{ property: 'title' | 'rating'; direction: 'asc' | 'desc' }` ;
  - le Tri par défaut ;
  - la lecture des deux paramètres depuis l'URL ;
  - les expressions de tri de la requête ;
  - l'URL de « Clear filters ».
- **Le Catalogue filtré**, dans le module des Jeux :
  - `getCatalogGames(db, filters, sort)` reçoit le Tri en troisième paramètre, et son tri par titre laisse la place aux expressions du Tri ;
  - `getCatalog(db, searchParams)` lit le Tri et le rend avec le reste : `{ games, total, filters, sort }`. `sort` est le Tri retenu après le traitement des valeurs invalides, et il présélectionne les listes déroulantes ;
  - l'interface `Catalog` gagne `sort`. `total` garde son nom et son sens ;
  - `getAllGames`, `getAllGameIds` et `getGameById` ne changent pas. Le ticket 04 insère `getPublisherGames` entre `getAllGameIds` et `getGameById` : ne pas toucher à cette zone.
- **L'URL de « Clear filters »** est une fonction pure, construite à partir du Tri retenu. Elle rend `/` au Tri par défaut, et sinon `/?sortProperty=…&sortDirection=…` avec les deux paramètres. Elle sert aux deux liens « Clear filters », celui du formulaire et celui du message « No games match these filters. ». Le ticket 01 ajoute la Recherche, que « Clear filters » garde aussi, et un lien « Clear search » : la branche fusionnée en second étend cette fonction.
- **Composants** :
  - le formulaire de Filtres reçoit le Tri retenu, dans une nouvelle prop. Il affiche les deux listes déroulantes entre les familles de Filtres et le bouton ;
  - la page lui passe `sort` et donne au lien du message vide l'URL de « Clear filters ».
- **Contrôles** :
  - un `<label>` « Sort by » relié à un `<select name="sortProperty">`, avec les options « Title » (`title`) et « Rating » (`rating`), et `data-testid="sort-property"` ;
  - un `<label>` « Order » relié à un `<select name="sortDirection">`, avec les options « Ascending » (`asc`) et « Descending » (`desc`), et `data-testid="sort-direction"` ;
  - pas de `<fieldset>` autour d'eux : les deux étiquettes suffisent ;
  - un focus visible, dans le style des contrôles de Filtre.
- Aucun changement de schéma ni de migration.

## Décisions de test

- On teste ce que la page voit, pas la tuyauterie. Il y a deux points d'entrée, et seulement deux :
  1. `getCatalog(db, searchParams)`, qui prouve toutes les règles du Tri :
     - les quatre Tris et leurs départages ;
     - les Jeux sans Note en dernier, dans les deux sens ;
     - le Tri par défaut sans paramètre ;
     - les défauts indépendants des deux paramètres ;
     - chaque cas de valeur invalide du contrat d'URL ;
     - le Tri retenu dans `sort` ;
     - le Tri appliqué au résultat d'un Filtre de Catégorie ;
     - un Tri seul qui ne rend pas le Catalogue filtré (`hasActiveFilters` reste faux) ;
  2. l'URL de « Clear filters » : `/` au Tri par défaut, et les deux paramètres pour chacun des trois autres Tris. C'est une fonction pure, testée sans base.
- La lecture des paramètres et les expressions de tri ne sont pas testées directement : un test qui les vise casserait au premier remaniement sans rien prouver de plus.
- Les tests du Tri vivent dans le fichier de test du module du Tri. Ils appellent `getCatalog` avec les paramètres du Tri, plus `category` pour le test de combinaison. Ils n'utilisent pas `publisher`, que la 07.2 livre en parallèle.
- Chaque test part d'une base en mémoire, migrée par `createTestDatabase()`, et y insère ses propres données, dans l'ordre inverse de l'ordre attendu :
  - des Notes ex æquo, pour prouver le départage par titre ;
  - des Jeux sans Note, pour prouver leur place ;
  - deux Jeux de même titre, pour prouver le départage par identifiant ;
  - les identifiants sont récupérés avec `returning`.

  Le modèle est le fichier de test de la famille Catégorie. Les valeurs invalides passent par un `it.each`.
- Les tests existants du module des Jeux et de la famille Catégorie ne changent pas : ils prouvent déjà le Tri par défaut, par titre de A à Z.
- Les composants Astro ne passent pas par Vitest. On les vérifie à la main, au clavier, sur `npm run dev` :
  - la tabulation et le focus visible ;
  - les options présélectionnées après le rechargement ;
  - le Tri combiné à un Filtre ;
  - les deux liens « Clear filters », qui gardent le Tri.

  On n'écrit pas de nouveau test e2e et on ne lance pas Playwright.
- Le travail est fini quand `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Hors périmètre

- Le tri des pages d'Éditeur (ticket 04 : prérendues, triées par titre, sans contrôle de Tri), du Concierge, de `getAllGames` et des chemins prérendus des fiches de jeu.
- D'autres propriétés triables : la Catégorie, l'Éditeur. Il n'y a pas de date en base pour trier par nouveauté.
- Des libellés de sens adaptés à la propriété (« A to Z », « Highest first ») : il faudrait du JavaScript.
- Tout JavaScript côté navigateur pour le Tri, y compris l'envoi automatique au changement.
- Un tri sur la Note affichée (bornée, arrondie) plutôt que sur la Note stockée.
- Un ordre des titres insensible à la casse ou aux accents.
- Le souvenir du Tri d'une visite à l'autre : le Visiteur reste anonyme, et seule l'URL porte le Tri.
- La Recherche (ticket 01), son titre de page et ses messages, et la pagination (ticket 06).
- Tout nouveau test e2e.

## Notes

- Aucun Jeu de `db/games.csv` n'est sans Note : le seed en donne une à chacun, de 3.0 à 5.0. Seul Vitest prouve la place des Jeux sans Note. Les ex æquo, eux, se voient sur la page : sept groupes de Jeux à Note égale, de 5.0 à 3.0.
- Fusion de la vague 2 (voir `backlog/dev-plan.md`) : on attend des conflits d'une ligne, à régler à la main.
  - Avec le 01 : la signature de `getCatalogGames` (le 01 y ajoute la Recherche), le retour de `getCatalog`, l'interface `Catalog` et la fonction d'URL des liens d'effacement.
  - Avec la 07.2 : le formulaire de Filtres.
  - Le renommage du bouton en « Apply » est fait par la même ligne que le 01, et git le fusionne seul.
  - Rebaser la branche après chaque fusion.
- La place des Jeux sans Note et le départage, que le critère d'acceptation veut « documentés », sont dans l'ADR 0005.

La livraison se fait en trois tranches verticales, chacune dans son ticket sous `issues/`. On les livre l'une après l'autre sur la même branche : elles écrivent toutes dans le module du Tri et son fichier de test.

| Ticket | Bloqué par | Livre |
|---|---|---|
| 01 Titre dans les deux sens | — | La liste « Order » et le titre de A à Z ou de Z à A. Il pose tout ce qui est partagé : le module du Tri, `getCatalogGames(db, filters, sort)`, `sort` dans `getCatalog`, la prop du formulaire et le bouton « Apply ». |
| 02 Par Note | 01 | La liste « Sort by », le Tri par Note dans les deux sens, les Jeux sans Note en dernier et les défauts indépendants. |
| 03 « Clear filters » garde le Tri | 01, 02 | La fonction d'URL d'effacement et les deux liens « Clear filters ». |
