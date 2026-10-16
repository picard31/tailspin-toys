# Plan de développement de la backlog

L'ordre de livraison des neuf tickets de `backlog/`, pour en mener le plus possible en parallèle sans conflit de fusion. Établi le 16/10/2026, à partir du commit `f5a6bde`.

## Trois zones, plus un ticket transverse

Deux tickets peuvent avancer en parallèle quand ils ne touchent pas les mêmes fichiers, et quand l'un ne repose pas sur ce que l'autre met en place.

| Ticket | Fichiers principaux | Zone |
|---|---|---|
| [01 Recherche](01-search-games.md) | `src/pages/index.astro`, un helper de `src/lib/` | Accueil |
| [02 Tri](02-sort-games.md) | `src/pages/index.astro`, un helper de `src/lib/` | Accueil |
| [05 Résumé du catalogue](05-catalog-summary.md) | `src/pages/index.astro`, un helper de `src/lib/` | Accueil |
| [06 Pagination](06-pagination.md) | `src/pages/index.astro`, `src/lib/games.ts` | Accueil |
| [07 Filtres](07-filter-games.md) | `src/pages/index.astro`, `src/lib/games.ts`, de nouveaux composants | Accueil |
| [03 Descriptions](03-detail-descriptions.md) | un nouveau module `src/lib/game-details.ts` (`getGameDetails`), `src/types/game.ts` (`GameDetails`), `src/pages/game/[id].astro` | Fiche de jeu |
| [04 Pages éditeur](04-publisher-pages.md) | `src/types/game.ts` (`PublisherDetails`), `src/pages/game/[id].astro`, une nouvelle page `src/pages/publisher/[id].astro` | Fiche de jeu |
| [09 Backer Concierge](09-backer-concierge.md) | une nouvelle page `src/pages/concierge.astro`, une route `src/pages/api/concierge.ts`, un nouveau module `src/lib/concierge.ts`, `src/components/Header.astro`, `astro.config.mjs`, `package.json`, `README.md`, `.env.example` | Concierge |
| [08 Standards de code](08-coding-standards.md) | `CLAUDE.md`, `.claude/rules/`, `eslint.config.js`, `README.md`, et potentiellement tous les fichiers | Transverse |

Le ticket 07 se découpe lui-même en quatre tranches (voir sa section *Delivery*) : 07.1 une catégorie, 07.2 l'éditeur, 07.3 plusieurs catégories, 07.4 la combinaison.

## Les vagues

| Vague | En parallèle | Prérequis |
|---|---|---|
| 0 | **08** seul | aucun |
| 1 | **07.1** · **03** · **09** (ses neuf tickets l'un après l'autre) | 08 fusionné |
| 2 | **07.2** · **07.3** · **01** · **02** · **05** · **04** | 07.1 fusionnée ; 03 fusionné pour 04 |
| 3 | **07.4** · **06** | 07.2, 07.3, 01 et 02 fusionnés |

Les dépendances, une par ligne :

- 08 → tous les autres
- 07.1 → 01, 02, 05, 07.2, 07.3
- 03 → 04
- 07.2 et 07.3 → 07.4
- 07.1 à 07.3, 01 et 02 → 06

## Pourquoi cet ordre

