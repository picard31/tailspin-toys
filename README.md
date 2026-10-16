# Tailspin Toys

Le projet d'entraînement de la formation Claude Code « Context Engineering, skills & workflows ». C'est un fork de [github-samples/tailspin-toys](https://github.com/github-samples/tailspin-toys), l'appli que GitHub utilise pour ses ateliers d'agents, adapté à Claude Code (voir [ce qui change](#ce-qui-change-par-rapport-à-loriginal)).

Tailspin Toys est un site fictif de financement participatif de jeux : un catalogue de 21 jeux, une fiche par jeu et une page À propos. Il est écrit en TypeScript, avec [Astro](https://astro.build/) 7 et [Tailwind CSS](https://tailwindcss.com/) v4. Les données sont dans une base SQLite locale, lue avec [Drizzle ORM](https://orm.drizzle.team/) et le module SQLite intégré à Node. Il n'y a rien d'autre à installer que Node : ni serveur de base de données, ni Docker, ni clé d'API.

## Prérequis

- **Git**.
- **Node.js 24 LTS** ; Node 22 convient aussi, à partir de 22.13. Évitez les versions impaires (23, 25), que Vitest ne prend pas en charge. Vérifiez avec `node --version`.
- **Claude Code**.

Sous Windows, si PowerShell refuse de lancer `npm` (« l'exécution de scripts est désactivée sur ce système »), tapez une fois `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, ou passez par Git Bash.

## Installation

```bash
git clone https://github.com/denneulin/tailspin-toys.git
cd tailspin-toys
npm ci
```

## Lancer le site

```bash
npm run dev
```

Ouvrez l'URL affichée, http://localhost:4321 en général. `npm run dev` crée d'abord la base, `tailspin.db`, à partir de `db/games.csv`. Dans un deuxième worktree, le serveur prend le port libre suivant (4322, 4323…).

Quand c'est Claude Code qui lance `npm run dev` sous macOS ou Linux, Astro 7 passe le serveur en arrière-plan et rend la main à Claude. Pour l'arrêter : `npx astro dev stop`.

## Tester

```bash
npm run test:unit       # Vitest : 39 tests, en moins d'une seconde
npm run lint            # ESLint : le code, son format, les TSDoc et les Props
npm run typecheck       # TypeScript 7 (tsgo) sur db/ et src/lib/
```

Les tests e2e (Playwright, `npm run test:e2e`) ne servent pas pendant la formation : ils demandent un navigateur de test, que les postes n'installent pas.

## Standards de code

- **Format** : 4 espaces, apostrophes simples, points-virgules, virgule finale en multiligne ; `npm run lint` l'impose et `npm run lint -- --fix` le corrige ([règle `format`](.claude/rules/format.md), [ADR 0002](docs/adr/0002-format-impose-par-eslint-stylistic.md)).
- **Commentaires** : un commentaire dit pourquoi (une intention, un choix, un piège), jamais ce que le code dit déjà, et un commentaire périmé est un bug ([règle `commentaires`](.claude/rules/commentaires.md)).
- **Documentation** : un TSDoc complet sur chaque fonction exportée de `db/` et `src/lib/`, un commentaire sur chaque prop des composants, dont `npm run lint` vérifie la présence ([règle `commentaires`](.claude/rules/commentaires.md)).

## Le backlog

Neuf tickets, rédigés par l'équipe de GitHub, sont dans [`backlog/`](backlog/). Chacun a un besoin, puis des critères d'acceptation à cocher : accessibilité, `data-testid` et tests unitaires. Seul le 08, les standards de code, est livré ; l'ordre des autres est dans [`backlog/dev-plan.md`](backlog/dev-plan.md).

| Ticket | En bref |
|---|---|
| [01](backlog/01-search-games.md) | Rechercher un jeu par son titre |
| [02](backlog/02-sort-games.md) | Trier la liste par titre (A–Z, Z–A) ou par note |
| [03](backlog/03-detail-descriptions.md) | Afficher sur la fiche d'un jeu la description de sa catégorie et de son éditeur |
| [04](backlog/04-publisher-pages.md) | Une page par éditeur, avec ses jeux |
| [05](backlog/05-catalog-summary.md) | Un résumé du catalogue sur l'accueil : nombre de jeux, note moyenne |
| [06](backlog/06-pagination.md) | Paginer la liste des jeux |
| [07](backlog/07-filter-games.md) | Filtrer par catégorie et par éditeur, les deux filtres combinés |
| [08](backlog/08-coding-standards.md) | Des standards de code : commentaires, TSDoc, règles ESLint (rien de visible à l'écran) |
| [09](backlog/09-backer-concierge.md) | « Backer Concierge », un assistant IA qui répond sur le catalogue (il faut une clé d'API) |

Vous pouvez aussi partir de votre propre idée : une liste de souhaits, des avis, le bouton « Support This Game », qui ne fait encore rien… Une fonctionnalité qui enregistre quelque chose passe par une route servie à la demande ; le modèle est `src/pages/api/games/[id].ts`.

## Le harness Claude Code

- `CLAUDE.md` : les commandes, quand une tâche est finie, la langue des échanges et du code, et les pièges du projet.
- `.claude/rules/` : six règles, chargées selon les fichiers que Claude lit (données, interface, tests unitaires, tests e2e, commentaires, format).
- `.claude/settings.json` : les tests unitaires, le lint, la vérification des types et le serveur de dev tournent sans demande de permission, et les worktrees de `claude -w` partent du commit courant (`"worktree": { "baseRef": "head" }`).

## Ce qui change par rapport à l'original

- Le contexte Copilot (`.github/copilot-instructions.md`, fichiers d'instructions, skills, workflows agentiques) est remplacé par le harness Claude Code ci-dessus.
- L'adaptateur Node d'Astro est installé : les pages restent prérendues, et une route qui exporte `prerender = false` répond à la demande. Une route d'exemple, `GET /api/games/:id`, est testée dans `e2e-tests/api.spec.ts`.
- Les tests e2e marchent quand Claude Code les lance, et chaque worktree teste son propre serveur.
- Windows : des fins de ligne LF partout, et des serveurs qui n'écoutent que sur la machine (pas d'alerte du pare-feu).
- Les tickets, qui devenaient des issues GitHub dans un dépôt créé depuis le modèle, sont des fichiers de `backlog/`.

## Licence

MIT, comme l'original : voir [LICENSE](LICENSE). Tailspin Toys est un projet de GitHub, [github-samples/tailspin-toys](https://github.com/github-samples/tailspin-toys). Ce site n'est pas fait pour la production.
