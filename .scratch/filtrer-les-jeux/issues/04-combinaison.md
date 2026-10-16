Status: ready-for-agent
Blocked by: 02, 03

# 04 : Combiner Catégories et Éditeur

Spec : `../spec.md`.

## Ce qu'il faut construire

Le visiteur coche plusieurs Catégories **et** choisit un Éditeur : il voit les Jeux de cet Éditeur qui appartiennent à l'une des Catégories cochées. Une fois 02 et 03 fusionnés, la combinaison fonctionne déjà, puisque `getCatalogGames` assemble les conditions des familles par ET. Ce ticket la **prouve** et clôt le ticket 07 du backlog. Il ne contient pas de code de production, sauf si un test révèle un défaut ; dans ce cas, on corrige le défaut dans le module concerné.

## Critères d'acceptation

- [ ] Le fichier de test du module des Jeux prouve, à travers `getCatalog`, sur une base en mémoire où plusieurs Éditeurs publient dans plusieurs Catégories :
  - [ ] deux Catégories et un Éditeur donnent les Jeux de cet Éditeur dans l'une ou l'autre Catégorie, et rien d'autre, triés par titre ;
  - [ ] une combinaison sans Jeu correspondant donne une liste vide, sans changer `total` ;
  - [ ] les Filtres retenus contiennent à la fois les Catégories et l'Éditeur ;
  - [ ] une valeur invalide dans une famille ne retire pas le Filtre de l'autre famille.
- [ ] On vérifie à la main, au clavier, sur `npm run dev` : `/?category=…&category=…&publisher=…` coche les bonnes cases et sélectionne le bon Éditeur, la ligne « Showing N of M games » est juste, le titre de page indique le filtrage, et « Clear filters » remet les deux familles à zéro.
- [ ] Chaque critère d'acceptation de `backlog/07-filter-games.md` est couvert et coché.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
