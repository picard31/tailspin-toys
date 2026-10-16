Status: ready-for-agent
Blocked by: aucun (peut démarrer tout de suite)

# 01 : Trier le Catalogue par titre, dans les deux sens

Spec : `../spec.md`. Architecture : ADR 0005 (le Tri) et ADR 0001 (l'accueil rendue à la demande).

## Ce qu'il faut construire

Dans le formulaire de Filtres, le visiteur choisit le sens du Tri dans une liste déroulante « Order » (Ascending, Descending). Il clique sur « Apply » et voit les mêmes Jeux par titre, de A à Z ou de Z à A. L'URL porte le sens, et l'option choisie reste sélectionnée après le rechargement. Sans paramètre de Tri, la page est la même qu'aujourd'hui, triée par titre de A à Z.

Ce ticket pose tout ce que les tickets 02 et 03 partagent : le module du Tri, le Tri en troisième paramètre de `getCatalogGames`, le Tri retenu dans le retour de `getCatalog`, la nouvelle prop du formulaire et le bouton renommé. La propriété du Tri est toujours le titre : la Note arrive au ticket 02.

## Critères d'acceptation

- [x] Un module du Tri, à part, contient :
  - le type `CatalogSort` : `{ property: 'title'; direction: 'asc' | 'desc' }`, que le ticket 02 élargit à `'rating'` ;
  - le Tri par défaut : titre, croissant ;
  - la lecture de `sortDirection` ;
  - les expressions de tri de la requête.
- [x] `getCatalogGames(db, filters, sort)` trie avec les expressions du Tri, et son ancien tri par titre disparaît :
  - en croissant : titre de A à Z, puis identifiant croissant ;
  - en décroissant : titre de Z à A, puis identifiant décroissant, l'inverse exact du croissant ;
  - le titre garde l'ordre binaire de SQLite.
- [x] `getCatalog(db, searchParams)` lit le Tri et le rend : `{ games, total, filters, sort }`. L'interface `Catalog` gagne `sort`, et `total` garde son nom et son sens.
- [x] `sortDirection` vaut `asc` (par défaut) ou `desc`. Les valeurs invalides ne provoquent jamais d'erreur : une valeur vide, inconnue ou de casse différente (`DESC`) est ignorée, et seule la première valeur valide compte.
- [x] Le Tri n'est pas un Filtre :
  - il n'entre pas dans le type des Filtres ;
  - un Tri seul laisse `hasActiveFilters` faux, et ne change ni le titre de page, ni « Showing N of M games », ni les messages vides.
- [x] Le formulaire de Filtres reçoit le Tri retenu par une nouvelle prop, et la page lui passe `sort`. Entre les familles de Filtres et le bouton, il affiche :
  - un `<label>` « Order » relié à un `<select name="sortDirection">`, avec les options « Ascending » (`asc`) et « Descending » (`desc`) ;
  - le `data-testid` `sort-direction` sur le `<select>` ;
  - l'option du Tri retenu, sélectionnée.
- [x] Le `<select>` a un focus visible, dans le style des contrôles de Filtre. Rien ne s'envoie quand on change d'option, et il n'y a pas de JavaScript.
- [x] Le bouton « Apply filters » devient « Apply ». Son `data-testid`, `apply-filters`, ne change pas. Le ticket 01 du backlog fait le même changement, sur la même ligne.
- [x] Le fichier de test du module du Tri prouve, à travers `getCatalog` :
  - le Tri par défaut sans paramètre ;
  - le titre de Z à A ;
  - l'inverse exact, avec deux Jeux de même titre départagés par identifiant ;
  - le Tri retenu dans `sort` ;
  - chaque valeur invalide de `sortDirection`, dans un `it.each` ;
  - la première valeur valide ;
  - un Tri seul qui laisse `hasActiveFilters` faux ;
  - le Tri appliqué au résultat d'un Filtre de Catégorie (`category`).
- [x] Ces tests partent d'une base en mémoire (`createTestDatabase()`) et insèrent leurs Jeux dans l'ordre inverse de l'ordre attendu. Ils vérifient l'ordre des titres et `sort` sans comparer le Catalogue en entier, que le ticket 01 du backlog complète en parallèle avec la Recherche.
- [x] Les tests existants du module des Jeux et de la famille Catégorie passent sans changement.
- [x] Rien ne change dans `getAllGames`, `getAllGameIds` et `getGameById`, ni dans la zone qui va de `getAllGameIds` à `getGameById` : le ticket 04 du backlog y insère une fonction.
- [x] On vérifie à la main, au clavier, sur `npm run dev` :
  - Tab atteint « Order », avec un focus visible ;
  - « Descending » puis « Apply » trie par titre de Z à A ;
  - l'option reste sélectionnée après le rechargement ;
  - le Tri se combine avec une Catégorie.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
