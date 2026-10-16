Status: ready-for-agent
Blocked by: 01

# 02 : Le lien depuis la Fiche

Spec : `../spec.md`. Vocabulaire : `GLOSSARY.md`.

## Ce qu'il faut construire

Sur la Fiche d'un Jeu, le visiteur lit le bloc « About the publisher » et suit le lien « All games by <nom> » jusqu'à la Page Éditeur. Le bloc est là dès que le Jeu a un Éditeur, même quand l'Éditeur n'a pas de description : seule la description dépend de `null`. Cela change la règle du ticket 03, pour ce seul bloc.

Ce ticket ne touche que la Fiche. Il est bloqué par 01 seulement parce que son lien doit mener à une page qui existe pour qu'on le vérifie. Il clôt le ticket 04 du backlog.

## Critères d'acceptation

- [x] Le bloc « About the publisher », un `<section>` titré par un `<h2>`, est présent dès que le Jeu a un Éditeur. Il est absent quand le Jeu n'en a pas.
- [x] Le paragraphe `data-testid="game-details-publisher-description"` n'est présent que si la description de l'Éditeur n'est pas `null`.
- [x] Le bloc se termine par le lien « All games by <nom> » vers `/publisher/<id>`. Ce lien porte :
  - [x] `data-testid="game-details-publisher-link"` ;
  - [x] un focus visible (`focus:ring-2 focus:ring-blue-500 focus:outline-none`) ;
  - [x] la couleur des liens de texte du site, `text-blue-400`, souligné au survol.
- [x] Le texte du lien est le même que l'Éditeur ait un ou plusieurs Jeux, et il se comprend hors contexte.
- [x] Ne changent pas :
  - [x] le bloc « About the category », toujours absent quand sa description vaut `null` ;
  - [x] les Tags de la Catégorie et de l'Éditeur, et la description du Jeu ;
  - [x] le `getStaticPaths` de la Fiche ;
  - [x] la carte de Jeu, qui ne contient toujours aucun lien.
- [x] Rien ne change dans `src/lib/`, et les tests existants passent sans modification.
- [x] On vérifie à la main, au clavier, sur `npm run dev` :
  - [x] sur une Fiche, Tab atteint le lien avec un focus visible ;
  - [x] Entrée ouvre la Page Éditeur du bon Éditeur ;
  - [x] une carte de cette page ramène à une Fiche.
- [x] Chaque critère d'acceptation de `backlog/04-publisher-pages.md` est couvert par 01 ou par 02. Le fichier du backlog reste intact.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
