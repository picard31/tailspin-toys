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
| [03 Descriptions](03-detail-descriptions.md) | `src/lib/games.ts` (`gameSelection`, `mapGame`), `src/types/game.ts`, `src/pages/game/[id].astro` | Fiche de jeu |
| [04 Pages éditeur](04-publisher-pages.md) | `src/types/game.ts` (`Publisher`), `src/pages/game/[id].astro`, une nouvelle page `src/pages/publisher/[id].astro` | Fiche de jeu |
| [09 Backer Concierge](09-backer-concierge.md) | une nouvelle page, une route d'API, `src/components/Header.astro`, `package.json` | Concierge |
| [08 Standards de code](08-coding-standards.md) | `CLAUDE.md`, `.claude/rules/`, `eslint.config.js`, `README.md`, et potentiellement tous les fichiers | Transverse |

Le ticket 07 se découpe lui-même en quatre tranches (voir sa section *Delivery*) : 07.1 une catégorie, 07.2 l'éditeur, 07.3 plusieurs catégories, 07.4 la combinaison.

## Les vagues

| Vague | En parallèle | Prérequis | État |
|---|---|---|---|
| 0 | **08** seul | aucun | ✅ Livrée le 16/10/2026 : [PR #1](https://github.com/picard31/tailspin-toys/pull/1) fusionnée |
| 1 | **07.1** · **03** · **09** (une fois ses questions tranchées) | 08 fusionné | Débloquée |
| 2 | **07.2** · **07.3** · **01** · **02** · **05** · **04** | 07.1 fusionnée ; 03 fusionné pour 04 | En attente |
| 3 | **07.4** · **06** | 07.2, 07.3, 01 et 02 fusionnés | En attente |

La vague 0 a livré les standards de code (spec `.scratch/standards-de-code/spec.md`, ADR 0002) : `npm run lint` impose désormais le format et la présence des TSDoc et des commentaires de Props. Une branche ouverte avant sa fusion se rebase sur `main` : ses conflits viennent surtout du reformatage, et `npm run lint -- --fix` remet ensuite son code au format.

Les dépendances, une par ligne :

- 08 → tous les autres
- 07.1 → 01, 02, 05, 07.2, 07.3
- 03 → 04
- 07.2 et 07.3 → 07.4
- 07.1 à 07.3, 01 et 02 → 06

## Pourquoi cet ordre

- **08 seul, d'abord** : il change les règles que les autres tickets suivent. Les règles de format qu'il impose par ESLint reformateraient beaucoup de fichiers : `src/pages/index.astro` est indenté à 2 espaces, `src/lib/games.ts` et `src/components/GameCard.astro` à 4. Il ajoute aussi un TSDoc à chaque fonction exportée de `src/lib/` et de `db/`. Mené en parallèle, il entrerait en conflit avec toutes les branches.
- **07.1 avant 01, 02, 05 et 06** : elle passe l'accueil en rendu à la demande, les filtres étant lus dans la query string d'un formulaire GET (ADR 0001). Elle crée `getCatalogGames`, où chaque famille de filtres ajoute une condition, et le message « No games match these filters ». L'ADR prévoit d'y greffer la recherche (01), le tri (02) et la pagination (06), comme d'autres paramètres de la même URL. 07.1 calcule aussi le nombre total de jeux, dont 05 a besoin ; menés en parallèle, les deux le calculeraient chacun de son côté, dans les mêmes lignes de `index.astro`.
- **03 en parallèle de 07.1** : dans `src/lib/games.ts`, 03 modifie `gameSelection` et `mapGame`, en haut du fichier ; 07.1 n'y ajoute que des imports et des fonctions, à la fin. Git fusionne les deux seul.
- **03 avant 04** : les deux modifient le type `Publisher` et le tag de l'éditeur dans `src/pages/game/[id].astro`. 04 a aussi besoin de la description de l'éditeur, que 03 remonte dans la couche de données.
- **09 en parallèle de tout** : il touche peu de fichiers que les autres modifient. L'export du catalogue qu'il exige existe déjà, dans `db/export-catalog.ts`, avec ses tests.
- **06 en dernier** : la pagination découpe le résultat des filtres, de la recherche et du tri, et modifie la ligne « Showing X of Y games ». Faite plus tôt, elle découperait le catalogue en pages avant de le filtrer, ou chaque ticket suivant devrait la reprendre. Avec 21 jeux dans `db/games.csv`, c'est aussi le ticket le moins urgent.

## Fusionner la vague 2

01, 07.2 et 07.3 ajoutent chacun une condition dans le même `and(...)` de `getCatalogGames`, et un contrôle dans `CatalogFilters.astro` ; 02 modifie le `orderBy` de la même fonction. Les conflits attendus tiennent en une ligne et se règlent à la main. Fusionner les branches une à une, et rebaser les autres après chaque fusion.

## Avant de lancer

- **L'ADR 0001 n'est pas sur `main`** : il n'existe que sur `origin/secours/07-filtres`, avec le glossaire et la spec du 07, déjà découpée en quatre tickets sous `.scratch/filtrer-les-jeux/`. Si 01 ou 02 démarrent avant 07.1, un agent pourrait choisir de filtrer dans le navigateur, une option que l'ADR écarte.
- **07.1 est déjà faite** sur `origin/secours/07-filtres-01-fait` : la vague 2 peut partir de là. Les noms `getCatalogGames` et `CatalogFilters.astro` cités plus haut viennent de cette branche.
- **09 n'est pas prêt pour un agent** : il reste à choisir le fournisseur de LLM, l'endroit où vit la clé d'API sur les postes de la formation, et si la recherche web est permise.
- **Le piège du 04** : `src/components/GameCard.astro` est un grand lien `<a>`. Un lien vers l'éditeur à l'intérieur serait un lien imbriqué dans un lien, du HTML invalide. Le mettre sur la fiche de jeu, ce que le critère permet (« and/or »).
- **Les tickets ne sont pas là où le disent les docs** : ils sont dans `backlog/`, sans ligne `Status:`, alors que `docs/agents/issue-tracker.md` les attend sous `.scratch/<fonctionnalité>/issues/`.
