# Le format du code est imposé par ESLint Stylistic, pas par Prettier

Le code mêlait deux styles : 2 ou 4 espaces, guillemets simples ou doubles. Le style majoritaire (4 espaces, guillemets simples, points-virgules, virgule finale en multiligne) est imposé par `@stylistic/eslint-plugin`, réglé dans `eslint.config.js`. Un seul outil vérifie ainsi le code, `npm run lint`, dont `CLAUDE.md` fait déjà une condition de fin de tâche ; `npm run lint -- --fix` corrige le format. ESLint Stylistic vérifie aussi l'indentation du HTML des `.astro`, que `astro-eslint-parser` lui présente comme du JSX.

## Options écartées

- **Prettier, avec `prettier-plugin-astro` et `eslint-config-prettier`** : un second outil, une seconde configuration et une seconde commande, que les postes et la CI devraient lancer en plus de la lint, pour un résultat que la lint obtient seule.
- **Les règles de format d'ESLint lui-même** (`indent`, `quotes`, `semi`) : dépréciées depuis ESLint 8.53, elles disparaissent en 11.0.
- **Des conventions écrites, sans outil** : rien n'empêcherait les deux styles de revenir.

## Conséquences

Changer d'outil plus tard veut dire reformater tout le dépôt, en conflit avec chaque branche ouverte.
