Status: ready-for-agent

# Standards de code : commentaires, documentation et format

Source : `backlog/08-coding-standards.md` (laissé intact). Décision d'outil : `docs/adr/0002-format-impose-par-eslint-stylistic.md`. Ordre de livraison : vague 0 de `backlog/dev-plan.md`, seul, avant tous les autres tickets.

## Problème

Qui contribue au dépôt, participant de la formation ou Claude, ne trouve écrit nulle part comment commenter ni comment formater. Le code lui montre deux styles contradictoires : 4 espaces et guillemets simples dans la couche de données et la plupart des composants ; 2 espaces dans les pages, l'en-tête, la mise en page et les fichiers de configuration, avec des guillemets doubles dans deux d'entre eux. Certains commentaires répètent la ligne qui les suit. Trois fonctions exportées n'ont pas de TSDoc, et aucune ne décrit ses paramètres ni sa valeur de retour. Cinq composants et la mise en page ne documentent pas leurs Props. Rien ne signale ces écarts : `npm run lint` passe quel que soit le style. Chaque nouvelle branche ajoute donc sa variante, et la relecture s'use sur la forme plutôt que sur le fond.

## Solution

Deux règles Claude Code, chargées dès qu'on touche un fichier source, disent comment commenter et comment formater ; le README les résume et y renvoie. ESLint impose tout ce qui peut l'être : le format partout, HTML des `.astro` compris, un TSDoc complet sur chaque fonction exportée de la couche de données, et un commentaire sur chaque prop des composants. Le moindre écart fait échouer `npm run lint`, et `npm run lint -- --fix` corrige le format. Le code existant est mis en conformité dans le même ticket, pour que les vagues suivantes partent d'un dépôt propre.

## User stories

1. En tant que participant de la formation, je veux une règle écrite sur ce qu'un commentaire doit dire, pour ne plus hésiter entre trop et pas assez commenter.
2. En tant que participant, je veux que les commentaires expliquent pourquoi un morceau de code existe ou pourquoi une décision non évidente a été prise, pour comprendre l'intention sans la deviner.
3. En tant que lecteur du code, je veux qu'aucun commentaire ne répète la ligne qui le suit, pour que ceux qui restent méritent d'être lus.
4. En tant que relecteur, je veux qu'un commentaire périmé compte comme un bogue, corrigé ou supprimé dans le changement qui touche le code, pour que les commentaires restent dignes de confiance.
5. En tant que développeur qui appelle une fonction de la couche de données, je veux un résumé en TSDoc, pour savoir ce qu'elle fait sans lire son corps.
6. En tant que développeur, je veux un `@param` par paramètre, qui dit ce que le type ne dit pas (d'où vient la valeur, ce qu'on en attend), pour appeler la fonction correctement du premier coup.
7. En tant que développeur, je veux un `@returns` qui dit les cas particuliers (`null`, ordre de tri), pour traiter chaque cas sans lire l'implémentation.
8. En tant qu'auteur de tests, je veux que le paramètre `db` soit documenté comme injecté (les pages passent la base partagée, les tests une base en mémoire), pour que le modèle de test du dépôt reste évident.
9. En tant qu'auteur d'une fonction qui ne rend rien, je ne veux pas de `@returns`, pour ne pas écrire un tag vide.
10. En tant que développeur, je veux que les types restent dans TypeScript et jamais dans les tags, pour qu'ils ne puissent pas diverger.
11. En tant que développeur, je veux voir le TSDoc au survol d'un appel dans mon éditeur, pour lire la documentation là où j'en ai besoin.
12. En tant qu'utilisateur d'un composant, je veux un commentaire sur chaque prop, qui dit ce que le composant en fait, pour m'en servir sans lire son balisage.
13. En tant qu'utilisateur d'un composant, je veux voir ce commentaire au survol de la prop, pour ne pas ouvrir le fichier du composant.
14. En tant que participant, je veux un seul style dans tout le dépôt, pour ne pas avoir à le choisir à chaque fichier.
15. En tant que participant, je veux que ce style soit celui de la majorité du code (4 espaces, guillemets simples, points-virgules, virgule finale en multiligne), pour que la mise en conformité touche le moins de lignes possible.
16. En tant que participant, je veux que le HTML des `.astro` suive la même indentation et que la lint la vérifie, pour que balisage et code se lisent de la même façon.
17. En tant que participant, je veux que le corps d'un `<script>` soit indenté d'un niveau dans sa balise, comme tout élément enfant.
18. En tant que relecteur, je veux qu'aucune ligne ne finisse par des espaces et que chaque fichier finisse par un saut de ligne, pour des diffs sans bruit.
19. En tant que participant, je ne veux pas de longueur de ligne maximale, pour ne pas couper les listes de classes Tailwind ni les chaînes longues.
20. En tant que participant, je veux que `npm run lint` échoue sur un écart de format, pour le voir avant de pousser.
21. En tant que participant, je veux que `npm run lint -- --fix` corrige seul le format, pour ne jamais réindenter à la main.
22. En tant qu'agent, je veux que chaque écart soit une erreur et jamais un avertissement, puisqu'une tâche n'est finie que quand `npm run lint` passe.
23. En tant qu'agent, je veux que la lint signale un TSDoc ou un commentaire de prop manquant, pour ne pas l'oublier sur les helpers et les composants qu'ajouteront les vagues suivantes.
24. En tant qu'agent, je veux que les règles se chargent dès que j'ouvre un fichier source, sans alourdir les tâches qui n'en touchent aucun.
25. En tant que nouveau participant, je veux une section du README qui résume les standards en trois lignes et renvoie aux règles, pour les découvrir dès l'installation.
26. En tant que participant, je veux trouver la commande de correction dans la liste des commandes de `CLAUDE.md`, à côté de `npm run lint`.
27. En tant que relecteur, je veux que la CI, sous Windows et sous Linux, applique les mêmes règles que les postes, sans étape supplémentaire.
28. En tant que futur mainteneur, je veux un ADR qui explique le choix d'ESLint Stylistic plutôt que Prettier, pour ne pas rouvrir la question sans raison nouvelle.
29. En tant que développeur des vagues suivantes, je veux que la mise en conformité soit faite une fois, avant les autres branches, pour que mes fusions ne butent pas sur un reformatage.
30. En tant que responsable des tests e2e, je veux que leur mise en conformité ne change que des espaces et des commentaires, puisqu'on ne peut pas les lancer pendant la formation.

