# Contribuer à la documentation TypR

Site Docusaurus publié sur https://we-data-ch.github.io/typr.github.io/

## Boucle de travail

```bash
npm ci
npm start          # rechargement à chaud
npm run build      # ce que la CI exécute — à lancer avant d'ouvrir une PR
```

## Ce que la CI vérifie

Toute PR vers `main` construit le site en entier sans le déployer. Le
déploiement n'a lieu qu'après la fusion.

`onBrokenLinks` est réglé sur `throw` : un lien interne mort **fait échouer la
construction**. C'est volontaire — mais ça veut dire qu'un lien cassé bloque
aussi tout déploiement ultérieur. Lance `npm run build` avant de pousser.

## Structure

Le site suit le cadre Diátaxis : une page ne mélange pas les genres.

| Dossier | Rôle | Question à laquelle la page répond |
|---|---|---|
| `docs/intro.md`, `docs/tutorials/` | Tutoriel | « je débute, guide-moi » |
| `docs/howto/` | Guide pratique | « comment je fais X ? » |
| `docs/reference/` | Référence | « quelle est la syntaxe exacte de X ? » |
| `docs/philosophy/`, `docs/concepts/` | Explication | « pourquoi c'est conçu comme ça ? » |

Si une page répond à deux de ces questions, elle doit être coupée en deux.

## Blocs de code

Les blocs TypR se balisent ` ```typr `. La coloration vient de la grammaire
générée par le compilateur (`syntaxes/typr.tmLanguage.json`, appliquée au build
par `src/syntax/shiki.ts`) — et c'est aussi cette langue qui décide de l'ajout
du bouton « playground ».

Deux mots-clés se posent après la langue :

| Mot-clé | Effet |
|---|---|
| `autorun` | le playground compile et exécute le bloc dès l'ouverture |
| `noplayground` | pas de bouton du tout |

`noplayground` sert aux blocs qui ne sont pas des programmes complets : une
expression de type isolée, un corps remplacé par `/* ... */`, une ligne de
syntaxe hors contexte. Sans lui, le bouton envoie le lecteur vers une erreur de
compilation. Le reste de la chaîne est décrit dans `INTEGRATION.md` du dépôt du
playground.

Les blocs **ne sont pas vérifiés contre le compilateur** au build. Un exemple
peut donc devenir faux silencieusement quand le langage évolue. Deux
conséquences :

- vérifie tout exemple que tu ajoutes avec un `typr check` réel ;
- ne recopie pas un exemple depuis une page ancienne sans le retester.

Rendre ces blocs vérifiables en CI est le prochain chantier de ce dépôt.

## Ne pas commiter

`node_modules/`, `build/` et `.docusaurus/` sont ignorés. Ils l'ont longtemps
été mal : le dépôt contenait 31 000 fichiers de `node_modules`.

## Source de la référence

`syntaxe.md` à la racine est une carte de la syntaxe établie par lecture directe
du parseur. Elle fait autorité sur le comportement réel — mais elle contient
aussi des notes d'implémentation qui n'ont pas leur place dans la doc publique.
En cas de doute entre une page du site et `syntaxe.md`, c'est `syntaxe.md` qui
décrit le compilateur.
