Status: ready-for-agent
Blocked by: 03

# 04 : Les Props des composants, vérifiées par la lint

Spec : `../spec.md`.

## Ce qu'il faut construire

Qui utilise un composant ou une mise en page lit, au survol de chaque prop, ce que le composant en fait. `npm run lint` échoue quand une prop déclarée dans l'interface `Props` n'a pas de commentaire. La règle **commentaires** gagne la section qui le dit.

Il attend 03, qui installe et configure `eslint-plugin-jsdoc` : les deux tickets modifieraient sinon les mêmes dépendances, le même fichier de verrouillage et la même configuration.

## Critères d'acceptation

- [ ] Sur les composants et les mises en page, `jsdoc/require-jsdoc` est en `error`, avec pour seul contexte les membres de l'interface `Props`. Un prototype a validé ce sélecteur, sur ESLint 10.11 et `eslint-plugin-astro` 3.2.1 : `TSInterfaceDeclaration[id.name='Props'] TSPropertySignature`.
- [ ] Les Props de l'état vide, de la carte de jeu, du bandeau de page (deux props), de la notation par étoiles et de la mise en page sont documentées. Celles du bouton, du tag et de la carte, déjà documentées, restent telles quelles.
- [ ] Chaque commentaire dit ce que le composant fait de la prop (« Shown as the hero's `<h1>` »), pas son type. Les props héritées de `HTMLAttributes` ne sont pas concernées.
- [ ] La règle **commentaires** gagne une section Props : à quoi elle s'applique, ce que dit un commentaire de prop, un exemple, et le fait que la lint vérifie la présence du commentaire mais pas son contenu.
- [ ] La lint mord : une prop ajoutée sans commentaire la fait échouer. On la retire ensuite.
- [ ] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.
