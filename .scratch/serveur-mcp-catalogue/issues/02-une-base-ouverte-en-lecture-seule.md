Status: needs-triage
Blocked by: aucun

# 02 : Le serveur MCP ouvre une base qui existe, en lecture seule

Origine : la revue après fusion de la PR #13, et la limite connue que sa description annonce (« un `DATABASE_URL` relatif lancé depuis un autre dossier crée une base vide au lieu d'échouer »).

## Le constat

- `mcp/catalog-server.ts` vérifie que `tailspin.db` existe, mais seulement quand `DATABASE_URL` n'est pas défini. Avec un `DATABASE_URL` qui pointe vers un fichier absent, le serveur démarre sur une base vide.
- La connexion passe par `createDatabase` (`src/lib/db.ts`), qui ouvre la base en lecture-écriture et crée les dossiers du chemin (`mkdirSync`). Les deux outils ne font que des lectures, mais rien n'empêche une écriture.

## Critères d'acceptation

- [ ] Le serveur s'arrête, avec un message sur stderr, quand le fichier de la base est absent, que son chemin vienne de `DATABASE_URL` ou non. Un `DATABASE_URL=:memory:`, qui n'a pas de fichier et serait vide, est refusé de même.
- [ ] Le serveur ouvre la base en lecture seule, sans rien créer sur le disque.
- [ ] Le reste du site, le seed et les tests ouvrent toujours la base comme avant.
- [ ] La règle tient dans du code de `src/lib/` prouvé par Vitest.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
