Status: ready-for-agent

# Rechercher un Jeu par son titre

Source : `backlog/01-search-games.md` (laissé intact). Vocabulaire : `GLOSSARY.md` (Recherche, Filtre, Catalogue). Décision d'architecture : `docs/adr/0001-accueil-rendue-a-la-demande.md`.

## Problème

Le Visiteur qui sait déjà quel Jeu il cherche doit parcourir toutes les cartes de l'accueil, ou deviner sa Catégorie pour réduire la liste avec les Filtres. Les Filtres ne choisissent que parmi des valeurs connues, la Catégorie ou l'Éditeur : rien ne lui permet de taper le peu qu'il retient d'un titre, « repo » ou « server ».

## Solution

En tête du formulaire de Filtres, un champ « Search by title » reçoit une Recherche. Le Visiteur tape quelques lettres d'un titre et appuie sur Entrée, ou clique sur « Apply ». La page se recharge avec les seuls Jeux dont le titre contient ce texte, quelle que soit la casse, et parmi ceux que les Filtres retiennent déjà. L'URL porte la Recherche, ce qui permet de la partager ou de la mettre en favori. Si aucun Jeu ne correspond, un message le dit en citant la Recherche, avec un lien pour la retirer. Tout fonctionne au clavier et sans JavaScript.

## User stories

