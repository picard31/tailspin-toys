Status: ready-for-agent

# La Page Éditeur : un Éditeur et tous ses Jeux

Source : `backlog/04-publisher-pages.md` (laissé intact). Vocabulaire : `GLOSSARY.md` (Page Éditeur, Fiche, Éditeur, Filtre). Décisions d'architecture : `docs/adr/0007-page-editeur-prerendue-a-cote-du-filtre.md`, et `docs/adr/0001-accueil-rendue-a-la-demande.md` pour l'accueil.

## Problème

Sur la Fiche d'un Jeu, le Visiteur lit le nom et la description de son Éditeur, mais rien ne le mène aux autres Jeux de cet Éditeur. Pour les trouver, il doit revenir à l'accueil et parcourir toutes les cartes, ou choisir l'Éditeur dans le Filtre, et il quitte alors l'Éditeur pour une liste du Catalogue. Aucun endroit du site ne présente un Éditeur.

## Solution

Chaque Éditeur a sa Page Éditeur, à l'adresse `/publisher/<id>`. Sur la Fiche, le bloc « About the publisher » porte un lien « All games by <nom> » qui y mène. La page montre le nom de l'Éditeur, sa description et tous ses Jeux, triés par titre, avec la carte de l'accueil. Un Éditeur qui n'a encore aucun Jeu a quand même sa page, avec un message qui le dit. La page est prérendue, comme la Fiche : elle s'affiche vite et sans JavaScript.

## User stories

1. En tant que visiteur, je veux un lien vers la Page Éditeur depuis la Fiche d'un Jeu, pour voir ce que la même société a publié d'autre.
2. En tant que visiteur, je veux ce lien dans le bloc « About the publisher », à côté de ce que je viens de lire sur l'Éditeur.
3. En tant que visiteur, je veux ce lien même quand l'Éditeur n'a pas de description, pour toujours pouvoir rejoindre sa page.
4. En tant que visiteur, je veux que le texte du lien nomme l'Éditeur, « All games by CodeForge Studios », pour savoir où il mène avant de cliquer.
5. En tant que visiteur, je veux que ce texte reste vrai quand l'Éditeur n'a publié que le Jeu que je regarde, pour ne pas me voir promettre d'autres Jeux qui n'existent pas.
6. En tant que visiteur, je veux que la Fiche garde ses Tags, la description du Jeu et celle de sa Catégorie, pour que rien d'autre n'y change.
7. En tant que visiteur, je veux que la carte d'un Jeu reste un seul lien vers sa Fiche, pour cliquer n'importe où sur la carte comme aujourd'hui.
8. En tant que visiteur, je veux que la Page Éditeur affiche le nom de l'Éditeur comme titre principal, pour savoir tout de suite de qui elle parle.
9. En tant que visiteur, je veux lire la description de l'Éditeur sous son nom, pour savoir qui il est.
10. En tant que visiteur, je veux qu'un Éditeur sans description n'affiche pas de texte vide, pour que la page ne paraisse pas cassée.
11. En tant que visiteur, je veux voir tous les Jeux de l'Éditeur, et seulement les siens, pour faire le tour de ce qu'il publie.
12. En tant que visiteur, je veux que ces Jeux soient triés par titre de A à Z, comme sur l'accueil par défaut, pour retrouver un Jeu dans un ordre que je connais.
13. En tant que visiteur, je veux que chaque Jeu apparaisse avec la même carte que sur l'accueil, pour le reconnaître et ouvrir sa Fiche d'un clic.
14. En tant que visiteur, je veux un titre « Games by <nom> » au-dessus de la grille, pour savoir ce que liste la page.
15. En tant que visiteur, je veux que l'onglet du navigateur porte le nom de l'Éditeur, pour retrouver la page parmi mes onglets et mes favoris.
16. En tant que visiteur, je veux un message « This publisher has no games yet. » quand l'Éditeur n'a aucun Jeu, plutôt qu'une grille vide.
17. En tant que visiteur, je veux un bouton « Back to all games », pour revenir au Catalogue d'un geste.
18. En tant que visiteur, je veux une adresse stable pour chaque Page Éditeur, pour la partager ou la mettre en favori.
19. En tant que visiteur qui ouvre l'adresse d'un Éditeur qui n'existe pas, je veux la page 404 du site, comme pour un Jeu inconnu.
20. En tant que visiteur, je veux que la Page Éditeur s'affiche sans JavaScript, puisqu'elle n'est faite que de texte et de liens.
21. En tant que visiteur, je veux que le Filtre Éditeur de l'accueil reste là pour combiner un Éditeur avec des Catégories, puisque la Page Éditeur présente un Éditeur et ne filtre rien.
22. En tant qu'utilisateur du clavier, je veux atteindre avec Tab le lien de la Fiche, chaque carte de la Page Éditeur et le bouton de retour, avec un focus toujours visible, pour naviguer sans souris.
23. En tant qu'utilisateur d'un lecteur d'écran, je veux un titre de niveau 1 au nom de l'Éditeur et un titre de niveau 2 au-dessus des Jeux, pour parcourir la page par ses titres.
24. En tant qu'utilisateur d'un lecteur d'écran, je veux un lien dont le texte se suffit à lui-même, pour le comprendre dans la liste des liens de la page.
25. En tant que développeur, je veux que la lecture des Jeux d'un Éditeur vive dans `src/lib/` et soit prouvée par Vitest, puisque les postes de la formation n'ont pas de navigateur de test.
26. En tant que développeur, je veux que la Fiche et la Page Éditeur appliquent la même règle à une description vide ou faite d'espaces, pour qu'un Éditeur ne montre pas sa description sur une page et la cache sur l'autre.
27. En tant que développeur, je veux que deux builds donnent le même site, avec des Éditeurs énumérés par nom et des Jeux triés par titre.
28. En tant que développeur, je veux que ce ticket n'utilise aucun code du Filtre Éditeur (07.2), pour livrer les deux en parallèle dans la vague 2.
29. En tant que développeur, je veux que ce ticket ne touche que des lignes que les autres branches de la vague 2 laissent intactes, pour le fusionner sans conflit.
30. En tant que testeur, je veux des `data-testid` sur la Page Éditeur, sa grille, son message vide et le lien de la Fiche, pour que les tests e2e futurs les ciblent.

