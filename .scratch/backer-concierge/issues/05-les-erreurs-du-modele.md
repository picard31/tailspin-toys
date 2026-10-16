Status: ready-for-agent
Blocked by: 02

# 05 : Une erreur claire quand le modèle refuse ou répond mal

Spec : la spec du Backer Concierge (`../spec.md`).

## Ce qu'il faut construire

Quand le modèle refuse de répondre, s'arrête avant la fin de sa réponse ou rend une sortie qui ne respecte pas le schéma, le Visiteur lit un message d'erreur clair dans la conversation, au lieu d'une réponse vide ou d'une page cassée. Il peut reposer sa question.

## Critères d'acceptation

- [x] `answerConcierge` rend 502 avec `{ error }`, un message en anglais qui invite à réessayer, quand :
  - le modèle refuse de répondre (raison d'arrêt `refusal`) ;
  - le modèle s'arrête sur la limite de jetons (raison d'arrêt `max_tokens`) ;
  - la sortie n'a pas d'`answer` texte ;
  - `gameIds` manque ou n'est pas une liste de nombres entiers.
- [x] Une sortie conforme continue de donner 200.
- [x] La page affiche ce message dans la conversation, le champ garde la question, et le focus y revient.
- [x] Les tests prouvent chacun de ces cas à travers `answerConcierge`, avec un tableau `it.each` et une fausse `askModel` qui rend la raison d'arrêt ou la sortie du cas.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Comments

Livré par la PR #4. La revue de la PR #4 a ajouté un cas de 502 : une `answer` vide, faite d'espaces ou de plus de 4 000 caractères, que la page renverrait dans l'historique et que les règles de la conversation refuseraient ensuite (`readModelOutput`, `src/lib/concierge.ts` ; trois cas du tableau `it.each`, et le test « accepts an answer of 4,000 characters »). La spec le cite depuis la PR #7.
