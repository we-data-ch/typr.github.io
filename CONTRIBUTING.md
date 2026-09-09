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

## Versionnement de la documentation

**État : le site n'est pas versionné.** Il n'existe qu'une documentation, servie
sous `/docs/`, dont l'oracle d'exemples est la dernière release du compilateur.

Le versionnement est **délibérément différé** (plan-phase2 §2.9) : il double le
coût de maintenance de chaque page, pour un langage dont la syntaxe bouge
encore. Ce qui est **décidé dès maintenant**, c'est le schéma d'URL — le changer
après coup casse tous les liens entrants, et un lien vers une page de doc vit
plus longtemps que la version qu'elle décrit.

### Le contrat d'URL

| URL | Contenu | Existe |
|---|---|---|
| `/docs/<page>` | la **dernière release** | aujourd'hui, et toujours |
| `/docs/next/<page>` | `develop`, non publié | à partir du jour où l'on versionne |
| `/docs/<x.y>/<page>` | une release plus ancienne | pas avant 1.0 — voir plus bas |
| `/llms.txt`, `/llms-full.txt`, `/docs/<page>.md` | la dernière release | aujourd'hui, et toujours |

Une phrase suffit à le résumer : **`/docs/<page>` ne désigne jamais autre chose
que la dernière release.** Le jour où l'on versionne, aucune URL existante ne
change de place ; c'est la documentation de `develop` qui déménage vers
`/docs/next/`, et elle n'a aujourd'hui aucun lien entrant.

C'est exactement le comportement **par défaut** de Docusaurus quand
`versioned_docs/` existe — vérifié en construisant le site versionné, pas
supposé. Il n'y a donc rien à configurer pour l'obtenir, seulement des choses à
ne pas faire.

### Ce qu'il ne faut pas faire

| Tentation | Ce qu'elle casse |
|---|---|
| `lastVersion: 'current'` | `/docs/` se met à décrire `develop` : le lecteur lit une syntaxe que son compilateur ne connaît pas, sans que rien ne l'en avertisse |
| donner à la release un `path` (`/docs/latest/`, `/docs/0.5/`) | tous les liens entrants tombent en 404, et Google met des mois à suivre |
| une version par patch (`0.5.10`) | dix instantanés pour une seule syntaxe — la granularité est le **`x.y`**, la version exacte reste affichée sur la page d'accueil |
| renommer `next` en `develop` dans l'URL | `next` est la convention Docusaurus, connue des lecteurs ; c'est l'**étiquette** du menu qui doit dire `develop`, pas le chemin |

### Quand versionner