## Décisions d'implémentation

### Architecture

- La Page Éditeur est prérendue (`getStaticPaths` et `prerender = true`), sur le modèle de la Fiche. L'ADR 0007 dit pourquoi elle l'est alors que l'accueil, qui affiche les mêmes Jeux avec le Filtre Éditeur, est rendu à la demande.
- Elle ne lit aucun paramètre d'URL. Elle ne reprend ni le formulaire de Filtres, ni la Recherche, ni le Tri, ni la ligne « Showing N of M games ». Aucun JavaScript.
- Elle n'utilise aucun code de la 07.2 : ni `getAllPublishers`, ni `getCatalogGames`, ni `getCatalog`.
- Aucun changement de schéma, de seed, de CSV ni de migration.

### Contrat d'URL

- `/publisher/<id>`, où `<id>` est l'identifiant numérique de l'Éditeur. Pas de slug, comme `/game/<id>` et le Filtre `?publisher=<id>`.
- `getStaticPaths` énumère tous les Éditeurs de la base, y compris ceux sans Jeu, triés par nom.
- Un identifiant qui n'est pas dans la base n'a pas de page : le site sert sa 404. Comme sur la Fiche, la page redirige vers `/404` quand la lecture rend `null`, un cas que `getStaticPaths` exclut mais que le typage exige.

### Modules

