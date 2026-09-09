# Plan phase 2 — outillage de la documentation TypR

> **Objectif** : la phase 1 (`plan.md`, actions 1-11 ✅ toutes terminées) a restructuré le
> *contenu* selon Diátaxis — 33 pages. Cette phase 2 s'attaque à la *plateforme* : recherche,
> garantie de fraîcheur des exemples, consommation par les LLM, canaux de discussion et de
> proposition.
>
> Rédigé le **2026-09-09** à l'issue d'une discussion avec Fabrice. Les actions 1, 2 et 3 sont
> implémentées ; les suivantes sont à faire par une session ultérieure. Les priorités
> reflètent un arbitrage explicite valeur/coût, pas un ordre de préférence esthétique.

---

## 0. Contexte et contraintes

**Le site est statique, déployé sur GitHub Pages.** C'est *la* contrainte structurante : tout
ce qui a un état (propositions, comptes, messages, feedback) doit soit s'appuyer sur GitHub
lui-même, soit vivre chez un tiers. Aucune solution avec backend maison n'est envisageable.

**La CI sait déjà parler au dépôt du compilateur.** `.github/workflows/deploy.yml` :
- se déclenche sur `push`/`pull_request` sur `main`, sur `workflow_dispatch`, **et sur un
  `repository_dispatch` de type `typr-release`** émis par la release du compilateur ;
- récupère déjà des fichiers depuis `we-data-ch/typr@develop` via `raw.githubusercontent.com`
  (la version dans `Cargo.toml`, la grammaire `typr.tmLanguage.json`) ;
- sur une PR, s'arrête après le build sans déployer.

C'est le point d'ancrage des actions 2 et 6 — le mécanisme existe, il s'agit de l'étendre.

**Le compilateur est dans le même workspace mais dans un autre dépôt** :
`../typR/typr` (crates Rust, binaire `typr`). Voir `../CLAUDE.md` pour la carte du workspace
et `../typR/ai_context/CLAUDE.md` pour l'architecture du compilateur.

**Volumétrie actuelle des exemples** : 225 blocs ` ```typr ` répartis sur 36 fichiers
(`docs/`, `blog/`, `src/pages/`), dont 48 marqués `noplayground` (tableaux de syntaxe,
exemples volontairement invalides, projets `mod` multi-fichiers, formes que le parser ne sait
pas encore lire) — donc **177 blocs qui passent un `typr check`**, vérifiés en CI depuis
l'action 2. (Le compte était de 47/178 à la rédaction : le 178ᵉ était un exemple
volontairement invalide qui n'avait jamais été marqué — c'est le job de l'action 2 qui l'a
trouvé.)

> ⚠️ **Une note de `plan.md` est périmée.** Son action 7 décrit `typr` comme un alias de la
> grammaire Prism `r`, via un `src/theme/prism-include-languages.js` swizzlé. Ce n'est plus
> vrai : la coloration passe désormais par **Shiki** au moment du build
> (`src/syntax/shiki.ts`, branché en `beforeDefaultRehypePlugins`), à partir de la grammaire
> générée par le compilateur (`syntaxes/typr.tmLanguage.json`). Prism ne colore plus rien —
> il ne reste de ses « thèmes » dans `docusaurus.config.ts` que `plain`, dont Docusaurus tire
> le fond du conteneur. Le fichier `prism-include-languages.js` n'existe plus.

---

## 1. Actions par priorité

| # | Action | Priorité | Statut |
|---|--------|----------|--------|
| 1 | Barre de recherche plein-texte locale | Haute | ✅ Fait (2026-09-09) |
| 2 | Vérifier les blocs ` ```typr ` contre le vrai compilateur en CI | **Haute** | ✅ Fait (2026-09-09) |
| 3 | Rendre la doc « AI-ready » : `llms.txt`, copie Markdown, MCP | **Haute** | ✅ Fait (2026-09-09) — sauf MCP, voir §2.3 |
| 4 | Activer GitHub Discussions et le lier depuis le site | Haute | 🚧 À faire |
| 5 | Processus RFC dans `we-data-ch/typr` + section « Design proposals » | Moyenne | 🚧 À faire |
| 6 | Générer les pages de référence depuis `typr syntax --json` | Moyenne | 🚧 À faire |
| 7 | Analytics respectueuses de la vie privée | Moyenne | 🚧 À faire |
| 8 | Lien « signaler un problème sur cette page » | Basse | 🚧 À faire |
| 9 | Versionnement de la doc | Basse | ⏸ Différé — décider le schéma d'URL maintenant |
| 10 | Section « TypR by example » | Basse | 🚧 À faire |
| 11 | Internationalisation française | Basse | ⏸ Optionnel |
| — | Assistant IA conversationnel (widget de chat) | — | ❌ Écarté — voir §2.3 |

