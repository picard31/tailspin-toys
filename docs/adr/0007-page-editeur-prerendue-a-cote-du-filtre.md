# La Page Éditeur est prérendue, à côté du Filtre Éditeur

Le ticket 04 donne à chaque Éditeur de la base sa Page Éditeur, `/publisher/<id>`, avec son nom, sa description et tous ses Jeux triés par titre. Elle est prérendue par `getStaticPaths`, comme la Fiche d'un Jeu. L'accueil, qui affiche les mêmes Jeux avec le Filtre Éditeur (`/?publisher=<id>`), est pourtant rendu à la demande (ADR 0001). Les deux n'ont pas le même rôle : le Filtre restreint le Catalogue et se combine aux autres Filtres, la Page Éditeur présente un Éditeur. Elle ne reprend donc ni le formulaire de Filtres, ni la Recherche, ni le Tri de l'accueil. Son code ne dépend pas de celui du Filtre Éditeur, ce qui permet de livrer le 04 et la 07.2 en parallèle.

## Options écartées

- **Un simple lien vers `/?publisher=<id>`, sans page** : c'est moins de code. Mais la description de l'Éditeur n'aurait pas de place, le critère du ticket (une page prérendue) ne serait pas tenu, et le 04 devrait attendre la fusion de la 07.2.

## Conséquences

- La liste des Jeux d'un Éditeur s'affiche à deux endroits, sur sa Page Éditeur et sur l'accueil filtré, par deux lectures différentes.
- Comme la Fiche, la Page Éditeur montre la base telle qu'elle était au build.
