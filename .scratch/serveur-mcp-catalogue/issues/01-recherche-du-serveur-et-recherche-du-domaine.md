Status: needs-triage
Blocked by: aucun

# 01 : La recherche du serveur MCP et la Recherche du domaine

Origine : la revue après fusion de la PR #13 (« Un serveur MCP en stdio pour le catalogue, en lecture seule »), fusionnée sans ticket ni spec. Ce dossier en garde les suites. Vocabulaire : `GLOSSARY.md`.

## Le constat

- L'outil MCP `search_games` (`mcp/catalog-server.ts`) appelle `searchGames(db, query)` (`src/lib/games.ts`). Celle-ci retient les Jeux dont le titre, la Catégorie **ou** l'Éditeur contient le texte, sans tenir compte de la casse ASCII.
- Le glossaire réserve le mot au ticket 01 : « la recherche porte sur le titre, ticket 01 » (entrée Filtre). La spec du 01 (PR #11, `.scratch/rechercher-les-jeux/spec.md`) exclut une Recherche sur la description, la Catégorie ou l'Éditeur.
- Deux fonctions feront donc la même correspondance, « une sous-chaîne prise à la lettre, sans tenir compte de la casse ASCII » :
  - `containsIgnoringCase`, avec `instr(lower())`, dans `src/lib/games.ts` ;
  - `searchCondition`, avec `LIKE … ESCAPE`, dans `src/lib/catalog-search.ts` (PR #11).

  Aucun nom exporté n'entre en collision : rien ne casse, mais les deux peuvent diverger.

## La décision à prendre

Elle revient au propriétaire du dépôt, au plus tard à la fusion de la PR #11. Deux voies :

1. **Renommer l'outil** (par exemple `find_games` et `findGames`) et écrire dans `GLOSSARY.md` qu'il n'est pas la Recherche, puisqu'il cherche aussi dans la Catégorie et l'Éditeur.
2. **L'aligner sur la Recherche** : le titre seul, avec la fonction de correspondance du 01.

Dans les deux cas, garder une seule fonction de correspondance pour le Catalogue.

## Critères d'acceptation

- [ ] La décision est prise, et notée sous `## Comments`.
- [ ] Le nom de l'outil MCP, celui de la fonction de `src/lib/` et `GLOSSARY.md` disent la même chose.
- [ ] Une seule fonction de correspondance sert l'accueil et le serveur MCP, avec ses tests Vitest.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
