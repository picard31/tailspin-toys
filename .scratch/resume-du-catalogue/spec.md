Status: ready-for-agent

# Le Résumé du Catalogue sur l'accueil

Source : `backlog/05-catalog-summary.md` (laissé intact). Vocabulaire : `GLOSSARY.md` (Catalogue, Résumé du Catalogue, Note, Note moyenne). Architecture : ADR 0001 (accueil rendue à la demande). Spec voisine : `.scratch/filtrer-les-jeux/spec.md`.

## Problème

En arrivant sur l'accueil, le Visiteur passe du bandeau de bienvenue aux Filtres et à la grille sans savoir ce que la plateforme propose. La ligne « Showing N of M games » donne bien la taille du Catalogue, mais sous les Filtres, comme une information sur sa sélection. Rien ne dit la qualité des Jeux : la Note n'apparaît que sur la fiche de chacun.

## Solution

Sous le sous-titre du bandeau d'accueil, une ligne courte présente le Résumé du Catalogue : le nombre de Jeux et leur Note moyenne, par exemple « 21 games · ★ 3.9 average rating ». Elle décrit toujours tout le Catalogue : les Filtres, et demain la Recherche, le Tri et la pagination, ne la changent pas. Quand aucun Jeu n'a de Note, la Note moyenne laisse la place à « No ratings yet ». La ligne « Showing N of M games » ne change pas.

## User stories

1. En tant que Visiteur, je veux voir dès l'accueil combien de Jeux propose la plateforme, pour mesurer l'étendue du Catalogue avant de le parcourir.
2. En tant que Visiteur, je veux voir la Note moyenne des Jeux, pour juger de leur qualité d'un coup d'œil.
3. En tant que Visiteur, je veux que le Résumé reste le même quand j'applique des Filtres, pour qu'il décrive toujours la plateforme et non ma sélection.
4. En tant que Visiteur qui a filtré, je veux lire encore « Showing N of M games » sous les Filtres, pour savoir quelle part du Catalogue j'ai sous les yeux.
5. En tant que Visiteur, je veux que la Note moyenne ne compte que les Jeux qui ont une Note, pour qu'un Jeu pas encore noté ne la tire pas vers zéro.
6. En tant que Visiteur, je veux que la Note moyenne soit arrondie au dixième, comme la Note d'un Jeu sur sa fiche, pour lire les deux de la même façon.
7. En tant que Visiteur, je veux que la Note moyenne s'affiche toujours avec une décimale (« 4.0 », pas « 4 »), pour reconnaître le format des Notes du site.
8. En tant que Visiteur, je veux que la Note moyenne reste entre 0 et 5 même si une Note est aberrante en base, pour qu'elle reste cohérente avec les Notes affichées sur les fiches.
9. En tant que Visiteur, je veux lire « 1 game » quand le Catalogue n'a qu'un Jeu, pour un texte correct en anglais.
10. En tant que Visiteur, je veux lire « No ratings yet » quand aucun Jeu n'a de Note, plutôt qu'une moyenne de 0 ou une valeur vide.
11. En tant que Visiteur d'une plateforme encore vide, je veux lire « 0 games · No ratings yet », cohérent avec le message « No games available at the moment. » sous les Filtres.
12. En tant qu'utilisateur d'un lecteur d'écran, je veux entendre « 21 games, 3.9 average rating », sans que l'étoile ni le séparateur soient lus.
13. En tant que Visiteur, je veux un Résumé discret, dans les couleurs de l'accueil, qui ne fasse concurrence ni au titre ni aux Jeux.
14. En tant que développeur, je veux que le Résumé soit calculé par un helper de la couche de données et prouvé par Vitest, puisque les postes de la formation n'ont pas de navigateur de test.
15. En tant que développeur, je veux que la taille du Catalogue ne soit calculée qu'à un seul endroit, pour que le Résumé et la ligne « Showing N of M games » ne puissent jamais se contredire.
16. En tant que développeur, je veux que la page d'accueil ne fasse toujours qu'un appel à la couche de données, comme l'a posé la spec des Filtres.
17. En tant que développeur d'un ticket parallèle (Recherche, Tri, Filtres), je veux que `total` garde son nom et son sens, pour que mes tests restent justes après la fusion.
18. En tant que testeur, je veux des `data-testid` sur le Résumé, son nombre de Jeux et sa Note moyenne, pour que les tests e2e futurs les ciblent.

## Décisions d'implémentation

### Portée

- Le Résumé décrit toujours tout le Catalogue. Ni les Filtres, ni la Recherche (01), ni le Tri (02), ni la pagination (06) ne le changent.
- La ligne « Showing N of M games » ne change ni de texte ni de place. Son M et le nombre du Résumé sont la même valeur.

### Calcul

- Le nombre de Jeux compte tous les Jeux du Catalogue, notés ou non.
- La Note moyenne est la moyenne arithmétique des Notes des Jeux qui en ont une. Un Jeu sans Note ne compte ni dans la somme, ni dans le nombre de Notes.
- Chaque Note entre dans la moyenne bornée à 0–5, telle que le site l'affiche : la règle de `clampRating`.
- Le helper arrondit la moyenne au dixième, au plus proche, la moitié vers le haut : il rend `3.9`, pas `3.904…`.
- Quand aucun Jeu n'a de Note, Catalogue vide compris, la Note moyenne vaut `null`, jamais `0` ni `NaN`.

### Modules

