# `syntaxes/` — fichiers générés, à ne pas éditer

Ni `typr.tmLanguage.json` ni `typr.syntax.json` n'appartiennent à ce dépôt. Ils
sont **générés** par le compilateur, à partir du même manifeste :

```
we-data-ch/typr
  crates/typr-core/src/components/syntax/mod.rs   ← la source de vérité
  typr syntax --json                               → typr.syntax.json
  typr syntax --target tmlanguage --write          → editors/vscode/syntaxes/typr.tmLanguage.json
```

et recopiés ici par le job `grammar` de la release du compilateur. La CI de ce
dépôt compare les deux copies à l'original et avertit si elles en diffèrent.

| Fichier | Consommé par |
|---|---|
| `typr.tmLanguage.json` | la coloration Shiki au build (`src/syntax/shiki.ts`) |
| `typr.syntax.json` | `scripts/gen-syntax-reference.mjs`, qui en dérive les inventaires de `docs/reference/operators.md` et `docs/reference/lexicon.md` |

Le second est le manifeste lui-même — la grammaire TextMate n'en est qu'un
rendu, et un rendu dont on ne peut pas relire la liste des mots-clés. C'est
pourquoi la doc consomme le manifeste et non la grammaire.

Ajouter un mot-clé, un opérateur ou un sigil se fait donc **dans le manifeste**,
jamais ici : une modification faite sur ces copies serait écrasée à la
prochaine release, et surtout elle recréerait la divergence que le manifeste a
supprimée — VSCode, le playground, la doc et Vim coloraient six syntaxes
différentes, dont des mots-clés Rust (`impl`, `trait`, `struct`, `enum`) que
TypR n'a jamais eus.

## Mettre à jour la copie à la main

Entre deux releases, la copie a le droit d'être en retard sur `develop`. Pour la
rafraîchir sans attendre une release, depuis un clone du compilateur :

```bash
typr syntax --json > .../typr.github.io/syntaxes/typr.syntax.json
npm run syntax:reference        # régénère les tableaux des pages de référence
```
