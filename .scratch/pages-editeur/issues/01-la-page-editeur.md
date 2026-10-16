Status: ready-for-agent
Blocked by: aucun (peut démarrer tout de suite)

# 01 : La Page Éditeur

Spec : `../spec.md`. Vocabulaire : `GLOSSARY.md`. Décision d'architecture : ADR 0007.

## Ce qu'il faut construire

Le visiteur ouvre `/publisher/<id>` et voit la Page Éditeur. Elle commence par le nom et la description de l'Éditeur, puis montre tous ses Jeux triés par titre, avec la carte de l'accueil. Un Éditeur sans Jeu a sa page, avec un message qui le dit. La page est prérendue pour chaque Éditeur de la base. Aucun lien n'y mène encore : le ticket 02 l'ajoute sur la Fiche. On la vérifie en tapant l'URL.

Ce ticket pose toute la lecture des données. Il n'utilise aucun code du Filtre Éditeur (07.2), livré en parallèle.

## Critères d'acceptation

- [ ] Chaque Éditeur de la base, y compris celui sans Jeu, a sa Page Éditeur à `/publisher/<id>`, prérendue avec `getStaticPaths` et `prerender = true`. `getStaticPaths` énumère les Éditeurs avec `getPublisherIds`, triés par nom.
- [ ] La page ne fait qu'un appel, `getPublisherPage(db, id)`. Elle redirige vers `/404` quand il rend `null`, comme la Fiche. `/publisher/9999` mène à la 404 du site.
- [ ] La page a pour `<title>` « <nom> - Tailspin Toys », et un conteneur porte `data-testid="publisher-page"`.
- [ ] En tête, le composant `PageHero`, sans modification, montre le nom de l'Éditeur en `<h1>` et sa description en sous-titre. Le sous-titre est absent quand la description vaut `null`.
- [ ] Un `<h2>` « Games by <nom> », dans le style de « Featured Games » sur l'accueil, précède la grille.
- [ ] La grille a les classes de celle de l'accueil et porte `data-testid="publisher-games"`. Chaque Jeu y est un `GameCard` sans modification.
- [ ] Sans Jeu, la grille laisse la place à un `EmptyState`, dont le slot contient un `<p data-testid="publisher-no-games">` « This publisher has no games yet. ».
- [ ] En bas, le bouton « Back to all games » mène à `/`, comme sur la Fiche, et porte `data-testid="publisher-back-link"`.
- [ ] Le module des Jeux gagne `getPublisherGames(db, publisherId)`, sa seule modification :
  - [ ] la fonction rend les Jeux de cet Éditeur, triés par titre de A à Z, chacun avec sa Catégorie et son Éditeur, et une liste vide quand il n'en a aucun ;
  - [ ] elle réutilise la requête et la conversion privées des listes ;
  - [ ] elle est insérée entre `getAllGameIds` et `getGameById`, une zone que les specs du 02 et du 05 laissent au 04 ;
  - [ ] les imports, `getAllGames`, `getCatalogGames`, `getCatalog` et l'interface `Catalog` ne changent pas.
- [ ] Le module de la Fiche exporte `shownDescription`, avec un TSDoc. Ni son comportement ni `getGameDetails` ne changent.
- [ ] Un nouveau module de la Page Éditeur déclare :
  - [ ] le type `PublisherPage`, `{ publisher: PublisherDetails; games: Game[] }` ;
  - [ ] `getPublisherIds(db)`, qui rend les identifiants de tous les Éditeurs, triés par nom ;
  - [ ] `getPublisherPage(db, id)`, qui rend l'Éditeur, avec sa description passée par `shownDescription`, et ses Jeux lus par `getPublisherGames`, ou `null` quand aucun Éditeur n'a cet identifiant.

  Chaque fonction exportée a son TSDoc.
- [ ] Le module des types ne gagne aucun type : seul le commentaire de `PublisherDetails` s'élargit à la Page Éditeur. Aucun code de la 07.2 n'est utilisé (`getAllPublishers`, `getCatalogGames`, `getCatalog`). Aucun changement de schéma, de seed, de CSV ni de migration.
- [ ] Le fichier de test du module de la Page Éditeur prouve, sur une base en mémoire créée par `createTestDatabase()`, avec des Éditeurs et des Jeux insérés dans un ordre qui n'est ni l'ordre attendu ni son inverse :
  - [ ] que `getPublisherPage` rend le nom, la description et les seuls Jeux de cet Éditeur, alors qu'un autre Éditeur a des Jeux dans la même base ;
  - [ ] que ces Jeux sont triés par titre de A à Z, chacun avec sa Catégorie et son Éditeur ;
  - [ ] qu'un Éditeur sans Jeu rend `games: []` ;
  - [ ] qu'un identifiant inconnu rend `null` ;
  - [ ] avec `it.each`, qu'une description `null`, `''` ou `'   '` donne `null` ;
  - [ ] que `getPublisherIds` rend tous les Éditeurs, y compris ceux sans Jeu, triés par nom.
- [ ] `getPublisherGames` et `shownDescription` ne sont pas testées directement. Les tests du module des Jeux et du module de la Fiche passent sans modification.
- [ ] On vérifie à la main, sur `npm run dev` :
  - [ ] la Page Éditeur de chacun des quatre Éditeurs du seed : le nom, la description, les Jeux par titre et le bouton de retour ;
  - [ ] au clavier, Tab passe par chaque carte puis par le bouton, avec un focus visible ;
  - [ ] `/publisher/9999` mène à la 404.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