Le déclencheur n'est pas une date, c'est un fait observable : **le jour où un
bloc ` ```typr ` ne peut plus être vrai à la fois pour la release et pour
`develop`.** Le workflow `examples-develop.yml` est précisément là pour le
signaler la nuit venue — quand son `::warning` ne dénonce plus un bug mais un
changement de langage assumé, la doc a deux publics et il est temps de couper.

Avant 1.0, **une seule release est publiée à la fois** : au moment de versionner
pour `0.6`, l'instantané de `0.5` est supprimé, pas archivé. Conséquence
heureuse : aucune URL de la forme `/docs/<x.y>/` n'est jamais publiée, donc
aucune ne peut casser plus tard. Les anciens instantanés restent dans l'historique
git, qui est leur place. On commencera à en garder plusieurs (et à les déclarer
dans `onlyIncludeVersions`) quand des utilisateurs resteront volontairement sur
une version ancienne — c'est-à-dire après 1.0.

### Le jour où l'on versionne

Dans l'ordre. Les points 3 et 4 sont ceux qu'on ne voit pas en construisant le
site : ils échouent en silence.

1. **Figer l'instantané** — `npx docusaurus docs:version 0.5`. Il crée
   `versioned_docs/version-0.5/`, `versioned_sidebars/` et `versions.json`.
   Coût mesuré sur le site actuel : +37 pages HTML (62 → 99), 11 → 16 Mo de
   sortie, et un second index de recherche de 1,4 Mo (chargé paresseusement,
   et seulement par qui lit cette version-là).

2. **Déclarer le schéma explicitement** dans `docusaurus.config.ts`, même si
   c'est le défaut — c'est la ligne qu'un futur mainteneur « corrigerait »
   autrement :

   ```ts
   docs: {
     lastVersion: '0.5',
     versions: {
       current: {label: 'develop 🚧', path: 'next'},
       '0.5': {label: '0.5', path: ''},
     },
   }
   ```

   Et un item `{type: 'docsVersionDropdown', position: 'right'}` dans la navbar,
   sans quoi personne ne peut atteindre `/docs/next/`.

3. **Repointer les fichiers pour LLM sur l'instantané** :
   `docsDir: 'versioned_docs/version-0.5'` dans `docusaurus-plugin-llms`. Ils
   décrivent **la release**, pas `develop` — ils existent pour faire écrire du
   TypR correct à un modèle, et le modèle écrit pour le compilateur que
   l'utilisateur a installé.

   Deux pièges vérifiés :

   - **Ne pas utiliser `versions: 'auto'`.** Le plugin préfixe les versions à la
     racine du site là où Docusaurus les préfixe après `/docs` : les fichiers de
     `current` atterrissent dans `/next/docs/…` alors que les pages sont servies
     sous `/docs/next/…`, et les liens de `/next/llms.txt` renvoient vers les
     pages **stables**. Un jeu de fichiers, celui de la release, et le compte est
     bon.
   - **L'ordre de lecture doit venir de la barre latérale figée.**
     `includeOrder` contient des chemins `docs/<id>.md` (voir
     `src/llms/order.ts`) : aucun ne correspond plus à
     `versioned_docs/version-0.5/…`, donc toutes les pages basculent dans
     `includeUnmatchedLast` et `llms.txt` perd l'ordre Diátaxis — silencieusement.
     Il faut passer un préfixe à `docOrderFromSidebars` et le nourrir de
     `versioned_sidebars/version-0.5-sidebars.json`, qui a exactement la même
     forme que `sidebars.ts`.

4. **Inverser les deux vérifications d'exemples**, qui sans cela vérifient
   toutes les deux le mauvais arbre :

   | Job | Arbre | Oracle |
   |---|---|---|
   | `examples` de `deploy.yml`, bloquant | `versioned_docs/version-0.5` + `blog` + `src/pages` | dernière release |
   | `examples-develop.yml`, nocturne, `::warning` | `docs` | `develop` |

   `blog/` et `src/pages/` ne sont pas versionnés par Docusaurus : ils sont
   publiés tels quels, donc ils relèvent de l'oracle de la release. Côté script,
   `SOURCES` est en dur dans `scripts/check-typr-blocks.mjs` — lui ajouter une
   option `--sources` plutôt que d'abuser de `--only`, dont le motif est un
   simple `includes()` : `docs/` sélectionnerait aussi `versioned_docs/`.

5. **Laisser `gen-syntax-reference.mjs` tranquille.** Il n'écrit que dans
   `docs/reference/`, et c'est correct : l'instantané garde les tableaux qu'il
   avait le jour où il a été figé, ce qui est précisément ce qu'un lecteur de
   la version 0.5 doit voir. Ne pas le pointer sur `versioned_docs/`.

6. **Pages CMS** — ajouter une collection pour `versioned_docs/version-0.5`.
   Sans elle, toute correction faite depuis un téléphone atterrit dans `next` et
   **n'apparaît jamais sur le site publié** : la panne la plus déroutante de la
   liste.

7. **Corriger deux fois, en connaissance de cause.** Une erreur de doc se
   corrige dans `docs/` (elle doit survivre à la prochaine release) *et* dans
   l'instantané si elle concerne la version publiée (c'est celle qu'on lit). Les
   liens « Edit this page » et « Report an issue » désignent déjà le bon fichier
   — vérifié : sur une page stable ils pointent sur
   `versioned_docs/version-0.5/intro.md`, sur `/docs/next/` sur `docs/intro.md`.
   Rien à changer de ce côté.

8. **À la release suivante** — supprimer `versioned_docs/`, `versioned_sidebars/`
   et `versions.json`, puis refiger sur le nouveau `x.y`, et mettre à jour les
   trois occurrences du numéro (config, plugin llms, workflows). Tant qu'on n'en
   garde qu'une, c'est une commande et un remplacement.

Le numéro de version, lui, ne se saisit nulle part dans ce dépôt : il vient de
`Cargo.toml [workspace.package].version` du compilateur, que `deploy.yml`
récupère déjà pour la page d'accueil. La doc **consomme** cette valeur, elle n'en
définit jamais une.

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
