Status: ready-for-agent
Blocked by: aucun (peut démarrer tout de suite)

# 01 : Afficher le Résumé du Catalogue sur l'accueil

Spec : `../spec.md`. Source : `backlog/05-catalog-summary.md` (laissé intact). Vocabulaire : `GLOSSARY.md` (Résumé du Catalogue, Note, Note moyenne). Architecture : ADR 0001.

## Ce qu'il faut construire

Sous le sous-titre du bandeau d'accueil, le Visiteur lit le Résumé du Catalogue : « 21 games · ★ 3.9 average rating ». Le Résumé décrit toujours tout le Catalogue : il reste le même quand des Filtres sont actifs. Quand aucun Jeu n'a de Note, il affiche « No ratings yet ». La ligne « Showing N of M games » ne change pas.

Un nouveau module de la couche de données calcule le Résumé, et `getCatalog` s'en sert à la place de son comptage actuel. Le Catalogue n'est ainsi compté qu'une fois par requête, et la page ne fait toujours qu'un appel.

Ce ticket est livré en parallèle des tickets 01 (Recherche), 02 (Tri), 04 (pages d'Éditeur), 07.2 et 07.3. Pour limiter les conflits, il ne touche dans le module des Jeux qu'à `getCatalog`, à l'interface `Catalog` et aux imports. Il ne modifie aucun test existant.

## Critères d'acceptation

- [x] Un nouveau module de la couche de données exporte `getCatalogSummary(db)`, qui rend un `CatalogSummary` de forme `{ total: number; averageRating: number | null }`, calculé par une seule requête d'agrégat sur tous les Jeux. Il porte un TSDoc, comme toute fonction exportée de la couche de données.
- [x] `total` compte tous les Jeux du Catalogue, notés ou non.
- [x] `averageRating` est la moyenne des Notes des seuls Jeux qui en ont une. Chaque Note y entre bornée à 0–5, selon la règle de `clampRating`. La moyenne est arrondie au dixième, au plus proche, la moitié vers le haut.
- [x] `averageRating` vaut `null` quand aucun Jeu n'a de Note, Catalogue vide compris. Il ne vaut jamais `0` ni `NaN`.
- [x] `getCatalog(db, searchParams)` appelle `getCatalogSummary` à la place de sa requête de comptage, et rend `{ games, total, averageRating, filters }`. L'interface `Catalog` gagne `averageRating: number | null`. `total` garde son nom et son sens : la taille du Catalogue entier, même filtré.
- [x] Dans le module des Jeux, rien d'autre ne change : ni `getCatalogGames`, ni la zone entre `getAllGameIds` et `getGameById`, réservée au ticket 04.
- [x] La page d'accueil n'appelle toujours que `getCatalog`. Le Résumé est un paragraphe placé dans l'emplacement libre du bandeau d'accueil, sous le sous-titre.
- [x] Le texte du Résumé :
  - « 21 games · ★ 3.9 average rating » ;
  - « 1 game » au singulier, « N games » sinon, « 0 games » compris ;
  - la Note moyenne toujours avec une décimale (« 4.0 ») ;
  - « 21 games · No ratings yet », sans étoile, quand aucun Jeu n'a de Note ;
  - « 0 games · No ratings yet » pour un Catalogue vide.

  Le Résumé n'est jamais masqué, et le nombre de Jeux notés n'est pas affiché.
- [x] L'étoile et le point médian sont masqués aux lecteurs d'écran (`aria-hidden`). Le paragraphe se lit « 21 games, 3.9 average rating ».
- [x] Le style est plus discret que le sous-titre (un texte gris plus petit), avec les nombres en gras et plus clairs. L'étoile est jaune, comme celle de la Note sur la fiche de jeu.
- [x] Les `data-testid` sont posés : `catalog-summary` sur le paragraphe, `catalog-summary-total` sur « 21 games », `catalog-summary-rating` sur la Note moyenne ou « No ratings yet ». `page-hero`, `results-count` et les autres ne changent pas.
- [x] Le titre de la page, « Featured Games », les Filtres, la ligne « Showing N of M games » et la grille ne changent pas.
- [x] Un fichier de test à part, à côté du nouveau module, prouve sur une base en mémoire créée par `createTestDatabase()` :
  - `getCatalogSummary` :
    - le total compte les Jeux notés et non notés ;
    - la moyenne ignore les Jeux sans Note ;
    - l'arrondi au dixième (3.9, 4.0 et 4.0 donnent 4.0) ;
    - la borne 0–5 (une Note de 7 compte pour 5, une Note de -1 pour 0) ;
    - `null` quand aucun Jeu n'a de Note ;
    - `{ total: 0, averageRating: null }` sur un Catalogue vide ;
  - `getCatalog` avec un Filtre de Catégorie actif : `total` et `averageRating` sont ceux du Catalogue entier, pas ceux des Jeux retenus.
- [x] Les tests existants, dont ceux de la famille Catégorie qui vérifient `total`, passent sans modification.
- [x] On vérifie à la main, sur `npm run dev` :
  - « 21 games · ★ 3.9 average rating » avec le seed ;
  - le même Résumé avec un Filtre actif ;
  - la lecture dans l'arbre d'accessibilité.

  Les cas « 1 game », « No ratings yet » et « 0 games » se vérifient sur une base modifiée à la main. Supprimer ensuite `tailspin.db` pour revenir au seed. On n'écrit pas de test e2e et on ne lance pas Playwright.
- [x] Aucun changement de schéma ni de migration.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Notes de fusion

Le 01 (`search`) et le 02 (`sort`) ajoutent eux aussi des champs à l'interface `Catalog` et au `return` de `getCatalog`. Leur conflit avec ce ticket touche trois zones : les imports et le TSDoc de `Catalog` dans `src/lib/games.ts`, le `@returns` et le corps de `getCatalog` dans le même fichier, et la déstructuration de `getCatalog` dans `src/pages/index.astro`. Il se règle à la main en gardant tous les champs, et `getCatalogSummary` à la place de l'ancien `count()`, que `main` n'importe plus. La PR #11 du 01 l'a déjà réglé ainsi (`d89fb08`). La règle générale est dans `backlog/dev-plan.md`, « Fusionner la vague 2 ».

## Comments

Livré par la PR #10. Les cases ont été cochées après la revue de cette PR, faite après sa fusion par un agent dédié. Chaque critère y est prouvé : par le code, par un test de `src/lib/catalog-summary.test.ts`, par le diff de la PR (rien d'autre dans `games.ts`, page et tests existants inchangés, aucune migration) ou par la CI. Vérification à la main refaite sur `main` (`c4acd67`), sur `npm run dev` : « 21 games · ★ 3.9 average rating » avec le seed, et le même Résumé avec `?category=2` (« Showing 4 of 21 games »). Pour la lecture, j'ai relevé le texte hors des éléments `aria-hidden` : « 21 games, 3.9 average rating ». C'est une approximation de l'arbre d'accessibilité, que l'audit axe de `/` en CI complète. Les cas « 1 game », « No ratings yet » et « 0 games », sur une base modifiée à la main, sont ceux que relève la description de la PR #10.