## Décisions d'implémentation

### Où vivent les standards

- Deux nouvelles règles Claude Code, à côté des règles existantes, rédigées en français comme elles, avec des exemples de code en anglais. Chacune est limitée par `paths:` aux fichiers `.ts`, `.astro`, `.js` et `.mjs`.
  - **commentaires** : un commentaire dit pourquoi, pas quoi ; le TSDoc des fonctions exportées ; les commentaires des Props ; un commentaire périmé est un bogue.
  - **format** : les conventions, le fait qu'ESLint les impose, l'exception du `<script>` et la commande de correction.
- `CLAUDE.md` ne reçoit que `npm run lint -- --fix`, dans sa liste de commandes. Pas de nouveau script npm.
- Le README gagne une courte section « Standards de code » : un résumé en trois lignes, avec des liens vers les deux règles et vers l'ADR 0002. Les règles n'y sont pas recopiées.

### Commentaires et TSDoc

- Un commentaire explique une intention ou une décision non évidente. Ceux qui paraphrasent le code sont supprimés.
- Chaque fonction exportée de la couche de données, tests exclus, porte un TSDoc : un résumé, un `@param` par paramètre, un `@returns`, sauf pour `void`. Chaque tag dit ce que le type ne dit pas, et aucun ne porte de type. Les constantes, les tables Drizzle et les types n'en ont pas besoin. L'exemple fixé pendant le cadrage :

  ```ts
  /**
   * A single game by id.
   *
   * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
   * @param id - The game's primary key.
   * @returns The game, or `null` when no game has this id.
   */
  ```

- Chaque prop déclarée dans l'interface `Props` d'un composant ou d'une mise en page porte son TSDoc, qui dit ce que le composant en fait (« Shown as the hero's `<h1>` »), pas son type. Les props héritées de `HTMLAttributes` ne sont pas concernées.

### Format

- 4 espaces, guillemets simples, points-virgules, virgule finale en multiligne, pas d'espace en fin de ligne, un saut de ligne final, pas de longueur maximale.
- Partout : TypeScript, JavaScript des fichiers de configuration, `.astro` (frontmatter, HTML et `<script>`), tests e2e.
- Le corps d'un `<script>` est indenté d'un niveau dans sa balise. La lint n'y vérifie que l'indentation relative à la première ligne du bloc : cette base se tient à la main, et la règle **format** le dit.
- Les fins de ligne restent l'affaire de `.gitattributes`, qui impose LF partout.

### Outillage (ADR 0002)

