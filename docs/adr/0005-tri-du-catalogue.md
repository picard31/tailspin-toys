# Le Tri du Catalogue est une propriété et un sens, hors des Filtres

L'accueil trie le Catalogue affiché (ticket 02) avec deux paramètres de la même URL que les Filtres (ADR 0001) : `sortProperty` (`title` ou `rating`) et `sortDirection` (`asc` ou `desc`). Chacun est lu à part : absent ou invalide, il prend sa valeur par défaut (`title`, `asc`) sans toucher l'autre, et la page ne renvoie jamais d'erreur. Sans paramètre, l'accueil reste donc trié par titre A→Z, comme avant.

Le Tri n'est pas un Filtre : il ne retire aucun Jeu. Il n'entre pas dans `CatalogFilters`, ne donne pas le titre « Filtered games », et « Clear filters » le garde : ses liens pointent vers `/` au Tri par défaut, et sinon vers `/?sortProperty=…&sortDirection=…`.

Sans JavaScript, deux paramètres demandent deux contrôles : un `<select>` « Sort by » et un `<select>` « Order », dans le formulaire des Filtres. Ils sont indépendants, si bien que les quatre combinaisons sont des Tris, la Note croissante comprise, et que leurs libellés restent génériques (« Ascending », « Descending »).

L'ordre est total, pour rester le même d'une visite à l'autre et servir tel quel à la pagination (06) :

- par titre : le titre, puis l'identifiant, tous deux dans le sens choisi ; Z→A est l'inverse exact de A→Z. Le titre garde l'ordre binaire de SQLite, celui de `getAllGames` ;
- par Note : la Note stockée, dans le sens choisi, puis le titre A→Z, puis l'identifiant croissant. Les Jeux sans Note viennent après tous les Jeux notés, dans les deux sens. La Note triée est la valeur en base, sans la borne 0–5 de l'affichage.

## Options écartées

- **Un seul paramètre à trois valeurs** (`sort=title-asc`, `title-desc` ou `rating-desc`) : il permettait un seul `<select>` aux libellés précis (« Title: A to Z », « Rating: highest first »). Deux paramètres l'ont emporté parce que la propriété et le sens se composent : une propriété triable de plus ajoute une option, pas une valeur par sens.
- **Interdire la Note croissante** : le formulaire proposerait une combinaison qui ne fait rien.
- **Des Jeux sans Note comptés comme 0** : ils se mêleraient aux Jeux mal notés, alors qu'on ne sait rien d'eux.
- **Des Jeux sans Note exclus du Tri par Note** : le Tri deviendrait un Filtre, et « Showing N of M games » changerait.
- **L'ordre naturel de SQLite** : `NULL` vient en tête en croissant, et les Jeux sans Note ouvriraient la Note croissante.
- **Un sens par défaut qui dépend de la propriété** (la Note en décroissant) : moins prévisible qu'un défaut par paramètre.
- **Du JavaScript pour adapter le libellé du sens à la propriété** (« A to Z », « Highest first ») : l'accueil fonctionne sans JavaScript (ADR 0001).

## Conséquences

- Le bouton du formulaire applique les Filtres et le Tri : il s'appelle « Apply », et garde son `data-testid="apply-filters"`.
- Aucun Jeu de `db/games.csv` n'est sans Note : seul Vitest prouve leur place. Les Jeux à Note égale sont nombreux, et le départage par titre se voit sur la page.
- Renommer un paramètre ou une valeur casse les URL partagées et les favoris.
