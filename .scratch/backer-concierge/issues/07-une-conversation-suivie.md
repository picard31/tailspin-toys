Status: ready-for-agent
Blocked by: 03

# 07 : Une conversation suivie

Spec : la spec du Backer Concierge (`../spec.md`). Architecture : ADR 0003.

## Ce qu'il faut construire

Le Visiteur enchaîne les questions, et le Concierge tient compte de tout ce qui a été dit depuis le début de la conversation. L'historique vit dans la page, qui l'envoie en entier à chaque question. Rien n'est gardé sur le serveur, et l'historique se perd au rechargement.

Ce ticket remplace la règle « exactement un message » du ticket 03 par les règles d'une conversation.

## Critères d'acceptation

- [x] `answerConcierge` accepte une conversation : une liste `messages` dont chaque message vient du Visiteur (`user`) ou du Concierge (`assistant`), avec ces règles :
  - les rôles alternent, et le premier comme le dernier message viennent du Visiteur ;
  - chaque `content` est un texte non vide une fois les espaces retirés ;
  - un message du Visiteur fait au plus 500 caractères ;
  - un message du Concierge fait au plus 4 000 caractères.

  Toute autre requête reçoit 400 avec `{ error }`, sans appel à `askModel`.
- [x] `askModel` reçoit la conversation entière, dans l'ordre.
- [x] La page garde l'historique et l'envoie en entier à chaque question. Le `content` d'un message du Concierge est le texte de sa réponse. Une question rejetée, ou qui a mené à une erreur, n'entre pas dans l'historique.
- [x] Les tests prouvent, à travers `answerConcierge`, avec une fausse `askModel` :
  - une conversation valide de trois questions donne 200, et `askModel` reçoit ses cinq messages, dans l'ordre ;
  - avec un tableau `it.each`, deux messages du même rôle à la suite, une conversation qui commence par le Concierge, une qui finit par le Concierge, un message du Concierge vide, un de 4 001 caractères : 400, et `askModel` n'est pas appelée ;
  - un message du Concierge de 4 000 caractères est accepté.

  Les cas du ticket 03 qui rejetaient un message du Concierge ou deux messages sont remplacés par ceux-ci. Les autres cas du ticket 03 restent.
- [ ] On vérifie à la main, sur `npm run dev`, avec une clé : « Which strategy games do you have? », puis « Which of those is the best rated? » donne une réponse qui parle des Jeux de stratégie de la première réponse.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Comments

Livré par la PR #4. L'historique envoyé en entier a été vérifié avec des réponses simulées dans la page ; la suite de conversation reste à vérifier avec une clé.
