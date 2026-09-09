# Contribuer à la documentation TypR

Site Docusaurus publié sur https://we-data-ch.github.io/typr.github.io/

## Boucle de travail

```bash
npm ci
npm start              # rechargement à chaud
npm run check:examples # compile chaque bloc ```typr — nécessite le binaire `typr`
npm run build          # ce que la CI exécute — à lancer avant d'ouvrir une PR
```

## Ce que la CI vérifie

Toute PR vers `main` compile d'abord **tous les exemples**, puis construit le
site en entier sans le déployer. Le déploiement n'a lieu qu'après la fusion.

`onBrokenLinks` est réglé sur `throw` : un lien interne mort **fait échouer la
construction**. C'est volontaire — mais ça veut dire qu'un lien cassé bloque
aussi tout déploiement ultérieur. Lance `npm run build` avant de pousser.

Le job `Check typr examples` de `deploy.yml` passe chaque bloc ` ```typr ` au
vrai compilateur (`typr check`) et bloque le build s'il en reste un qui ne
compile pas. Son oracle est la **dernière release** de `we-data-ch/typr` — la
version que le lecteur a réellement installée. Un second workflow,
`examples-develop.yml`, refait la même chose chaque nuit contre `develop` et
n'émet qu'un `::warning` : c'est le préavis « la prochaine release va casser tel
exemple », pas un garde-fou.

## Éditer depuis un navigateur (ou un téléphone)

Deux chemins, sans rien installer.

**Le lien « Edit this page ».** En bas de chaque page du site, il ouvre le
fichier directement dans l'éditeur web de GitHub (`editUrl` pointe sur
`/edit/main/` dans `docusaurus.config.ts`). Suffisant pour une correction de
typo depuis un mobile — demander « site pour ordinateur » si le clavier se
comporte mal.

**Pages CMS.** `.pages.yml` à la racine configure https://pagescms.org, une
interface d'édition hébergée : on s'y connecte avec son compte GitHub, on
autorise l'app sur le dépôt, et les pages apparaissent dans une liste éditable.
Rien à héberger, rien à ajouter au build — l'outil ne fait que committer, et
c'est `deploy.yml` qui reconstruit.

Ce que la configuration expose :

| Entrée | Contenu | Mode d'édition |
|---|---|---|
| Documentation | `docs/**.md` | markdown brut, frontmatter compris |
| Blog | `blog/*.md` | champs (titre, slug, auteurs, tags, image) + corps markdown |
| Blog (MDX) | `blog/*.mdx` | markdown brut — ces billets contiennent du JSX |
| Blog — tags / auteurs | `blog/tags.yml`, `blog/authors.yml` | YAML brut |

`docs/` est volontairement édité **en brut** : la majorité des pages n'ont pas
de frontmatter, et un éditeur WYSIWYG reformaterait les blocs ` ```typr `. Ne
pas ajouter de `fields:` à cette collection sans mesurer cet effet.

Deux réflexes depuis un téléphone :

- committer sur une branche et ouvrir une PR plutôt que d'écrire sur `main` —
  la CI construit la PR, donc un lien cassé est vu avant d'atteindre le site ;
- un nouveau tag de billet doit d'abord exister dans `blog/tags.yml`, sinon le
  build émet un avertissement (`onInlineTags: 'warn'`).

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

Trois mots-clés se posent après la langue :

| Mot-clé | Ce que le lecteur voit | Ce que la CI vérifie |
|---|---|---|
| *(aucun)* | bouton « playground » | le bloc **compile** |
| `autorun` | le playground exécute le bloc dès l'ouverture | le bloc **compile** |
| `noplayground` | pas de bouton | rien — le bloc est ignoré |
| `compile_fail` | bandeau « This example does not compile » + bouton | le bloc **échoue à compiler** |

`noplayground` sert aux blocs qui ne sont **pas des programmes complets** : une
expression de type isolée, un corps remplacé par `/* ... */`, une ligne de
syntaxe hors contexte. Sans lui, le bouton envoie le lecteur vers une erreur de
compilation.

`compile_fail` sert à autre chose, et la distinction compte : au bloc **complet
dont le refus par le compilateur est la démonstration** — « voici ce que TypR
n'accepte pas ». Emprunté à rustdoc, il fait deux choses que `noplayground` ne
faisait pas :

- il **le dit au lecteur**, par un bandeau au-dessus du code. Sans ça, un
  contre-exemple est indiscernable d'un exemple, et le lecteur pressé recopie du
  code que le compilateur refuse ;
- il **reste vérifié, à l'envers** : la CI exige que le bloc échoue. Le jour où
  le langage change et où le contre-exemple se met à compiler, le job le
  signale — sinon le bandeau mentirait, et personne ne s'en apercevrait.

Le bouton « playground » est conservé : le bandeau a prévenu, et l'erreur *est*
la démonstration — cliquer donne le message exact du compilateur. `compile_fail`
l'emporte sur `noplayground` : c'est une assertion, pas une dispense.

Le reste de la chaîne est décrit dans `INTEGRATION.md` du dépôt du playground.

### Vérification des exemples

Tout bloc ` ```typr ` **sans** `noplayground` est passé au compilateur en CI par
`scripts/check-typr-blocks.mjs` — dans le sens normal, ou à l'envers pour un
`compile_fail`. Localement :

