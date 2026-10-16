Status: ready-for-agent
Blocked by: 02

# 03 : Le TSDoc de la couche de données, vérifié par la lint

Spec : `../spec.md`.

## Ce qu'il faut construire

Le développeur qui appelle une fonction exportée de la couche de données lit au survol ce qu'elle fait, ce qu'attend chaque paramètre et ce qu'elle rend, cas particuliers compris. `npm run lint` échoue quand une fonction exportée n'a pas de TSDoc, ou quand il lui manque un `@param` ou un `@returns`. La règle **commentaires** gagne la section qui le dit.

Il attend 02, qui crée la règle **commentaires**.

## Critères d'acceptation

- [ ] `eslint-plugin-jsdoc` est une dépendance de développement. Sur la couche de données (`db/` et `src/lib/`), tests exclus, ces règles sont en `error` : `require-jsdoc` limité aux fonctions exportées, `require-param`, `require-param-description`, `require-returns`, `require-returns-description`, `check-param-names` et `no-types`.
- [ ] Les 22 fonctions exportées ont chacune un résumé, un `@param` par paramètre et un `@returns`, sauf celles qui rendent `void`. Les trois fonctions qui fabriquent les descriptions du seed, qui n'ont aucun TSDoc, en reçoivent un.
- [ ] Chaque tag dit ce que le type ne dit pas, et aucun ne porte de type. Le paramètre `db` dit qu'il est injecté : les pages passent la base partagée, les tests une base en mémoire. L'exemple fixé pendant le cadrage :

  ```ts
  /**
   * A single game by id.
   *
   * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
   * @param id - The game's primary key.
   * @returns The game, or `null` when no game has this id.
   */
  ```

- [ ] Les constantes, les tables Drizzle et les types ne reçoivent pas de TSDoc imposé.
- [ ] La règle **commentaires** gagne une section TSDoc : à qui elle s'applique, ce que disent le résumé et les tags, l'exemple ci-dessus, et le fait que la lint vérifie la présence des tags mais pas leur contenu, qui reste à la relecture.
- [ ] La lint mord : retirer un `@param`, puis le TSDoc entier d'une fonction exportée, la fait échouer. On les remet ensuite.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