- **Le module des Jeux** gagne une seule fonction, `getPublisherGames(db, publisherId): Promise<Game[]>` :
  - elle rend les Jeux de cet Éditeur, triés par titre de A à Z, chacun avec sa Catégorie et son Éditeur ;
  - elle réutilise la requête et la conversion privées des listes, avec une condition d'égalité sur l'Éditeur ;
  - elle rend une liste vide pour un Éditeur sans Jeu ou un identifiant inconnu ;
  - elle est insérée entre `getAllGameIds` et `getGameById`, une zone que les specs du 02 (Tri) et du 05 (Résumé du Catalogue) laissent explicitement intacte. Les imports, `getAllGames`, `getCatalogGames`, `getCatalog` et l'interface `Catalog` ne changent pas.
- **Le module de la Fiche** exporte `shownDescription`, la règle qui transforme une description `null`, vide ou faite d'espaces en `null`. Elle gagne un TSDoc, et son comportement ne change pas, pas plus que `getGameDetails`.
- **Le module de la Page Éditeur**, nouveau, est le seul que la page appelle :
  - le type `PublisherPage`, `{ publisher: PublisherDetails; games: Game[] }`, déclaré dans ce module, comme `Catalog` l'est dans le module des Jeux ;
  - `getPublisherIds(db): Promise<number[]>` : les identifiants de tous les Éditeurs, triés par nom, pour `getStaticPaths` ;
  - `getPublisherPage(db, id): Promise<PublisherPage | null>` : l'Éditeur, avec sa description passée par `shownDescription`, et ses Jeux lus par `getPublisherGames`. Elle rend `null` quand aucun Éditeur n'a cet identifiant.
- Les types `PublisherDetails` et `Game` servent tels quels. Le module des types ne change pas.

### La Page Éditeur

- `<title>` : « <nom> - Tailspin Toys ». Un conteneur porte `data-testid="publisher-page"`.
- En tête, le composant `PageHero`, sans modification :
  - le nom de l'Éditeur en titre (`<h1>`, `page-hero-title`) ;
  - sa description en sous-titre (`page-hero-subtitle`), omise quand elle vaut `null`.
- Un `<h2>` « Games by <nom> », dans le style de « Featured Games » sur l'accueil.
- La grille a les classes de celle de l'accueil et porte `data-testid="publisher-games"`.
  - Chaque Jeu y est un `GameCard`, sans modification : la carte garde son Tag Éditeur, redondant ici.
- Sans Jeu, la grille laisse la place à un `EmptyState`. Son contenu passe par le slot : un `<p data-testid="publisher-no-games">` « This publisher has no games yet. ».
- En bas, le bouton « Back to all games », vers `/`, comme sur la Fiche.
- Rien d'autre :
  - pas de nombre de Jeux ;
  - pas de lien vers `/?publisher=<id>` ;
  - pas de page qui liste les Éditeurs ;
  - pas d'entrée dans le menu.

### La Fiche

- Le bloc « About the publisher » est présent dès que le Jeu a un Éditeur, qu'il ait une description ou non. Il contient :
  - son `<h2>` ;
  - le paragraphe de description (`game-details-publisher-description`), seulement quand la description n'est pas `null` ;
  - le lien « All games by <nom> » vers `/publisher/<id>`, avec `data-testid="game-details-publisher-link"`, un focus visible (`focus:ring-2 focus:ring-blue-500 focus:outline-none`) et la couleur des liens de texte du site (`text-blue-400`, souligné au survol).
- C'est une modification de la règle du ticket 03, pour ce seul bloc. Le bloc « About the category » ne change pas : il reste absent quand sa description vaut `null`.
- Les Tags de la Catégorie et de l'Éditeur, la description du Jeu et le `getStaticPaths` de la Fiche ne changent pas.
- La carte de Jeu ne change pas : un lien dans son grand lien serait un lien imbriqué, du HTML invalide.

## Décisions de test

