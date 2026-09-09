# Les extraits de code de la page d'accueil

Un fichier = un bloc de code de la page d'accueil. Ce sont de vrais fichiers, et
c'est tout l'intérêt : `npm run check:examples` compile chaque `.ty` avec le vrai
compilateur, exactement comme les blocs ` ```typr ` de la documentation. Un
exemple faux sur la première page que lit un visiteur est la pire des vitrines,
et rien d'autre ne l'empêcherait.

Ils sont lus et colorés au build par [`../plugin.ts`](../plugin.ts), qui les
publie en HTML déjà prêt. La page les désigne par `<nom>.<langage>` :
`package.ty` devient la clé `package.typr`, `package.R` la clé `package.r`.

| Extension | Langage | Vérifié ? |
|---|---|---|
| `.ty` | `typr` | oui, par `typr check` |
| `.R` | `r` | non — c'est le « avant » d'une comparaison, il n'a pas à compiler |
| `.sh` | `bash` | non |
| `.txt` | texte brut | non — un diagnostic du compilateur, recopié |

## Les contre-exemples

Un nom qui se termine par `-broken` **doit** être rejeté par le compilateur : le
vérificateur inverse l'oracle sur ces fichiers, comme le fait ` ```typr
compile_fail ` dans la documentation. Le jour où l'un d'eux se met à compiler,
c'est que le langage a bougé sous lui — et que la page montre au lecteur une
erreur qui n'existe plus.

`pipeline-broken.ty` est le pendant de `pipeline.ty`, l'étape de conversion en
moins ; `pipeline-error.txt` est le diagnostic que `typr check` produit dessus,
recopié tel quel (seul le nom du fichier a été remplacé par `pipeline.ty`, qui
est celui que le lecteur a sous les yeux). Pour le régénérer après une évolution
des messages du compilateur :

```bash
typr check src/homepage/snippets/pipeline-broken.ty 2>&1 \
  | sed 's/\x1b\[[0-9;]*m//g' \
  | sed -n '/× Type error/,/╰────/p' \
  | sed 's/pipeline-broken\.ty/pipeline.ty/' \
  > src/homepage/snippets/pipeline-error.txt
```

## Ajouter un extrait

1. Déposer le fichier ici.
2. Le référencer par sa clé depuis `src/homepage/UseCases.tsx` ou
   `src/pages/index.tsx` — une clé inconnue arrête le build, elle ne laisse pas
   un trou dans la page.
3. `npm run check:examples`.

Les blocs de la page d'accueil sont larges d'environ 55 caractères sur un écran
de bureau : au-delà, la ligne se met à défiler horizontalement. Mieux vaut
couper la signature sur plusieurs lignes que compter sur le défilement.