---

## 2. Détail des actions

### 2.1 — ✅ Action 1 : barre de recherche locale *(fait le 2026-09-09)*

**Choix : `@easyops-cn/docusaurus-search-local`, pas Algolia DocSearch.** L'index lunr est
construit pendant `docusaurus build` et servi en statique : aucun service externe, aucune clé
d'API, aucun dossier de candidature, et ça fonctionne hors ligne. Algolia reste envisageable
plus tard (voir action 7).

Changements effectués :
- `docusaurus.config.ts` — bloc `themes` avant `themeConfig` : indexation docs + blog + pages,
  `highlightSearchTermsOnTargetPage`, `explicitSearchResultPath` (page `/search` dédiée),
  `hashed: true` ;
- `docusaurus.config.ts` — item `{type: 'search', position: 'right'}` ajouté **après** le lien
  GitHub dans la navbar, pour maîtriser le placement plutôt que de laisser le thème l'insérer
  en bout de liste ;
- `package.json` / `package-lock.json` — la dépendance.

Vérifié : `npm run typecheck` et `npm run build` passent ; `build/search-index.json` (1,2 Mo,
chargé en *lazy* uniquement à l'ouverture de la recherche) et `build/search/` sont générés ;
le markup de la barre est présent dans le HTML. En `npm start` le serveur répond bien sur
`/search-index.json` et `/search`, mais **tester de préférence avec `npm run build && npm run
serve`**, qui est le mode nominal du plugin.

> Point d'attention pour plus tard : la taille de l'index croît avec le contenu. Au-delà de
> ~3-4 Mo, envisager `indexBlog: false` ou le passage à Algolia.

---

### 2.2 — ✅ Action 2 : vérifier les blocs de code en CI *(fait le 2026-09-09)*

**Le problème.** 178 blocs ` ```typr ` étaient censés compiler, et **rien ne le vérifiait**. Un
changement de syntaxe dans le compilateur pouvait rendre la doc fausse sans qu'aucun build
n'échoue. Pour la documentation d'un *langage*, c'est le risque de correction n°1 : une doc
qui ment coûte plus cher qu'une doc absente. C'est aussi un objectif déjà formulé dans
`documentation.md` (« Exemples exécutables et testés … systématiquement intégrés au pipeline
de CI »).

**Ce qui a été fait.**

- `scripts/check-typr-blocks.mjs` — sans dépendance, donc exécutable en CI sans `npm ci`.
  Il parcourt `docs/`, `blog/` et `src/pages/`, extrait chaque bloc ` ```typr ` non marqué
  `noplayground`, l'écrit dans un fichier temporaire, lui applique `typr check`, et **réécrit
  les positions du diagnostic en lignes du fichier Markdown** pour que le message soit
  cliquable. Sortie 0 / 1 / 2 (2 = le script lui-même ne peut pas tourner). Options :
  `--typr`, `--only`, `--jobs`, `--list`, `--noplayground`, `--keep`.
- `npm run check:examples` — la même chose en local.
- `.github/workflows/deploy.yml` — job `examples`, **bloquant**, dont `build` dépend
  (`needs: examples`). Il télécharge le binaire de la dernière release de `we-data-ch/typr` ;
  sur un `repository_dispatch: typr-release`, il vise directement la version du
  `client_payload` plutôt que « latest », qui peut ne pas encore avoir basculé.
- `.github/workflows/examples-develop.yml` — le préavis : compile `typr` depuis
  `we-data-ch/typr@develop` et rejoue le script, en `::warning` seulement, une fois par nuit
  (`continue-on-error`). Quotidien plutôt qu'à chaque push : la compilation Rust dure
  plusieurs minutes et ne doit pas taxer les PR de contenu.

**Deux constats de mise en œuvre :**

- **`typr check` n'a pas besoin de R.** Il se contente d'un avertissement quand `Rscript` est
  absent — vérifié en environnement sans R. Rien à installer sur le runner.
- **Le premier `typr check` écrit `context.json` et `std.ty` dans le répertoire courant** (le
  préchargement de la bibliothèque standard). Le script lance donc le premier bloc seul avant
  de paralléliser les autres, pour qu'aucune course n'écrive ces fichiers à plusieurs. Coût
  total : ~3 s pour 177 blocs.

**Attention aux blocs auto-suffisants.** Les blocs destinés au playground sont volontairement
autonomes : quand un exemple a besoin de définitions d'un bloc précédent de la page, elles
sont répétées dans un préambule `# --- setup, ... ---`. Le script vérifie donc chaque bloc
**isolément**, jamais en concaténant les blocs d'une page.

**Première prise.** Le job a immédiatement trouvé un bloc faux :
`docs/tutorials/typr-for-dummies.md:51`, l'exemple « *TypR won't* » qui montre exprès un
réassignement interdit — il envoyait le lecteur du playground droit dans une erreur. C'est ce
bloc qui a motivé le corollaire ci-dessous.

**Corollaire — le mot-clé `compile_fail`.** Marquer ce bloc `noplayground` réglait le
symptôme et perdait l'information : le lecteur ne voyait toujours pas que l'exemple était un
contre-exemple, et le bloc sortait de toute vérification. D'où l'emprunt à rustdoc, fait dans
la foulée :

| | Lecteur | CI |
|---|---|---|
| `noplayground` | pas de bouton | rien |
| `compile_fail` | bandeau « This example does not compile » + bouton | le bloc **doit** échouer |

C'est le couple qui fait la valeur. Le bandeau (`src/components/CompileFailNotice`, posé par
le swizzle `CodeBlock/Content/Element` qui est le dernier à voir la metastring) empêche qu'un
contre-exemple passe pour un exemple. L'oracle inversé empêche qu'il pourrisse : le jour où le
langage change et où le bloc se met à compiler, la CI le dit — sans quoi le bandeau mentirait
sans que personne s'en aperçoive. `compile_fail` l'emporte sur `noplayground` : c'est une
assertion, pas une dispense.

