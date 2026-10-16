---
paths:
  - "**/*.ts"
  - "**/*.astro"
  - "**/*.js"
  - "**/*.mjs"
---

# Format du code

ESLint applique le format avec `@stylistic/eslint-plugin`, sur le TypeScript, le JavaScript et les fichiers `.astro` (frontmatter, gabarit et `<script>`). Un écart fait échouer `npm run lint`, et `npm run lint -- --fix` le corrige ; en cas de doute, `eslint.config.js` fait foi. Le choix de l'outil est dans `docs/adr/0002-format-impose-par-eslint-stylistic.md`.

- Indentation de 4 espaces ; les `case` d'un `switch` décalés d'un niveau.
- Apostrophes simples, ou des guillemets pour une chaîne qui contient une apostrophe.
- Un point-virgule à la fin de chaque instruction, et après chaque membre d'une interface ou d'un type.
- Une virgule après le dernier élément d'une liste écrite sur plusieurs lignes : objet, tableau, arguments, paramètres, imports.
- L'accolade ouvrante en fin de ligne (`} else {`).
- Des espaces dans les accolades (`{ id }`), aucun dans les crochets (`[a, b]`), un autour des opérateurs et après chaque virgule.
- Pas de longueur de ligne maximale : une liste de classes Tailwind ou une longue chaîne reste sur sa ligne.
- Aucun espace en fin de ligne, une ligne vide d'affilée au plus, un saut de ligne à la fin du fichier.

## Le `<script>` des `.astro`

Le corps d'un `<script>` est indenté d'un niveau dans sa balise, comme tout élément enfant :

```astro
<script>
    const menu = document.getElementById('menu');
</script>
```

La lint n'y vérifie que l'indentation relative à la première ligne du bloc : un `<script>` entier à 2 ou à 8 espaces passe. Cette base d'un niveau se tient à la main, et `--fix` ne la rétablit pas.

`--fix` laisse aussi en place un commentaire aligné sur la ligne voisine plutôt que sur le code qu'il précède, et la suite d'une expression coupée sur plusieurs lignes : aligne-les à la main.
