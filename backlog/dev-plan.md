# Plan de développement de la backlog

L'ordre de livraison des neuf tickets de `backlog/`, pour en mener le plus possible en parallèle sans conflit de fusion. Établi le 16/10/2026, à partir du commit `f5a6bde`.

## Trois zones, plus un ticket transverse

Deux tickets peuvent avancer en parallèle quand ils ne touchent pas les mêmes fichiers, et quand l'un ne repose pas sur ce que l'autre met en place.

| Ticket | Fichiers principaux | Zone |
|---|---|---|
| [01 Recherche](01-search-games.md) | `src/pages/index.astro`, une condition dans `getCatalogGames` (`src/lib/games.ts`), un contrôle dans `CatalogFilters.astro` | Accueil |
| [02 Tri](02-sort-games.md) | `src/pages/index.astro`, un contrôle de tri dans le formulaire (`CatalogFilters.astro`), un helper de tri de `src/lib/` et le `orderBy` de `getCatalogGames` (`src/lib/games.ts`) | Accueil |
| [05 Résumé du catalogue](05-catalog-summary.md) | `src/pages/index.astro`, un helper de `src/lib/`, un champ de `Catalog` et du `return` de `getCatalog` (`src/lib/games.ts`) | Accueil |
| [06 Pagination](06-pagination.md) | `src/pages/index.astro`, `src/lib/games.ts` | Accueil |
| [07 Filtres](07-filter-games.md) | `src/pages/index.astro`, `src/lib/games.ts`, de nouveaux composants | Accueil |
| [03 Descriptions](03-detail-descriptions.md) | un nouveau module `src/lib/game-details.ts` (`getGameDetails`), `src/types/game.ts` (`GameDetails`), `src/pages/game/[id].astro` | Fiche de jeu |
| [04 Pages éditeur](04-publisher-pages.md) | un helper de `src/lib/` qui rend les Jeux d'un Éditeur, `src/pages/game/[id].astro` (un lien dans « About the publisher »), une nouvelle page `src/pages/publisher/[id].astro` ; il réutilise `GameDetails` et `PublisherDetails`, livrés par le 03 | Fiche de jeu |
| [09 Backer Concierge](09-backer-concierge.md) | une nouvelle page `src/pages/concierge.astro`, une route `src/pages/api/concierge.ts`, un nouveau module `src/lib/concierge.ts`, `src/components/Header.astro`, `astro.config.mjs`, `package.json`, `README.md`, `.env.example` | Concierge |
| [08 Standards de code](08-coding-standards.md) | `CLAUDE.md`, `.claude/rules/`, `eslint.config.js`, `README.md`, et potentiellement tous les fichiers | Transverse |

Le ticket 07 se découpe lui-même en quatre tranches (voir sa section *Delivery*) : 07.1 une catégorie, 07.2 l'éditeur, 07.3 plusieurs catégories, 07.4 la combinaison.

## Les vagues