Le bouton « playground » est conservé sur un `compile_fail` : le bandeau a prévenu, et cliquer
donne le message exact du compilateur — l'erreur *est* la démonstration. (`autorun` y est
ignoré : la compilation s'arrête avant.)

Trois blocs reclassés dans la foulée : `docs/tutorials/typr-for-dummies.md:51` et
`docs/reference/records.md:70` en `compile_fail`, et `docs/philosophy/beautiful_syntax.md:24`
— marqué `noplayground` alors qu'il compile et se dit lui-même « all valid » — rendu à la
vérification et au playground. Bilan : **178 blocs vérifiés, 2 contre-exemples, 45 exclus**.

**Ce qui reste.** Les 45 `noplayground` sont une dette : `npm run check:examples
-- --noplayground` en sort le tableau Markdown, **calculé et pas tenu à la main** — un tableau
figé se serait périmé dès la PR suivante. Un tri manuel a montré qu'ils se répartissent en
trois familles : des fragments de syntaxe (types isolés, corps en `/* ... */`, projets `mod`
multi-fichiers) qui doivent rester `noplayground` ; quelques blocs mixtes qui montrent côte à
côte l'interdit et l'autorisé, et qu'il faudrait couper en deux pour que `compile_fail` ait un
sens ; et **six blocs présentés comme valides qui ne compilent pas**.

Ces six-là ont été examinés un par un et vérifiés contre `typr` 0.5.10 : quatre sont des
erreurs de doc, deux sont des trous du compilateur (types singleton `bool`/`num`, et types de
fonction comparés nom de paramètre compris). Le détail, les repros et les corrections
proposées sont dans **`doc_correction.md`** à la racine — aucun n'est corrigé, l'un d'eux
(`philosophy/intro.md`) demande d'abord une décision de langage.

---

### 2.3 — ✅ Action 3 : rendre la doc « AI-ready » *(fait le 2026-09-09)*

**Pourquoi pas un widget de chat.** Kapa.ai / Inkeep / Mendable font très bien le travail et
ont des offres open-source, mais le rapport valeur/entretien est mauvais tant que le trafic
est faible — et surtout ça répond au mauvais problème. Le vrai problème de TypR, c'est que
**les LLM ne connaissent pas le langage** : à qui demande du TypR, un assistant rend du R ou
du Julia légèrement déguisé. Un widget aide le visiteur déjà présent sur le site ; ce qu'il
faut, c'est aider l'utilisateur **là où il écrit du TypR, dans son éditeur**. À rediscuter si
le trafic décolle.