- On teste ce que la page voit, pas la tuyauterie. Il y a deux points d'entrée, ceux que la page appelle, et seulement deux, dans le fichier de test du module de la Page Éditeur :
  1. `getPublisherPage(db, id)` :
     - le cas nominal : le nom, la description et les seuls Jeux de cet Éditeur, alors qu'un autre Éditeur a des Jeux dans la même base ;
     - le tri par titre de A à Z ;
     - chaque Jeu rendu avec sa Catégorie et son Éditeur ;
     - un Éditeur sans Jeu, qui rend `games: []` ;
     - un identifiant inconnu, qui rend `null` ;
     - avec `it.each`, une description `null`, `''` ou `'   '`, qui donne `null` ;
  2. `getPublisherIds(db)` : tous les Éditeurs, y compris ceux sans Jeu, triés par nom.
- `getPublisherGames` et `shownDescription` ne sont pas testées directement : `getPublisherPage` les couvre, et un test qui les viserait casserait au premier remaniement sans rien prouver de plus. Les tests du module des Jeux et du module de la Fiche ne changent pas.
- Chaque test part d'une base en mémoire, migrée par `createTestDatabase()`, et y insère ses propres Catégories, Éditeurs et Jeux. Les Jeux et les Éditeurs sont insérés dans l'ordre inverse de l'ordre attendu, et les identifiants récupérés avec `returning`.
- Les modèles sont :
  - le fichier de test du module de la Fiche, pour la base en mémoire et l'`it.each` des descriptions ;
  - celui du module des Jeux, pour la preuve d'un tri.
- Les pages Astro ne passent pas par Vitest. On les vérifie à la main, au clavier, sur `npm run dev` :
  - sur une Fiche : le bloc « About the publisher », son lien et son focus visible ;
  - la Page Éditeur de chacun des quatre Éditeurs du seed : le nom, la description, les Jeux par titre et le bouton de retour ;
  - la tabulation sur les cartes ;
  - la 404 de `/publisher/9999`.

  On n'écrit pas de nouveau test e2e et on ne lance pas Playwright.
- Le travail est fini quand `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Hors périmètre

- Un lien vers la Page Éditeur sur la carte de Jeu : ce serait un lien imbriqué.
- Le Tag Éditeur de la Fiche transformé en lien.
- Les slugs dans l'URL.
- Une page qui liste tous les Éditeurs, et une entrée de menu.
- Sur la Page Éditeur :
  - les Filtres, la Recherche, le Tri, la pagination et la ligne « Showing N of M games » ;
  - un lien vers le Filtre Éditeur de l'accueil ;
  - le nombre de Jeux de l'Éditeur ou leur Note moyenne (le Résumé du Catalogue est le ticket 05) ;
  - le retrait du Tag Éditeur des cartes.
- Les pages de Catégorie.
- De vraies descriptions d'Éditeur : le seed garde son texte de remplissage, et le CSV ne change pas.
- Tout JavaScript côté navigateur.
- Tout nouveau test e2e, y compris le contrôle axe de la nouvelle page.

## Notes

- Le seed crée quatre Éditeurs, avec cinq ou six Jeux chacun, et donne à chacun une description de remplissage. Seul Vitest prouve l'Éditeur sans Jeu et la description `null` ; on ne les voit pas sur `npm run dev`.
- Prérendue, la Page Éditeur montre la base telle qu'elle était au build, comme la Fiche, alors que l'accueil la lit à chaque visite. Après un changement du CSV, il faut supprimer `tailspin.db` et reconstruire le site.
- `backlog/dev-plan.md` range `src/types/game.ts` (`PublisherDetails`) parmi les fichiers du 04. Finalement, le module des types ne change pas : `PublisherPage` vit dans le module de la Page Éditeur.
- Fusion de la vague 2 : aucun conflit attendu.
  - La fonction ajoutée au module des Jeux va dans une zone que les specs du 02 et du 05 réservent au 04.
  - Le module de la Fiche, la Fiche elle-même et les nouveaux fichiers ne sont touchés par aucune autre branche.
  - La 07.2 crée sa propre famille Éditeur, sans lien avec ce ticket.
- Le glossaire a gagné **Fiche** et **Page Éditeur**. La définition d'**Éditeur** admet maintenant un Éditeur qui n'a encore aucun Jeu.
