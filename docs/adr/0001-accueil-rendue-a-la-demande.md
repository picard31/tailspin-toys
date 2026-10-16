# La page d'accueil est rendue à la demande pour filtrer le Catalogue

Le site est prérendu, sauf les routes qui exportent `prerender = false`. Pour filtrer le Catalogue (ticket 07), la page d'accueil passe en `prerender = false`. Elle lit les filtres dans la query string d'un formulaire GET et interroge SQLite à travers un helper de `src/lib/`. Le filtrage reste ainsi dans du code que Vitest teste, fonctionne sans JavaScript avec des contrôles natifs accessibles, et produit des URL qu'on peut partager. La recherche (01), le tri (02) et la pagination (06) viendront s'y greffer comme d'autres paramètres de la même URL.

## Options écartées

- **Filtrer en JS dans le navigateur, sur la page prérendue** : le filtrage ne passerait plus par `src/lib/`, et Vitest ne prouverait rien de ce que voit l'utilisateur.
- **Une API JSON à la demande, et un script qui reconstruit la grille** : plus de code pour le même résultat, et rien ne marche sans JavaScript.

## Conséquences

La page d'accueil n'est plus un fichier statique : chaque visite fait une requête SQLite, et le site a besoin du serveur Node pour l'afficher.
