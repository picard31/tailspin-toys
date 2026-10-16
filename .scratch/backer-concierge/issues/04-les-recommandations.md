Status: ready-for-agent
Blocked by: 02

# 04 : Les Recommandations, tirées du Catalogue

Spec : la spec du Backer Concierge (`../spec.md`). Architecture : ADR 0003.

## Ce qu'il faut construire

Sous la réponse du Concierge, le Visiteur voit la liste des Recommandations. Chacune porte un lien vers la fiche du Jeu, avec sa Catégorie, son Éditeur et sa note. Ces données viennent du Catalogue, jamais du modèle : un Jeu que le modèle inventerait n'apparaît pas.

## Critères d'acceptation

- [ ] Dans la réponse 200 d'`answerConcierge`, `games` contient les Jeux des `gameIds` présents dans le Catalogue, tels que l'export du Catalogue décrit un Jeu :
  - les identifiants absents du Catalogue sont écartés ;
  - les doublons sont fusionnés ;
  - l'ordre du modèle est gardé.
- [ ] Sous chaque réponse, la page affiche la liste des Recommandations. Pour chacune (`data-testid="concierge-game"`), un lien vers `/game/{id}` porte le titre, avec la Catégorie, l'Éditeur et le libellé de la note.
- [ ] La liste est construite avec les API du DOM, en texte brut ; le composant de carte de Jeu, rendu côté serveur, n'est pas réutilisé. Une réponse sans Recommandation n'affiche pas de liste vide.
- [ ] Les tests prouvent, à travers `answerConcierge`, sur une base en mémoire, avec une fausse `askModel` :
  - les Recommandations ont le titre, la Catégorie, l'Éditeur et la note de la base, même si la sortie du modèle prétend autre chose ;
  - un identifiant inconnu est écarté ;
  - les doublons sont fusionnés ;
  - l'ordre du modèle est gardé ;
  - un `gameIds` vide donne un `games` vide.
- [ ] On vérifie à la main, sur `npm run dev`, avec une clé : « Which game suits people who like git puns? » donne des Recommandations dont les liens mènent aux bonnes fiches, avec la Catégorie, l'Éditeur et la note de ces fiches.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
