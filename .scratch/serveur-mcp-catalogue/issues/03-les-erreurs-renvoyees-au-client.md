Status: needs-triage
Blocked by: aucun

# 03 : Une erreur claire pour le client MCP, plutôt que l'erreur SQL

Origine : la revue après fusion de la PR #13, et la limite connue que sa description annonce (« une erreur SQL remonte telle quelle au client »).

## Le constat

Les outils `search_games` et `get_game` (`mcp/catalog-server.ts`) appellent `searchGames` et `getGameById` sans intercepter d'erreur. Si la requête échoue, par exemple sur une base sans tables :

- Drizzle lève une `DrizzleQueryError`, dont le message est `Failed query: <la requête SQL>` suivi de ses paramètres ; le message de SQLite (« no such table: games ») reste dans sa `cause` ;
- le SDK MCP la transforme en un résultat `isError` dont le texte est ce message.

Le client MCP reçoit donc déjà une erreur, mais son texte expose la requête SQL et ses paramètres, sans dire au client ce qui ne va pas ni comment y remédier.

## Critères d'acceptation

- [ ] Quand la lecture du Catalogue échoue, l'outil rend toujours un résultat `isError`, mais son texte est un message en anglais qui dit que le Catalogue est illisible et comment le recréer (`npm run db:setup`), à la place du message de Drizzle.
- [ ] Le détail de l'erreur, requête et `cause` comprises, part sur stderr, pas vers le client.
- [ ] Le choix du message tient dans du code de `src/lib/` prouvé par Vitest, comme le demande `CLAUDE.md` ; le serveur ne fait que l'appeler.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