- **08 seul, d'abord** : il change les règles que les autres tickets suivent. Les règles de format qu'il impose par ESLint reformateraient beaucoup de fichiers : `src/pages/index.astro` est indenté à 2 espaces, `src/lib/games.ts` et `src/components/GameCard.astro` à 4. Il ajoute aussi un TSDoc à chaque fonction exportée de `src/lib/` et de `db/`. Mené en parallèle, il entrerait en conflit avec toutes les branches.
- **07.1 avant 01, 02, 05 et 06** : elle passe l'accueil en rendu à la demande, les filtres étant lus dans la query string d'un formulaire GET (ADR 0001). Elle crée `getCatalogGames`, où chaque famille de filtres ajoute une condition, et le message « No games match these filters ». L'ADR prévoit d'y greffer la recherche (01), le tri (02) et la pagination (06), comme d'autres paramètres de la même URL. 07.1 calcule aussi le nombre total de jeux, dont 05 a besoin ; menés en parallèle, les deux le calculeraient chacun de son côté, dans les mêmes lignes de `index.astro`.
- **03 en parallèle de 07.1** : 03 ne touche pas à `src/lib/games.ts`, que 07.1 modifie en haut (les imports) et en bas (ses fonctions). Sa lecture, `getGameDetails`, vit dans son propre module. Ses types, `GameDetails`, `CategoryDetails` et `PublisherDetails`, s'ajoutent à côté de `Game`, `Category` et `Publisher` sans les changer, sans quoi `getAllCategories` de la 07.1 ne passerait plus `typecheck` après la fusion. Git fusionne les deux seul.
- **03 avant 04** : 04 réutilise `GameDetails`, la description de l'éditeur que 03 remonte, et le bloc « About the publisher » de `src/pages/game/[id].astro`, où il ajoute son lien.
- **09 en parallèle de tout** : il ne touche aucun fichier des autres tickets de la vague. Son code vit dans `src/lib/concierge.ts`, et il lit le Catalogue avec `getAllGames` et `toCatalogExport`, qui existent déjà, avec leurs tests.
- **06 en dernier** : la pagination découpe le résultat des filtres, de la recherche et du tri, et modifie la ligne « Showing X of Y games ». Faite plus tôt, elle découperait le catalogue en pages avant de le filtrer, ou chaque ticket suivant devrait la reprendre. Avec 21 jeux dans `db/games.csv`, c'est aussi le ticket le moins urgent.

## Fusionner la vague 2

01, 07.2 et 07.3 ajoutent chacun une condition dans le même `and(...)` de `getCatalogGames`, et un contrôle dans `CatalogFilters.astro` ; 02 modifie le `orderBy` de la même fonction. Les conflits attendus tiennent en une ligne et se règlent à la main. Fusionner les branches une à une, et rebaser les autres après chaque fusion.

## Avant de lancer

- **L'ADR 0001 n'est pas sur `main`** : il n'existe que sur `origin/secours/07-filtres`, avec le glossaire et la spec du 07, déjà découpée en quatre tickets sous `.scratch/filtrer-les-jeux/`. Si 01 ou 02 démarrent avant 07.1, un agent pourrait choisir de filtrer dans le navigateur, une option que l'ADR écarte.
- **07.1 est déjà faite** sur `origin/secours/07-filtres-01-fait` : la vague 2 peut partir de là. Les noms `getCatalogGames` et `CatalogFilters.astro` cités plus haut viennent de cette branche.
- **09 est tranché** : l'API Claude (`claude-opus-5-5`), une clé de formation dans `.env`, pas de recherche web (spec `.scratch/backer-concierge/spec.md`, ADR 0003). Avant la vague, le formateur crée la clé, la plafonne en dépenses et la distribue ; il la révoque après la session.
- **Le piège du 04** : `src/components/GameCard.astro` est un grand lien `<a>`. Un lien vers l'éditeur à l'intérieur serait un lien imbriqué dans un lien, du HTML invalide. Le mettre sur la fiche de jeu, ce que le critère permet (« and/or »).
- **Les tickets de la vague 1 sont sous `.scratch/`**, comme l'attend `docs/agents/issue-tracker.md` :
  - 07.1 : `.scratch/filtrer-les-jeux/issues/01-une-categorie.md`, sur `origin/secours/07-filtres` ;
  - 03 : `.scratch/descriptions-fiche-de-jeu/issues/01-descriptions.md` ;
  - 09 : les neuf tickets de `.scratch/backer-concierge/issues/`, de `01-la-page.md` à `09-la-question-de-clarification.md`, dans l'ordre des numéros.

  Les tickets des vagues suivantes, sauf ceux du 07, sont encore dans `backlog/`, sans ligne `Status:`.
