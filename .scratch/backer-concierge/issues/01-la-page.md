Status: ready-for-agent
Blocked by: aucun (peut démarrer tout de suite)

# 01 : La page du Concierge, atteignable depuis le menu

Spec : la spec du Backer Concierge (`../spec.md`).

## Ce qu'il faut construire

Depuis n'importe quelle page, le Visiteur trouve « Backer Concierge » dans le menu principal et ouvre la page du Concierge. Il y voit à quoi sert le Concierge et un formulaire pour poser sa question. Le formulaire n'est pas encore branché : le ticket 02 le relie au Concierge.

Ce ticket pose la structure que les suivants rempliront : la région de la conversation, l'état d'attente et les `data-testid`.

## Critères d'acceptation

- [x] Un lien « Backer Concierge » vers `/concierge` suit « About » dans le menu principal de l'en-tête.
- [x] La page `/concierge` est prérendue, comme les autres pages du site.
- [x] Son `<title>` est « Backer Concierge - Tailspin Toys », son `<h1>` « Backer Concierge ». Une phrase d'introduction dit que le Concierge ne connaît que le Catalogue de Tailspin Toys.
- [x] Le formulaire (`data-testid="concierge-form"`) comprend :
  - une étiquette « Your question » reliée à un champ texte d'une ligne, limité à 500 caractères (`data-testid="concierge-question"`) ;
  - un bouton « Ask » (`data-testid="concierge-ask"`).
- [x] La page contient une région de conversation vide, `role="log"` (`data-testid="concierge-log"`), et un élément d'attente vide, `role="status"` (`data-testid="concierge-status"`).
- [x] Un `<noscript>` dit que le Concierge a besoin de JavaScript.
- [x] Le champ, le bouton et le lien du menu ont un focus visible, dans le style du projet. La page suit le thème sombre du site.
- [x] On vérifie à la main, sur `npm run dev` : le lien du menu mène à la page depuis l'accueil, la page À propos et une fiche de Jeu ; au clavier, Tab atteint le lien, le champ et le bouton, avec un focus visible.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