| Vague | En parallèle | Prérequis | État |
|---|---|---|---|
| 0 | **08** seul | aucun | ✅ Livrée le 16/10/2026 : [PR #1](https://github.com/picard31/tailspin-toys/pull/1) fusionnée |
| 1 | **07.1** · **03** · **09** (ses neuf tickets l'un après l'autre) | 08 fusionné | ✅ Livrée le 16/10/2026 : [PR #3](https://github.com/picard31/tailspin-toys/pull/3), [PR #4](https://github.com/picard31/tailspin-toys/pull/4) et [PR #2](https://github.com/picard31/tailspin-toys/pull/2) fusionnées |
| 2 | **07.2** · **07.3** · **01** · **02** · **05** · **04** | 07.1 fusionnée ; 03 fusionné pour 04 | Débloquée |
| 3 | **07.4** · **06** | 07.2, 07.3, 01 et 02 fusionnés | En attente |

La vague 0 a livré les standards de code (spec `.scratch/standards-de-code/spec.md`, ADR 0002) : `npm run lint` impose désormais le format, la présence des TSDoc des fonctions exportées de `db/` et `src/lib/`, et celle des commentaires de Props. Une branche ouverte avant sa fusion se met à jour avec `main` par une fusion de `picard31/main` : un rebase réécrirait des commits déjà poussés. Ses conflits viennent surtout du reformatage. `npm run lint -- --fix` remet ensuite son code au format, sauf ce que les règles disent de tenir à la main : la base d'indentation des `<script>` des `.astro`, un commentaire aligné sur la ligne voisine et la suite d'une expression coupée sur plusieurs lignes (`.claude/rules/format.md`) ; il n'écrit pas non plus les TSDoc ni les commentaires de Props manquants (`.claude/rules/commentaires.md`).

La vague 1 a livré le filtre du Catalogue par une Catégorie (07.1, ADR 0001), les descriptions de la fiche de jeu (03) et le Backer Concierge (09, ADR 0003). Chaque PR a été relue par un agent dédié, puis fusionnée dans l'ordre 03, 09, puis 07.1. Les PR du 03 et de la 07.1 ont été approuvées avant leur fusion. Celle du 09 a été fusionnée avant la fin de sa revue : les corrections de son second tour arrivent par la PR #7, avec deux commentaires que la revue de la 07.1 jugeait non bloquants. Entre elles, un seul conflit : `GLOSSARY.md`, complété des deux côtés, réglé en gardant la version la plus complète. Les vérifications du Concierge qui demandent une vraie clé d'API restent à faire : elles sont notées sous `## Comments` dans ses tickets.

Les dépendances, une par ligne :

- 08 → tous les autres
- 07.1 → 01, 02, 05, 07.2, 07.3
- 03 → 04
- 07.2 et 07.3 → 07.4
- 07.1 à 07.3, 01 et 02 → 06

## Pourquoi cet ordre

- **08 seul, d'abord** : il change les règles que les autres tickets suivent. Les règles de format qu'il impose par ESLint reformateraient beaucoup de fichiers : `src/pages/index.astro` est indenté à 2 espaces, `src/lib/games.ts` et `src/components/GameCard.astro` à 4. Il ajoute aussi un TSDoc à chaque fonction exportée de `src/lib/` et de `db/`. Mené en parallèle, il entrerait en conflit avec toutes les branches.
- **07.1 avant 01, 02, 05 et 06** : elle passe l'accueil en rendu à la demande, les filtres étant lus dans la query string d'un formulaire GET (ADR 0001). Elle crée `getCatalogGames`, où chaque famille de filtres ajoute une condition, et le message « No games match these filters ». L'ADR prévoit d'y greffer la recherche (01), le tri (02) et la pagination (06), comme d'autres paramètres de la même URL. 07.1 calcule aussi le nombre total de jeux, dont 05 a besoin ; menés en parallèle, les deux le calculeraient chacun de son côté, dans les mêmes lignes de `index.astro`.
- **03 en parallèle de 07.1** : 03 ne touche pas à `src/lib/games.ts`, que 07.1 modifie en haut (les imports) et en bas (ses fonctions). Sa lecture, `getGameDetails`, vit dans son propre module. Ses types, `GameDetails`, `CategoryDetails` et `PublisherDetails`, s'ajoutent à côté de `Game`, `Category` et `Publisher` sans les changer, sans quoi `getAllCategories` de la 07.1 ne passerait plus `typecheck` après la fusion. Git fusionne seul le code des deux ; seul `GLOSSARY.md`, que les deux branches complètent, demande une résolution à la main.
- **03 avant 04** : 04 réutilise `GameDetails`, la description de l'éditeur que 03 remonte, et le bloc « About the publisher » de `src/pages/game/[id].astro`, où il ajoute son lien.
- **09 en parallèle de tout** : il ne touche aucun fichier de code des autres tickets de la vague ; seul `GLOSSARY.md` lui est commun avec eux. Son code vit dans `src/lib/concierge.ts`, et il lit le Catalogue avec `getAllGames` et `toCatalogExport`, qui existent déjà, avec leurs tests.
- **06 en dernier** : la pagination découpe le résultat des filtres, de la recherche et du tri, et modifie la ligne « Showing X of Y games ». Faite plus tôt, elle découperait le catalogue en pages avant de le filtrer, ou chaque ticket suivant devrait la reprendre. Avec 21 jeux dans `db/games.csv`, c'est aussi le ticket le moins urgent.

## Fusionner la vague 2

01 et 07.2 ajoutent chacun une condition dans le même `and(...)` de `getCatalogGames`, dont 02 modifie le `orderBy`, et tous trois ajoutent un contrôle dans `CatalogFilters.astro` ; 07.3 ne touche que les fichiers de la famille Catégorie. 01 et 02 ajoutent aussi un paramètre à `getCatalogGames`, un champ à `Catalog` et au `return` de `getCatalog` (comme le 05 l'a fait), et une prop à `CatalogFilters`. Leurs conflits portent donc sur plusieurs blocs de `src/lib/games.ts`, `src/pages/index.astro` et `CatalogFilters.astro`. Ils se règlent à la main en gardant les ajouts des deux côtés, avec une seule signature de `getCatalogGames` qui réunit les paramètres de chacun. Fusionner les branches une à une, et mettre les autres à jour avec `picard31/main` après chaque fusion.

Chaque ticket qui ajoute un terme du domaine l'écrit dans `GLOSSARY.md`, seul conflit de la vague 1. Placer chaque terme à côté de ses voisins de sens, plutôt qu'à la fin du fichier où toutes les branches écriraient au même endroit, réduit les conflits sans les exclure. Un conflit restant se règle à la main : garder les entrées des deux côtés, et une seule fois une entrée identique des deux côtés.

## Avant de lancer

- **L'ADR 0001 est sur `main`** depuis la PR #2, avec la spec du 07, découpée en quatre tickets sous `.scratch/filtrer-les-jeux/`. La recherche (01), le tri (02) et la pagination (06) s'appuient sur l'accueil rendu à la demande, jamais sur un filtrage dans le navigateur, une option que l'ADR écarte.
- **07.1 est fusionnée** (PR #2) : la vague 2 part de `picard31/main`, où vivent `getCatalog`, `getCatalogGames` et `CatalogFilters.astro`.
- **09 est tranché** : l'API Claude (`claude-opus-5-5`), une clé de formation dans `.env`, pas de recherche web (spec `.scratch/backer-concierge/spec.md`, ADR 0003). Avant la vague, le formateur crée la clé, la plafonne en dépenses et la distribue ; il la révoque après la session.
- **Le piège du 04** : `src/components/GameCard.astro` est un grand lien `<a>`. Un lien vers l'éditeur à l'intérieur serait un lien imbriqué dans un lien, du HTML invalide. Le mettre sur la fiche de jeu, ce que le critère permet (« and/or »). Le 04 réutilise aussi `getGameDetails` (`src/lib/game-details.ts`), qui reprend la sélection et les jointures de `src/lib/games.ts` parce que le 03 ne devait pas toucher ce fichier. Les factoriser, pour que les deux requêtes ne divergent pas, toucherait `src/lib/games.ts`, que 01, 02 et 07.2 modifient dans la même vague : à faire après leur fusion, dans une PR à part, plutôt que dans le 04.
- **Les tickets de la vague 1 sont sous `.scratch/`**, comme l'attend `docs/agents/issue-tracker.md` :
  - 07.1 : `.scratch/filtrer-les-jeux/issues/01-une-categorie.md` ;
  - 03 : `.scratch/descriptions-fiche-de-jeu/issues/01-descriptions.md` ;
  - 09 : les neuf tickets de `.scratch/backer-concierge/issues/`, de `01-la-page.md` à `09-la-question-de-clarification.md`, dans l'ordre des numéros.

  Les tickets des vagues suivantes, sauf ceux du 07 et du 05 (`.scratch/resume-du-catalogue/`), sont encore dans `backlog/`, sans ligne `Status:`.
