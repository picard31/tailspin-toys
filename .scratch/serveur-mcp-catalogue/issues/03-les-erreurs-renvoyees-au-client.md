Status: needs-triage
Blocked by: aucun

# 03 : Une erreur claire pour le client MCP, plutôt que l'erreur SQL

Origine : la revue après fusion de la PR #13, et la limite connue que sa description annonce (« une erreur SQL remonte telle quelle au client »).

## Le constat

Les outils `search_games` et `get_game` (`mcp/catalog-server.ts`) appellent `searchGames` et `getGameById` sans intercepter d'erreur. Si la requête échoue, par exemple sur une base sans tables, le client MCP reçoit le message brut de SQLite.

## Critères d'acceptation

- [ ] Quand la lecture du Catalogue échoue, l'outil rend un résultat `isError`, avec un message en anglais qui dit que le Catalogue est illisible et comment le recréer (`npm run db:setup`).
- [ ] Le détail de l'erreur part sur stderr, pas vers le client.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
