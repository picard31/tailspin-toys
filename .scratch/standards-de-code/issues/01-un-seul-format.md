Status: ready-for-agent
Blocked by: aucun (peut démarrer tout de suite)

# 01 : Un seul format, imposé par la lint

Spec : `../spec.md`. Décision d'outil : ADR 0002.

## Ce qu'il faut construire

Qui contribue au dépôt n'a plus de style à choisir : `npm run lint` échoue au moindre écart de format, et `npm run lint -- --fix` le corrige. Tout le dépôt suit le style majoritaire : 4 espaces, guillemets simples, points-virgules, virgule finale en multiligne, pas d'espace en fin de ligne, un saut de ligne final, sans longueur de ligne maximale. Une règle Claude Code **format** l'apprend à l'agent dès qu'il touche un fichier source.

Ce ticket porte le grand reformatage du ticket 08 : un changement mécanique, qui touche presque tous les fichiers et passe au vert d'un coup grâce au correcteur. Il vient en premier pour que les tickets suivants modifient du code déjà à son format final.

## Critères d'acceptation

- [ ] Les dépendances sont installées par `npm ci` dans le worktree, pas par un lien vers les `node_modules` du checkout principal.
- [ ] `@stylistic/eslint-plugin` est une dépendance de développement. Ses règles `indent` (4 espaces), `quotes` (simples), `semi`, `comma-dangle` (en multiligne), `no-trailing-spaces` et `eol-last` s'appliquent, en `error`, à tout ce que lit `npm run lint`.
- [ ] Les règles de format d'ESLint lui-même, dépréciées, ne sont pas utilisées.
- [ ] `npm run lint -- --fix` a reformaté tout le dépôt : TypeScript, JavaScript des fichiers de configuration, `.astro` (frontmatter, HTML et `<script>`), tests e2e.
- [ ] Le corps du `<script>` du menu de l'en-tête est indenté d'un niveau dans sa balise, à la main : le correcteur le laisse en escalier, à 2, 6 et 10 espaces.
- [ ] La réécriture de la configuration ESLint supprime ses quatre libellés de section, qui répètent ce qui suit. Les commentaires sur les worktrees et sur les variables préfixées par `_` restent.
- [ ] Dans les tests e2e, rien d'autre ne change que des espaces.
- [ ] Une règle Claude Code **format**, à côté des règles existantes, en français, limitée par `paths:` aux fichiers `.ts`, `.astro`, `.js` et `.mjs`. Elle donne les conventions, dit qu'ESLint les impose, explique l'exception du `<script>` (la lint n'y vérifie que l'indentation relative à sa première ligne : la base d'un niveau se tient à la main) et donne la commande de correction.
- [ ] `CLAUDE.md` liste `npm run lint -- --fix` parmi ses commandes. Aucun script npm n'est ajouté.
- [ ] La lint mord : une indentation à 2 espaces, des guillemets doubles et un point-virgule manquant, ajoutés exprès, la font échouer, et `--fix` les corrige. On les retire ensuite.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent, et les tests n'ont changé que de format.
