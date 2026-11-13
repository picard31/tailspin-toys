Status: ready-for-agent
Blocked by: aucun (peut démarrer tout de suite)

# 01 : Rechercher un Jeu par son titre

Spec : `../spec.md`. Architecture : ADR 0001. Vocabulaire : Recherche, dans `GLOSSARY.md`.

## Ce qu'il faut construire

En tête du formulaire de Filtres de l'accueil, le Visiteur tape une partie du titre d'un Jeu dans le champ « Search by title », puis appuie sur Entrée ou clique sur « Apply ». La page se recharge avec les seuls Jeux dont le titre contient ce texte, sans tenir compte de la casse, et parmi ceux que les Filtres retiennent. L'URL porte la Recherche, le champ la montre après le rechargement, et le titre de la page comme le message vide la citent. Sans Recherche, la page est la même qu'aujourd'hui.

La Recherche n'est pas un Filtre : elle a son propre module et n'entre pas dans le type des Filtres. Le ticket 02 ajoutera les liens pour la retirer ; d'ici là, « Clear filters » ramène encore à `/` et efface donc aussi la Recherche.

## Critères d'acceptation

- [x] En tête du formulaire de Filtres, avant les familles de Filtres : un `<label>` visible « Search by title », relié à un `<input type="search" name="search">`, avec `data-testid="search-input"`.
- [x] Le champ n'a pas de bouton à lui : Entrée envoie le formulaire. Rien ne s'envoie pendant la frappe, et il n'y a pas de JavaScript.
- [x] Le bouton « Apply filters » devient « Apply », avec `data-testid="apply-filters"` inchangé. Seul le texte de sa ligne change, à l'identique de ce que fait le ticket 02 (Tri) du backlog, pour que git fusionne les deux sans conflit.
- [x] `?search=<texte>` n'affiche que les Jeux dont le titre contient le texte, triés par titre, et le champ montre la Recherche retenue après le rechargement.
- [x] La correspondance ignore la casse des lettres ASCII et cherche la phrase en entier : « server sim » trouve « Virtual Server Simulator », « simulator server » ne le trouve pas.
- [x] La Recherche est prise littéralement : `%`, `_` et le caractère d'échappement sont échappés dans le `LIKE`. « 50% » ne trouve que les titres qui contiennent « 50% ».
- [x] La Recherche et les Filtres se combinent par ET : `?search=repo&category=<id>` n'affiche que les Jeux de cette Catégorie dont le titre contient « repo ».
- [x] Les valeurs abîmées ne provoquent jamais d'erreur : seule la première occurrence de `search` compte, les espaces au début et à la fin sont retirés, et une valeur vide ou faite d'espaces veut dire « pas de Recherche » (tout le Catalogue).
- [x] La ligne « Showing N of M games » compte les Jeux trouvés, sans changer de texte.
- [x] Le `<title>` devient « Search results for "repo" - Tailspin Toys » dès qu'une Recherche est active, avec ou sans Filtres. Sinon, il ne change pas.
- [x] Quand rien ne correspond, `data-testid="no-matching-games"` affiche « No games match "repo". » pour une Recherche seule, « No games match "repo" with these filters. » pour une Recherche et des Filtres, et « No games match these filters. », comme aujourd'hui, pour des Filtres seuls. « No games available at the moment. » reste réservé au Catalogue vide.
- [x] La Recherche vit dans son propre module de la couche de données : la lecture de `search`, qui rend la Recherche retenue (le texte nettoyé, ou `null`), et la condition SQL, qui rend `undefined` sans Recherche. Elle n'entre ni dans `CatalogFilters` ni dans `hasActiveFilters`.
- [x] `getCatalogGames(db, filters, search)` ajoute la condition de la Recherche dans son `and(...)`. `getCatalog(db, searchParams)` rend `{ games, total, filters, search }`, l'interface `Catalog` suit, et la page d'accueil n'appelle toujours que lui.
- [x] Le champ a le même focus visible que les autres contrôles du formulaire. On vérifie à la main, au clavier, sur `npm run dev` : Entrée dans le champ, champ pré-rempli après rechargement, combinaison avec une Catégorie, titre de la page et message vide.
- [x] Le fichier de test de la Recherche, à côté de celui de la famille Catégorie, prouve à travers `getCatalog`, sur une base en mémoire qui insère ses propres Jeux : la sous-chaîne, la casse ignorée, la phrase entière, les jokers pris littéralement (un titre de test contient `%` ou `_`), le ET avec une Catégorie, le tri par titre, `total`, `search` (`null` sans Recherche) et chaque cas de valeur abîmée.
- [x] Ces tests vérifient les champs de `getCatalog` un à un, sans comparer l'objet en entier : le ticket 02 y ajoute deux champs sans les casser.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
