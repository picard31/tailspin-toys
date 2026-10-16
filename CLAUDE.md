# Tailspin Toys

Site fictif de financement participatif de jeux, en Astro 7 et Tailwind CSS v4, sans framework front. Les pages sont prérendues au build ; une route qui exporte `prerender = false` est servie à la demande par l'adaptateur Node, sur le modèle de `src/pages/api/games/[id].ts`. Les données sont dans un SQLite local, lu avec Drizzle ORM et le module `node:sqlite` de Node.

## Commandes

- `npm run dev` : serveur de dev, sur le premier port libre à partir de 4321 ; l'URL est dans la sortie. `npm run dev -- --port 4322` impose le port.
- `npm run test:unit` : Vitest, en moins d'une seconde. Un seul fichier : `npx vitest run src/lib/games.test.ts`.
- `npm run lint` : ESLint, qui vérifie aussi le format, les TSDoc de `db/` et `src/lib/` et les `Props` des composants. `npm run lint -- --fix` corrige le format.
- `npm run typecheck` : TypeScript 7 (`tsgo`) sur `db/` et `src/lib/`.

Une tâche est finie quand `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

Ne lance ni les tests e2e (`npm run test:e2e`) ni Playwright, et n'écris pas de nouveau test e2e : pendant la formation, les postes n'ont pas de navigateur de test. Ce qui doit être prouvé l'est par Vitest, sur les fonctions de `src/lib/` et de `db/`.

## Branches et PR

- Les branches se poussent sur le remote `picard31` (`https://github.com/picard31/tailspin-toys.git`), et les PR s'ouvrent dans ce dépôt, vers sa branche `main` : `gh pr create --repo picard31/tailspin-toys --base main`.
- Jamais vers `denneulin/tailspin-toys`, le remote `origin` : on n'y pousse aucune branche et on n'y ouvre aucune PR, même quand GitHub le propose comme base par défaut d'un fork. `origin` ne sert qu'à récupérer `main`.

## Langue

Les échanges, les specs, les tickets, le glossaire et les ADR sont en français. Le code, ses commentaires et les textes affichés par le site restent en anglais.

## Pièges

- Sous macOS et Linux, Astro 7 détecte que c'est un agent qui lance `npm run dev` ou `npm run preview` : le serveur passe en arrière-plan, et la commande rend la main avec l'URL. Un second `npm run dev` dans le même dossier ne relance rien, il redonne cette URL. `npx astro dev status`, `npx astro dev logs` et `npx astro dev stop` le pilotent (`npx astro preview …` pour la preview). Sous Windows, le serveur reste au premier plan, et la commande ne rend jamais la main : lance-la en tâche de fond (`run_in_background`).
- `tailspin.db`, ignorée par git, est construite à partir de `db/games.csv` par `npm run db:setup`, que lancent `npm run dev` et `npm run build`. Le seed n'ajoute que les jeux absents : après un changement du CSV ou du seed, supprime `tailspin.db`.
- Les migrations de `db/migrations/` sont produites par `npm run db:generate` après un changement de `db/schema.ts`, et committées avec lui ; ne les écris jamais à la main.
- Le paquet `typescript` reste en v6 : ESLint et `astro check` ne supportent pas encore la v7. TypeScript 7 (`tsgo`) ne sert qu'à la vérification de types.

## Agent skills

### Gestionnaire de tickets

Tickets et specs en fichiers Markdown locaux, sous `.scratch/<fonctionnalité>/`. Voir `docs/agents/issue-tracker.md`.

### Labels de tri

Les cinq labels par défaut (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), en ligne `Status:` dans chaque ticket. Voir `docs/agents/triage-labels.md`.

### Docs de domaine

Contexte unique : `GLOSSARY.md` et `docs/adr/` à la racine. Voir `docs/agents/domain.md`.
