Status: ready-for-agent
Blocked by: 01

# 03 : Filtrer le Catalogue par plusieurs Catégories

Spec : `../spec.md`.

## Ce qu'il faut construire

Le visiteur coche une ou plusieurs Catégories, clique sur « Apply filters » et voit les Jeux de l'une **ou** de l'autre, triés par titre. Si aucune case n'est cochée, il voit tout le Catalogue. Les cases cochées le restent après le rechargement.

Ce ticket est livré en parallèle du ticket 02, dans un autre worktree. Il ne modifie **que** les fichiers de la famille Catégorie : sa lecture de `category`, son composant et son fichier de test. Le type des Filtres et la condition SQL acceptent déjà une liste depuis le ticket 01, et ce ticket ne doit toucher à aucun fichier partagé ni à la famille Éditeur.

## Critères d'acceptation

- [ ] Le `<fieldset>` « Category » propose une case à cocher par Catégorie, triées par nom, à la place des boutons radio. L'option « All categories » disparaît.
- [ ] `?category=<id>&category=<id>` affiche les Jeux de toutes les Catégories choisies (OU), triés par titre, et les cases correspondantes sont cochées après le rechargement.
- [ ] Aucune case cochée : tout le Catalogue s'affiche, et non aucun Jeu.
- [ ] Toutes les valeurs valides de `category` sont gardées, et les doublons sont fusionnés. Une valeur non numérique ou vide est ignorée. Un identifiant inconnu est gardé : seul, il mène au message vide ; mêlé à une Catégorie connue, il laisse s'afficher les Jeux de celle-ci.
- [ ] Le `data-testid` `category-option` est posé sur chaque case à cocher.
- [ ] Les cases ont un focus visible. On vérifie à la main, au clavier, sur `npm run dev`, qu'on peut cocher plusieurs cases, appliquer, et que « Clear filters » les décoche toutes.
- [ ] Le fichier de test de la famille Catégorie prouve, à travers `getCatalog` : le OU entre deux Catégories ou plus, le tri par titre sur le résultat combiné, `total`, les Filtres retenus, la fusion des doublons, le mélange de valeurs valides et invalides, et l'identifiant inconnu mêlé à un identifiant connu. Les tests du ticket 01 qui supposaient « seule la première valeur compte » sont remplacés.
- [ ] Comme ceux du ticket 01, ces tests vérifient `filters.categoryIds` sans comparer l'objet des Filtres en entier, que le ticket 02 complète en parallèle.
- [ ] Aucun fichier en dehors de la famille Catégorie n'est modifié.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
