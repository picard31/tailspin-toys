Status: ready-for-agent
Blocked by: 01

# 02 : Poser une question et lire la réponse du Concierge

Spec : la spec du Backer Concierge (`../spec.md`). Architecture : ADR 0003.

## Ce qu'il faut construire

Le Visiteur tape une question, appuie sur Entrée et lit la réponse du Concierge, qui a tout le Catalogue sous les yeux. Sans clé d'API, la page lui dit que le Concierge n'est pas configuré.

C'est la première tranche qui traverse tout, de la page jusqu'au modèle. Elle pose la clé, le SDK, la route et le point d'entrée `answerConcierge`, que les tickets suivants étendront. Chaque question part seule, sans historique. Les Recommandations, la validation complète de la question et les erreurs du modèle viennent avec les tickets 03 à 05.

## Critères d'acceptation

- [x] Le SDK officiel d'Anthropic est une dépendance du projet.
- [x] `ANTHROPIC_API_KEY` est déclarée dans le schéma d'environnement d'Astro comme secret serveur facultatif. Elle est lue au moment de la requête, et n'apparaît ni dans le build ni dans le navigateur.
- [x] Un fichier `.env.example` committé nomme `ANTHROPIC_API_KEY`, sans valeur. Le README explique comment poser la clé de formation dans `.env`, et dit que le reste du site marche sans elle.
- [x] Le module du Concierge exporte `answerConcierge(db, body, { apiKey, askModel })`, qui rend `{ status, body }` :
  - `body` est le corps brut de la requête, en texte ;
  - `askModel` reçoit le prompt système et la conversation, et rend la raison d'arrêt du modèle et sa sortie structurée brute. Elle lève une erreur quand le fournisseur échoue.

  Ce module est distinct du module des Jeux, qui n'est pas modifié.
- [x] `POST /api/concierge` est servie à la demande, sur le modèle de la route qui rend un Jeu en JSON. Elle ne fait que :
  - lire la clé ;
  - fournir un `askModel` branché sur le SDK : `claude-opus-5-5`, effort `low`, repli `fallbacks: "default"`, sortie structurée à deux champs, `answer` (texte) et `gameIds` (liste d'identifiants). Ni streaming, ni recherche web, ni autre outil. Le client du SDK n'est construit qu'à l'appel, donc jamais sans clé ;
  - renvoyer le résultat d'`answerConcierge` en JSON, avec son statut.
- [x] `answerConcierge` :
  - sans clé, ou avec une clé vide : rend 503 avec `{ error }`, sans appeler `askModel` ;
  - quand le corps n'est pas du JSON ou n'a pas de question lisible (une liste `messages` dont le dernier message vient du Visiteur avec un `content` texte) : rend 400 avec `{ error }`, sans appeler `askModel` ;
  - construit le Catalogue avec la fonction d'export du Catalogue, depuis la base, à chaque question, sans lire le fichier qu'écrit `npm run db:export` ;
  - quand `askModel` lève une erreur : rend 502 avec `{ error }` ;
  - sinon rend 200 avec `{ answer, games }`, où `games` reste une liste vide jusqu'au ticket 04.
- [x] Le prompt système contient tout le Catalogue et reste identique d'un appel à l'autre, au caractère près. Il dit au modèle de ne recommander que des Jeux du Catalogue, par leur identifiant dans `gameIds`, et de ne nommer dans `answer` que les Jeux de `gameIds`.
- [x] Les messages d'erreur sont en anglais.
- [x] Le script de la page intercepte l'envoi du formulaire et appelle la route avec la question. Pendant l'attente :
  - « Thinking… » s'affiche dans l'élément d'attente ;
  - le bouton ne renvoie pas une seconde question.
- [x] Chaque échange s'ajoute à la conversation : la question, puis la réponse (`data-testid="concierge-answer"`), affichée en texte brut, jamais interprétée comme du HTML. Un message d'erreur de la route s'y affiche aussi.
- [x] Le champ est vidé quand la réponse arrive, et garde la question après une erreur. Dans les deux cas, le focus revient dans le champ.
- [x] Les tests du module du Concierge passent par `answerConcierge` seul. Ils utilisent une base en mémoire créée par `createTestDatabase()`, avec ses propres Catégories, Éditeurs et Jeux, et une fausse `askModel` qui note ce qu'elle reçoit. Ils prouvent :
  - sans clé ou avec une clé vide : 503, et `askModel` n'est pas appelée ;
  - un corps qui n'est pas du JSON : 400, et `askModel` n'est pas appelée ;
  - le prompt reçu par `askModel` contient chaque Jeu de la base, et il est identique pour deux questions ;
  - la conversation reçue par `askModel` contient la question du Visiteur ;
  - 200, avec l'`answer` rendue par `askModel` ;
  - `askModel` qui lève une erreur : 502.

  Aucun test n'appelle l'API Claude, et aucun ne simule le client du SDK.
- [ ] On vérifie à la main, sur `npm run dev` :
  - avec une clé, « Which game suits people who like git puns? » donne une réponse qui cite des Jeux du Catalogue ;
  - sans `.env`, le serveur démarre, la page s'affiche, et une question donne le message qui dit que le Concierge n'est pas configuré ;
  - au clavier, Entrée envoie la question, et le focus revient dans le champ après la réponse.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Comments

Livré par la PR #4. Vérifié à la main sans `.env` (le serveur démarre, la page dit que le Concierge n'est pas configuré, Entrée envoie, le focus revient dans le champ). Reste à vérifier avec une clé : « Which game suits people who like git puns? ».
