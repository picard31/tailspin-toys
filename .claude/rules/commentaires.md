---
paths:
  - "**/*.ts"
  - "**/*.astro"
  - "**/*.js"
  - "**/*.mjs"
---

# Commentaires et documentation

Les commentaires sont en anglais, comme le code.

## Un commentaire dit pourquoi

Un commentaire porte ce que le code ne peut pas dire : l'intention, la raison d'un choix qui ne va pas de soi, le piège évité. Le code dit déjà ce qu'il fait ; un commentaire qui le paraphrase se supprime.

- À garder : `// Insert titles in reverse-alphabetical order to prove ordering is applied.` (`src/lib/games.test.ts`), le commentaire du `PRAGMA` de `src/lib/db.ts`.
- À supprimer : `// Toggle menu visibility when hamburger is clicked` au-dessus d'un `addEventListener('click', …)`, `/* Retry on CI only */` au-dessus de `retries: process.env.CI ? 2 : 0`.
- Le code retiré disparaît du fichier : git en garde la trace.

## Un commentaire périmé est un bug

Le changement qui modifie un comportement met à jour, dans le même commit, les commentaires et les TSDoc qui le décrivent, ou les supprime. Relire les commentaires autour des lignes touchées fait partie du changement.

## TSDoc des fonctions exportées de `db/` et `src/lib/`

Chaque fonction exportée de la couche de données, tests exclus, a un bloc TSDoc :

- un résumé : ce que la fonction rend au reste du site, et pourquoi elle existe quand ce n'est pas évident ;
- un `@param nom - description` par paramètre, avec le tiret de TSDoc : ce que le type ne dit pas, d'où vient la valeur et ce qu'on en attend ;
- un `@returns` pour toute fonction qui rend une valeur, aucun pour une fonction `void` : ce que contient le résultat, ses cas particuliers (`null`, ordre de tri) ;
- `@throws` quand l'appelant doit s'attendre à une erreur.

Aucun tag ne porte de type : les types restent dans la signature TypeScript, seule source de vérité. Les constantes, les tables Drizzle et les types n'ont pas besoin de TSDoc.

Le paramètre `db` d'une fonction d'accès aux données dit qu'il est injecté : les pages passent la base partagée, les tests une base en mémoire.

```ts
/**
 * A single game by id.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @param id - The game's primary key.
 * @returns The game, or `null` when no game has this id.
 */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
```

Une fonction privée se contente d'une ligne, quand son nom ne suffit pas.

## Les Props des composants `.astro`

Dans `src/components/` et `src/layouts/`, chaque prop déclarée dans l'interface `Props` porte son commentaire TSDoc. Il dit ce que le composant fait de la prop, sa valeur par défaut, le cas absent ou `null`, jamais son type :

```astro
interface Props {
    /** Shown as the hero's `<h1>`. */
    title: string;
    /** Line under the title; left out when not provided. */
    subtitle?: string;
}
```

Les props héritées de `HTMLAttributes` (`interface Props extends HTMLAttributes<'div'>`) ne sont pas concernées : seules celles que le composant déclare le sont.

## Ce que vérifie ESLint

`npm run lint` échoue sur une fonction exportée de `db/` ou de `src/lib/` sans TSDoc, sans résumé, sans `@param`, sans `@returns` ou sans le tiret, sur un tag qui porte un type, et sur une prop de `Props` sans commentaire. Il vérifie la présence des commentaires, pas leur contenu : ce qu'ils disent reste à la relecture, et c'est le pourquoi qu'il faut écrire. `npm run lint -- --fix` n'en écrit aucun : un TSDoc ou un commentaire de prop manquant se rédige à la main.
