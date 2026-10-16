# Le Concierge est ancré dans le Catalogue : le modèle choisit, le Catalogue affiche

Le Concierge (ticket 09) répond aux questions des Visiteurs avec l'API Claude, appelée par une route servie à la demande, `POST /api/concierge`. La clé d'API reste sur le serveur.

À chaque question, la route construit le Catalogue en mémoire avec `toCatalogExport`, le donne au modèle et lui demande une sortie structurée `{ answer, gameIds }`. Elle écarte les identifiants absents du Catalogue, et rend les Jeux retenus tels que le Catalogue les décrit. Le titre, la Catégorie, l'Éditeur et la note d'une Recommandation ne viennent donc jamais du modèle, et Vitest le prouve sans l'appeler.

L'historique de la conversation vit dans la page, qui l'envoie en entier à chaque question. La page a donc besoin de JavaScript, contrairement aux Filtres (ADR 0001). Il n'y a pas de recherche web.

## Options écartées

- **Le texte du modèle pris tel quel** : rien ne prouverait que les Jeux cités existent, ni que leur note est la bonne.
- **Un formulaire envoyé sans JavaScript, comme les Filtres** : une question à la fois, et la question de clarification ne mènerait nulle part, sauf à garder la conversation sur le serveur.
- **La recherche web pour le contexte général** : elle coûte, le réseau des salles de formation est incertain, et rien de ce qu'elle rapporte ne se vérifie contre le Catalogue.
- **La lecture de `db/catalog.json`** : ce fichier est ignoré par git, absent d'un clone neuf tant qu'on n'a pas lancé `npm run db:export`, et périmé dès que la base change.

## Conséquences

- Le texte de `answer` peut encore mal nommer un Jeu : seul le prompt l'en dissuade.
- Les refus et les questions de clarification dépendent du modèle : ils se vérifient à la main, pas avec Vitest.
- Chaque question coûte un appel à l'API, sur une clé partagée. Des limites bornent ce coût : 500 caractères par question, 10 questions par conversation.
- Sans clé, le Concierge répond 503 ; le reste du site n'en dépend pas.
