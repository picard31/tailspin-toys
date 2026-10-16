Status: ready-for-agent
Blocked by: 07

# 08 : Au plus dix questions, et « New conversation »

Spec : la spec du Backer Concierge (`../spec.md`).

## Ce qu'il faut construire

Une conversation compte au plus dix questions : à la onzième, la page invite le Visiteur à en commencer une nouvelle, ce qui borne le coût d'une conversation. Le bouton « New conversation » vide la conversation et l'historique, d'un geste.

## Critères d'acceptation

- [x] `answerConcierge` rend 400 avec `{ error }` pour une conversation de plus de dix questions du Visiteur, sans appel à `askModel`. Le message, en anglais, invite à commencer une nouvelle conversation.
- [x] Un bouton « New conversation » (`data-testid="concierge-reset"`) vide la conversation affichée et l'historique, puis met le focus dans le champ. Il a un focus visible.
- [x] Les tests prouvent, à travers `answerConcierge`, avec une fausse `askModel` :
  - une conversation de dix questions est acceptée ;
  - une conversation de onze questions donne 400, avec le message qui invite à recommencer, et `askModel` n'est pas appelée.
- [ ] On vérifie à la main, sur `npm run dev`, avec une clé :
  - une onzième question donne le message qui invite à commencer une nouvelle conversation ;
  - après « New conversation », la conversation est vide, le focus est dans le champ, et la question suivante ne tient plus compte des précédentes.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Comments

Livré par la PR #4. La onzième question refusée et « New conversation » ont été vérifiés avec des réponses simulées et la vraie route ; reste à vérifier avec une clé que la question suivante ne tient plus compte des précédentes.
