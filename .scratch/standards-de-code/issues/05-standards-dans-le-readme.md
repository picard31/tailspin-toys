Status: ready-for-agent
Blocked by: 04

# 05 : Les standards dans le README

Spec : `../spec.md`.

## Ce qu'il faut construire

Un nouveau participant découvre les standards de code dès le README : une courte section les résume et renvoie aux deux règles Claude Code et à l'ADR 0002, sans les recopier.

Il vient en dernier pour que le résumé décrive des règles toutes en place et vérifiées.

## Critères d'acceptation

- [x] Le README gagne une section « Standards de code », en français comme le reste du README.
- [x] Elle tient en trois lignes : le format imposé par la lint et sa commande de correction ; des commentaires qui disent pourquoi ; le TSDoc de la couche de données et les commentaires des Props, vérifiés par la lint.
- [x] Elle renvoie, par des liens relatifs qui marchent sur GitHub, aux règles **format** et **commentaires** et à l'ADR 0002.
- [x] On vérifie, un par un, que les critères d'acceptation du ticket 08 du backlog sont remplis, sans modifier ce ticket.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Comments

Livré par la PR picard31/tailspin-toys#1. Les critères du ticket 08 du backlog, vérifiés un par un :

- Philosophie des commentaires (pourquoi, pas quoi) : `.claude/rules/commentaires.md`, section « Un commentaire dit pourquoi ».
- TSDoc des fonctions exportées de `db/` et `src/lib/`, paramètres et retour compris : même règle, section TSDoc ; la lint l'impose avec `eslint-plugin-jsdoc`.
- Documentation des `Props` des composants `.astro` : même règle, section Props ; la lint exige un commentaire par prop.
- Règles de format TypeScript documentées et imposées par ESLint : `.claude/rules/format.md` et `@stylistic/eslint-plugin` dans `eslint.config.js` (ADR 0002).
- Le README résume les standards et y renvoie : section « Standards de code ».
- `npm run lint` passe avec les nouvelles règles.