- **Le Résumé du Catalogue**, un nouveau module de la couche de données. `getCatalogSummary(db)` rend un `CatalogSummary` de forme `{ total: number; averageRating: number | null }`, calculé par une seule requête d'agrégat sur tous les Jeux.
- **Le Catalogue de l'accueil**, `getCatalog`, dans le module des Jeux :
  - sa requête de comptage est remplacée par l'appel à `getCatalogSummary` ;
  - il rend `{ games, total, averageRating, filters }`, et `total` garde son nom et son sens ;
  - l'interface `Catalog` gagne le champ `averageRating: number | null`.
  
  Rien d'autre ne change dans ce module : ni `getCatalogGames`, ni la zone entre `getAllGameIds` et `getGameById`, où le ticket 04 ajoute sa fonction.
- **La page d'accueil** fait toujours un seul appel, `getCatalog`. Le Résumé va dans l'emplacement libre du bandeau d'accueil, sous le sous-titre. Le titre de la page, « Featured Games », les Filtres, la ligne de résultats et la grille ne changent pas.
- Aucun changement de schéma ni de migration.

### Affichage

- Une seule ligne, en anglais : « 21 games · ★ 3.9 average rating ».
- Le nombre de Jeux : « 1 game » au singulier, « N games » sinon, « 0 games » compris.
- La Note moyenne : une étoile jaune, comme celle de la Note sur la fiche de jeu, puis la valeur, toujours avec une décimale (« 4.0 »), puis « average rating ».
- Sans Jeu noté, la ligne devient « 21 games · No ratings yet », sans étoile, et « 0 games · No ratings yet » pour un Catalogue vide. Le Résumé n'est jamais masqué.
- Le nombre de Jeux notés (« from 18 rated games ») n'est pas affiché.
- Le Résumé est un simple paragraphe. L'étoile et le point médian sont décoratifs, masqués aux lecteurs d'écran.
- Le style est plus discret que le sous-titre (un texte gris plus petit), avec les nombres en gras et plus clairs.
- `data-testid` : `catalog-summary` sur le paragraphe, `catalog-summary-total` sur « 21 games » et `catalog-summary-rating` sur la Note moyenne ou « No ratings yet ». Ceux qui existent, dont `page-hero` et `results-count`, ne changent pas.

## Décisions de test

- On teste ce que la page voit, pas la tuyauterie. Il y a deux points d'entrée, et seulement deux :
  1. `getCatalogSummary(db)`, qui prouve chaque règle de calcul :
     - le total compte tous les Jeux, notés ou non ;
     - la moyenne ignore les Jeux sans Note ;
     - l'arrondi au dixième (3.9, 4.0 et 4.0 donnent 4.0) ;
     - la borne 0–5 (une Note de 7 compte pour 5, une Note de -1 pour 0) ;
     - `null` quand aucun Jeu n'a de Note ;
     - `{ total: 0, averageRating: null }` sur un Catalogue vide.
  2. `getCatalog(db, searchParams)` avec un Filtre actif, qui prouve que `total` et `averageRating` sont ceux du Catalogue entier et non ceux des Jeux retenus.
- Les tests vivent dans un fichier à eux, à côté du nouveau module. Aucun test existant n'est modifié. Ceux de la famille Catégorie, qui vérifient `total` par `getCatalog`, doivent passer tels quels.
- Chaque test part d'une base en mémoire, migrée par `createTestDatabase()`, et y insère ses propres Catégories, Éditeurs et Jeux, sur le modèle des tests du module des Jeux et de la famille Catégorie. Le schéma ne contraint pas la Note : un test peut insérer `7`, `-1` ou `null`.
- Le paragraphe du Résumé ne passe pas par Vitest. On le vérifie à la main sur `npm run dev` :
  - le texte avec le seed : « 21 games · ★ 3.9 average rating » ;
  - le même Résumé avec un Filtre actif ;
  - la lecture dans l'arbre d'accessibilité.
  
  Les cas « 1 game », « No ratings yet » et « 0 games » demandent une base modifiée à la main ; supprimer ensuite `tailspin.db` pour revenir au seed. On n'écrit pas de nouveau test e2e et on ne lance pas Playwright.
- Le ticket est fini quand `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Hors périmètre

- Un résumé du résultat des Filtres, de la Recherche ou de la page courante.
- Le nombre de Jeux notés, la répartition des Notes, et un Résumé par Catégorie ou par Éditeur. Les compteurs par option restent hors périmètre, comme dans la spec des Filtres.
- Le singulier dans « Showing N of M games ».
- La Note sur la carte de Jeu.
- Un Résumé ailleurs que sur l'accueil : pages d'Éditeur, Concierge.
- La façon dont le seed attribue les Notes.
- Tout nouveau test e2e.

## Notes

- Pas d'ADR : aucune décision de ce ticket n'est à la fois difficile à défaire, surprenante sans contexte et le fruit d'un arbitrage. La règle de portée est écrite dans la définition du Résumé du Catalogue, dans le glossaire. Le numéro 0006, réservé au ticket, reste libre.
- Fusion avec la vague 2 : le 01 (`search`) et le 02 (`sort`) ajoutent eux aussi des champs à l'interface `Catalog` et au `return` de `getCatalog`. Ces conflits touchent plusieurs zones de `src/lib/games.ts` et de `src/pages/index.astro`, et se règlent à la main en gardant tous les champs et `getCatalogSummary` (voir le ticket et `backlog/dev-plan.md`, « Fusionner la vague 2 »).
- Le terme Note est défini à l'identique par le ticket 02 (Tri), au même endroit du glossaire : git fusionne les deux ajouts sans conflit, tant que personne ne le reformule d'un seul côté.
- Données actuelles : 21 Jeux, tous notés entre 3.0 et 5.0. La Note moyenne vaut 3.9.
