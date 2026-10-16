Status: ready-for-agent
Blocked by: 04

# 05 : Les standards dans le README

Spec : `../spec.md`.

## Ce qu'il faut construire

Un nouveau participant découvre les standards de code dès le README : une courte section les résume et renvoie aux deux règles Claude Code et à l'ADR 0002, sans les recopier.

Il vient en dernier pour que le résumé décrive des règles toutes en place et vérifiées.

## Critères d'acceptation

- [ ] Le README gagne une section « Standards de code », en français comme le reste du README.
- [ ] Elle tient en trois lignes : le format imposé par la lint et sa commande de correction ; des commentaires qui disent pourquoi ; le TSDoc de la couche de données et les commentaires des Props, vérifiés par la lint.
- [ ] Elle renvoie, par des liens relatifs qui marchent sur GitHub, aux règles **format** et **commentaires** et à l'ADR 0002.
- [ ] On vérifie, un par un, que les critères d'acceptation du ticket 08 du backlog sont remplis, sans modifier ce ticket.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