```bash
npm run check:examples                       # tout
npm run check:examples -- --only reference/  # un dossier
npm run check:examples -- --list             # ce qui serait vérifié (et dans quel sens)
npm run check:examples -- --noplayground     # inventaire de ce qui est exclu
node scripts/check-typr-blocks.mjs --typr ./target/release/typr  # binaire précis
```

Le script écrit chaque bloc dans un fichier temporaire et lui applique
`typr check`, puis réécrit les positions du diagnostic en lignes du fichier
Markdown. Les blocs sont vérifiés **un par un, jamais concaténés** : les
exemples du playground sont volontairement auto-suffisants (préambule
`# --- setup, ... ---` quand ils ont besoin d'une définition d'un bloc
précédent), et les concaténer masquerait justement les blocs incomplets.

Trois issues quand un bloc ne compile pas — et la question à se poser est
toujours la même : *qu'est-ce que ce bloc est censé démontrer ?*

- l'exemple est simplement faux → **corrige-le** ;
- le refus du compilateur *est* la démonstration → **`compile_fail`**, et le
  lecteur voit enfin que c'est voulu ;
- ce n'a jamais été un programme complet (fragment, ligne de syntaxe isolée) →
  **`noplayground`**.

Un `compile_fail` qui se met à compiler est signalé lui aussi, avec le message
« marqué `compile_fail`, mais le bloc compile ». C'est le cas intéressant : le
langage a bougé sous un contre-exemple qui, sans ce garde-fou, aurait continué à
afficher un bandeau faux pendant des mois.

`--noplayground` liste ce qui reste exclu : chacun de ces blocs est soit une
limite connue du parser, soit un exemple à corriger un jour, soit un
contre-exemple qui gagnerait à passer en `compile_fail`. L'inventaire est
recalculé à la demande plutôt que tenu à la main dans un fichier, qui se
périmerait dès la PR suivante.

`typr check` n'a pas besoin de R : il se contente d'un avertissement quand
`Rscript` est absent.

## Ne pas commiter

`node_modules/`, `build/` et `.docusaurus/` sont ignorés. Ils l'ont longtemps
été mal : le dépôt contenait 31 000 fichiers de `node_modules`.

## Source de la référence

`syntaxe.md` à la racine est une carte de la syntaxe établie par lecture directe
du parseur. Elle fait autorité sur le comportement réel — mais elle contient
aussi des notes d'implémentation qui n'ont pas leur place dans la doc publique.
En cas de doute entre une page du site et `syntaxe.md`, c'est `syntaxe.md` qui
décrit le compilateur.

## Mesure d'audience

Le site peut compter ses pages vues avec [GoatCounter](https://www.goatcounter.com)
— sans cookie, sans identifiant persistant, donc sans bandeau de consentement.
**Elle est éteinte par défaut et il n'y a rien à faire pour la garder éteinte** :
tout est piloté par une variable d'environnement lue au build, et tant qu'elle
est vide (`npm start`, un build local, une PR), aucun script tiers n'est injecté
et aucune requête n'est émise.

Pour l'allumer, une fois le compte GoatCounter créé : définir la **variable de
dépôt** (Settings → Secrets and variables → Actions → *Variables*)

```
GOATCOUNTER_ENDPOINT = https://<compte>.goatcounter.com/count
```

C'est délibérément une variable et pas un secret : la valeur finit dans le
JavaScript public du site, et la ranger dans `secrets` ne masquerait que les
journaux de CI en laissant croire à une confidentialité qui n'existe pas.
Le prochain déploiement suffit ; aucun changement de code.

Pour vérifier la mesure de bout en bout avant de l'allumer, en local :

```bash
GOATCOUNTER_ENDPOINT=https://<compte>.goatcounter.com/count \
GOATCOUNTER_ALLOW_LOCAL=1 npm run build && npm run serve
```

Le second drapeau est nécessaire : `count.js` refuse de compter depuis
`localhost`. Et c'est bien `npm run build`, pas `npm start` — c'est au build que
la variable est lue.

Ce qui est mesuré, et pourquoi, est décrit dans `src/analytics/goatcounter.ts` ;
ce que le visiteur en voit est en question 36 de la FAQ. Deux choses seulement :
les pages lues, et **les recherches qui ne renvoient aucun résultat**
(`src/theme/SearchPage/`) — la meilleure source d'idées de roadmap documentaire
qui soit, puisqu'elle dit ce que les lecteurs cherchent et ne trouvent pas.