1. En tant que Visiteur, je veux taper une partie du titre d'un Jeu, pour le trouver sans parcourir tout le Catalogue.
2. En tant que Visiteur, je veux que la Recherche ignore la casse, pour trouver « Server Siege » en tapant « server » ou « SERVER ».
3. En tant que Visiteur, je veux que la Recherche trouve le texte n'importe où dans le titre, pour trouver « Virtual Server Simulator » en tapant « server ».
4. En tant que Visiteur, je veux que plusieurs mots soient cherchés ensemble, comme une phrase, pour que « server sim » trouve « Virtual Server Simulator ».
5. En tant que Visiteur, je veux que les caractères que je tape soient pris tels quels, pour qu'une saisie comme « 50% » ou « _ » ne trouve pas tous les Jeux.
6. En tant que Visiteur, je veux que les espaces tapés au début ou à la fin ne comptent pas, pour qu'une espace en trop ne vide pas la liste.
7. En tant que Visiteur, je veux qu'une Recherche vide, ou faite seulement d'espaces, affiche tout le Catalogue, pour que valider un champ vide ne me montre pas une liste vide.
8. En tant que Visiteur, je veux lancer la Recherche avec la touche Entrée, pour ne pas quitter le clavier.
9. En tant que Visiteur, je veux que le bouton du formulaire applique en même temps ma Recherche et mes Filtres, pour n'avoir qu'un geste à faire.
10. En tant que Visiteur, je veux que la Recherche cherche parmi les Jeux que mes Filtres retiennent, pour trouver « repo » parmi les seuls Jeux de Strategy.
11. En tant que Visiteur, je veux qu'après le rechargement le champ montre ma Recherche, pour savoir ce qui restreint la liste.
12. En tant que Visiteur, je veux que la page ne change pas pendant que je tape, pour ne pas perdre le fil de ma saisie.
13. En tant que Visiteur, je veux que la ligne « Showing N of M games » compte les Jeux trouvés, pour savoir quelle part du Catalogue ma Recherche retient.
14. En tant que Visiteur, je veux le message « No games match "repo". » quand rien ne correspond à ma Recherche, pour comprendre que c'est ma saisie qui vide la liste.
15. En tant que Visiteur, je veux le message « No games match "repo" with these filters. » quand ma Recherche et mes Filtres ne retiennent rien ensemble, pour savoir que les deux comptent.
16. En tant que Visiteur, je veux que le message « No games available at the moment. » reste réservé au Catalogue vide, pour ne pas confondre une Recherche sans résultat avec un site sans Jeux.
17. En tant que Visiteur, je veux un lien « Clear search » à côté du champ quand une Recherche est active, pour la retirer d'un geste en gardant mes Filtres et mon Tri.
18. En tant que Visiteur, je veux le lien « Clear search » dans le message vide, pour repartir sans retaper l'URL.
19. En tant que Visiteur, je veux que « Clear filters » garde ma Recherche, puisqu'une Recherche n'est pas un Filtre.
20. En tant que Visiteur, je veux que le message vide ne me propose « Clear filters » que si des Filtres sont actifs, pour ne voir que les liens qui changent quelque chose.
21. En tant que Visiteur, je veux que l'URL décrive ma Recherche, pour la partager ou la retrouver en favori.
22. En tant que Visiteur qui ouvre une URL abîmée (`search` répété, vide, ou fait d'espaces), je veux une page qui s'affiche quand même, plutôt qu'une erreur.
23. En tant qu'utilisateur du clavier, je veux atteindre le champ, le lien « Clear search », chaque Filtre et le bouton avec Tab, avec un focus toujours visible, pour chercher sans souris.
24. En tant qu'utilisateur d'un lecteur d'écran, je veux que le champ ait une étiquette visible, « Search by title », et soit annoncé comme un champ de recherche, pour savoir ce que je saisis.
25. En tant qu'utilisateur d'un lecteur d'écran, je veux que le titre de la page devienne « Search results for "repo" - Tailspin Toys », pour savoir dès le chargement que la liste est restreinte par ma Recherche.
26. En tant qu'utilisateur sans JavaScript, je veux que la Recherche fonctionne quand même, puisque c'est un simple champ de formulaire.
27. En tant que développeur, je veux que les règles de la Recherche vivent dans la couche de données et soient prouvées par Vitest, puisque les postes de la formation n'ont pas de navigateur de test.
28. En tant que développeur, je veux que la Recherche ait son propre module, hors du type des Filtres, pour que le glossaire et le code disent la même chose, et pour la livrer en parallèle de la 07.2 et du 02.
29. En tant que testeur, je veux des `data-testid` sur le champ, sur chaque lien « Clear search » et sur le message vide, pour que les tests e2e futurs les ciblent.

## Décisions d'implémentation

### Architecture

- Pas de JavaScript : la Recherche part avec le formulaire GET des Filtres, sur la page d'accueil rendue à la demande (ADR 0001). Le critère du ticket, *« updates the visible list as the user types or submits »*, est rempli par la soumission. Le filtrage pendant la frappe est écarté : un envoi automatique fait perdre le focus au rechargement (WCAG 3.2.2), et un filtrage dans le navigateur est l'option que l'ADR 0001 écarte.
- La Recherche n'est pas un Filtre (glossaire). Elle n'entre ni dans le type `CatalogFilters`, ni dans `hasActiveFilters`, dont le `satisfies` refuserait d'ailleurs une chaîne.
- Le titre « Featured Games », la carte de Jeu et la ligne « Showing N of M games » ne changent pas.

### Contrat d'URL

- `search` : le texte de la Recherche, encodé comme le fait nativement un formulaire GET (`?search=server+sim`).
- Aucune erreur n'est jamais renvoyée :
  - seule la première occurrence de `search` compte ;
  - les espaces au début et à la fin sont retirés ;
  - une valeur vide, ou faite seulement d'espaces, veut dire « pas de Recherche » : tout le Catalogue, comme sans paramètre ;
  - il n'y a pas de limite de longueur.

### Correspondance

- Un Jeu correspond quand son titre contient la Recherche retenue, en entier, comme une seule phrase. « server sim » trouve « Virtual Server Simulator », « simulator server » ne le trouve pas.
- La casse est ignorée pour les lettres ASCII, comme le fait le `LIKE` de SQLite. Les lettres accentuées ne sont pas repliées ; aucun titre du Catalogue n'en contient.
- La Recherche est prise littéralement : la condition est un `LIKE` dont les jokers `%` et `_`, et le caractère d'échappement lui-même, sont échappés. « 50% » ne trouve que les titres qui contiennent « 50% ».
- La Recherche et les Filtres se combinent par ET : sa condition s'ajoute à celles des familles de Filtres dans le `and(...)` de `getCatalogGames`.
- Les résultats restent triés par titre.

### Modules

- **Le module de la Recherche**, à part dans la couche de données, à côté des modules de chaque famille de Filtres :
  - la lecture de `search` depuis les paramètres d'URL, qui rend la Recherche retenue : le texte nettoyé, ou `null` quand il n'y a pas de Recherche ;
  - la condition SQL, qui rend `undefined` (pas de restriction) quand la Recherche est `null`, comme `categoryCondition` pour une liste vide.
- **Le Catalogue filtré**, dans le module des Jeux :
  - `getCatalogGames(db, filters, search)` reçoit la Recherche retenue en troisième paramètre et ajoute sa condition dans le `and(...)`.
  - `getCatalog(db, searchParams)` reste le seul appel de la page. Il rend désormais `{ games, total, filters, search, clearFiltersHref, clearSearchHref }`, et l'interface `Catalog` suit :
    - `search` : la Recherche retenue, `string | null`, qui pré-remplit le champ ;
    - `clearSearchHref` : l'URL de l'accueil avec les paramètres courants, moins toutes les occurrences de `search` et moins les paramètres vides ; `/` s'il ne reste rien. Elle garde ainsi d'elle-même la Catégorie, l'Éditeur de la 07.2 et le Tri du 02 ;
    - `clearFiltersHref` : `/` sans Recherche, `/?search=<Recherche retenue>` avec. Elle ne garde que ce qui n'est pas un Filtre, si bien qu'un Éditeur ajouté par la 07.2 est effacé sans que personne y pense.
- **Le formulaire de Filtres** :
  - En tête, avant les familles de Filtres : un `<label>` visible « Search by title », relié à un `<input type="search" name="search">` pré-rempli avec la Recherche retenue, avec `data-testid="search-input"`.
  - À côté du champ, seulement quand une Recherche est active : un lien « Clear search » vers `clearSearchHref`, avec `data-testid="clear-search"`.
  - Pas de bouton à part : Entrée envoie le formulaire. Le bouton « Apply filters » devient « Apply », `data-testid="apply-filters"` inchangé. Seul le texte change, par la même ligne que le ticket 02 (Tri), pour que git fusionne les deux changements sans conflit.
  - Le lien « Clear filters » du formulaire pointe vers `clearFiltersHref` au lieu de `/`.
  - Le champ et le lien ont le même focus visible que les autres contrôles du formulaire.
- **Le message vide**, quand le Catalogue n'est pas vide et que rien ne correspond :
  - Recherche seule : « No games match "repo". », avec un lien « Clear search » (`data-testid="no-matching-games-clear-search"`) ;
  - Recherche et Filtres : « No games match "repo" with these filters. », avec « Clear search » et « Clear filters » ;
  - Filtres seuls : « No games match these filters. », avec « Clear filters », comme aujourd'hui ;
  - le message garde `data-testid="no-matching-games"`, et le lien « Clear filters » garde `no-matching-games-clear-filters` et pointe vers `clearFiltersHref` ;
  - « No games available at the moment. » reste réservé au Catalogue vide, et passe avant tout le reste.
- **Le `<title>`** : « Search results for "repo" - Tailspin Toys » dès qu'une Recherche est active, avec ou sans Filtres. Sinon, il ne change pas : « Filtered games - Tailspin Toys » avec des Filtres, le titre par défaut sans.
- La Recherche affichée dans le message et le titre est la Recherche retenue, échappée par Astro comme tout texte.
- Pas de région `aria-live` : le formulaire recharge la page.
- Aucun changement de schéma ni de migration.

## Décisions de test

- On teste ce que la page voit, par un seul point d'entrée : `getCatalog(db, searchParams)`. Il prouve :
  - la correspondance : sous-chaîne, casse ignorée, phrase entière, `%` et `_` pris littéralement ;
  - le contrat d'URL : la première occurrence seule, les espaces retirés, une valeur vide ou faite d'espaces qui donne tout le Catalogue, sans erreur ;
  - le ET avec une Catégorie ;
  - le tri par titre et `total`, qui compte tout le Catalogue ;
  - `search`, la Recherche retenue (`null` sans Recherche) ;
  - `clearSearchHref` : `search` retiré, toutes ses occurrences, les paramètres vides retirés, `category` gardé, et `/` quand il ne reste rien ;
  - `clearFiltersHref` : `/` sans Recherche, et la Recherche retenue, encodée, avec.
- La lecture de `search` et la condition SQL ne sont pas testées directement : un test qui les vise casserait au premier remaniement sans rien prouver de plus.
- La Recherche a son propre fichier de test, à côté de celui de la famille Catégorie, qui sert de modèle. Chaque test part d'une base en mémoire migrée par `createTestDatabase()`, et y insère ses propres Catégories, Éditeurs et Jeux, dans un ordre inverse pour prouver le tri. Les titres de test contiennent ce qu'il faut pour prouver les jokers (un titre avec `%` ou `_`, et d'autres sans).
- Les tests existants de `getCatalog` vérifient ses champs un à un : les nouveaux champs ne les cassent pas.
- Les composants Astro ne passent pas par Vitest. On les vérifie à la main, au clavier, sur `npm run dev` : Entrée dans le champ, focus visible, champ pré-rempli après rechargement, « Clear search » et « Clear filters », message vide et titre de la page. On n'écrit pas de nouveau test e2e et on ne lance pas Playwright.
- Le ticket est fini quand `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Hors périmètre

- Toute mise à jour de la liste pendant la frappe, et tout JavaScript côté navigateur pour la Recherche.
- Une Recherche sur autre chose que le titre : description, Catégorie, Éditeur.
- Une Recherche mot par mot, par préfixe ou floue.
- L'insensibilité aux accents et la casse des lettres non ASCII.
- Les suggestions ou l'autocomplétion.
- Le Tri (ticket 02 du backlog), la pagination (06) et le filtre par Éditeur (07.2), sauf ce que la Recherche doit garder de leurs paramètres dans ses liens.
- Le rôle `search` sur le formulaire, et tout autre changement du formulaire de Filtres que le champ, le lien « Clear search » et les libellés décrits plus haut.
- Tout nouveau test e2e.

## Notes

- **Livraison en parallèle.** Le 01 est livré en même temps que la 07.2, la 07.3 et le 02, chacun dans son worktree. Les conflits attendus tiennent en une ligne et se règlent à la main, en fusionnant les branches une à une :
  - avec le 02 : la signature de `getCatalogGames`, le retour de `getCatalog` et l'interface `Catalog`, et le `href` de « Clear filters ». Le 02 le construit par une fonction qui garde le Tri ; après fusion, ce lien doit garder la Recherche **et** le Tri ;
  - avec la 07.2 : le `and(...)` de `getCatalogGames`, et le formulaire, où chacun ajoute son contrôle ;
  - la 07.3 ne touche que les fichiers de la famille Catégorie : aucun conflit.
- **Pagination.** `clearSearchHref` garde tous les paramètres autres que `search`. Quand la pagination (06) arrivera, elle devra décider si retirer la Recherche ramène à la première page.
- **Glossaire.** Le terme Recherche est placé après Visiteur, et non après Filtre, où le 02 ajoute Tri.