**À implémenter, par ordre de coût croissant :**

1. **`llms.txt` et `llms-full.txt` générés au build** — un plugin Docusaurus le fait
   (`docusaurus-plugin-llms` ou équivalent ; vérifier la compatibilité Docusaurus 3.8 avant
   de l'ajouter). Un index structuré des pages plus une version agrégée en Markdown brut,
   chargeable dans une fenêtre de contexte. C'est déjà identifié comme une exigence dans
   `documentation.md` §3.
2. **Un bouton « copier la page en Markdown »** dans l'en-tête de chaque page de doc — à faire
   par swizzle, dans l'esprit de ce qui existe déjà sous `src/theme/CodeBlock/`.
3. **Un serveur MCP de la documentation**, plus tard : il exposerait la recherche et la
   lecture des pages à un assistant. À ne considérer qu'une fois 1 et 2 en place.

**Levier maximal, à ne pas oublier :** ce qui limite le plus les hallucinations, c'est la
qualité de la référence elle-même — signatures explicites, invariants, gestion d'erreurs — et
les pages « d'intention » (`philosophy/`) qui expliquent *pourquoi* une décision de design a
été prise. Elles existent déjà : les garder à jour sert autant les LLM que les humains.

**Ce qui a été fait (points 1 et 2 ; le 3 reste à faire).**

- **`docusaurus-plugin-llms` 0.6.0**, en `devDependency`. Compatibilité vérifiée avant l'ajout
  (peer `@docusaurus/core ^3.0.0`, trois dépendances : `gray-matter`, `minimatch`, `yaml`).
  Écrit en `postBuild`, donc **au `npm run build` seulement** — rien en `npm start`.
- **Trois sorties**, et c'est la troisième qui porte la valeur pratique :
  `llms.txt` (l'index, une ligne par page), `llms-full.txt` (la doc entière, 176 Ko ≈ 45 k
  jetons, chargeable d'un bloc) et, surtout, **le Markdown de chaque page à côté de son HTML** :
  `/docs/intro` ↔ `/docs/intro.md`. C'est la convention qui s'installe, et c'est ce qui rend le
  point 2 gratuit.
- **Bouton « Copy as Markdown »** (`src/components/CopyPageButton`), posé sur la ligne du fil
  d'Ariane par un swizzle de `@theme/DocItem/Layout`. Il ne transporte rien dans le bundle : il
  va chercher le `.md` de la page au clic. Un lien « View » à côté ouvre la source brute — c'est
  souvent l'URL qu'on veut donner à un assistant, pas le texte.
  Piège traité : le serveur de dev répond **200 + du HTML** pour une route inconnue, donc sans
  garde-fou le bouton mettrait la page d'accueil dans le presse-papier. Il vérifie le premier
  caractère de la réponse et affiche « Unavailable » plutôt que de mentir.
- **Un préambule commun aux deux fichiers** (`src/llms/preamble.md`) : ce que TypR est, l'avis
  explicite qu'un modèle ne le connaît pas et doit s'abstenir plutôt qu'extrapoler, et surtout
  **la convention des fences** — `typr` compile et c'est vérifié en CI, `typr compile_fail` est
  un contre-exemple à ne jamais présenter comme valide, `typr noplayground` est un fragment. Le
  plugin recopie les metastrings telles quelles : sans cette clé de lecture, `llms-full.txt`
  apprendrait les contre-exemples de l'action 2 comme du TypR correct.
- **L'ordre de lecture est dérivé de `sidebars.ts`** (`src/llms/order.ts`), pas réécrit à la
  main : la barre latérale *est* déjà l'ordre Diátaxis décidé pour les humains, et une seconde
  liste aurait divergé dès la page suivante. Les pages hors barre latérale tombent à la fin.
- **Le blog est exclu.** Ces fichiers servent à faire écrire du TypR correct ; les billets sont
  datés et certains portent encore des fences ` ```julia `. Leur matière de fond est reprise
  dans `docs/philosophy/`.
- **`description:` ajouté au front matter des 35 pages qui n'en avaient pas.** Ce n'était pas
  cosmétique : `llms.txt` n'est qu'un titre plus une ligne par page, et faute de `description`
  le plugin prenait le premier *paragraphe* puis le coupait à la première fin de ligne — donc en
  plein milieu d'une phrase, la doc étant rompue à 80 colonnes. Les mêmes descriptions servent
  la balise `<meta name="description">` et les extraits de recherche.
- **Question 33 de la FAQ** (« How do I get an AI assistant to write correct TypR? ») et un lien
  `llms.txt` dans le pied de page : sans point d'entrée, un fichier que personne ne connaît ne
  sert à rien.

**Un défaut connu, laissé tel quel.** Les dix pages qui déclarent un `title:` en front matter
différent de leur `<h1>` (les how-to et les tutoriels, dont le titre de barre latérale est plus
court que le titre de page) produisent deux titres consécutifs dans `llms-full.txt` : le plugin
ne déduplique que sur égalité exacte. Aligner les deux imposerait de réécrire des titres de
pages visibles — pour deux lignes redondantes qui n'induisent personne en erreur.

**Reste à faire : le serveur MCP** (point 3 ci-dessus), qui exposerait recherche et lecture des
pages à un assistant. Il a maintenant sa matière première : les `.md` par page et `llms.txt`
sont exactement ce qu'un tel serveur servirait.

**Vérifié :** `npm run typecheck`, `npm run build` et `npm run check:examples` passent ;
`build/llms.txt` liste les 36 pages dans l'ordre de la barre latérale, `build/llms-full.txt` les
contient toutes, et `curl` sur `/docs/intro.md` renvoie bien `text/markdown`.

---

### 2.4 — Action 4 : GitHub Discussions

Le canal d'aide canonique, gratuit, indexé par Google, et voisin des issues.

- Activer Discussions sur `we-data-ch/typr` avec les catégories **Q&A**, **Ideas**,
  **Show and tell**.
- Lier depuis la navbar **et** le footer de `docusaurus.config.ts` (section « Community », qui
  ne contient aujourd'hui que R-bloggers et GitHub).
- Ajouter un renvoi depuis `docs/faq.md` : « votre question n'est pas là ? demandez ici ».

**Un Discord ou un Zulip en plus seulement si tu es sûr de l'animer** — un salon mort fait plus
de mal que pas de salon du tout. Côté présence communautaire hors site : Posit Community et
Bluesky/Mastodon `#rstats` sont les endroits où se trouve le public R.

---

### 2.5 — Action 5 : processus RFC et section « Design proposals »

La forme éprouvée pour un langage (Rust, Python PEP, Swift Evolution) :

- un dossier `rfcs/` **dans `we-data-ch/typr`**, pas dans le dépôt de doc : les propositions
  sont revues comme du code ;
- un `rfcs/0000-template.md` et une PR par proposition ; la discussion vit dans la PR, le
  statut est porté par un label (`rfc-draft` / `rfc-accepted` / `rfc-rejected`) ;
- la matière existe déjà dans `../typR/spécifications/` et `../typR/ai_context/*.md` — ces
  notes de design sont aujourd'hui internes au workspace ; les RFC en seraient la face
  publique ;
- côté site : une section **« Design proposals »** qui liste les RFC acceptées et pointe vers
  le dépôt. Genre Diátaxis : *explication* — donc sous `docs/philosophy/` ou une rubrique
  dédiée, **surtout pas** mélangée à `reference/`.
- les idées encore floues, qui ne méritent pas encore une RFC, vont dans la catégorie
  **Ideas** des Discussions (action 4).

---

### 2.6 — Action 6 : générer les pages de référence depuis le compilateur

`typr syntax --json` est **déjà la source de vérité unique** des grammaires d'éditeur (voir
`../CLAUDE.md` : `crates/typr-core/src/components/syntax/mod.rs`, avec deux tests qui
verrouillent l'invariant dans les deux sens). Les tableaux d'opérateurs et de mots-clés de
`docs/reference/operators.md` et `docs/reference/lexicon.md` sont, eux, maintenus à la main.

Les dériver du manifeste supprimerait la possibilité même de la dérive, au lieu de se contenter
de la détecter. La CI récupère déjà `typr.tmLanguage.json` depuis `raw.githubusercontent.com` :
le même mécanisme peut récupérer le manifeste JSON et générer un partiel MDX inclus dans la
page.

Même logique que l'action 2 : **rendre l'erreur impossible plutôt que la signaler**.

À noter aussi : `syntaxe.md` à la racine est la carte de syntaxe autoritative (elle prime sur
`docs/` en cas de désaccord) et elle est **mirroir** de `../typR/typr/syntaxe.md` — les deux
doivent rester synchronisées quand le langage change. Un contrôle CI de cette synchronisation
serait un petit gain facile.

---

### 2.7 — Action 7 : analytics respectueuses de la vie privée

Plausible, GoatCounter ou Umami — sans cookie, sans bandeau de consentement à gérer.

Ce qu'on veut réellement savoir : **quelles pages sont lues**, et surtout, maintenant que la
recherche existe, **quelles recherches ne renvoient aucun résultat**. C'est la meilleure source
d'idées de roadmap documentaire qui soit — elle dit ce que les gens cherchent et ne trouvent
pas.

C'est aussi le seul argument sérieux pour **repasser à Algolia DocSearch** plus tard (gratuit
pour l'open-source) : la tolérance aux fautes de frappe et les analytics de recherche
intégrées. À faire seulement si le besoin se manifeste — la recherche locale de l'action 1
couvre le cas nominal.

---

### 2.8 — Action 8 : lien « signaler un problème sur cette page »

À côté du « Edit this page » déjà présent (`editUrl` est correctement configuré vers
`we-data-ch/typr.github.io`), ajouter un lien qui **pré-remplit une issue GitHub** avec l'URL
et le titre de la page.

Environ cinq lignes de swizzle, et ça transforme un lecteur agacé en rapport de bug exploitable.
Rapport valeur/effort excellent.

---

### 2.9 — Action 9 : versionnement de la doc *(différé, mais à décider maintenant)*

Docusaurus sait versionner. **Ne pas le faire tout de suite** : ça double le coût de
maintenance de chaque page, pour un langage dont la syntaxe bouge encore.

Mais **décider le schéma d'URL dès maintenant**, parce que le changer après coup casse tous les
liens entrants. Le besoin deviendra réel dès qu'un utilisateur installera une release taguée
pendant que la doc décrit `develop` — et le `repository_dispatch: typr-release` de
`deploy.yml` montre que le couplage doc/release est déjà pensé.

Rappel de `../CLAUDE.md` : les versions sont fixées en un seul endroit,
`Cargo.toml [workspace.package].version`, propagées par `nu publish.nu sync`. La doc doit
consommer cette valeur, jamais en redéfinir une.

---

### 2.10 — Action 10 : section « TypR by example »

À la manière de *Rust by Example* : une progression d'exemples courts, **chacun exécutable dans
le playground**, qui couvre le langage par la pratique.

Le playground (`typr-playground.github.io`, protocole documenté dans son `INTEGRATION.md`) est
l'atout différenciant de TypR face aux autres langages jeunes, et il est aujourd'hui
sous-exploité comme porte d'entrée : le bouton « play » existe sur chaque bloc, mais aucune
page n'est *conçue* autour de l'exécution.

Genre Diátaxis : *tutoriel* — donc sous `docs/tutorials/`, sans mélanger avec la référence.
Contrainte : chaque bloc doit rester auto-suffisant (préambule `# --- setup, ... ---`), et il
passera le contrôle de l'action 2.

---

### 2.11 — Action 11 : internationalisation française *(optionnel)*

Docusaurus i18n avec une locale `fr`. Les notes de design sont en français et il existe un
public R francophone (académique notamment).

**Mais traduire double la charge sur chaque page**, et une traduction en retard est pire qu'une
absence de traduction. À ne faire que si ce public est explicitement visé — décision produit,
pas décision technique. C'est délibérément la dernière de la liste.

---

## 3. Fil rouge

Trois des actions ci-dessus (2, 6, et l'invariant de grammaire déjà en place dans
`deploy.yml`) relèvent du même principe : **la documentation d'un langage ne doit pas pouvoir
diverger silencieusement de son compilateur**. Quand un choix se présente entre « détecter la
dérive » et « rendre la dérive impossible », prendre la seconde.

Les actions 3, 4, 5 relèvent d'un autre principe : **s'appuyer sur GitHub plutôt que sur une
infrastructure**, parce que le site est statique et que le mainteneur est peu nombreux.
