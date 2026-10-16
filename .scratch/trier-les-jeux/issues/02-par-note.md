Status: ready-for-agent
Blocked by: 01

# 02 : Trier le Catalogue par Note

Spec : `../spec.md`. Architecture : ADR 0005.

## Ce qu'il faut construire

Dans le formulaire de Filtres, une liste déroulante « Sort by » (Title, Rating) s'ajoute devant « Order ». Avec « Rating » et « Descending », le visiteur voit d'abord les Jeux les mieux notés ; avec « Rating » et « Ascending », les moins bien notés. Dans les deux sens, les Jeux sans Note viennent après tous les Jeux notés, et les Jeux à Note égale sont rangés par titre, de A à Z. L'URL porte la propriété du Tri, et l'option choisie reste sélectionnée après le rechargement.

Ce ticket élargit le module du Tri posé par le ticket 01. Dans les fichiers partagés, il ne touche que le formulaire de Filtres, où il ajoute la liste déroulante.

## Critères d'acceptation

- [x] Le type `CatalogSort` prend sa forme finale : `{ property: 'title' | 'rating'; direction: 'asc' | 'desc' }`.
- [x] `sortProperty` vaut `title` (par défaut) ou `rating`. Les valeurs invalides ne provoquent jamais d'erreur : une valeur vide, inconnue ou de casse différente (`Rating`) est ignorée, et seule la première valeur valide compte.
- [x] Les deux paramètres sont lus séparément. Un paramètre absent ou invalide prend sa propre valeur par défaut, sans toucher l'autre :
  - `?sortProperty=rating` seul trie par Note croissante ;
  - `?sortDirection=desc` seul trie toujours par titre de Z à A.
- [x] Le Tri par Note range les Jeux ainsi :
  - la Note stockée dans le sens choisi, puis le titre de A à Z, puis l'identifiant croissant ;
  - les Jeux sans Note après tous les Jeux notés, dans les deux sens, rangés entre eux par titre de A à Z puis identifiant croissant ;
  - la valeur triée est la Note en base, sans la borne 0–5 ni l'arrondi de l'affichage.
- [x] Le formulaire de Filtres affiche, devant « Order » :
  - un `<label>` « Sort by » relié à un `<select name="sortProperty">`, avec les options « Title » (`title`) et « Rating » (`rating`) ;
  - le `data-testid` `sort-property` sur le `<select>` ;
  - l'option du Tri retenu, sélectionnée ;
  - pas de `<fieldset>` autour des deux listes déroulantes.
- [x] Le `<select>` a un focus visible, dans le style des contrôles de Filtre.
- [x] Le fichier de test du module du Tri prouve, à travers `getCatalog` :
  - la Note décroissante et la Note croissante, avec des ex æquo rangés par titre de A à Z dans les deux sens ;
  - les Jeux sans Note en dernier dans les deux sens, et rangés entre eux par titre ;
  - les défauts indépendants des deux paramètres ;
  - chaque valeur invalide de `sortProperty`, dans un `it.each` ;
  - la première valeur valide ;
  - le Tri retenu dans `sort` ;
  - le Tri par Note appliqué au résultat d'un Filtre de Catégorie (`category`), sans `publisher`, que la 07.2 livre en parallèle.
- [x] Les données de ces tests sont insérées dans l'ordre inverse de l'ordre attendu : des Notes ex æquo, des Jeux sans Note, et des identifiants récupérés avec `returning`.
- [x] Les tests du ticket 01 passent sans changement.
- [x] On vérifie à la main, au clavier, sur `npm run dev` :
  - Tab atteint « Sort by » puis « Order », avec un focus visible ;
  - « Rating » et « Descending » mettent les Jeux à 5.0 en tête, et les ex æquo par titre ;
  - les deux options restent sélectionnées après le rechargement.

  Le seed donne une Note à chaque Jeu, donc la place des Jeux sans Note n'est prouvée que par Vitest.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
