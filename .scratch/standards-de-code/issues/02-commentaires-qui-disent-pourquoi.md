Status: ready-for-agent
Blocked by: 01

# 02 : Des commentaires qui disent pourquoi

Spec : `../spec.md`.

## Ce qu'il faut construire

Le lecteur du code ne croise plus de commentaire qui répète la ligne suivante ; ceux qui restent expliquent une intention ou une décision non évidente. Une règle Claude Code **commentaires** l'écrit, avec la règle du commentaire périmé : il compte comme un bogue, corrigé ou supprimé dans le changement qui touche le code.

Ce ticket crée la règle **commentaires** ; les tickets 03 et 04 y ajouteront chacun leur section. Il attend 01 parce qu'il modifie les mêmes fichiers : le `<script>` de l'en-tête, la configuration Playwright, les tests e2e.

## Critères d'acceptation

- [x] Une règle Claude Code **commentaires**, à côté des règles existantes, en français avec des exemples en anglais, limitée par `paths:` aux fichiers `.ts`, `.astro`, `.js` et `.mjs`. Elle dit qu'un commentaire explique pourquoi, jamais quoi ; qu'un commentaire qui paraphrase le code se supprime ; qu'un commentaire périmé est un bogue.
- [x] Ces commentaires sont supprimés :
  - les trois commentaires du `<script>` du menu de l'en-tête ;
  - la première phrase de l'en-tête du fichier des types de jeu (la seconde, qui dit qui produit et qui lit ces types, reste) ;
  - dans la configuration Playwright, les trois lignes `dotenv` commentées et les commentaires du modèle qui répètent l'option qu'ils précèdent ;
  - dans les tests e2e, les `// Check that…` suivis de la ligne qui fait la vérification.
- [x] Ces commentaires restent, parce qu'ils disent pourquoi :
  - le préchargement des polices de la mise en page ;
  - `prerender = false`, dans la route d'API et dans la configuration d'Astro ;
  - `pathToFileURL`, dans le seed et dans l'export du catalogue ;
  - la gestion des CRLF, le vidage final et les 21 paliers de note du seed ;
  - le contournement du type Drizzle dans le client de base ;
  - le tri ordinal du test de l'export, et l'ordre inversé du test des jeux ;
  - `first()` contre le mode strict, et le focus déjà sur le premier lien, dans les tests e2e ;
  - « Never reuse a running server » dans la configuration Playwright.
- [x] Dans les tests e2e et la configuration Playwright, rien d'autre ne change que des commentaires.
- [x] `npm run test:unit`, `npm run lint` et `npm run typecheck` passent.

## Comments

Livré par la PR picard31/tailspin-toys#1. Des deux commentaires `first()` des tests e2e, celui de l'en-tête garde sa raison, le mode strict. Celui des cartes de jeu, dans le test des SVG décoratifs, invoquait aussi le mode strict, à tort : `count()` et `nth(i)` n'y sont pas soumis. Il dit maintenant la vraie raison, qu'une carte suffit puisque toutes affichent les mêmes icônes.

Des trois commentaires du `<script>` du menu de l'en-tête, les deux premiers sont supprimés. Le troisième, qui paraphrasait le gestionnaire d'Escape, est remplacé par un commentaire qui dit pourquoi le focus revient au bouton : un utilisateur au clavier reprend là où il a ouvert le menu.
