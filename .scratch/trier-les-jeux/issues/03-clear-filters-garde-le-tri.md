Status: ready-for-agent
Blocked by: 01, 02

# 03 : « Clear filters » garde le Tri

Spec : `../spec.md`. Architecture : ADR 0005.

## Ce qu'il faut construire

Le visiteur qui a trié le Catalogue puis choisi des Filtres clique sur « Clear filters », dans le formulaire ou dans le message « No games match these filters. ». Les Filtres s'effacent, et le Tri reste celui qu'il avait choisi, puisque le Tri n'est pas un Filtre.

Les deux liens tirent leur URL d'une fonction pure du module du Tri. Le ticket 01 du backlog y ajoutera la Recherche, que « Clear filters » garde aussi, et un lien « Clear search » : la branche fusionnée en second étend cette fonction.

Ce ticket ne dépend que du Tri. Il vient pourtant après le 02 : ses tests couvrent les Tris par Note, et il écrit dans les mêmes fichiers que le 02.

## Critères d'acceptation

- [x] Une fonction pure du module du Tri construit l'URL de « Clear filters » à partir du Tri retenu :
  - `/` au Tri par défaut (titre, croissant) ;
  - sinon `/?sortProperty=…&sortDirection=…`, avec les deux paramètres.
- [x] Les deux liens « Clear filters » tirent leur `href` de cette fonction :
  - celui du formulaire (`clear-filters`) ;
  - celui du message vide (`no-matching-games-clear-filters`).
- [x] Leurs `data-testid` ne changent pas.
- [x] Le fichier de test du module du Tri prouve, sans base de données, que la fonction rend `/` au Tri par défaut, et les deux paramètres pour chacun des trois autres Tris (titre décroissant, Note croissante, Note décroissante).
- [x] Les tests des tickets 01 et 02 passent sans changement.
- [x] On vérifie à la main, au clavier, sur `npm run dev` :
  - trier par « Rating » et « Descending », choisir une Catégorie, appliquer, puis activer « Clear filters » : tout le Catalogue s'affiche, toujours par Note décroissante, et les deux listes déroulantes montrent ce Tri ;
  - même chose depuis le message vide, avec `?category=99999&sortProperty=rating&sortDirection=desc` ;
  - au Tri par défaut, « Clear filters » mène à `/`.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
