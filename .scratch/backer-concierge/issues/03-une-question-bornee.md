Status: ready-for-agent
Blocked by: 02

# 03 : Une question bornée

Spec : la spec du Backer Concierge (`../spec.md`).

## Ce qu'il faut construire

Une question vide, faite seulement d'espaces ou trop longue, ou une requête mal formée, reçoit un message d'erreur clair, sans qu'on interroge le modèle. Le coût d'une question reste ainsi borné, puisque tous les postes partagent une clé plafonnée.

Ce ticket complète la lecture de la question posée par le ticket 02. Chaque question part encore seule : l'historique viendra avec le ticket 07.

## Critères d'acceptation

- [x] `answerConcierge` n'accepte qu'une liste `messages` d'exactement un message, du Visiteur (`role: 'user'`), dont le `content` est un texte non vide une fois les espaces retirés, de 500 caractères au plus.
- [x] Toute autre requête reçoit 400 avec `{ error }`, un message en anglais qui dit ce qui ne va pas, sans appel à `askModel`.
- [x] La page affiche ce message dans la conversation, et le champ garde la question.
- [x] Les tests prouvent, à travers `answerConcierge`, avec un tableau `it.each` : un corps sans `messages`, une liste `messages` vide, un `messages` qui n'est pas une liste, un `content` qui n'est pas du texte, une question vide, une question faite d'espaces, une question de 501 caractères, un message du Concierge, deux messages. Chacun donne 400, et `askModel` n'est pas appelée.
- [x] Les tests prouvent aussi qu'une question de 500 caractères exactement est acceptée.
- [x] On vérifie à la main, sur `npm run dev`, qu'une question faite d'espaces donne un message d'erreur dans la conversation.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Comments

Livré par la PR #4. La règle « exactement un message » a ensuite été remplacée par les règles d'une conversation (ticket 07), comme celui-ci le prévoit.

Vérifié à la main sur `npm run dev`, avec une clé factice (sans clé, le 503 passe avant le 400) : une question faite d'espaces donne « The question is empty. Please type a question. » dans la conversation, sans appel au modèle, et le champ garde la question.
