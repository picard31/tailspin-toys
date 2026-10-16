Status: ready-for-agent
Blocked by: aucun (peut démarrer tout de suite)

# 01 : Afficher les descriptions de la Catégorie et de l'Éditeur sur la fiche d'un Jeu

Source : `backlog/03-detail-descriptions.md` (laissé intact). Vocabulaire : `GLOSSARY.md`.

## Ce qu'il faut construire

Sur la fiche d'un Jeu, après « About this game », le Visiteur lit la description de la Catégorie du Jeu puis celle de son Éditeur, chacune dans son bloc. Un bloc dont la description manque n'apparaît pas.

Une lecture propre à la fiche, `getGameDetails(db, id)`, remonte les descriptions. Les types des listes (`Game`, `Category`, `Publisher`), `getGameById` et la route `GET /api/games/:id` ne changent pas. Leur ajouter un champ casserait :

- les tests qui comparent la forme exacte de la Catégorie et de l'Éditeur, dans `src/lib/games.test.ts` et `e2e-tests/api.spec.ts` ;
- les objets construits en littéral dans `db/export-catalog.test.ts` ;
- `getAllCategories`, que la tranche 07.1 du filtrage, livrée en parallèle, déclare rendre des `Category`.

`getGameDetails` vit dans son propre module, `src/lib/game-details.ts`, et non dans `src/lib/games.ts`. La tranche 07.1 modifie la ligne d'imports de `games.ts`, ajoute des lignes juste après l'import du type `Game` et des fonctions à la fin du fichier : toute modification de `games.ts` par ce ticket risquerait un conflit de fusion.

Les descriptions sont affichées telles que le seed les écrit (`db/transforms.ts`). Ce ticket ne touche ni au seed ni au CSV.

Le ticket 04 du backlog (pages d'Éditeur) réutilisera `GameDetails`, et ajoutera dans le bloc de l'Éditeur un lien vers sa page.

## Critères d'acceptation

- [ ] `src/types/game.ts` définit :
  - `CategoryDetails` et `PublisherDetails`, qui étendent `Category` et `Publisher` avec `description: string | null` ;
  - `GameDetails`, un `Game` dont la Catégorie et l'Éditeur sont de ces types, avec la même nullité que dans `Game`.

  `Game`, `Category` et `Publisher` ne changent pas.
- [ ] `getGameDetails(db, id)`, dans `src/lib/game-details.ts`, rend le `GameDetails` du Jeu, ou `null` quand il n'existe pas.
- [ ] Une description `null`, vide ou faite seulement d'espaces devient `null` dans `getGameDetails`. La page n'a qu'à tester `null`.
- [ ] `src/lib/games.ts` n'est pas modifié. `getGameById`, `getAllGames` et la route `GET /api/games/:id` rendent exactement ce qu'ils rendaient.
- [ ] `src/pages/game/[id].astro` lit le Jeu avec `getGameDetails`, y compris pour la redirection vers `/404`. `getStaticPaths` ne change pas.
- [ ] Après la section « About this game », la fiche montre deux blocs, dans cet ordre :
  - « About the category » : un `<section>` titré par un `<h2>`, et un `<p>` qui porte `data-testid="game-details-category-description"` ;
  - « About the publisher » : un `<section>` titré par un `<h2>`, et un `<p>` qui porte `data-testid="game-details-publisher-description"`.

  Titres et texte ont le style de « About this game ».
- [ ] Un bloc n'est pas dans le HTML quand sa description est `null`, ni quand le Jeu n'a pas de Catégorie ou d'Éditeur.
- [ ] Les tags de la Catégorie et de l'Éditeur (`game-details-category`, `game-details-publisher`) ne changent pas.
- [ ] `src/lib/game-details.test.ts` prouve, sur une base en mémoire créée par `createTestDatabase()` :
  - que les deux descriptions remontent ;
  - avec `it.each`, qu'une description `null`, `''` ou `'   '` donne `null`, pour la Catégorie comme pour l'Éditeur ;
  - qu'un identifiant inconnu donne `null`.
- [ ] Les tests existants de `src/lib/games.test.ts` passent sans modification.
- [ ] On vérifie à la main, sur `npm run dev`, qu'une fiche de Jeu montre les deux blocs, dans l'ordre, avec le style de « About this game ».
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
