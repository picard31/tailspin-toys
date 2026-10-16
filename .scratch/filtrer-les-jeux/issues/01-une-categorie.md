Status: ready-for-agent
Blocked by: aucun (peut démarrer tout de suite)

# 01 : Filtrer le Catalogue par une Catégorie

Spec : `../spec.md`. Architecture : ADR 0001.

## Ce qu'il faut construire

Sur la page d'accueil, le visiteur choisit une Catégorie dans un formulaire de Filtres, clique sur « Apply filters » et ne voit plus que les Jeux de cette Catégorie, triés par titre. L'URL porte le Filtre, la page indique combien de Jeux sont affichés sur le total, et un lien « Clear filters » ramène à tout le Catalogue. Sans Filtre, la page est la même qu'aujourd'hui.

Ce ticket pose tout ce qui est partagé par les Filtres : la page d'accueil rendue à la demande, le formulaire, le type des Filtres et leur lecture depuis l'URL, `getCatalog` et `getCatalogGames`, la ligne de résultats, le titre de page et le message vide. Les tickets 02 et 03 s'y brancheront.

## Critères d'acceptation

- [x] La page d'accueil est rendue à la demande. Sans paramètre, elle affiche tout le Catalogue sous « Featured Games », avec le titre de page actuel.
- [x] Un formulaire `GET` vers la page d'accueil contient un `<fieldset>` dont la `<legend>` est « Category » : un bouton radio « All categories » en premier, puis un bouton radio par Catégorie, triées par nom. Il contient aussi un bouton « Apply filters » et un lien « Clear filters » vers `/`.
- [x] Rien ne s'envoie quand on change de choix : seul le bouton applique les Filtres. Il n'y a pas de JavaScript.
- [x] `?category=<id>` n'affiche que les Jeux de cette Catégorie, triés par titre, et le bouton radio correspondant est coché après le rechargement.
- [x] La ligne visible « Showing N of M games » donne le nombre de Jeux affichés et la taille du Catalogue.
- [x] Le `<title>` devient « Filtered games - Tailspin Toys » quand une Catégorie est choisie.
- [x] Quand une Catégorie est choisie mais qu'aucun Jeu ne correspond, la page affiche « No games match these filters. ». Le message « No games available at the moment. » reste réservé au Catalogue vide.
- [x] Les valeurs invalides ne provoquent jamais d'erreur : une valeur non numérique ou vide (comme celle de « All categories ») est ignorée, et un identifiant inconnu est gardé, ce qui mène au message vide. Dans ce ticket, seule la première valeur valide de `category` est retenue.
- [x] Le type des Filtres porte déjà les Catégories sous forme de **liste** d'identifiants, et la condition SQL de la famille Catégorie est une appartenance à cette liste. Le ticket 03 n'aura ainsi à toucher ni au type ni à la requête.
- [x] `getCatalog(db, searchParams)` rend `{ games, total, filters }` et la page d'accueil n'appelle que lui. Il s'appuie sur `getCatalogGames(db, filters)`, qui assemble les conditions des familles par ET.
- [x] `getAllCategories(db)` rend toutes les Catégories, triées par nom.
- [x] La famille Catégorie vit dans ses propres modules : la lecture de `category`, la condition SQL, `getAllCategories`, le composant `CategoryFilter` qui va chercher ses options lui-même, et un fichier de test à part. Le formulaire est prêt à recevoir une seconde famille d'une seule ligne.
- [x] Les `data-testid` sont posés : `catalog-filters`, `category-filter`, `category-option`, `apply-filters`, `clear-filters`, `results-count` et `no-matching-games`. `games-grid` et `game-card` ne changent pas.
- [x] Tous les contrôles ont un focus visible, dans le style du bouton du menu de l'en-tête. On vérifie à la main, au clavier, sur `npm run dev`, qu'on peut choisir une Catégorie, appliquer et effacer.
- [x] Le fichier de test de la famille Catégorie prouve, à travers `getCatalog`, sur une base en mémoire : le Catalogue entier sans paramètre, le filtrage par une Catégorie, le tri par titre, `total`, les Filtres retenus et chaque cas de valeur invalide. Il prouve aussi que `getAllCategories` rend une liste complète et triée.
- [x] Ces tests vérifient les Catégories retenues (`filters.categoryIds`), sans comparer l'objet des Filtres en entier : le ticket 02 y ajoute l'Éditeur sans toucher aux fichiers de la famille Catégorie.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
