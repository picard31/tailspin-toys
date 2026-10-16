Status: ready-for-agent
Blocked by: 01

# 02 : Filtrer le Catalogue par Éditeur

Spec : `../spec.md`.

## Ce qu'il faut construire

Dans le formulaire de Filtres, le visiteur choisit un Éditeur dans une liste déroulante, clique sur « Apply filters » et ne voit plus que les Jeux de cet Éditeur, triés par titre. L'URL porte le Filtre, et l'Éditeur choisi reste sélectionné après le rechargement.

Ce ticket est livré en parallèle du ticket 03, dans un autre worktree. Il crée la famille Éditeur, et c'est le **seul** des deux à modifier les fichiers partagés : le type des Filtres, leur lecture, `getCatalogGames` et le formulaire, une ligne dans chacun. Il ne touche à aucun fichier de la famille Catégorie.

## Critères d'acceptation

- [ ] Le formulaire de Filtres contient un `<label>` « Publisher » relié à un `<select>`, dont la première option est « All publishers ». Les options suivantes sont tous les Éditeurs, triés par nom.
- [ ] `?publisher=<id>` n'affiche que les Jeux de cet Éditeur, triés par titre, et cet Éditeur est sélectionné après le rechargement.
- [ ] La ligne « Showing N of M games », le titre « Filtered games - Tailspin Toys » et le message « No games match these filters. » s'appliquent quand un Éditeur est choisi.
- [ ] Les valeurs invalides ne provoquent jamais d'erreur : une valeur non numérique ou vide (comme celle de « All publishers ») est ignorée, seule la première valeur valide de `publisher` compte, et un identifiant inconnu est gardé, ce qui mène au message vide.
- [ ] Le type des Filtres prend sa forme finale : `{ categoryIds: number[]; publisherId: number | null }`. `getCatalogGames` ajoute la condition d'égalité de l'Éditeur par ET.
- [ ] `getAllPublishers(db)` rend tous les Éditeurs, triés par nom.
- [ ] La famille Éditeur vit dans ses propres modules : la lecture de `publisher`, la condition SQL, `getAllPublishers`, le composant `PublisherFilter` qui va chercher ses options lui-même, et un fichier de test à part.
- [ ] Le `data-testid` `publisher-filter` est posé sur le `<select>`.
- [ ] Le `<select>` a un focus visible. On vérifie à la main, au clavier, sur `npm run dev`, qu'on peut choisir un Éditeur, appliquer, et que « Clear filters » efface ce choix.
- [ ] Le fichier de test de la famille Éditeur prouve, à travers `getCatalog`, avec des paramètres de la seule famille Éditeur : le filtrage par un Éditeur, le tri par titre, `total`, les Filtres retenus et chaque cas de valeur invalide. Il prouve aussi que `getAllPublishers` rend une liste complète et triée. La combinaison avec les Catégories est testée dans le ticket 04.
- [ ] Aucun fichier de la famille Catégorie n'est modifié.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