- `@stylistic/eslint-plugin`, sur tout le dépôt : `indent`, `quotes`, `semi`, `comma-dangle`, `no-trailing-spaces`, `eol-last`. Les règles de format d'ESLint lui-même, dépréciées, ne sont pas utilisées.
- `eslint-plugin-jsdoc` :
  - sur la couche de données, tests exclus : `require-jsdoc` limité aux fonctions exportées, `require-param`, `require-param-description`, `require-returns`, `require-returns-description`, `check-param-names`, `no-types` ;
  - sur les composants et les mises en page : `require-jsdoc`, avec pour seul contexte les membres de l'interface `Props`. Un prototype a validé le sélecteur, sur ESLint 10.11 et `eslint-plugin-astro` 3.2.1 : `TSInterfaceDeclaration[id.name='Props'] TSPropertySignature`.
- Toutes les règles ajoutées sont en `error`.
- Deux nouvelles dépendances de développement, rien d'autre.

### Mise en conformité du code existant

- `npm run lint -- --fix` sur tout le dépôt. Le prototype a montré que le correcteur réindente proprement le HTML des `.astro`, mais laisse le `<script>` du menu de l'en-tête en escalier (2, 6, 10 espaces) : ce bloc se ramène à la main à un niveau dans sa balise.
- Le TSDoc est complété sur les 22 fonctions exportées de la couche de données : les trois fonctions qui fabriquent les descriptions du seed n'en ont pas, et aucune n'a encore de `@param` ni de `@returns`.
- Les Props sont documentées dans l'état vide, la carte de jeu, le bandeau de page, la notation par étoiles et la mise en page. Le bouton, le tag et la carte le sont déjà.
- Commentaires supprimés :
  - les trois commentaires du `<script>` du menu de l'en-tête ;
  - la première phrase de l'en-tête du fichier des types de jeu (la seconde, qui dit qui produit et qui lit ces types, reste) ;
  - les quatre libellés de section de la configuration ESLint ;
  - dans la configuration Playwright, les trois lignes `dotenv` commentées et les commentaires du modèle qui répètent l'option qu'ils précèdent ;
  - dans les tests e2e, les `// Check that…` suivis de la ligne qui vérifie.
- Commentaires gardés, parce qu'ils disent pourquoi :
  - le préchargement des polices de la mise en page ;
  - `prerender = false`, dans la route d'API et dans la configuration d'Astro ;
  - `pathToFileURL`, dans le seed et dans l'export du catalogue ;
  - la gestion des CRLF, le vidage final et les 21 paliers de note du seed ;
  - le contournement du type Drizzle dans le client de base ;
  - le tri ordinal du test de l'export ;
  - l'ordre inversé du test des jeux ;
  - `first()` contre le mode strict, et le focus déjà sur le premier lien, dans les tests e2e ;
  - « Never reuse a running server » dans la configuration Playwright.
- Dans les tests e2e, rien d'autre ne change que des espaces et des commentaires.

## Décisions de test

- Une seule couture : `npm run lint`. C'est elle qui prouve le ticket, sur les postes et dans la CI, sous Windows et sous Linux. Pas de nouveau test Vitest : la configuration ESLint n'appartient ni à `src/lib/` ni à `db/`, et un test qui linterait des extraits n'en prouverait pas plus que la lint du dépôt.
- Pendant l'implémentation, on vérifie que chaque famille de règles mord : une violation volontaire (indentation, guillemets, point-virgule, TSDoc absent, `@param` absent, prop sans commentaire) fait échouer la lint, puis on la retire.
- `npm run test:unit` et `npm run typecheck` gardent la non-régression : ni le reformatage ni les commentaires ne changent un comportement, et les tests existants passent sans autre modification que leur format.
- Ce qu'un commentaire dit ne se vérifie pas par outil : cette partie reste à la relecture.
- Aucun test e2e lancé, aucun écrit.
- Le ticket est fini quand `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Hors périmètre

- Prettier, et le format des fichiers qu'ESLint ne lit pas : CSS, Markdown, YAML de la CI, JSON.
- La documentation des types, des constantes et des tables Drizzle.
- Une longueur de ligne maximale.
- Un script npm de correction.
- Tout changement de comportement, tests e2e compris.
- Les autres tickets du backlog.

## Notes

- Le ticket est mené seul, en vague 0 de `backlog/dev-plan.md` : il touche presque tous les fichiers et, mené en parallèle, entrerait en conflit avec chaque branche.
- L'ADR du format porte le numéro 0002 parce que l'ADR 0001 (l'accueil rendu à la demande) existe sur `origin/secours/07-filtres` et arrivera avec la vague 2.
- Le worktree de la vague 0 n'a pas de `node_modules`. Y lancer `npm ci` plutôt que de lier celui du checkout principal : sinon l'ajout des deux plugins modifierait aussi les dépendances du checkout principal.
