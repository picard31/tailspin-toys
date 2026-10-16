Status: ready-for-agent
Blocked by: 04, 07

# 09 : La question de clarification

Spec : la spec du Backer Concierge (`../spec.md`).

## Ce qu'il faut construire

Quand la demande du Visiteur est vague, ou dépend d'une donnée que le Catalogue n'enregistre pas, le Concierge pose une seule question courte au lieu de deviner, sans Recommandation. Le Visiteur y répond dans la même conversation, et obtient les Recommandations qui correspondent.

Ce comportement vient du modèle : ce ticket complète le prompt système, et on le vérifie à la main.

## Critères d'acceptation

- [x] Le prompt système dit au modèle de poser une seule question courte quand la demande est vague ou dépend d'une donnée absente du Catalogue, avec `gameIds` vide.
- [x] Le prompt reste identique d'un appel à l'autre : les tests existants le prouvent toujours.
- [ ] On vérifie à la main, sur `npm run dev`, avec une clé :
  - « Recommend me a good game » donne une seule question courte, sans Recommandation ;
  - répondre « Strategy, please » donne des Recommandations de la Catégorie Strategy ;
  - « Which game is best for six players? » donne une question courte, ou une réponse qui dit que le Catalogue n'enregistre pas le nombre de joueurs, sans Recommandation inventée.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Comments

Livré par la PR #4. Les trois questions restent à vérifier avec une clé.
