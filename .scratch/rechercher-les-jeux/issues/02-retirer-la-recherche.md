Status: ready-for-agent
Blocked by: 01

# 02 : Retirer la Recherche, ou les seuls Filtres

Spec : `../spec.md`. Vocabulaire : Recherche et Filtre, dans `GLOSSARY.md`.

## Ce qu'il faut construire

Quand une Recherche est active, un lien « Clear search » apparaît à côté du champ et dans le message vide : il retire la Recherche et garde les Filtres. « Clear filters », lui, efface les Filtres et garde la Recherche, puisqu'une Recherche n'est pas un Filtre. Le message vide ne propose que les liens qui changent quelque chose.

Les deux `href` viennent de `getCatalog`, qui reste le seul appel de la page et le seul point de test.

## Critères d'acceptation

- [ ] `getCatalog(db, searchParams)` rend aussi `clearSearchHref` et `clearFiltersHref`, et l'interface `Catalog` suit.
- [ ] `clearSearchHref` est l'URL de l'accueil avec les paramètres courants, moins toutes les occurrences de `search` et moins les paramètres vides, ou `/` s'il ne reste rien. Elle garde ainsi d'elle-même la Catégorie, et plus tard l'Éditeur (07.2) et le Tri (02 du backlog).
- [ ] `clearFiltersHref` vaut `/` sans Recherche, et `/?search=<Recherche retenue>`, encodée, avec. Elle ne garde que ce qui n'est pas un Filtre.
- [ ] À côté du champ de Recherche, seulement quand une Recherche est active : un lien « Clear search » vers `clearSearchHref`, avec `data-testid="clear-search"`.
- [ ] Le lien « Clear filters » du formulaire pointe vers `clearFiltersHref` au lieu de `/`. Son `data-testid` ne change pas.
- [ ] Dans le message vide : « Clear search » (`data-testid="no-matching-games-clear-search"`, vers `clearSearchHref`) quand une Recherche est active, et « Clear filters » (`no-matching-games-clear-filters`, vers `clearFiltersHref`) quand des Filtres sont actifs. Les deux apparaissent quand une Recherche et des Filtres le sont.
- [ ] Les deux liens ont le même focus visible que les autres liens du formulaire. On vérifie à la main, au clavier, sur `npm run dev` : « Clear search » garde la Catégorie choisie, « Clear filters » garde la Recherche, et le message vide montre les bons liens dans les trois cas (Recherche seule, Filtres seuls, les deux).
- [ ] Le fichier de test de la Recherche prouve, à travers `getCatalog` : `clearSearchHref` sans `search` (toutes ses occurrences), sans les paramètres vides, avec `category` gardé, et `/` quand il ne reste rien ; `clearFiltersHref` à `/` sans Recherche, et avec la Recherche retenue, encodée (une Recherche avec une espace), quand elle est active.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## À la fusion avec le 02 du backlog (Tri)

Le 02 construit le `href` de « Clear filters » par sa propre fonction, qui garde le Tri. La branche fusionnée en second réunit les deux : après fusion, « Clear filters » garde la Recherche **et** le Tri.
